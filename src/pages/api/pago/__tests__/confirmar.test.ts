import { describe, it, expect } from 'vitest';
import {
    validateEpaycoSignature,
    validateResumenCaso,
    mapTransaccionToResponse,
    type TransaccionRow,
} from '../confirmar';
import { validateCelular } from '../../../../components/asesoria/Checkout';

// SHA-256 of 'p123^key456^REF001^TXN001^59900^COP'
const EXPECTED_SIG = 'daf98ab0135fe4689258f6ed7e8df8e5c3b1a43912bb66a5678bc08335ed3618';

describe('validateEpaycoSignature', () => {
    it('retorna true con firma correcta', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(true);
    });

    it('retorna false cuando el monto está adulterado', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '99999',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(false);
    });

    it('retorna false con hash incorrecto', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        );
        expect(result).toBe(false);
    });

    it('retorna false con hash vacío', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: 'p123',
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            ''
        );
        expect(result).toBe(false);
    });

    it('retorna false cuando falta p_cust_id_cliente (undefined)', async () => {
        const result = await validateEpaycoSignature(
            {
                p_cust_id_cliente: undefined as unknown as string,
                p_key: 'key456',
                x_ref_payco: 'REF001',
                x_transaction_id: 'TXN001',
                x_amount: '59900',
                x_currency_code: 'COP',
            },
            EXPECTED_SIG
        );
        expect(result).toBe(false);
    });
});

describe('validateResumenCaso', () => {
    it('retorna objeto válido con datos correctos', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', resumen_caso: 'Mi caso' });
        expect(result).toEqual({ ref_payco: 'REF001', resumen_caso: 'Mi caso' });
    });

    it('retorna null cuando resumen_caso supera 5000 caracteres', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', resumen_caso: 'x'.repeat(5001) });
        expect(result).toBeNull();
    });

    it('retorna null cuando ref_payco está vacío', () => {
        const result = validateResumenCaso({ ref_payco: '', resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna null cuando ref_payco es undefined', () => {
        const result = validateResumenCaso({ ref_payco: undefined, resumen_caso: 'Mi caso' });
        expect(result).toBeNull();
    });

    it('retorna objeto válido con resumen_caso vacío', () => {
        const result = validateResumenCaso({ ref_payco: 'REF001', resumen_caso: '' });
        expect(result).toEqual({ ref_payco: 'REF001', resumen_caso: '' });
    });
});

const FAKE_CALENDAR = 'https://calendar.google.com/appointments/fake';

function makeRow(overrides: Partial<TransaccionRow> = {}): TransaccionRow {
    return {
        ref_payco: 'REF001',
        transaction_id: 'TXN001',
        estado: 'Aceptada',
        codigo_aprobacion: 'APR001',
        motivo_rechazo: null,
        nombre: 'Juan Perez',
        email: 'juan@test.com',
        telefono: '3001234567',
        monto: 59900,
        moneda: 'COP',
        franquicia: 'VS',
        tipo_pago: 'TDC',
        banco: 'Bancolombia',
        tarjeta: '**** 1234',
        cuotas: '1',
        descripcion: 'Asesoría legal',
        fecha_transaccion: '2026-04-08T00:00:00Z',
        ...overrides,
    };
}

describe('mapTransaccionToResponse', () => {
    it('retorna ok:true y calendarUrl cuando estado es Aceptada', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Aceptada' }), FAKE_CALENDAR);
        expect(result.ok).toBe(true);
        expect(result.calendarUrl).toBe(FAKE_CALENDAR);
    });

    it('retorna ok:false y sin calendarUrl cuando estado es Rechazada', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Rechazada' }), FAKE_CALENDAR);
        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
    });

    it('retorna ok:false cuando estado es Pendiente', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Pendiente' }), FAKE_CALENDAR);
        expect(result.ok).toBe(false);
        expect(result.calendarUrl).toBeUndefined();
    });

    it('pago incluye campo telefono', () => {
        const result = mapTransaccionToResponse(makeRow({ telefono: '3001234567' }), FAKE_CALENDAR);
        expect(result.pago.telefono).toBe('3001234567');
    });

    it('calendarUrl ausente del resultado cuando ok:false', () => {
        const result = mapTransaccionToResponse(makeRow({ estado: 'Rechazada' }), FAKE_CALENDAR);
        expect('calendarUrl' in result).toBe(false);
    });
});

describe('validateCelular', () => {
    it('acepta número de 10 dígitos válido', () => {
        expect(validateCelular('3001234567')).toBe(true);
    });

    it('rechaza número con prefijo internacional', () => {
        expect(validateCelular('573001234567')).toBe(false);
    });

    it('rechaza número con espacios', () => {
        expect(validateCelular('300 123 4567')).toBe(false);
    });

    it('rechaza número de 9 dígitos', () => {
        expect(validateCelular('300123456')).toBe(false);
    });

    it('rechaza número de 11 dígitos', () => {
        expect(validateCelular('30012345678')).toBe(false);
    });

    it('rechaza número con letras', () => {
        expect(validateCelular('300123456a')).toBe(false);
    });
});
