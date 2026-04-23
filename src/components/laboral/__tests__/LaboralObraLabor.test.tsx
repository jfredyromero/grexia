import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LaboralObraLabor from '../html/LaboralObraLabor';
import type { LaboralFormData } from '../types';
import { formatCOP, numberToWordsCOP } from '../laboralUtils';

// ── Fixture ───────────────────────────────────────────────────────────────────

const base: LaboralFormData = {
    tipoContrato: 'obra-labor',
    empleador: {
        nombreCompleto: 'Construcciones Andinas S.A.S.',
        tipoDocumento: 'NIT',
        numeroDocumento: '900123456',
        ciudad: 'Medellin',
        direccion: 'Carrera 70 No. 10-15',
    },
    trabajador: {
        nombreCompleto: 'Maria Fernanda Lopez Torres',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        ciudad: 'Bogota D.C.',
        direccion: 'Carrera 15 No. 80-22 Apt 301',
    },
    condicionesTerminoFijo: {
        cargo: '',
        salario: '',
        frecuenciaPago: '',
        metodoPago: '',
        cuentaBancaria: '',
        jornada: '',
        lugarPrestacion: '',
        duracionNumero: '',
        duracionUnidad: '',
    },
    condicionesObraLabor: {
        descripcionObra:
            'Construccion de edificio residencial de 5 pisos. La obra se entiende finalizada cuando se obtenga el certificado de ocupacion.',
        oficio: 'Maestro de obra',
        salario: '2500000',
        modalidadPago: 'mensual',
        lugar: 'Carrera 70 No. 10-15, Medellin',
    },
};

function renderTemplate(overrides?: Partial<LaboralFormData['condicionesObraLabor']>) {
    const formData: LaboralFormData = overrides
        ? { ...base, condicionesObraLabor: { ...base.condicionesObraLabor, ...overrides } }
        : base;
    return render(<LaboralObraLabor formData={formData} />);
}

// ── Partes ────────────────────────────────────────────────────────────────────

describe('LaboralObraLabor — partes', () => {
    it('muestra el nombre del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Construcciones Andinas S.A.S.');
    });

    it('muestra el nombre del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Maria Fernanda Lopez Torres');
    });

    it('muestra el NIT del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('900123456');
    });

    it('muestra la cédula del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la ciudad del empleador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Medellin');
    });

    it('muestra la ciudad del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bogota D.C.');
    });

    it('muestra placeholder cuando faltan datos del empleador', () => {
        const formData: LaboralFormData = {
            ...base,
            empleador: { ...base.empleador, nombreCompleto: '', numeroDocumento: '' },
        };
        const { container } = render(<LaboralObraLabor formData={formData} />);
        expect(container.textContent).toContain('___________________');
    });
});

// ── Datos de la obra ──────────────────────────────────────────────────────────

describe('LaboralObraLabor — datos de la obra', () => {
    it('muestra la descripción de la obra', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Construccion de edificio residencial de 5 pisos');
    });

    it('muestra el oficio del trabajador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Maestro de obra');
    });

    it('muestra el lugar de la obra', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Carrera 70 No. 10-15, Medellin');
    });

    it('muestra la modalidad de pago', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('mensual');
    });

    it('muestra placeholder cuando la descripción de la obra está vacía', () => {
        const { container } = renderTemplate({ descripcionObra: '' });
        expect(container.textContent).toContain('___________________');
    });
});

// ── Salario ───────────────────────────────────────────────────────────────────

describe('LaboralObraLabor — salario', () => {
    it('muestra el salario formateado en COP', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain(formatCOP('2500000'));
    });

    it('muestra el salario en letras', () => {
        const { container } = renderTemplate();
        const letras = numberToWordsCOP(2_500_000);
        expect(container.textContent).toContain(letras);
    });

    it('muestra placeholder cuando el salario está vacío', () => {
        const { container } = renderTemplate({ salario: '' });
        expect(container.textContent).toContain('$ ___________________');
    });
});

// ── Cláusulas ─────────────────────────────────────────────────────────────────

describe('LaboralObraLabor — cláusulas', () => {
    it('muestra la cláusula Primera', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Primera.');
    });

    it('muestra la cláusula Segunda', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Segunda.');
    });

    it('muestra la cláusula Tercera', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Tercera.');
    });

    it('muestra la cláusula Cuarta', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Cuarta.');
    });

    it('muestra la cláusula Quinta (duración por obra o labor contratada)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Quinta.');
        expect(container.textContent).toContain('obra (o labor contratada)');
    });

    it('muestra la cláusula Sexta (justas causas - decreto 2351)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Sexta.');
        expect(container.textContent).toContain('decreto 2351 de 1965');
    });

    it('muestra la cláusula Séptima (invenciones)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Séptima.');
    });

    it('muestra la cláusula Octava (traslados)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Octava.');
    });

    it('muestra la cláusula Novena (buena fe)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Novena.');
    });

    it('muestra la cláusula Décima (integridad del contrato)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Décima.');
    });
});

// ── Cierre ────────────────────────────────────────────────────────────────────

describe('LaboralObraLabor — cierre', () => {
    it('muestra el texto de cierre antes de firmas', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Leído el presente documento');
        expect(container.textContent).toContain('firman y suscriben el presente contrato de efectos legales');
    });
});

// ── Bloques de firma ──────────────────────────────────────────────────────────

describe('LaboralObraLabor — bloques de firma', () => {
    it('muestra EMPLEADOR en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('EMPLEADOR');
    });

    it('muestra TRABAJADOR en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('TRABAJADOR');
    });

    it('muestra Huella en los bloques de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Huella');
    });
});

// ── Logo y marca de agua ──────────────────────────────────────────────────────

describe('LaboralObraLabor — logo y marca de agua', () => {
    it('muestra el logo de Grexia', () => {
        renderTemplate();
        const logo = screen.getByAltText('Grexia');
        expect(logo).toBeInTheDocument();
    });

    it('muestra la marca de agua GREXIA', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('GREXIA');
    });

    it('la marca de agua tiene aria-hidden', () => {
        const { container } = renderTemplate();
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark!.textContent).toContain('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('LaboralObraLabor — footer', () => {
    it('contiene el texto "Generado con"', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Generado con');
    });

    it('contiene "grexia.co"', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('grexia.co');
    });

    it('contiene texto de asesoría legal', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Agenda una asesoría legal');
    });
});
