import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ViviendasTemplate from '../html/Viviendas';
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

describe('ViviendasTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ARRENDAMIENTO');
    });

    it('muestra subtítulo Vivienda Urbana', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Vivienda Urbana');
    });

    it('NO muestra Propiedad Horizontal en el subtítulo', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).not.toContain('Propiedad Horizontal');
    });

    it('muestra el logo Grexia siempre', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getByAltText('Grexia')).toBeInTheDocument();
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('ViviendasTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getAllByText('Juan García Martínez').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getAllByText('María López Castro').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Calle 45 # 23-15, Apto 301');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('ViviendasTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getAllByText(/UN MILLÓN QUINIENTOS MIL PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*1[.,]500[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Bogotá');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('ViviendasTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*3[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 5');
    });
});

// ── Cláusulas 1–21 ───────────────────────────────────────────────────────────

describe('ViviendasTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
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

    it('NO contiene Vigésima Segunda (solo 21 cláusulas)', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).not.toContain('Vigésima Segunda.');
    });

    it('Segunda menciona Canon de Arrendamiento (no PH)', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Canon de Arrendamiento');
        expect(container.textContent).not.toContain('Régimen de Propiedad Horizontal');
    });

    it('Primera menciona el objeto del contrato', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('Tercera menciona la duración', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
        expect(container.textContent).toContain('ley 820 de 2003');
    });

    it('Sexta menciona servicios públicos del Inmueble', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Séptima menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Primera menciona incumplimiento con lista de acciones', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Declarar terminado este Contrato');
    });

    it('Décima Tercera menciona mérito ejecutivo', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Séptima menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones');
    });

    it('Décima Novena menciona el abandono del inmueble', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Primera menciona solidaria', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('solidaria');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('ViviendasTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<ViviendasTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<ViviendasTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Carlos Ruiz Gómez').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<ViviendasTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('5678901234');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('ViviendasTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        const spans = container.querySelectorAll('span');
        const huellaTexts = Array.from(spans).filter((el) => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<ViviendasTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<ViviendasTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('ViviendasTemplate — marca de agua', () => {
    it('muestra la marca de agua GREXIA siempre (aria-hidden)', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toBe('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('ViviendasTemplate — footer', () => {
    it('muestra Generado por Grexia.co', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Grexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<ViviendasTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('grexia.co');
    });
});
