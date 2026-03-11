import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocalComercialTemplate from '../html/LocalComercial';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Local Comercial',
        propiedadHorizontal: false,
        direccion: 'Calle 72 # 10-34, Local 3',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        estrato: '3',
        areaMq: '45',
    },
    arrendador: {
        nombreCompleto: 'Pedro Gómez Vargas',
        tipoDocumento: 'CC',
        numeroDocumento: '1122334455',
        telefono: '301 111 2222',
        email: 'pedro@test.co',
    },
    arrendatario: {
        nombreCompleto: 'Distribuciones XYZ S.A.S.',
        tipoDocumento: 'CC',
        numeroDocumento: '9988776655',
        telefono: '312 333 4444',
        email: '',
    },
    condiciones: {
        fechaInicio: '2026-06-01',
        duracionMeses: 12,
        canonMensual: '3000000',
        depositoCOP: '6000000',
        diaPagoMes: 3,
        actividadComercial: 'Distribución de productos alimenticios',
    },
};

const withCoarrendatario = (): ArrendamientoFormData => ({
    ...base,
    coarrendatario: {
        nombreCompleto: 'Ana Torres Ríos',
        tipoDocumento: 'CC',
        numeroDocumento: '4455667788',
        telefono: '321 444 5555',
        email: 'ana@test.co',
    },
});

// ── Título y encabezado ───────────────────────────────────────────────────────

describe('LocalComercialTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CONTRATO DE ARRENDAMIENTO');
    });

    it('muestra subtítulo Contrato de Local Comercial', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Contrato de Local Comercial');
    });

    it('NO muestra Propiedad Horizontal en el subtítulo', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).not.toContain('Propiedad Horizontal');
    });

    it('muestra el logo Lexia en plan gratuito', () => {
        render(
            <LocalComercialTemplate
                formData={base}
                plan="free"
            />
        );
        expect(screen.getByAltText('Lexia')).toBeInTheDocument();
    });

    it('muestra logo personalizado en plan empresarial con logoUrl', () => {
        render(
            <LocalComercialTemplate
                formData={base}
                plan="empresarial"
                logoUrl="data:image/png;base64,abc"
            />
        );
        expect(screen.getByAltText('Logo')).toHaveAttribute('src', 'data:image/png;base64,abc');
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('LocalComercialTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getAllByText('Pedro Gómez Vargas').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('1122334455');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getAllByText('Distribuciones XYZ S.A.S.').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('9988776655');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Calle 72 # 10-34, Local 3');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('LocalComercialTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getAllByText(/TRES MILLONES PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*3[.,]000[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Medellín');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('LocalComercialTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*6[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 3 días');
    });
});

// ── Cláusulas 1–21 ───────────────────────────────────────────────────────────

describe('LocalComercialTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
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
    });

    it('NO contiene Vigésima Segunda (solo 21 cláusulas, sin PH)', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).not.toContain('Vigésima Segunda.');
    });

    it('Primera menciona el objeto del contrato (local comercial)', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('NO contiene cláusula de Régimen de Propiedad Horizontal', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).not.toContain('Régimen de Propiedad Horizontal');
    });

    it('Segunda menciona el canon de arrendamiento', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Canon de Arrendamiento');
    });

    it('Cuarta menciona Articulo 518 del Código de Comercio', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('518 del Código de Comercio');
    });

    it('Cuarta menciona la duración del contrato', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
    });

    it('Sexta menciona reparaciones locativas', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('reparaciones locativas');
    });

    it('Séptima menciona servicios públicos', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Octava menciona Artículo 523 del Código de Comercio', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 523 del Código de Comercio');
    });

    it('Octava menciona la actividad comercial del arrendatario', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Distribución de productos alimenticios');
    });

    it('Octava menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Quinta menciona mérito ejecutivo', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Séptima menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones');
    });

    it('Décima Novena menciona el abandono del inmueble', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Primera menciona impuesto de timbre', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('impuesto de timbre');
    });

    it('NO menciona Ley 820 de 2003 (régimen Código de Comercio)', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).not.toContain('ley 820 de 2003');
        expect(container.textContent).not.toContain('Ley 820 de 2003');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('LocalComercialTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<LocalComercialTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<LocalComercialTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Ana Torres Ríos').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<LocalComercialTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('4455667788');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('LocalComercialTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        const huellas = container.querySelectorAll('span');
        const huellaTexts = Array.from(huellas).filter((el) => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<LocalComercialTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<LocalComercialTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('LocalComercialTemplate — marca de agua', () => {
    it('plan free: muestra la marca de agua LEXIA (aria-hidden)', () => {
        const { container } = render(
            <LocalComercialTemplate
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
            <LocalComercialTemplate
                formData={base}
                plan="empresarial"
            />
        );
        expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('LocalComercialTemplate — footer', () => {
    it('muestra Generado por Lexia.co', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Lexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<LocalComercialTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('lexia.co');
    });
});
