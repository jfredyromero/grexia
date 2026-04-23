import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LaboralTerminoFijo from '../html/LaboralTerminoFijo';
import type { LaboralFormData } from '../types';
import { formatCOP, numberToWordsCOP } from '../laboralUtils';

// ── Fixture ───────────────────────────────────────────────────────────────────

const base: LaboralFormData = {
    tipoContrato: 'termino-fijo',
    empleador: {
        nombreCompleto: 'Carlos Alberto Gomez Ruiz',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        ciudad: 'Bogota D.C.',
        direccion: 'Calle 123 No. 45-67',
    },
    trabajador: {
        nombreCompleto: 'Maria Fernanda Lopez Torres',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        ciudad: 'Bogota D.C.',
        direccion: 'Carrera 15 No. 80-22 Apt 301',
    },
    condicionesTerminoFijo: {
        cargo: 'Analista de Sistemas',
        salario: '3500000',
        frecuenciaPago: 'mensual',
        metodoPago: 'efectivo',
        cuentaBancaria: '',
        jornada: 'lunes-viernes-8-5',
        lugarPrestacion: 'Calle 123 No. 45-67, Bogota D.C.',
        duracionNumero: '6',
        duracionUnidad: 'meses',
    },
    condicionesObraLabor: {
        descripcionObra: '',
        oficio: '',
        salario: '',
        modalidadPago: '',
        lugar: '',
    },
};

function renderTemplate(overrides?: Partial<LaboralFormData['condicionesTerminoFijo']>) {
    const formData: LaboralFormData = overrides
        ? { ...base, condicionesTerminoFijo: { ...base.condicionesTerminoFijo, ...overrides } }
        : base;
    return render(<LaboralTerminoFijo formData={formData} />);
}

// ── Partes ────────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — partes', () => {
    it('muestra el nombre del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Carlos Alberto Gomez Ruiz');
    });

    it('muestra el nombre del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Maria Fernanda Lopez Torres');
    });

    it('muestra el número de documento del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el número de documento del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la ciudad del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bogota D.C.');
    });

    it('muestra placeholder cuando faltan datos del empleador', () => {
        const formData: LaboralFormData = {
            ...base,
            empleador: { ...base.empleador, nombreCompleto: '', numeroDocumento: '' },
        };
        const { container } = render(<LaboralTerminoFijo formData={formData} />);
        expect(container.textContent).toContain('___________________');
    });
});

// ── Cargo ─────────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — cargo', () => {
    it('muestra el cargo del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Analista de Sistemas');
    });
});

// ── Salario ───────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — salario', () => {
    it('muestra el salario formateado en COP', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain(formatCOP('3500000'));
    });

    it('muestra el salario en letras', () => {
        const { container } = renderTemplate();
        const letras = numberToWordsCOP(3_500_000);
        expect(container.textContent).toContain(letras);
    });

    it('muestra placeholder cuando el salario está vacío', () => {
        const { container } = renderTemplate({ salario: '' });
        expect(container.textContent).toContain('$ ___________________');
    });
});

// ── Duración ──────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — duración', () => {
    it('muestra duración en letras: seis (6) meses', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toMatch(/seis \(6\) meses/i);
    });

    it('muestra duración en años: un (1) año', () => {
        const { container } = renderTemplate({ duracionNumero: '1', duracionUnidad: 'anos' });
        expect(container.textContent).toMatch(/un \(1\) año/i);
    });

    it('muestra placeholder cuando duración está vacía', () => {
        const { container } = renderTemplate({ duracionNumero: '', duracionUnidad: '' });
        expect(container.textContent).toContain('___________________');
    });
});

// ── Jornada ───────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — jornada', () => {
    it('muestra la jornada legible (no el valor raw)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('lunes a viernes de 8:00 a.m. a 5:00 p.m.');
        expect(container.textContent).not.toContain('lunes-viernes-8-5');
    });

    it('muestra la jornada lunes-viernes-7-4 legible', () => {
        const { container } = renderTemplate({ jornada: 'lunes-viernes-7-4' });
        expect(container.textContent).toContain('lunes a viernes de 7:00 a.m. a 4:00 p.m.');
    });
});

// ── Forma de pago ─────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — forma de pago', () => {
    it('no muestra cuenta bancaria cuando el método es efectivo', () => {
        const { container } = renderTemplate({ metodoPago: 'efectivo', cuentaBancaria: '' });
        expect(container.textContent).not.toContain('cuenta bancaria No.');
    });

    it('muestra la cuenta bancaria cuando el método es transferencia', () => {
        const { container } = renderTemplate({
            metodoPago: 'transferencia',
            cuentaBancaria: '1234567890123',
        });
        expect(container.textContent).toContain('1234567890123');
    });
});

// ── Artículo 2 — listas ───────────────────────────────────────────────────────

describe('LaboralTerminoFijo — artículo 2 listas', () => {
    it('muestra la subsección Del EMPLEADOR', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Del EMPLEADOR');
    });

    it('muestra la subsección Del TRABAJADOR', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Del TRABAJADOR');
    });

    it('muestra obligación de parafiscales', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('parafiscales');
    });
});

// ── Artículos clave ───────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — artículos clave', () => {
    it('muestra Artículo 8 de preaviso (30 días)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Artículo 8');
        expect(container.textContent).toContain('30 días');
    });

    it('muestra Artículo 9 con referencia al art. 62 C.S.T.', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Artículo 9');
        expect(container.textContent).toContain('artículo 62');
    });

    it('muestra Artículo 11 de integridad', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Artículo 11');
    });
});

// ── Firmas ────────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — firmas', () => {
    it('muestra el rol EMPLEADOR en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('EMPLEADOR');
    });

    it('muestra el rol TRABAJADOR en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('TRABAJADOR');
    });

    it('muestra el recuadro de huella', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Huella');
    });
});

// ── Logo y marca de agua ──────────────────────────────────────────────────────

describe('LaboralTerminoFijo — logo y marca de agua', () => {
    it('muestra el logo de Grexia', () => {
        renderTemplate();
        const logo = screen.getByAltText('Grexia');
        expect(logo).toBeInTheDocument();
    });

    it('muestra la marca de agua GREXIA con aria-hidden', () => {
        const { container } = renderTemplate();
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toContain('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('LaboralTerminoFijo — footer', () => {
    it('contiene "Generado con"', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Generado con');
    });

    it('contiene "grexia.co"', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('grexia.co');
    });

    it('contiene invitación a asesoría legal', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Agenda una asesoría legal');
    });
});
