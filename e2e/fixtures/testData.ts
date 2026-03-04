// ── Coarrendatario reutilizable ───────────────────────────────────────────────

export const coarrendatarioPrincipal = {
    nombre: 'Carlos Arturo Ruiz Gómez',
    tipoDoc: 'CC',
    numDoc: '1098765432',
    telefono: '320 555 1234',
    email: 'carlos.ruiz@lexiatest.co',
} as const;

// ── Personas reutilizables ────────────────────────────────────────────────────

const arrendadorPrincipal = {
    nombre: 'Juan Carlos Gómez Martínez',
    tipoDoc: 'CC',
    numDoc: '1234567890',
    telefono: '300 123 4567',
    email: 'juan.gomez@lexiatest.co',
} as const;

const arrendatarioPrincipal = {
    nombre: 'María Fernanda López Castro',
    tipoDoc: 'CC',
    numDoc: '9876543210',
    telefono: '310 987 6543',
    email: '',
} as const;

const arrendadorBogota = {
    nombre: 'Carlos Eduardo Ramírez Peña',
    tipoDoc: 'CC',
    numDoc: '80123456',
    telefono: '315 234 5678',
    email: 'carlos.ramirez@lexiatest.co',
} as const;

const arrendatarioExtranjero = {
    nombre: 'Ana Lucía Torres Vargas',
    tipoDoc: 'CE',
    numDoc: 'E-987654',
    telefono: '320 876 5432',
    email: '',
} as const;

const arrendadorMedellin = {
    nombre: 'Pedro Antonio Sánchez Leal',
    tipoDoc: 'CC',
    numDoc: '71234567',
    telefono: '304 111 2233',
    email: '',
} as const;

const arrendatarioMedellin = {
    nombre: 'Luisa Valentina Mora Ruiz',
    tipoDoc: 'CC',
    numDoc: '52345678',
    telefono: '311 445 6677',
    email: 'luisa.mora@lexiatest.co',
} as const;

// ── Vivienda: Apartamento sin PH ──────────────────────────────────────────────

export const contratoVivienda = {
    inmueble: {
        tipo: 'Apartamento' as const,
        ph: false,
        direccion: 'Calle 45 # 23-15, Apto 301',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '3',
        areaMq: '65',
    },
    arrendador: arrendadorPrincipal,
    arrendatario: arrendatarioPrincipal,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-03-01',
        duracion: '12',
        canon: '1500000',
        deposito: '3000000',
        diaPago: '5',
    },
} as const;

// ── Vivienda: Apartamento con PH ──────────────────────────────────────────────

export const contratoApartamentoPH = {
    inmueble: {
        tipo: 'Apartamento' as const,
        ph: true,
        direccion: 'Calle 72 # 10-43, Apto 501',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '4',
        areaMq: '72',
    },
    arrendador: arrendadorBogota,
    arrendatario: arrendatarioExtranjero,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-04-01',
        duracion: '12',
        canon: '2200000',
        deposito: '4400000',
        diaPago: '5',
    },
} as const;

// ── Vivienda: Casa sin PH ─────────────────────────────────────────────────────

export const contratoCasa = {
    inmueble: {
        tipo: 'Casa' as const,
        ph: false,
        direccion: 'Calle 134 # 52-18',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        estrato: '3',
        areaMq: '120',
    },
    arrendador: arrendadorMedellin,
    arrendatario: arrendatarioMedellin,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-05-01',
        duracion: '24',
        canon: '1800000',
        deposito: '3600000',
        diaPago: '1',
    },
} as const;

// ── Vivienda: Casa con PH ─────────────────────────────────────────────────────

export const contratoCasaPH = {
    inmueble: {
        tipo: 'Casa' as const,
        ph: true,
        direccion: 'Calle 134 # 52-18, Casa 4',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        estrato: '3',
        areaMq: '120',
    },
    arrendador: arrendadorMedellin,
    arrendatario: arrendatarioMedellin,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-05-01',
        duracion: '24',
        canon: '1800000',
        deposito: '3600000',
        diaPago: '1',
    },
} as const;

// ── Comercial: Local Comercial sin PH ─────────────────────────────────────────

export const contratoLocalComercialSinPH = {
    inmueble: {
        tipo: 'Local Comercial' as const,
        ph: false,
        direccion: 'Avenida 19 # 112-30, Local 8',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '4',
        areaMq: '60',
    },
    arrendador: arrendadorPrincipal,
    arrendatario: arrendatarioPrincipal,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-04-01',
        duracion: '36',
        canon: '3800000',
        deposito: '7600000',
        diaPago: '5',
        actividad: 'Venta de ropa y accesorios',
    },
} as const;

// ── Comercial: Local Comercial con PH ─────────────────────────────────────────

export const contratoLocalComercial = {
    inmueble: {
        tipo: 'Local Comercial' as const,
        ph: true,
        direccion: 'Carrera 15 # 93-47, Local 204',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '5',
        areaMq: '85',
    },
    arrendador: arrendadorPrincipal,
    arrendatario: arrendatarioPrincipal,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-03-01',
        duracion: '36',
        canon: '4500000',
        deposito: '9000000',
        diaPago: '5',
        actividad: 'Restaurante de comida rápida',
    },
} as const;

// ── Comercial: Oficina sin PH ─────────────────────────────────────────────────

export const contratoOficinaSinPH = {
    inmueble: {
        tipo: 'Oficina' as const,
        ph: false,
        direccion: 'Carrera 11 # 82-01, Of. 301',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '5',
        areaMq: '38',
    },
    arrendador: arrendadorPrincipal,
    arrendatario: arrendatarioPrincipal,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-04-01',
        duracion: '12',
        canon: '2800000',
        deposito: '5600000',
        diaPago: '5',
    },
} as const;

// ── Comercial: Oficina con PH ─────────────────────────────────────────────────

export const contratoOficinaPH = {
    inmueble: {
        tipo: 'Oficina' as const,
        ph: true,
        direccion: 'Avenida El Dorado # 85-70, Piso 12, Of. 1201',
        ciudad: 'Bogotá D.C.',
        departamento: 'Bogotá',
        estrato: '6',
        areaMq: '45',
    },
    arrendador: arrendadorPrincipal,
    arrendatario: arrendatarioPrincipal,
    coarrendatario: coarrendatarioPrincipal,
    condiciones: {
        fechaInicio: '2026-03-01',
        duracion: '12',
        canon: '3200000',
        deposito: '6400000',
        diaPago: '5',
    },
} as const;
