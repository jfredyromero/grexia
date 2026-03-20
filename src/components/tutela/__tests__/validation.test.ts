import { describe, it, expect } from 'vitest';
import {
    validateStep1,
    validateStep2,
    validateStep3,
    validateStep4,
    validateStep5,
    validateStep6,
    hasErrors,
} from '../validation';
import { INITIAL_TUTELA_DATA } from '../types';

describe('validateStep1', () => {
    it('retorna errores con datos vacíos', () => {
        const errors = validateStep1(INITIAL_TUTELA_DATA);
        expect(errors.nombreCompleto).toBeTruthy();
        expect(errors.cedula).toBeTruthy();
        expect(errors.ciudad).toBeTruthy();
        expect(errors.telefono).toBeTruthy();
        expect(errors.correo).toBeTruthy();
    });

    it('acepta datos válidos', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            nombreCompleto: 'María Torres',
            cedula: '1023456789',
            ciudad: 'Bogotá',
            telefono: '3001234567',
            correo: 'maria@test.com',
        };
        expect(hasErrors(validateStep1(data))).toBe(false);
    });

    it('rechaza cédula con letras', () => {
        const data = { ...INITIAL_TUTELA_DATA, cedula: 'ABC123' };
        expect(validateStep1(data).cedula).toBeTruthy();
    });

    it('rechaza correo inválido', () => {
        const data = { ...INITIAL_TUTELA_DATA, correo: 'no-es-correo' };
        expect(validateStep1(data).correo).toBeTruthy();
    });
});

describe('validateStep2', () => {
    it('retorna errores con datos vacíos', () => {
        const errors = validateStep2(INITIAL_TUTELA_DATA);
        expect(errors.nombreEPS).toBeTruthy();
        expect(errors.regimen).toBeTruthy();
        expect(errors.sedeEPS).toBeTruthy();
    });

    it('requiere otraEPS cuando nombreEPS es Otra', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            nombreEPS: 'Otra',
            regimen: 'contributivo' as const,
            sedeEPS: 'Bogotá',
        };
        expect(validateStep2(data).otraEPS).toBeTruthy();
    });

    it('acepta EPS de la lista sin otraEPS', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            nombreEPS: 'Sura EPS',
            regimen: 'subsidiado' as const,
            sedeEPS: 'Medellín',
        };
        expect(hasErrors(validateStep2(data))).toBe(false);
    });
});

describe('validateStep3', () => {
    it('retorna errores con datos vacíos', () => {
        const errors = validateStep3(INITIAL_TUTELA_DATA);
        expect(errors.diagnostico).toBeTruthy();
        expect(errors.servicioNegado).toBeTruthy();
        expect(errors.tipoNegativa).toBeTruthy();
        expect(errors.fechaNegativa).toBeTruthy();
        expect(errors.historiaClinica).toBeTruthy();
    });

    it('requiere nombreMedico cuando tieneMedicoTratante es si', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            diagnostico: 'Diabetes',
            servicioNegado: 'Insulina',
            tipoNegativa: 'no_autorizacion',
            fechaNegativa: '2024-01-15',
            historiaClinica: 'Historia...',
            tieneMedicoTratante: 'si' as const,
        };
        expect(validateStep3(data).nombreMedico).toBeTruthy();
    });
});

describe('validateStep4', () => {
    it('requiere al menos una condición', () => {
        expect(validateStep4(INITIAL_TUTELA_DATA).condicionesVulnerabilidad).toBeTruthy();
    });

    it('requiere tipoDiscapacidad cuando discapacidad está seleccionada', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            condicionesVulnerabilidad: ['discapacidad'],
        };
        expect(validateStep4(data).tipoDiscapacidad).toBeTruthy();
    });

    it('acepta ninguna como condición', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            condicionesVulnerabilidad: ['ninguna'],
        };
        expect(hasErrors(validateStep4(data))).toBe(false);
    });
});

describe('validateStep5', () => {
    it('retorna errores con datos vacíos', () => {
        const errors = validateStep5(INITIAL_TUTELA_DATA);
        expect(errors.impactoSaludVida).toBeTruthy();
        expect(errors.afectaTrabajo).toBeTruthy();
        expect(errors.afectaFamilia).toBeTruthy();
    });

    it('requiere descripcionImpactoTrabajo cuando afectaTrabajo es si', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            impactoSaludVida: 'No puedo caminar.',
            afectaTrabajo: 'si' as const,
            afectaFamilia: 'no' as const,
        };
        expect(validateStep5(data).descripcionImpactoTrabajo).toBeTruthy();
    });

    it('requiere descripcionImpactoFamilia cuando afectaFamilia es si', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            impactoSaludVida: 'No puedo caminar.',
            afectaTrabajo: 'no' as const,
            afectaFamilia: 'si' as const,
        };
        expect(validateStep5(data).descripcionImpactoFamilia).toBeTruthy();
    });

    it('acepta datos válidos sin afectaciones', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            impactoSaludVida: 'Afecta mi calidad de vida.',
            afectaTrabajo: 'no' as const,
            afectaFamilia: 'no' as const,
        };
        expect(hasErrors(validateStep5(data))).toBe(false);
    });
});

describe('validateStep6', () => {
    it('retorna errores con datos vacíos', () => {
        const errors = validateStep6(INITIAL_TUTELA_DATA);
        expect(errors.tipoPretension).toBeTruthy();
        expect(errors.detalleEspecifico).toBeTruthy();
    });

    it('requiere otraPretension cuando tipoPretension es otro', () => {
        const data = {
            ...INITIAL_TUTELA_DATA,
            tipoPretension: 'otro',
            detalleEspecifico: 'Detalle',
            numeroSolicitudes: 2,
        };
        expect(validateStep6(data).otraPretension).toBeTruthy();
    });
});

describe('hasErrors', () => {
    it('retorna true si hay errores', () => {
        expect(hasErrors({ campo: 'Error' })).toBe(true);
    });

    it('retorna false si no hay errores', () => {
        expect(hasErrors({ campo: '' })).toBe(false);
        expect(hasErrors({})).toBe(false);
    });
});
