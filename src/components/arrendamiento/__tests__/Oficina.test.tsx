import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OficinaTemplate from '../html/Oficina';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Oficina',
        propiedadHorizontal: false,
        direccion: 'Carrera 7 # 32-45, Oficina 502',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        estrato: '5',
        areaMq: '85',
    },
    arrendador: {
        nombreCompleto: 'Pedro Ramírez Mora',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        telefono: '300 123 4567',
        email: 'pedro@test.co',
    },
    arrendatario: {
        nombreCompleto: 'Empresa XYZ S.A.S.',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        telefono: '310 987 6543',
        email: '',
    },
    condiciones: {
        fechaInicio: '2026-04-01',
        duracionMeses: 12,
        canonMensual: '3000000',
        depositoCOP: '6000000',
        diaPagoMes: 3,
        actividadComercial: 'Servicios de consultoría empresarial',
    },
};

const withCoarrendatario = (): ArrendamientoFormData => ({
    ...base,
    coarrendatario: {
        nombreCompleto: 'Laura Gómez Vargas',
        tipoDocumento: 'CC',
        numeroDocumento: '5678901234',
        telefono: '320 555 1234',
        email: 'laura@test.co',
    },
});

// ── Título y encabezado ───────────────────────────────────────────────────────

describe('OficinaTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CONTRATO DE ARRENDAMIENTO');
    });

    it('muestra subtítulo Contrato de Oficina (sin Propiedad Horizontal)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Contrato de Oficina');
        expect(container.textContent).not.toContain('Propiedad Horizontal');
    });

    it('muestra el logo Grexia siempre', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getByAltText('Grexia')).toBeInTheDocument();
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('OficinaTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getAllByText('Pedro Ramírez Mora').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getAllByText('Empresa XYZ S.A.S.').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Carrera 7 # 32-45, Oficina 502');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('OficinaTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getAllByText(/TRES MILLONES PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*3[.,]000[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Bogotá');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('OficinaTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*6[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 3 días');
    });
});

// ── Cláusulas 1–22 ───────────────────────────────────────────────────────────

describe('OficinaTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        const text = container.textContent ?? '';

        expect(text).toContain('Primera.');
        expect(text).toContain('Segunda.');
        expect(text).toContain('Tercera.');
        expect(text).toContain('Cuarta.');
        expect(text).toContain('Quinta.');
        expect(text).toContain('Sexta.');
        expect(text).toContain('Séptima.');
        expect(text).toContain('Octava.');
        expect(text).toContain('Novena.');
        expect(text).toContain('Décima.');
        expect(text).toContain('Décima Primera.');
        expect(text).toContain('Décima Segunda.');
        expect(text).toContain('Décima Tercera.');
        expect(text).toContain('Décima Cuarta.');
        expect(text).toContain('Décima Quinta.');
        expect(text).toContain('Décima Sexta.');
        expect(text).toContain('Décima Séptima.');
        expect(text).toContain('Décima Octava.');
        expect(text).toContain('Décima Novena.');
        expect(text).toContain('Vigésima.');
        expect(text).toContain('Vigésima Primera.');
        expect(text).toContain('Vigésima Segunda.');
    });

    it('Primera menciona el objeto del contrato (oficina comercial)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('NO contiene cláusula de Régimen de Propiedad Horizontal', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).not.toContain('Régimen de Propiedad Horizontal');
    });

    it('Segunda es Canon de Arrendamiento (no PH)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Segunda. – Canon de Arrendamiento');
    });

    it('Tercera menciona reajuste del canon de arrendamiento', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Reajuste del Canon de Arrendamiento');
    });

    it('Cuarta menciona Artículo 518 del Código de Comercio', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 518 del Código de Comercio');
    });

    it('Cuarta menciona la duración del contrato', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
    });

    it('Sexta menciona reparaciones locativas', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('reparaciones locativas');
    });

    it('Séptima menciona servicios públicos', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Octava menciona Artículo 523 del Código de Comercio', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 523 del Código de Comercio');
    });

    it('Octava menciona la actividad comercial del arrendatario', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Servicios de consultoría empresarial');
    });

    it('Octava menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Quinta menciona mérito ejecutivo', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Séptima menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones');
    });

    it('Décima Novena menciona el abandono del inmueble', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Primera menciona impuestos', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('impuesto de timbre');
    });

    it('Vigésima Segunda menciona solidaria (coarrendatario)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('solidaria');
    });

    it('NO menciona Ley 820 de 2003 (régimen Código de Comercio)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).not.toContain('ley 820 de 2003');
        expect(container.textContent).not.toContain('Ley 820 de 2003');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('OficinaTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<OficinaTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<OficinaTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Laura Gómez Vargas').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<OficinaTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('5678901234');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('OficinaTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        const huellas = container.querySelectorAll('span');
        const huellaTexts = Array.from(huellas).filter((el) => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<OficinaTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<OficinaTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('OficinaTemplate — marca de agua', () => {
    it('muestra la marca de agua GREXIA siempre (aria-hidden)', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toBe('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('OficinaTemplate — footer', () => {
    it('muestra Generado por Grexia.co', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Grexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<OficinaTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('grexia.co');
    });
});
