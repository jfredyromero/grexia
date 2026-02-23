export const pagareSimple = {
    acreedor: {
        nombre: 'Juan Carlos Gómez Martínez',
        tipoDoc: 'CC',
        numDoc: '1234567890',
        telefono: '300 123 4567',
        email: 'juan.gomez@lexiatest.co',
    },
    deudor: {
        nombre: 'María Fernanda López Castro',
        tipoDoc: 'CC',
        numDoc: '9876543210',
        telefono: '310 987 6543',
        email: '',
        // department ID and city name — must match the mocked API response
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
    },
    obligacion: {
        valor: '5000000',
        fechaSuscripcion: '2026-02-22',
        fechaVencimiento: '2027-02-22',
        modalidad: 'unico' as const,
        // department ID and city name — must match the mocked API response
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '',
    },
} as const;

export const pagareEnCuotas = {
    ...pagareSimple,
    obligacion: {
        ...pagareSimple.obligacion,
        modalidad: 'cuotas' as const,
        numeroCuotas: '12',
        periodoCuotas: 'mensual' as const,
        fechaVencimiento: '',
    },
} as const;

/** Mocked Colombia API responses. Use these with page.route() in tests. */
export const mockColombiaApi = {
    departments: [
        { id: 11, name: 'Bogotá D.C.' },
        { id: 5, name: 'Antioquia' },
    ],
    citiesBogota: [
        { id: 149, name: 'Bogotá D.C.' },
        { id: 150, name: 'Soacha' },
    ],
} as const;
