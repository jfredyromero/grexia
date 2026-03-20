import { describe, it, expect } from 'vitest';
import {
    formatFecha,
    getEPSDisplay,
    getVulnerabilidadTexto,
    generarTextoHechos,
    generarPretensiones,
    generarListaAnexos,
} from '../tutelaUtils';
import type { TutelaFormData } from '../types';
import { INITIAL_TUTELA_DATA } from '../types';

const datosCompletos: TutelaFormData = {
    ...INITIAL_TUTELA_DATA,
    nombreCompleto: 'María Camila Torres',
    cedula: '1023456789',
    ciudad: 'Bogotá D.C.',
    telefono: '3001234567',
    correo: 'maria@test.com',
    nombreEPS: 'Sura EPS',
    otraEPS: '',
    regimen: 'contributivo',
    sedeEPS: 'Bogotá D.C.',
    correoEPS: '',
    diagnostico: 'Diabetes tipo 2',
    servicioNegado: 'Insulina Glargina',
    tipoNegativa: 'no_autorizacion',
    fechaNegativa: '2024-03-15',
    historiaClinica: 'Padezco diabetes desde hace 5 años.',
    tieneMedicoTratante: 'si',
    nombreMedico: 'Dr. Carlos Pérez',
    condicionesVulnerabilidad: ['enfermedad_cronica'],
    tipoDiscapacidad: '',
    descripcionZonaAcceso: '',
    impactoSaludVida: 'Sin la insulina mi glucosa sube peligrosamente.',
    afectaTrabajo: 'si',
    descripcionImpactoTrabajo: 'No puedo trabajar como conductor.',
    afectaFamilia: 'no',
    descripcionImpactoFamilia: '',
    tipoPretension: 'medicamento',
    otraPretension: '',
    detalleEspecifico: 'Insulina Glargina 100 UI/mL, 5 cartuchos mensuales',
    numeroSolicitudes: 3,
    documentosGuia: ['historia_clinica', 'carta_negativa'],
};

describe('formatFecha', () => {
    it('formatea una fecha correctamente en español', () => {
        expect(formatFecha('2024-03-15')).toBe('15 de marzo de 2024');
    });

    it('retorna placeholder con fecha vacía', () => {
        expect(formatFecha('')).toBe('___________________');
    });
});

describe('getEPSDisplay', () => {
    it('retorna el nombre directo de la EPS', () => {
        expect(getEPSDisplay(datosCompletos)).toBe('Sura EPS');
    });

    it('retorna otraEPS cuando nombreEPS es Otra', () => {
        const data = { ...datosCompletos, nombreEPS: 'Otra', otraEPS: 'Coomeva EPS' };
        expect(getEPSDisplay(data)).toBe('Coomeva EPS');
    });

    it('retorna placeholder cuando no hay EPS', () => {
        expect(getEPSDisplay(INITIAL_TUTELA_DATA)).toBe('___________________');
    });
});

describe('getVulnerabilidadTexto', () => {
    it('retorna texto vacío cuando no hay condiciones', () => {
        expect(getVulnerabilidadTexto(INITIAL_TUTELA_DATA)).toBe('');
    });

    it('retorna texto vacío cuando solo está ninguna', () => {
        const data = { ...INITIAL_TUTELA_DATA, condicionesVulnerabilidad: ['ninguna'] };
        expect(getVulnerabilidadTexto(data)).toBe('');
    });

    it('incluye la condición en el texto', () => {
        const texto = getVulnerabilidadTexto(datosCompletos);
        expect(texto).toContain('enfermedad crónica');
    });

    it('incluye el tipo de discapacidad cuando aplica', () => {
        const data = {
            ...datosCompletos,
            condicionesVulnerabilidad: ['discapacidad'],
            tipoDiscapacidad: 'parálisis cerebral',
        };
        const texto = getVulnerabilidadTexto(data);
        expect(texto).toContain('parálisis cerebral');
    });
});

describe('generarTextoHechos', () => {
    it('contiene el nombre del diagnóstico', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('Diabetes tipo 2');
    });

    it('contiene el nombre de la EPS', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('Sura EPS');
    });

    it('contiene el servicio negado', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('Insulina Glargina');
    });

    it('incluye impacto laboral cuando aplica', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('No puedo trabajar como conductor');
    });

    it('no incluye impacto familiar cuando no aplica', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).not.toContain('afecta mi vida familiar');
    });

    it('contiene el número de solicitudes', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('3');
    });

    it('está redactado en primera persona (no usa "el accionante")', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).not.toContain('El accionante');
        expect(texto).not.toContain('el accionante');
        expect(texto).not.toContain('del accionante');
    });

    it('usa verbos en primera persona singular', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('Me encuentro');
        expect(texto).toContain('Padezco');
        expect(texto).toContain('He formulado');
    });

    it('incluye impacto laboral en primera persona cuando aplica', () => {
        const texto = generarTextoHechos(datosCompletos);
        expect(texto).toContain('mi actividad económica');
    });
});

describe('generarPretensiones', () => {
    it('retorna array de 3 pretensiones', () => {
        expect(generarPretensiones(datosCompletos)).toHaveLength(3);
    });

    it('primera pretensión menciona la EPS', () => {
        const pretensiones = generarPretensiones(datosCompletos);
        expect(pretensiones[0]).toContain('Sura EPS');
    });

    it('segunda pretensión contiene el detalle específico', () => {
        const pretensiones = generarPretensiones(datosCompletos);
        expect(pretensiones[1]).toContain('Insulina Glargina 100 UI/mL');
    });
});

describe('generarListaAnexos', () => {
    it('retorna documentos de la guía seleccionados', () => {
        const lista = generarListaAnexos(datosCompletos);
        expect(lista).toContain('Copia de historia clínica');
        expect(lista).toContain('Carta de negativa de la EPS');
    });

    it('retorna lista vacía cuando no hay documentos seleccionados', () => {
        const lista = generarListaAnexos(INITIAL_TUTELA_DATA);
        expect(lista).toHaveLength(0);
    });
});
