// ── Personas reutilizables ────────────────────────────────────────────────────

const acreedorPersonaNatural = {
    nombre: 'Juan Carlos Gómez Martínez',
    tipoDoc: 'CC',
    numDoc: '1234567890',
    telefono: '300 123 4567',
    email: 'juan.gomez@lexiatest.co',
} as const;

const acreedorEmpresa = {
    nombre: 'Inversiones Lexia S.A.S.',
    tipoDoc: 'NIT',
    numDoc: '900123456-1',
    telefono: '601 234 5678',
    email: 'juridico@inversiones-lexia.co',
} as const;

const deudorBogota = {
    nombre: 'María Fernanda López Castro',
    tipoDoc: 'CC',
    numDoc: '9876543210',
    telefono: '310 987 6543',
    email: '',
    departamentoId: '11',
    ciudad: 'Bogotá D.C.',
} as const;

const deudorExtranjero = {
    nombre: 'Roberto Andrés Silva Ríos',
    tipoDoc: 'CE',
    numDoc: 'E-456789',
    telefono: '315 555 1234',
    email: 'roberto.silva@lexiatest.co',
    departamentoId: '11',
    ciudad: 'Bogotá D.C.',
} as const;

// ── Pago único ────────────────────────────────────────────────────────────────

export const pagareSimple = {
    acreedor: acreedorPersonaNatural,
    deudor: deudorBogota,
    obligacion: {
        valor: '5000000',
        fechaSuscripcion: '2026-02-22',
        modalidad: 'unico' as const,
        fechaVencimiento: '2027-02-22',
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '',
    },
} as const;

// ── Pago en cuotas mensuales ──────────────────────────────────────────────────

export const pagareEnCuotas = {
    acreedor: acreedorPersonaNatural,
    deudor: deudorBogota,
    obligacion: {
        valor: '12000000',
        fechaSuscripcion: '2026-03-01',
        modalidad: 'cuotas' as const,
        fechaVencimiento: '',
        numeroCuotas: '12',
        periodoCuotas: 'mensual' as const,
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '',
    },
} as const;

// ── Pago en cuotas bimestrales ────────────────────────────────────────────────

export const pagareEnCuotasBimestral = {
    acreedor: acreedorPersonaNatural,
    deudor: deudorBogota,
    obligacion: {
        valor: '6000000',
        fechaSuscripcion: '2026-03-01',
        modalidad: 'cuotas' as const,
        fechaVencimiento: '',
        numeroCuotas: '6',
        periodoCuotas: 'bimestral' as const,
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '',
    },
} as const;

// ── Pago en cuotas trimestrales ───────────────────────────────────────────────

export const pagareEnCuotasTrimestral = {
    acreedor: acreedorPersonaNatural,
    deudor: deudorBogota,
    obligacion: {
        valor: '8000000',
        fechaSuscripcion: '2026-04-01',
        modalidad: 'cuotas' as const,
        fechaVencimiento: '',
        numeroCuotas: '4',
        periodoCuotas: 'trimestral' as const,
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '',
    },
} as const;

// ── Acreedor empresa (NIT) ────────────────────────────────────────────────────

export const pagareNIT = {
    acreedor: acreedorEmpresa,
    deudor: deudorExtranjero,
    obligacion: {
        valor: '25000000',
        fechaSuscripcion: '2026-03-15',
        modalidad: 'unico' as const,
        fechaVencimiento: '2027-03-15',
        departamentoId: '11',
        ciudad: 'Bogotá D.C.',
        mora: '1.5',
    },
} as const;

// ── Mocked Colombia API responses ─────────────────────────────────────────────

/** Use these with page.route() in tests. */
export const mockColombiaApi = {
    departments: [
        { id: 11, name: 'Bogotá D.C.' },
        { id: 5, name: 'Antioquia' },
    ],
    citiesBogota: [
        { id: 149, name: 'Bogotá D.C.' },
        { id: 150, name: 'Soacha' },
    ],
    citiesAntioquia: [
        { id: 63, name: 'Medellín' },
        { id: 64, name: 'Bello' },
    ],
} as const;
