import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    { id: 88, name: 'Medellín' },
    { id: 89, name: 'Bello' },
];

// ── Fetch mock (set fresh before each test) ───────────────────────────────────

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

/** Wait until the department select is loaded and enabled */
async function waitForDepts() {
    await waitFor(
        () => {
            const sel = screen.getByLabelText('Departamento') as HTMLSelectElement;
            expect(sel.disabled).toBe(false);
            // At least one department option besides the placeholder
            expect(sel.options.length).toBeGreaterThan(1);
        },
        { timeout: 3000 }
    );
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('ColombiaLocationSelect — renderizado', () => {
    it('muestra el label Departamento', () => {
        renderSelect();
        expect(screen.getByLabelText('Departamento')).toBeInTheDocument();
    });

    it('muestra el label Ciudad / Municipio por defecto', () => {
        renderSelect();
        expect(screen.getByLabelText('Ciudad / Municipio')).toBeInTheDocument();
    });

    it('acepta un cityLabel personalizado', () => {
        render(
            <ColombiaLocationSelect
                idPrefix="test2"
                value=""
                onChange={vi.fn()}
                cityLabel="Ciudad de suscripción"
            />
        );
        expect(screen.getByLabelText('Ciudad de suscripción')).toBeInTheDocument();
    });

    it('muestra los departamentos en el selector después de la carga', async () => {
        renderSelect();
        await waitForDepts();
        // Check options (sorted alphabetically by the component)
        const opts = Array.from((screen.getByLabelText('Departamento') as HTMLSelectElement).options).map(
            (o) => o.text
        );
        expect(opts).toContain('Antioquia');
        expect(opts).toContain('Bogotá D.C.');
    });

    it('el selector de ciudad está deshabilitado hasta seleccionar departamento', async () => {
        renderSelect();
        await waitForDepts();
        const citySelect = screen.getByLabelText('Ciudad / Municipio') as HTMLSelectElement;
        expect(citySelect.disabled).toBe(true);
    });
});

// ── Department selection ──────────────────────────────────────────────────────

describe('ColombiaLocationSelect — selección de departamento', () => {
    it('carga las ciudades de Bogotá al seleccionar el departamento', async () => {
        renderSelect();
        await waitForDepts();

        fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: '11' } });

        // 'Soacha' is a city that only appears in cities list, not departments
        await waitFor(
            () => {
                const cityOpts = Array.from(
                    (screen.getByLabelText('Ciudad / Municipio') as HTMLSelectElement).options
                ).map((o) => o.text);
                expect(cityOpts).toContain('Soacha');
            },
            { timeout: 3000 }
        );
    });

    it('habilita el selector de ciudad después de seleccionar departamento', async () => {
        renderSelect();
        await waitForDepts();

        fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: '11' } });

        await waitFor(
            () => {
                expect((screen.getByLabelText('Ciudad / Municipio') as HTMLSelectElement).disabled).toBe(false);
            },
            { timeout: 3000 }
        );
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

        fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: '5' } });

        // onChange is called with empty string to reset city
        expect(onChange).toHaveBeenCalledWith('');
    });
});

// ── City selection ────────────────────────────────────────────────────────────

describe('ColombiaLocationSelect — selección de ciudad', () => {
    it('llama onChange con el nombre de la ciudad al seleccionarla', async () => {
        const onChange = vi.fn();
        render(
            <ColombiaLocationSelect
                idPrefix="city-test"
                value=""
                onChange={onChange}
            />
        );
        await waitForDepts();

        fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: '11' } });

        await waitFor(
            () => {
                expect((screen.getByLabelText('Ciudad / Municipio') as HTMLSelectElement).disabled).toBe(false);
            },
            { timeout: 3000 }
        );

        fireEvent.change(screen.getByLabelText('Ciudad / Municipio'), {
            target: { value: 'Bogotá D.C.' },
        });

        expect(onChange).toHaveBeenCalledWith('Bogotá D.C.');
    });

    it('carga las ciudades de Antioquia al seleccionar ese departamento', async () => {
        renderSelect();
        await waitForDepts();

        fireEvent.change(screen.getByLabelText('Departamento'), { target: { value: '5' } });

        await waitFor(
            () => {
                const cityOpts = Array.from(
                    (screen.getByLabelText('Ciudad / Municipio') as HTMLSelectElement).options
                ).map((o) => o.text);
                expect(cityOpts).toContain('Medellín');
                expect(cityOpts).toContain('Bello');
            },
            { timeout: 3000 }
        );
    });
});

// ── Error display ─────────────────────────────────────────────────────────────

describe('ColombiaLocationSelect — errores de validación', () => {
    it('muestra el mensaje de error cuando se provee', () => {
        renderSelect('', vi.fn(), 'La ciudad de residencia es requerida.');
        expect(screen.getByText('La ciudad de residencia es requerida.')).toBeInTheDocument();
    });

    it('no muestra mensaje de error cuando no se provee', () => {
        renderSelect();
        expect(screen.queryByText('La ciudad de residencia es requerida.')).not.toBeInTheDocument();
    });
});
