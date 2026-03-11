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
    departamento: 'Bogotá',
    ciudad: 'Bogotá D.C.',
} as const;

const deudorExtranjero = {
    nombre: 'Roberto Andrés Silva Ríos',
    tipoDoc: 'CE',
    numDoc: 'E-456789',
    telefono: '315 555 1234',
    email: 'roberto.silva@lexiatest.co',
    departamento: 'Bogotá',
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
        departamento: 'Bogotá',
        ciudad: 'Bogotá D.C.',
        tasaNominal: '1.2',
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
        departamento: 'Bogotá',
        ciudad: 'Bogotá D.C.',
        tasaNominal: '1.0',
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
        departamento: 'Bogotá',
        ciudad: 'Bogotá D.C.',
        tasaNominal: '0.8',
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
        departamento: 'Bogotá',
        ciudad: 'Bogotá D.C.',
        tasaNominal: '0.9',
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
        departamento: 'Bogotá',
        ciudad: 'Bogotá D.C.',
        tasaNominal: '1.5',
        mora: '1.5',
    },
} as const;
