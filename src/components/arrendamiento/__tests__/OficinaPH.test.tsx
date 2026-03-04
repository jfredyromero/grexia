import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OficinaPHTemplate from '../html/OficinaPH';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Oficina',
        propiedadHorizontal: true,
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

describe('OficinaPHTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CONTRATO DE ARRENDAMIENTO');
    });

    it('muestra subtítulo Contrato de Oficina - Propiedad Horizontal', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Contrato de Oficina - Propiedad Horizontal');
    });

    it('muestra el logo Lexia en plan gratuito', () => {
        render(
            <OficinaPHTemplate
                formData={base}
                plan="free"
            />
        );
        expect(screen.getByAltText('Lexia')).toBeInTheDocument();
    });

    it('muestra logo personalizado en plan empresarial con logoUrl', () => {
        render(
            <OficinaPHTemplate
                formData={base}
                plan="empresarial"
                logoUrl="data:image/png;base64,abc"
            />
        );
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'data:image/png;base64,abc');
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('OficinaPHTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getAllByText('Pedro Ramírez Mora').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getAllByText('Empresa XYZ S.A.S.').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Carrera 7 # 32-45, Oficina 502');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('OficinaPHTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getAllByText(/TRES MILLONES DE PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*3[.,]000[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Bogotá');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('OficinaPHTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*6[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 3 días');
    });
});

// ── Cláusulas 1–22 ───────────────────────────────────────────────────────────

describe('OficinaPHTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
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
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('Segunda menciona Régimen de Propiedad Horizontal', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Régimen de Propiedad Horizontal');
    });

    it('Tercera menciona reajuste del canon de arrendamiento', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Reajuste del Canon de Arrendamiento');
    });

    it('Cuarta menciona Artículo 518 del Código de Comercio', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 518 del Código de Comercio');
    });

    it('Quinta menciona la duración del contrato', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
    });

    it('Séptima menciona reparaciones locativas', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('reparaciones locativas');
    });

    it('Octava menciona servicios públicos', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Novena menciona Artículo 523 del Código de Comercio', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 523 del Código de Comercio');
    });

    it('Novena menciona la actividad comercial del arrendatario', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Servicios de consultoría empresarial');
    });

    it('Novena menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Quinta menciona mérito ejecutivo', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Séptima menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones');
    });

    it('Vigésima menciona el abandono del inmueble', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Segunda menciona solidaria (coarrendatario)', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('solidaria');
    });

    it('NO menciona Ley 820 de 2003 (régimen Código de Comercio)', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).not.toContain('ley 820 de 2003');
        expect(container.textContent).not.toContain('Ley 820 de 2003');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('OficinaPHTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<OficinaPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<OficinaPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Laura Gómez Vargas').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<OficinaPHTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('5678901234');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('OficinaPHTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        const huellas = container.querySelectorAll('span');
        const huellaTexts = Array.from(huellas).filter(el => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<OficinaPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<OficinaPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('OficinaPHTemplate — marca de agua', () => {
    it('plan free: muestra la marca de agua LEXIA (aria-hidden)', () => {
        const { container } = render(
            <OficinaPHTemplate
                formData={base}
                plan="free"
            />
        );
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toBe('LEXIA');
    });

    it('plan empresarial: no muestra la marca de agua', () => {
        const { container } = render(
            <OficinaPHTemplate
                formData={base}
                plan="empresarial"
            />
        );
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });

    it('plan empresarial: no muestra la marca de agua', () => {
        const { container } = render(
            <OficinaPHTemplate
                formData={base}
                plan="empresarial"
            />
        );
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('OficinaPHTemplate — footer', () => {
    it('muestra Generado por Lexia.co', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Lexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<OficinaPHTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('lexia.co');
    });
});
