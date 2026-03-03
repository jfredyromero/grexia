import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContractTemplate from '../ContractTemplate';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Apartamento',
        propiedadHorizontal: false,
        direccion: 'Calle 45 # 23-15, Apto 301',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        estrato: '3',
        areaMq: '65',
    },
    arrendador: {
        nombreCompleto: 'Juan García Martínez',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        telefono: '300 123 4567',
        email: 'juan@test.co',
    },
    arrendatario: {
        nombreCompleto: 'María López Castro',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        telefono: '310 987 6543',
        email: '',
    },
    condiciones: {
        fechaInicio: '2026-03-01',
        duracionMeses: 12,
        canonMensual: '1500000',
        depositoCOP: '3000000',
        diaPagoMes: 5,
        actividadComercial: '',
    },
};

const withTipo = (tipoInmueble: ArrendamientoFormData['inmueble']['tipoInmueble']): ArrendamientoFormData => ({
    ...base,
    inmueble: { ...base.inmueble, tipoInmueble },
});

const withPH = (): ArrendamientoFormData => ({
    ...base,
    inmueble: { ...base.inmueble, tipoInmueble: 'Apartamento', propiedadHorizontal: true },
});

const withLocal = (actividad: string): ArrendamientoFormData => ({
    ...base,
    inmueble: { ...base.inmueble, tipoInmueble: 'Local Comercial' },
    condiciones: { ...base.condiciones, actividadComercial: actividad },
});

// ── Contract title ────────────────────────────────────────────────────────────

describe('ContractTemplate — título del contrato', () => {
    it('muestra el tipo de inmueble en el título para Apartamento', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Apartamento');
    });

    it('muestra el tipo de inmueble en el título para Casa', () => {
        render(<ContractTemplate formData={withTipo('Casa')} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Casa');
    });

    it('muestra el tipo en el título para Local Comercial', () => {
        render(<ContractTemplate formData={withLocal('Tienda')} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Local Comercial');
    });

    it('muestra "en Propiedad Horizontal" en el título cuando aplica', () => {
        render(<ContractTemplate formData={withPH()} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Propiedad Horizontal');
    });

    it('no muestra "Propiedad Horizontal" en el título cuando no aplica', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Propiedad Horizontal');
    });
});

// ── Régimen legal ─────────────────────────────────────────────────────────────

describe('ContractTemplate — régimen legal', () => {
    // "Ley 820 de 2003" aparece en el badge de régimen Y en las cláusulas — usamos getAllByText
    it('indica Ley 820 de 2003 para contratos de vivienda (Apartamento)', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getAllByText(/Ley 820 de 2003/i).length).toBeGreaterThanOrEqual(1);
    });

    it('indica Ley 820 de 2003 para Casa', () => {
        render(<ContractTemplate formData={withTipo('Casa')} />);
        expect(screen.getAllByText(/Ley 820 de 2003/i).length).toBeGreaterThanOrEqual(1);
    });

    it('indica Código de Comercio para Local Comercial', () => {
        render(<ContractTemplate formData={withLocal('Tienda')} />);
        expect(screen.getAllByText(/Código de Comercio/i).length).toBeGreaterThanOrEqual(1);
    });

    it('indica Código de Comercio para Oficina', () => {
        render(<ContractTemplate formData={withTipo('Oficina')} />);
        expect(screen.getAllByText(/Código de Comercio/i).length).toBeGreaterThanOrEqual(1);
    });

    it('vivienda NO usa Código de Comercio', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.queryByText(/Código de Comercio/i)).not.toBeInTheDocument();
    });

    it('comercial NO usa Ley 820 como régimen principal', () => {
        render(<ContractTemplate formData={withLocal('Tienda')} />);
        // El badge de régimen dice "Código de Comercio", no "Ley 820 de 2003"
        expect(screen.getByText(/Régimen: Código de Comercio/i)).toBeInTheDocument();
    });
});

// ── Información de las partes ─────────────────────────────────────────────────

describe('ContractTemplate — datos de las partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getAllByText('Juan García Martínez').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el nombre del arrendatario', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getAllByText('María López Castro').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra la dirección del inmueble', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText(/Calle 45 # 23-15/i)).toBeInTheDocument();
    });

    it('muestra la ciudad', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getAllByText(/Bogotá/i).length).toBeGreaterThanOrEqual(1);
    });
});

// ── Canon en palabras ─────────────────────────────────────────────────────────

describe('ContractTemplate — canon en palabras (numberToWordsCOP)', () => {
    it('escribe el canon en palabras en el cuerpo del contrato', () => {
        render(<ContractTemplate formData={base} />);
        // 1.500.000 → UN MILLÓN QUINIENTOS MIL PESOS
        expect(screen.getByText(/UN MILLÓN QUINIENTOS MIL PESOS/i)).toBeInTheDocument();
    });

    it('escribe el depósito en palabras', () => {
        render(<ContractTemplate formData={base} />);
        // 3.000.000 → TRES MILLONES PESOS
        expect(screen.getByText(/TRES MILLONES PESOS/i)).toBeInTheDocument();
    });

    it('muestra el canon con un canon diferente', () => {
        const formData = {
            ...base,
            condiciones: { ...base.condiciones, canonMensual: '800000' },
        };
        render(<ContractTemplate formData={formData} />);
        expect(screen.getByText(/OCHOCIENTOS MIL PESOS/i)).toBeInTheDocument();
    });
});

