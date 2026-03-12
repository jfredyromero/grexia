import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViviendasPHTemplate from '../html/ViviendasPH';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Apartamento',
        propiedadHorizontal: true,
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

const withCoarrendatario = (): ArrendamientoFormData => ({
    ...base,
    coarrendatario: {
        nombreCompleto: 'Carlos Ruiz Gómez',
        tipoDocumento: 'CC',
        numeroDocumento: '5678901234',
        telefono: '320 555 1234',
        email: 'carlos@test.co',
    },
});

// ── Título y encabezado ───────────────────────────────────────────────────────

describe('ViviendasPHTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('CONTRATO DE ARRENDAMIENTO');
    });

    it('muestra subtítulo Propiedad Horizontal', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Propiedad Horizontal');
    });

    it('muestra el logo Grexia siempre', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getByAltText('Grexia')).toBeInTheDocument();
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getAllByText('Juan García Martínez').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getAllByText('María López Castro').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Calle 45 # 23-15, Apto 301');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getAllByText(/UN MILLÓN QUINIENTOS MIL PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*1[.,]500[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Bogotá');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('ViviendasPHTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*3[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 5 días');
    });
});

// ── Cláusulas 1–22 ───────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
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

    it('Primera menciona el objeto del contrato', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('Segunda menciona Régimen de Propiedad Horizontal', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Régimen de Propiedad Horizontal');
    });

    it('Tercera menciona Ley 242 de 1995', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Ley 242 de 1995');
    });

    it('Cuarta menciona la duración y los artículos de Ley 820', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
        expect(container.textContent).toContain('ley 820 de 2003');
    });

    it('Sexta menciona artículos 2029 y 2030 del Código Civil', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('artículos 2029 y 2030 del Código Civil');
    });

    it('Séptima menciona servicios públicos', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Octava menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Quinta menciona mérito ejecutivo', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Octava menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones de arrendamiento');
    });

    it('Vigésima menciona el abandono del inmueble', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Segunda menciona solidaria', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('solidaria');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<ViviendasPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<ViviendasPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Carlos Ruiz Gómez').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<ViviendasPHTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('5678901234');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        const huellas = container.querySelectorAll('span');
        const huellaTexts = Array.from(huellas).filter((el) => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<ViviendasPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<ViviendasPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — marca de agua', () => {
    it('muestra la marca de agua GREXIA siempre (aria-hidden)', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toBe('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('ViviendasPHTemplate — footer', () => {
    it('muestra Generado por Grexia.co', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Grexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<ViviendasPHTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('grexia.co');
    });
});
