import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CompraventaTemplate from '../CompraventaTemplate';
import type { CompraventaFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: CompraventaFormData = {
    vendedor: {
        nombre: 'Juan Carlos Gomez Martinez',
        cc: '1234567890',
        ccExpedidaEn: 'Bogota',
        departamento: 'Bogota',
        ciudad: 'Bogota D.C.',
    },
    comprador: {
        nombre: 'Maria Fernanda Lopez Castro',
        cc: '9876543210',
        ccExpedidaEn: 'Medellin',
        departamento: 'Antioquia',
        ciudad: 'Medellin',
    },
    inmueble: {
        direccion: 'Calle 100 #15-20 Apto 501',
        departamento: 'Bogota',
        ciudad: 'Bogota D.C.',
        area: '85',
        linderoNorte: 'Apto 502',
        linderoSur: 'Zona comun',
        linderoOriente: 'Fachada',
        linderoOccidente: 'Apto 503',
        matricula: '50N-12345678',
        cedulaCatastral: '01-02-0304-0005-000',
    },
    tradicion: {
        tipoActo: 'COMPRAVENTA',
        escrituraNro: '1234',
        notaria: 'Notaria 15 de Bogota',
        folioMatricula: '50N-12345678',
        ciudadRegistro: 'Bogota',
    },
    economico: {
        precioTotal: '350000000',
        precioIncluyeDescripcion: '',
        formaDePago: 'Pago de contado al momento de la firma de escritura publica',
        arrasValor: '35000000',
        clausulaPenalValor: '35000000',
    },
    escritura: {
        notaria: 'Notaria 15 de Bogota',
        fecha: '2026-06-15',
        gastosDistribucion: 'por partes iguales entre comprador y vendedor',
        domicilioDepartamento: 'Bogota',
        domicilioCiudad: 'Bogota D.C.',
        incluyeTestigo: false,
        testigoNombre: '',
        testigoCC: '',
    },
};

function renderTemplate(overrides?: Partial<CompraventaFormData>) {
    const formData = overrides ? { ...base, ...overrides } : base;
    return render(<CompraventaTemplate formData={formData} />);
}

// ── Header ──────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — header', () => {
    it('muestra el titulo del documento', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PROMESA DE COMPRAVENTA');
    });

    it('muestra el subtitulo del documento', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bien Inmueble');
    });

    it('muestra el logo de Grexia', () => {
        const { getByAltText } = renderTemplate();
        expect(getByAltText('Grexia')).toBeDefined();
    });
});

// ── Parties Box ─────────────────────────────────────────────────────────────

describe('CompraventaTemplate — partes', () => {
    it('muestra el nombre del vendedor', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Juan Carlos Gomez Martinez');
    });

    it('muestra la CC del vendedor', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('1234567890');
    });

    it('muestra el nombre del comprador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Maria Fernanda Lopez Castro');
    });

    it('muestra la CC del comprador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('9876543210');
    });
});

// ── Info Box ────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — info box', () => {
    it('muestra el precio formateado', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('350');
    });

    it('muestra la ciudad del domicilio contractual', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bogota D.C.');
    });
});

// ── Clausulas ───────────────────────────────────────────────────────────────

describe('CompraventaTemplate — clausulas', () => {
    it('muestra la clausula PRIMERA (OBJETO)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PRIMERA');
        expect(container.textContent).toContain('OBJETO');
    });

    it('muestra la clausula SEGUNDA (TRADICION)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('SEGUNDA');
    });

    it('muestra la clausula TERCERA (OTRAS OBLIGACIONES)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('TERCERA');
    });

    it('muestra la clausula CUARTA (PRECIO Y FORMA DE PAGO)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('CUARTA');
        expect(container.textContent).toContain('PRECIO');
    });

    it('muestra la clausula QUINTA (ARRAS)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('QUINTA');
        expect(container.textContent).toContain('ARRAS');
    });

    it('muestra la clausula SEXTA (CLAUSULA PENAL)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('SEXTA');
    });

    it('muestra la clausula SEPTIMA (ESCRITURA)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PTIMA');
    });

    it('muestra la clausula DECIMA SEPTIMA (DOMICILIO)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('DOMICILIO');
    });

    it('muestra la clausula DECIMA OCTAVA (PERFECCIONAMIENTO)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PERFECCIONAMIENTO');
    });
});

// ── Inmueble ────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — inmueble', () => {
    it('muestra la direccion del inmueble', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Calle 100 #15-20 Apto 501');
    });

    it('muestra el area del inmueble', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('85');
    });

    it('muestra la matricula inmobiliaria', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('50N-12345678');
    });

    it('muestra la cedula catastral', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('01-02-0304-0005-000');
    });
});

// ── Tradicion ───────────────────────────────────────────────────────────────

describe('CompraventaTemplate — tradicion', () => {
    it('muestra el tipo de acto (COMPRAVENTA)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('COMPRAVENTA');
    });

    it('muestra el numero de escritura', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('1234');
    });

    it('muestra la notaria de tradicion', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Notaria 15 de Bogota');
    });
});

// ── precioIncluyeDescripcion ────────────────────────────────────────────────

describe('CompraventaTemplate — precio incluye descripcion', () => {
    it('muestra texto adicional cuando hay descripcion', () => {
        const { container } = renderTemplate({
            economico: { ...base.economico, precioIncluyeDescripcion: 'parqueadero y deposito' },
        });
        expect(container.textContent).toContain('parqueadero y deposito');
    });

    it('no muestra texto adicional cuando no hay descripcion', () => {
        const { container } = renderTemplate();
        expect(container.textContent).not.toContain('incluye');
    });
});

// ── Testigo ─────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — testigo', () => {
    it('no muestra bloque de testigo cuando incluyeTestigo es false', () => {
        const { container } = renderTemplate();
        expect(container.textContent).not.toContain('TESTIGO');
    });

    it('muestra bloque de testigo cuando incluyeTestigo es true', () => {
        const { container } = renderTemplate({
            escritura: {
                ...base.escritura,
                incluyeTestigo: true,
                testigoNombre: 'Pedro Ramirez',
                testigoCC: '5555666777',
            },
        });
        expect(container.textContent).toContain('TESTIGO');
        expect(container.textContent).toContain('Pedro Ramirez');
        expect(container.textContent).toContain('5555666777');
    });
});

// ── Firmas ──────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — firmas', () => {
    it('muestra la firma del vendedor', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PROMITENTE VENDEDOR');
    });

    it('muestra la firma del comprador', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PROMITENTE COMPRADOR');
    });
});

// ── Footer ──────────────────────────────────────────────────────────────────

describe('CompraventaTemplate — footer', () => {
    it('muestra "grexia.co" en el footer', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('grexia.co');
    });
});
