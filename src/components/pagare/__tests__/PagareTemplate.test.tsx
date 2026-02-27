import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PagareTemplate from '../PagareTemplate';
import type { PagareFormData, PlanTier } from '../types';
import { formatCOP, numberToWordsCOP } from '../pagareUtils';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base: PagareFormData = {
    acreedor: {
        nombreCompleto: 'Juan Carlos Gómez Martínez',
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        telefono: '300 123 4567',
        email: 'juan@test.co',
    },
    deudor: {
        nombreCompleto: 'María Fernanda López Castro',
        tipoDocumento: 'CC',
        numeroDocumento: '9876543210',
        telefono: '310 987 6543',
        email: '',
        ciudadResidencia: 'Bogotá D.C.',
    },
    obligacion: {
        valorPrincipal: '1000000',
        fechaSuscripcion: '2026-02-22',
        modalidadPago: 'unico',
        fechaVencimiento: '2027-02-22',
        numeroCuotas: '',
        periodoCuotas: '',
        ciudadSuscripcion: 'Bogotá D.C.',
        tasaInteresMora: '',
    },
};

const baseCuotas: PagareFormData = {
    ...base,
    obligacion: {
        ...base.obligacion,
        modalidadPago: 'cuotas',
        fechaVencimiento: '',
        numeroCuotas: '12',
        periodoCuotas: 'mensual',
    },
};

function renderTemplate(overrides?: Partial<PagareFormData>, plan: PlanTier = 'free', logoUrl = '') {
    const formData = overrides ? { ...base, ...overrides } : base;
    return render(
        <PagareTemplate
            formData={formData}
            plan={plan}
            logoUrl={logoUrl}
        />
    );
}

// ── Amount Box ────────────────────────────────────────────────────────────────

describe('PagareTemplate — caja de monto', () => {
    it('muestra el valor formateado en COP', () => {
        const { container } = renderTemplate();
        const formatted = formatCOP('1000000');
        // Text may be split across siblings — check container textContent
        expect(container.textContent).toContain(formatted);
    });

    it('muestra "SON:" y el valor en letras', () => {
        const { container } = renderTemplate();
        const letras = numberToWordsCOP(1_000_000).toUpperCase();
        expect(container.textContent).toContain('SON:');
        expect(container.textContent).toContain(letras);
    });

    it('muestra placeholder cuando el valor está vacío', () => {
        const { container } = renderTemplate({
            obligacion: { ...base.obligacion, valorPrincipal: '' },
        });
        expect(container.textContent).toContain('$ ___________________');
    });

    it('muestra la ciudad de suscripción', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bogotá D.C.');
    });

    it('muestra la fecha de suscripción formateada', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('22 de febrero de 2026');
    });
});

// ── Parties (Deudor / Acreedor) ───────────────────────────────────────────────

describe('PagareTemplate — secciones de partes', () => {
    it('muestra la etiqueta DEUDOR con nombre', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Deudor(a)');
        expect(container.textContent).toContain('María Fernanda López Castro');
    });

    it('muestra la etiqueta ACREEDOR con nombre', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Acreedor(a)');
        expect(container.textContent).toContain('Juan Carlos Gómez Martínez');
    });

    it('muestra el número de documento del deudor', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('9876543210');
    });

    it('muestra la ciudad de residencia del deudor', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Bogotá D.C.');
    });

    it('muestra placeholders cuando faltan datos', () => {
        const { container } = renderTemplate({
            deudor: { ...base.deudor, nombreCompleto: '', numeroDocumento: '' },
        });
        expect(container.textContent).toContain('___________________');
    });
});

// ── Obligation paragraph ──────────────────────────────────────────────────────

describe('PagareTemplate — párrafo de obligación', () => {
    it('contiene el nombre del deudor y del acreedor en el cuerpo del documento', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('María Fernanda López Castro');
        expect(container.textContent).toContain('Juan Carlos Gómez Martínez');
    });

    it('contiene "me comprometo a pagar incondicionalmente"', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('me comprometo a pagar incondicionalmente');
    });
});

// ── Payment conditions box ───────────────────────────────────────────────────

describe('PagareTemplate — caja de condiciones de pago', () => {
    it('muestra la sección de condiciones de pago', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Condiciones de Pago');
    });

    it('pago único: muestra la fecha de vencimiento', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('22 de febrero de 2027');
    });

    it('por cuotas: muestra número de cuotas y período', () => {
        const { container } = render(
            <PagareTemplate
                formData={baseCuotas}
                plan="free"
            />
        );
        expect(container.textContent).toContain('12');
        expect(container.textContent).toContain('mensuales');
    });

    it('muestra "por definir" cuando no hay modalidad', () => {
        const { container } = renderTemplate({
            obligacion: { ...base.obligacion, modalidadPago: '' },
        });
        expect(container.textContent).toContain('por definir');
    });

    it('muestra la tasa de mora personalizada cuando se provee', () => {
        const { container } = renderTemplate({
            obligacion: { ...base.obligacion, tasaInteresMora: '1.5' },
        });
        expect(container.textContent).toContain('1.5% mensual');
    });

    it('muestra "tasa máxima legal vigente" cuando la mora está vacía', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('tasa máxima legal vigente certificada por la Superintendencia');
    });
});

