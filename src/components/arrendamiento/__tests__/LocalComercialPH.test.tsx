import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocalComercialPHTemplate from '../html/LocalComercialPH';
import type { ArrendamientoFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: ArrendamientoFormData = {
    inmueble: {
        tipoInmueble: 'Local Comercial',
        propiedadHorizontal: true,
        direccion: 'Carrera 15 # 93-47, Local 201',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        estrato: '4',
        areaMq: '60',
    },
    arrendador: {
        nombreCompleto: 'Carlos Martínez López',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        telefono: '300 123 4567',
        email: 'carlos@test.co',
    },
    arrendatario: {
        nombreCompleto: 'Inversiones ABC S.A.S.',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        telefono: '310 987 6543',
        email: '',
    },
    condiciones: {
        fechaInicio: '2026-05-01',
        duracionMeses: 12,
        canonMensual: '4000000',
        depositoCOP: '8000000',
        diaPagoMes: 3,
        actividadComercial: 'Venta de ropa y accesorios',
    },
};

const withCoarrendatario = (): ArrendamientoFormData => ({
    ...base,
    coarrendatario: {
        nombreCompleto: 'Sofía Rodríguez Peña',
        tipoDocumento: 'CC',
        numeroDocumento: '5678901234',
        telefono: '320 555 1234',
        email: 'sofia@test.co',
    },
});

// ── Título y encabezado ───────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — encabezado', () => {
    it('muestra CONTRATO DE ARRENDAMIENTO como título principal', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ARRENDAMIENTO');
    });

    it('muestra subtítulo Contrato de Local Comercial - Propiedad Horizontal', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Contrato de Local Comercial - Propiedad Horizontal');
    });

    it('muestra el logo Grexia siempre', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getByAltText('Grexia')).toBeInTheDocument();
    });
});

// ── Recuadro de partes ────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — recuadro de partes', () => {
    it('muestra el nombre del arrendador', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getAllByText('Carlos Martínez López').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendador', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del arrendatario', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getAllByText('Inversiones ABC S.A.S.').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del arrendatario', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la dirección del inmueble en el recuadro del arrendatario', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Carrera 15 # 93-47, Local 201');
    });
});

// ── Recuadro de canon ─────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — recuadro info (canon y fecha)', () => {
    it('muestra el canon en palabras en mayúsculas', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getAllByText(/CUATRO MILLONES PESOS/i).length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el canon COP formateado', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*4[.,]000[.,]000/);
    });

    it('muestra la ciudad en el recuadro de info', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Bogotá');
    });
});

// ── Recuadro de condiciones ───────────────────────────────────────────────────

describe('LocalComercialPHTemplate — recuadro condiciones de pago', () => {
    it('muestra el depósito COP formateado', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toMatch(/\$\s*8[.,]000[.,]000/);
    });

    it('muestra la forma de pago', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Forma de pago');
    });

    it('muestra el día de pago', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('primeros 3 días');
    });
});

// ── Cláusulas 1–22 ───────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — cláusulas', () => {
    it('contiene encabezados de todas las cláusulas principales', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
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

    it('Primera menciona el objeto del contrato (local comercial)', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('título de arrendamiento');
        expect(container.textContent).toContain('"INMUEBLE"');
    });

    it('Segunda menciona Régimen de Propiedad Horizontal', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Régimen de Propiedad Horizontal');
    });

    it('Tercera menciona el canon de arrendamiento con datos del formulario', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Canon de Arrendamiento');
    });

    it('Quinta menciona Articulo 518 del Código de Comercio', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('518 del Código de Comercio');
    });

    it('Quinta menciona la duración del contrato', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('doce (12) meses');
    });

    it('Séptima menciona reparaciones locativas', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('reparaciones locativas');
    });

    it('Octava menciona servicios públicos', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('servicios públicos del Inmueble');
    });

    it('Novena menciona Artículo 523 del Código de Comercio', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 523 del Código de Comercio');
    });

    it('Novena menciona la actividad comercial del arrendatario', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Venta de ropa y accesorios');
    });

    it('Novena menciona Artículo 34 de la Ley 30 de 1986', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Artículo 34 de la Ley 30 de 1986');
    });

    it('Décima Sexta menciona mérito ejecutivo', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('Décima Octava menciona cláusula penal de 3 cánones', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('3 cánones');
    });

    it('Vigésima menciona el abandono del inmueble', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('abandonado o deshabitado');
    });

    it('Vigésima Segunda menciona impuesto de timbre', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('impuesto de timbre');
    });

    it('NO menciona Ley 820 de 2003 (régimen Código de Comercio)', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).not.toContain('ley 820 de 2003');
        expect(container.textContent).not.toContain('Ley 820 de 2003');
    });
});

// ── Coarrendatario ────────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — coarrendatario', () => {
    it('sin coarrendatario: no muestra bloque EL COARRENDATARIO en firmas', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO en firmas', () => {
        render(<LocalComercialPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });

    it('muestra el nombre del coarrendatario', () => {
        render(<LocalComercialPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getAllByText('Sofía Rodríguez Peña').length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el documento del coarrendatario', () => {
        const { container } = render(<LocalComercialPHTemplate formData={withCoarrendatario()} />);
        expect(container.textContent).toContain('5678901234');
    });
});

// ── Bloque de firmas ──────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — bloque de firmas', () => {
    it('incluye EL ARRENDADOR', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDADOR')).toBeInTheDocument();
    });

    it('incluye EL ARRENDATARIO', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.getByText('EL ARRENDATARIO')).toBeInTheDocument();
    });

    it('incluye recuadros de huella', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        const huellas = container.querySelectorAll('span');
        const huellaTexts = Array.from(huellas).filter((el) => el.textContent?.trim() === 'Huella');
        expect(huellaTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('sin coarrendatario: no muestra EL COARRENDATARIO', () => {
        render(<LocalComercialPHTemplate formData={base} />);
        expect(screen.queryByText('EL COARRENDATARIO')).not.toBeInTheDocument();
    });

    it('con coarrendatario: muestra EL COARRENDATARIO', () => {
        render(<LocalComercialPHTemplate formData={withCoarrendatario()} />);
        expect(screen.getByText('EL COARRENDATARIO')).toBeInTheDocument();
    });
});

// ── Marca de agua ─────────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — marca de agua', () => {
    it('muestra la marca de agua GREXIA siempre (aria-hidden)', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toBe('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('LocalComercialPHTemplate — footer', () => {
    it('muestra Generado por Grexia.co', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('Generado por');
        expect(container.textContent).toContain('Grexia.co');
    });

    it('muestra enlace a asesoría legal', () => {
        const { container } = render(<LocalComercialPHTemplate formData={base} />);
        expect(container.textContent).toContain('asesoría legal');
        expect(container.textContent).toContain('grexia.co');
    });
});
