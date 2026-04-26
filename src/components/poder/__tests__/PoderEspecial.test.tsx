import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PoderEspecial from '../html/PoderEspecial';
import type { PoderFormData } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseConInmuebleYDemandados: PoderFormData = {
    tipoProceso: 'declaracion-pertenencia',
    poderdante: {
        nombreCompleto: 'Andres Felipe Ramirez Torres',
        ccPoderdante: '1098765432',
        lugarExpedicionPoderdante: 'Bogota',
        ciudadPoderdante: 'Bogota',
        direccionInmueble: 'Calle 100 No. 15-20',
        matriculaInmobiliaria: '050C-1234567',
    },
    apoderado: {
        nombreCompleto: 'Camila Andrea Lopez Vargas',
        ccApoderado: '52345678',
        lugarExpedicionApoderado: 'Medellin',
        ciudadApoderado: 'Medellin',
        tarjetaProfesional: '123456',
    },
    proceso: {
        demandados: ['Personas Indeterminadas', 'Herederos de Juan Perez'],
        objetoPoder: '',
    },
};

const sinInmuebleSoloDemandados: PoderFormData = {
    ...baseConInmuebleYDemandados,
    tipoProceso: 'proceso-laboral',
    poderdante: {
        ...baseConInmuebleYDemandados.poderdante,
        direccionInmueble: '',
        matriculaInmobiliaria: '',
    },
    proceso: {
        demandados: ['Empresa S.A.S.'],
        objetoPoder: '',
    },
};

const conInmuebleSinDemandados: PoderFormData = {
    ...baseConInmuebleYDemandados,
    tipoProceso: 'tramites-notariales',
    proceso: {
        demandados: [''],
        objetoPoder: 'Adelantar la escrituracion del inmueble ante notaria.',
    },
};

// ── Datos del poderdante ──────────────────────────────────────────────────────

describe('PoderEspecial — datos del poderdante', () => {
    it('muestra el nombre del poderdante', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Andres Felipe Ramirez Torres');
    });

    it('muestra el número de cédula del poderdante', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('1098765432');
    });

    it('muestra el lugar de expedición del poderdante', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Bogota');
    });
});

// ── Datos del apoderado ───────────────────────────────────────────────────────

describe('PoderEspecial — datos del apoderado', () => {
    it('muestra el nombre del apoderado', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Camila Andrea Lopez Vargas');
    });

    it('muestra el número de cédula del apoderado', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('52345678');
    });

    it('muestra la tarjeta profesional', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('123456');
    });

    it('menciona el Consejo Superior de la Judicatura', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Consejo Superior de la Judicatura');
    });
});

// ── Condicional: hasInmueble ──────────────────────────────────────────────────

describe('PoderEspecial — condicional inmueble', () => {
    it('muestra dirección del inmueble cuando hasInmueble', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Calle 100 No. 15-20');
    });

    it('muestra la matrícula inmobiliaria cuando hasInmueble', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('050C-1234567');
    });

    it('NO menciona inmueble cuando !hasInmueble', () => {
        const { container } = render(<PoderEspecial formData={sinInmuebleSoloDemandados} />);
        expect(container.textContent?.toLowerCase()).not.toContain('matrícula inmobiliaria');
    });
});

// ── Condicional: hasDemandados ────────────────────────────────────────────────

describe('PoderEspecial — condicional demandados', () => {
    it('muestra los demandados separados', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Personas Indeterminadas');
        expect(container.textContent).toContain('Herederos de Juan Perez');
    });

    it('muestra "en contra de" cuando hay demandados', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('en contra de');
    });

    it('NO muestra "en contra de" cuando !hasDemandados', () => {
        const { container } = render(<PoderEspecial formData={conInmuebleSinDemandados} />);
        expect(container.textContent).not.toContain('en contra de');
    });

    it('muestra el objeto del poder cuando !hasDemandados', () => {
        const { container } = render(<PoderEspecial formData={conInmuebleSinDemandados} />);
        expect(container.textContent).toContain('Adelantar la escrituracion');
    });
});

// ── Tipo de proceso ───────────────────────────────────────────────────────────

describe('PoderEspecial — tipo de proceso', () => {
    it('muestra el labelDocumento de declaracion-pertenencia', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('PROCESO DE DECLARACIÓN DE PERTENENCIA');
    });

    it('muestra el labelDocumento de proceso-laboral', () => {
        const { container } = render(<PoderEspecial formData={sinInmuebleSoloDemandados} />);
        expect(container.textContent).toContain('PROCESO LABORAL');
    });

    it('muestra el labelDocumento de tramites-notariales', () => {
        const { container } = render(<PoderEspecial formData={conInmuebleSinDemandados} />);
        expect(container.textContent).toContain('TRÁMITES NOTARIALES');
    });
});

// ── Encabezado y artículos ────────────────────────────────────────────────────

describe('PoderEspecial — encabezado y artículos', () => {
    it('muestra el título PODER ESPECIAL', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('PODER ESPECIAL');
    });

    it('menciona el artículo 77 del Código General del Proceso', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('artículo 77');
    });

    it('contiene el texto "AMPLIO Y SUFICIENTE"', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('AMPLIO Y SUFICIENTE');
    });
});

// ── Firma ─────────────────────────────────────────────────────────────────────

describe('PoderEspecial — firma', () => {
    it('muestra la línea de firma con el nombre del poderdante', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        // El nombre aparece tanto en el cuerpo como en la firma final
        const occurrences = (container.textContent ?? '').split('Andres Felipe Ramirez Torres').length - 1;
        expect(occurrences).toBeGreaterThanOrEqual(2);
    });

    it('muestra el número de cédula al pie de la firma', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        const occurrences = (container.textContent ?? '').split('1098765432').length - 1;
        expect(occurrences).toBeGreaterThanOrEqual(2);
    });
});

// ── Logo y marca de agua ──────────────────────────────────────────────────────

describe('PoderEspecial — logo y marca de agua', () => {
    it('muestra el logo de Grexia', () => {
        render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(screen.getByAltText('Grexia')).toBeInTheDocument();
    });

    it('muestra la marca de agua GREXIA con aria-hidden', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        const watermark = container.querySelector('[aria-hidden="true"]');
        expect(watermark).toBeInTheDocument();
        expect(watermark?.textContent).toContain('GREXIA');
    });
});

// ── Footer ────────────────────────────────────────────────────────────────────

describe('PoderEspecial — footer', () => {
    it('contiene "Generado con"', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Generado con');
    });

    it('contiene "grexia.co"', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('grexia.co');
    });

    it('contiene invitación a asesoría legal', () => {
        const { container } = render(<PoderEspecial formData={baseConInmuebleYDemandados} />);
        expect(container.textContent).toContain('Agenda una asesoría legal');
    });
});
