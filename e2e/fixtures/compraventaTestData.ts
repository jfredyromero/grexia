// ── Personas reutilizables ────────────────────────────────────────────────────

const vendedorBogota = {
    nombre: 'Carlos Alberto Ramirez Gutierrez',
    cc: '1234567890',
    ccExpedidaEn: 'Bogota',
    departamento: 'Bogotá',
    ciudad: 'Bogotá D.C.',
} as const;

const compradorMedellin = {
    nombre: 'Maria Fernanda Lopez Castro',
    cc: '9876543210',
    ccExpedidaEn: 'Medellin',
    departamento: 'Bogotá',
    ciudad: 'Bogotá D.C.',
} as const;

// ── Inmueble ─────────────────────────────────────────────────────────────────

const inmuebleApto = {
    direccion: 'Calle 100 #15-20 Apto 501, Conjunto Residencial Los Pinos',
    departamento: 'Bogotá',
    ciudad: 'Bogotá D.C.',
    area: '85',
    linderoNorte: 'Apto 502',
    linderoSur: 'Zona comun',
    linderoOriente: 'Fachada exterior',
    linderoOccidente: 'Apto 503',
    matricula: '50N-12345678',
    cedulaCatastral: '01-02-0304-0005-000',
} as const;

// ── Tradicion ────────────────────────────────────────────────────────────────

const tradicionCompraventa = {
    tipoActo: 'COMPRAVENTA',
    escrituraNro: '1234',
    notaria: 'Notaria 15 de Bogota',
    folioMatricula: '50N-12345678',
    ciudadRegistro: 'Bogota',
} as const;

// ── Economico ────────────────────────────────────────────────────────────────

const economicoBase = {
    precioTotal: '350000000',
    precioIncluyeDescripcion: '',
    formaDePago: 'Pago de contado al momento de la firma de la escritura publica',
    arrasValor: '35000000',
    clausulaPenalValor: '35000000',
} as const;

const economicoConIncluyeDescripcion = {
    ...economicoBase,
    precioIncluyeDescripcion: 'parqueadero y deposito',
} as const;

// ── Escritura ────────────────────────────────────────────────────────────────

const escrituraBase = {
    notaria: 'Notaria 20 de Bogota',
    fecha: '2026-06-15',
    gastosDistribucion: 'por partes iguales entre comprador y vendedor',
    domicilioDepartamento: 'Bogotá',
    domicilioCiudad: 'Bogotá D.C.',
    incluyeTestigo: false,
    testigoNombre: '',
    testigoCC: '',
} as const;

const escrituraConTestigo = {
    ...escrituraBase,
    incluyeTestigo: true,
    testigoNombre: 'Pedro Ramirez Lopez',
    testigoCC: '5555666777',
} as const;

// ── Fixtures completos ───────────────────────────────────────────────────────

export const compraventaBasica = {
    vendedor: vendedorBogota,
    comprador: compradorMedellin,
    inmueble: inmuebleApto,
    tradicion: tradicionCompraventa,
    economico: economicoBase,
    escritura: escrituraBase,
} as const;

export const compraventaConIncluyeDescripcion = {
    vendedor: vendedorBogota,
    comprador: compradorMedellin,
    inmueble: inmuebleApto,
    tradicion: tradicionCompraventa,
    economico: economicoConIncluyeDescripcion,
    escritura: escrituraBase,
} as const;

export const compraventaConTestigo = {
    vendedor: vendedorBogota,
    comprador: compradorMedellin,
    inmueble: inmuebleApto,
    tradicion: tradicionCompraventa,
    economico: economicoBase,
    escritura: escrituraConTestigo,
} as const;