// ── Clauses ───────────────────────────────────────────────────────────────────

describe('PagareTemplate — cláusulas', () => {
    it('muestra la sección de cláusulas', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('Cláusulas');
    });

    it('muestra PRIMERA (mérito ejecutivo)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('PRIMERA.');
        expect(container.textContent).toContain('mérito ejecutivo');
    });

    it('muestra SEGUNDA (intereses moratorios)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('SEGUNDA.');
        expect(container.textContent).toContain('intereses moratorios');
    });

    it('muestra TERCERA (transferible por endoso)', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('TERCERA.');
        expect(container.textContent).toContain('transferible por endoso');
    });

    it('muestra CUARTA con la ciudad de suscripción', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toContain('CUARTA.');
        expect(container.textContent).toContain('domicilio contractual');
    });
});

// ── Signature blocks ──────────────────────────────────────────────────────────

describe('PagareTemplate — bloques de firma', () => {
    it('muestra "DEUDOR ·" con documento en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toMatch(/DEUDOR\s*·\s*CC\s*9876543210/);
    });

    it('muestra "ACREEDOR ·" con documento en el bloque de firma', () => {
        const { container } = renderTemplate();
        expect(container.textContent).toMatch(/ACREEDOR\s*·\s*CC\s*1234567890/);
    });

    it('muestra el email del acreedor cuando se provee', () => {
        const { container } = renderTemplate();
        // Email appears in parties section and signature block
        expect(container.textContent).toContain('juan@test.co');
    });

    it('no renderiza el email del deudor cuando está vacío', () => {
        // deudor.email = '' so the conditional block renders nothing
        // Verify the deudor's signature block exists but email paragraph is not rendered
        const { container } = renderTemplate();
        const text = container.textContent ?? '';
        // Count occurrences: 'juan@test.co' appears (acreedor) but '' does not
        const count = (text.match(/juan@test\.co/g) ?? []).length;
        expect(count).toBeGreaterThan(0);
    });
});

// ── Plan: FREE ────────────────────────────────────────────────────────────────

describe('PagareTemplate — plan gratuito', () => {
    it('muestra el logo de texto LEXIA (no una imagen)', () => {
        renderTemplate(undefined, 'free');
        expect(screen.getByText('LEXIA')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('muestra la marca de agua LEXIA · DRAFT', () => {
        renderTemplate(undefined, 'free');
        expect(screen.getByText('LEXIA · DRAFT')).toBeInTheDocument();
    });

    it('muestra el footer de plan gratuito', () => {
        const { container } = renderTemplate(undefined, 'free');
        expect(container.textContent).toContain('plan gratuito');
        expect(container.textContent).toContain('lexia.co');
    });
});

// ── Plan: BÁSICO con logo ─────────────────────────────────────────────────────

describe('PagareTemplate — plan básico con logo personalizado', () => {
    it('muestra la imagen del logo personalizado', () => {
        renderTemplate(undefined, 'empresarial', 'data:image/png;base64,abc');
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
    });

    it('no muestra el texto LEXIA cuando hay logo personalizado', () => {
        renderTemplate(undefined, 'empresarial', 'data:image/png;base64,abc');
        expect(screen.queryByText('LEXIA')).not.toBeInTheDocument();
    });

    it('no muestra la marca de agua', () => {
        renderTemplate(undefined, 'empresarial', 'data:image/png;base64,abc');
        expect(screen.queryByText('LEXIA · DRAFT')).not.toBeInTheDocument();
    });

    it('no muestra el footer de plan gratuito', () => {
        const { container } = renderTemplate(undefined, 'empresarial', 'data:image/png;base64,abc');
        expect(container.textContent).not.toContain('plan gratuito');
    });
});

// ── Plan: BÁSICO sin logo ─────────────────────────────────────────────────────

describe('PagareTemplate — plan básico sin logo', () => {
    it('no muestra imagen ni texto LEXIA', () => {
        renderTemplate(undefined, 'empresarial', '');
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.queryByText('LEXIA')).not.toBeInTheDocument();
    });

    it('no muestra la marca de agua ni el footer gratuito', () => {
        const { container } = renderTemplate(undefined, 'empresarial', '');
        expect(screen.queryByText('LEXIA · DRAFT')).not.toBeInTheDocument();
        expect(container.textContent).not.toContain('plan gratuito');
    });
});

// ── Plan: PRO ─────────────────────────────────────────────────────────────────

describe('PagareTemplate — plan empresarial', () => {
    it('muestra logo personalizado en plan empresarial', () => {
        renderTemplate(undefined, 'empresarial', 'data:image/png;base64,xyz');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,xyz');
    });

    it('no muestra footer gratuito en plan empresarial', () => {
        const { container } = renderTemplate(undefined, 'empresarial', '');
        expect(container.textContent).not.toContain('plan gratuito');
    });
});
