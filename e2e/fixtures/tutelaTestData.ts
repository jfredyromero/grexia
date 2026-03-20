export const tutelaBasica = {
    accionante: {
        nombre: 'María Camila Torres Gómez',
        cedula: '1023456789',
        ciudad: 'Bogotá D.C.',
        telefono: '3001234567',
        correo: 'maria.torres@grexiatest.co',
    },
    eps: {
        nombreEPS: 'Sura EPS',
        regimen: 'contributivo' as const,
        sede: 'Bogotá D.C. — Calle 100 # 15-32',
        correo: '',
    },
    condicionMedica: {
        diagnostico: 'Diabetes tipo 2',
        servicioNegado: 'Insulina Glargina 100 UI/mL',
        tipoNegativa: 'No autorización por la EPS',
        fechaNegativa: '2024-03-15',
        historiaClinica:
            'Padezco diabetes tipo 2 desde hace 5 años. Mi médico tratante me prescribió insulina Glargina como tratamiento. La EPS se ha negado a autorizar dicho medicamento en tres oportunidades.',
        tieneMedico: 'si' as const,
        nombreMedico: 'Dr. Carlos Pérez',
    },
    vulnerabilidad: {
        condiciones: ['Enfermedad crónica o terminal'],
    },
    impacto: {
        saludVida:
            'Sin la insulina mi glucosa sube a niveles peligrosos, lo que me ha llevado a urgencias en dos ocasiones.',
        afectaTrabajo: 'si' as const,
        impactoTrabajo: 'Trabajo como docente y el deterioro de mi salud me impide ejercer con normalidad.',
        afectaFamilia: 'no' as const,
    },
    pretensiones: {
        tipo: 'Entrega del medicamento prescrito',
        detalle: 'Insulina Glargina 100 UI/mL, 5 cartuchos mensuales',
        solicitudes: 3,
    },
} as const;

export const tutelaSinMedico = {
    ...tutelaBasica,
    condicionMedica: {
        ...tutelaBasica.condicionMedica,
        tieneMedico: 'no' as const,
        nombreMedico: '',
    },
} as const;

export const tutelaOtraEPS = {
    ...tutelaBasica,
    eps: {
        nombreEPS: 'Otra' as const,
        otraEPS: 'Centro de Salud San José',
        regimen: 'subsidiado' as const,
        sede: 'Medellín — Calle 50 # 30-15',
        correo: '',
    },
} as const;