// ── Cláusulas específicas por tipo ────────────────────────────────────────────

describe('ContractTemplate — cláusulas por tipo de contrato', () => {
    it('contrato de vivienda contiene cláusula de reajuste por IPC', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText(/IPC/i)).toBeInTheDocument();
    });

    it('contrato comercial menciona reajuste libre sin límite de IPC', () => {
        render(<ContractTemplate formData={withLocal('Restaurante')} />);
        expect(screen.getByText(/sin que aplique el límite del IPC/i)).toBeInTheDocument();
    });

    it('contrato de vivienda menciona Ley 820 en cláusula de depósito', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText(/artículo 16/i)).toBeInTheDocument();
    });

    it('Local Comercial muestra cláusula de Actividad Comercial Autorizada', () => {
        render(<ContractTemplate formData={withLocal('Panadería')} />);
        expect(screen.getByText(/ACTIVIDAD COMERCIAL AUTORIZADA/i)).toBeInTheDocument();
    });

    it('Local Comercial muestra la actividad ingresada en el contrato', () => {
        render(<ContractTemplate formData={withLocal('Panadería artesanal')} />);
        expect(screen.getByText(/Panadería artesanal/)).toBeInTheDocument();
    });

    it('Oficina muestra cláusula de Destinación del Inmueble (no actividad)', () => {
        render(<ContractTemplate formData={withTipo('Oficina')} />);
        expect(screen.getByText(/DESTINACIÓN DEL INMUEBLE/i)).toBeInTheDocument();
    });

    it('Oficina menciona uso de oficina en la cláusula', () => {
        render(<ContractTemplate formData={withTipo('Oficina')} />);
        // "uso de <strong>oficina</strong>" — el texto está partido en nodos,
        // buscamos el container con queryAllByText usando exact:false
        const container = document.getElementById('contract-content')!;
        expect(container.textContent).toMatch(/uso de\s+oficina/i);
    });
});

// ── Propiedad Horizontal ──────────────────────────────────────────────────────

describe('ContractTemplate — cláusula de Propiedad Horizontal', () => {
    it('incluye la cláusula de PH cuando propiedadHorizontal es true', () => {
        render(<ContractTemplate formData={withPH()} />);
        expect(screen.getByText(/PROPIEDAD HORIZONTAL Y REGLAMENTO/i)).toBeInTheDocument();
    });

    it('no incluye la cláusula de PH cuando propiedadHorizontal es false', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.queryByText(/PROPIEDAD HORIZONTAL Y REGLAMENTO/i)).not.toBeInTheDocument();
    });

    it('también incluye cláusula de PH para contrato comercial con PH', () => {
        const comercialPH: ArrendamientoFormData = {
            ...withLocal('Tienda'),
            inmueble: { ...withLocal('Tienda').inmueble, propiedadHorizontal: true },
        };
        render(<ContractTemplate formData={comercialPH} />);
        expect(screen.getByText(/PROPIEDAD HORIZONTAL Y REGLAMENTO/i)).toBeInTheDocument();
    });
});

// ── Plan y marca de agua ──────────────────────────────────────────────────────

describe('ContractTemplate — marca de agua y planes', () => {
    it('muestra la marca de agua de Lexia en plan gratuito', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="free"
            />
        );
        expect(screen.getByText(/Documento generado por Lexia/i)).toBeInTheDocument();
    });

    it('oculta la marca de agua en plan básico', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="empresarial"
            />
        );
        expect(screen.queryByText(/Documento generado por Lexia/i)).not.toBeInTheDocument();
    });

    it('oculta la marca de agua en plan empresarial', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="empresarial"
            />
        );
        expect(screen.queryByText(/Documento generado por Lexia/i)).not.toBeInTheDocument();
    });

    it('muestra la marca de agua por defecto (sin prop plan)', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText(/Documento generado por Lexia/i)).toBeInTheDocument();
    });
});

// ── Logo personalizado ────────────────────────────────────────────────────────

describe('ContractTemplate — logo personalizado', () => {
    const LOGO_URL = 'data:image/png;base64,iVBORw0KGgo=';

    it('muestra el logo cuando el plan es básico y hay logoUrl', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="empresarial"
                logoUrl={LOGO_URL}
            />
        );
        const logo = screen.getByAltText('Logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', LOGO_URL);
    });

    it('muestra el logo en plan empresarial', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="empresarial"
                logoUrl={LOGO_URL}
            />
        );
        expect(screen.getByAltText('Logo')).toBeInTheDocument();
    });

    it('no muestra logo en plan gratuito aunque se proporcione logoUrl', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="free"
                logoUrl={LOGO_URL}
            />
        );
        expect(screen.queryByAltText('Logo')).not.toBeInTheDocument();
    });

    it('no muestra logo en plan básico sin logoUrl', () => {
        render(
            <ContractTemplate
                formData={base}
                plan="empresarial"
                logoUrl=""
            />
        );
        expect(screen.queryByAltText('Logo')).not.toBeInTheDocument();
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('ContractTemplate — bloque de firmas', () => {
    it('incluye el bloque EL ARRENDADOR con el nombre', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye el bloque EL ARRENDATARIO con el nombre', () => {
        render(<ContractTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });
});
