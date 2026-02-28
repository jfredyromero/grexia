import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColombiaLocationSelect from '../ColombiaLocationSelect';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockDepartments = [
    { id: 5, name: 'Antioquia' },
    { id: 11, name: 'Bogotá D.C.' },
    { id: 19, name: 'Cauca' },
];

const mockCitiesBogota = [
    { id: 149, name: 'Bogotá D.C.' },
    { id: 150, name: 'Soacha' },
];

const mockCitiesAntioquia = [
    { id: 87, name: 'Medellín' },
    { id: 88, name: 'Marinilla' },
];

// ── Fetch mock ────────────────────────────────────────────────────────────────
function makeFetchMock() {
    return vi.fn().mockImplementation((url: string) => {
        if (url.includes('/Department/11/cities')) {
            return Promise.resolve({ json: () => Promise.resolve(mockCitiesBogota) });
        }
        if (url.includes('/Department/5/cities')) {
            return Promise.resolve({ json: () => Promise.resolve(mockCitiesAntioquia) });
        }
        if (url.includes('/Department')) {
            return Promise.resolve({ json: () => Promise.resolve(mockDepartments) });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
}

beforeEach(() => {
    vi.stubGlobal('fetch', makeFetchMock());
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderSelect(value = '', onChange = vi.fn(), error?: string) {
    return render(
        <ColombiaLocationSelect
            idPrefix="test"
            value={value}
            onChange={onChange}
            error={error}
        />
    );
}

async function waitForDepts() {
    await waitFor(
        () => {
            const input = screen.getByLabelText('Departamento') as HTMLInputElement;
            expect(input.disabled).toBe(false);
        },
        { timeout: 3000 }
    );
}

async function selectDept(name: string) {
    const user = userEvent.setup();
    const input = screen.getByLabelText('Departamento');

    // Escribir en el input (esto dispara focus, keydown, change, etc.)
    await user.type(input, name);

    // Buscar la opción y hacer click
    const option = await screen.findByRole('option', { name: new RegExp(name, 'i') });
    await user.click(option);
}

async function waitForCityEnabled(cityLabel = 'Ciudad / Municipio') {
    await waitFor(
        () => {
            const input = screen.getByLabelText(cityLabel) as HTMLInputElement;
            expect(input.disabled).toBe(false);
        },
        { timeout: 4000 }
    );
}

// ── Tests Refactorizados ──────────────────────────────────────────────────────

describe('ColombiaLocationSelect — renderizado', () => {
    it('muestra el label Departamento', async () => {
        renderSelect();
        await waitForDepts();
        expect(screen.getByLabelText('Departamento')).toBeInTheDocument();
    });

    it('muestra el label Ciudad / Municipio por defecto', async () => {
        renderSelect();
        await waitForDepts();
        expect(screen.getByLabelText('Ciudad / Municipio')).toBeInTheDocument();
    });

    it('acepta un cityLabel personalizado', async () => {
        render(
            <ColombiaLocationSelect
                idPrefix="test2"
                value=""
                onChange={vi.fn()}
                cityLabel="Ciudad de suscripción"
            />
        );
        await waitForDepts();
        expect(screen.getByLabelText('Ciudad de suscripción')).toBeInTheDocument();
    });

    it('muestra los departamentos en el selector después de la carga', async () => {
        renderSelect();
        await waitForDepts();

        const input = screen.getByLabelText('Departamento');

        // 1. Abrimos el selector
        fireEvent.focus(input);
        fireEvent.click(input);

        // 2. Escribimos parte del nombre para filtrar
        fireEvent.change(input, { target: { value: 'Ant' } });

        // 3. Usamos findByRole con RegExp para ser más flexibles con espacios o mayúsculas
        const option = await screen.findByRole('option', { name: /Antioquia/i });
        expect(option).toBeInTheDocument();

        // También verificamos que esté el otro departamento si borramos la búsqueda
        fireEvent.change(input, { target: { value: '' } });
        expect(await screen.findByRole('option', { name: /Bogotá/i })).toBeInTheDocument();
    });

    it('el selector de ciudad está deshabilitado hasta seleccionar departamento', async () => {
        renderSelect();
        await waitForDepts();
        const cityInput = screen.getByLabelText('Ciudad / Municipio') as HTMLInputElement;
        expect(cityInput.disabled).toBe(true);
    });
});

describe('ColombiaLocationSelect — selección de departamento', () => {
    it('carga las ciudades de Bogotá al seleccionar el departamento', async () => {
        const user = userEvent.setup();
        renderSelect();
        await waitForDepts();

        await selectDept('Bogotá D.C.');
        await waitForCityEnabled();

        const cityInput = screen.getByLabelText('Ciudad / Municipio');
        await user.type(cityInput, 'S');

        const option = await screen.findByRole('option', { name: 'Soacha' });
        expect(option).toBeInTheDocument();
    });

    it('resetea la ciudad seleccionada al cambiar de departamento', async () => {
        const onChange = vi.fn();
        render(
            <ColombiaLocationSelect
                idPrefix="reset-test"
                value=""
                onChange={onChange}
            />
        );
        await waitForDepts();
        await selectDept('Bogotá D.C.');

        expect(onChange).toHaveBeenCalledWith('');
    });
});

// ── City selection ────────────────────────────────────────────────────────────

describe('ColombiaLocationSelect — selección de ciudad', () => {
    it('llama onChange con el nombre de la ciudad al seleccionarla', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <ColombiaLocationSelect
                idPrefix="city-test"
                value=""
                onChange={onChange}
            />
        );
        await waitForDepts();

        await selectDept('Bogotá D.C.');
        await waitForCityEnabled();

        const cityInput = screen.getByLabelText('Ciudad / Municipio');
        await user.type(cityInput, 'B');

        const option = await screen.findByRole('option', { name: 'Bogotá D.C.' });
        await user.click(option);

        expect(onChange).toHaveBeenCalledWith('Bogotá D.C.');
    });

    it('carga las ciudades de Antioquia al seleccionar ese departamento', async () => {
        const user = userEvent.setup();
        renderSelect();
        await waitForDepts();

        await selectDept('Antioquia');
        await waitForCityEnabled();

        const cityInput = screen.getByLabelText('Ciudad / Municipio');

        await user.type(cityInput, 'M');
        const option1 = await screen.findByRole('option', { name: 'Medellín' });
        const option2 = await screen.findByRole('option', { name: 'Marinilla' });
        expect(option1).toBeInTheDocument();
        expect(option2).toBeInTheDocument();
    });
});

describe('ColombiaLocationSelect — errores de validación', () => {
    it('muestra el mensaje de error cuando se provee', async () => {
        renderSelect('', vi.fn(), 'La ciudad de residencia es requerida.');
        await waitForDepts();

        expect(screen.getByText('La ciudad de residencia es requerida.')).toBeInTheDocument();
    });

    it('no muestra mensaje de error cuando no se provee', async () => {
        renderSelect();
        await waitForDepts();

        expect(screen.queryByText('La ciudad de residencia es requerida.')).not.toBeInTheDocument();
    });
});
