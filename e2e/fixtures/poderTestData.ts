// ─────────────────────────────────────────────────────────────────────────────
// Fixtures para la herramienta Poder Especial.
//
// Cada fixture cubre una variante distinta del documento:
//  - declaracionPertenencia → tiene inmueble + demandados
//  - procesoLaboral         → solo demandados (sin inmueble)
//  - tramitesNotariales     → solo inmueble (sin demandados)
//  - administracionBienes   → solo inmueble (objeto del poder libre)
// ─────────────────────────────────────────────────────────────────────────────

export interface PoderTestPoderdante {
    nombreCompleto: string;
    ccPoderdante: string;
    lugarExpedicionPoderdante: string;
    ciudadPoderdante: string;
    direccionInmueble?: string;
    matriculaInmobiliaria?: string;
}

export interface PoderTestApoderado {
    nombreCompleto: string;
    ccApoderado: string;
    lugarExpedicionApoderado: string;
    ciudadApoderado: string;
    tarjetaProfesional: string;
}

export interface PoderTestProceso {
    demandados?: string[];
    objetoPoder?: string;
}

export interface PoderTestData {
    tipoProceso:
        | 'declaracion-pertenencia'
        | 'proceso-civil'
        | 'proceso-laboral'
        | 'proceso-penal'
        | 'proceso-familia'
        | 'cobro-juridico'
        | 'tramites-notariales'
        | 'administracion-bienes';
    poderdante: PoderTestPoderdante;
    apoderado: PoderTestApoderado;
    proceso: PoderTestProceso;
}

// ── Personas reutilizables ────────────────────────────────────────────────────

export const poderdanteBase: PoderTestPoderdante = {
    nombreCompleto: 'Andres Felipe Ramirez Torres',
    ccPoderdante: '1098765432',
    lugarExpedicionPoderdante: 'Bogota D.C.',
    ciudadPoderdante: 'Bogota D.C.',
};

export const poderdanteConInmueble: PoderTestPoderdante = {
    ...poderdanteBase,
    direccionInmueble: 'Calle 100 No. 15-20, Apto 502',
    matriculaInmobiliaria: '050C-1234567',
};

export const apoderadoBase: PoderTestApoderado = {
    nombreCompleto: 'Camila Andrea Lopez Vargas',
    ccApoderado: '52345678',
    lugarExpedicionApoderado: 'Medellin',
    ciudadApoderado: 'Medellin',
    tarjetaProfesional: '123456',
};

// ── Variante 1: Declaración de Pertenencia (inmueble + demandados) ───────────

export const declaracionPertenencia: PoderTestData = {
    tipoProceso: 'declaracion-pertenencia',
    poderdante: poderdanteConInmueble,
    apoderado: apoderadoBase,
    proceso: {
        demandados: ['Personas Indeterminadas', 'Herederos de Juan Perez Gomez'],
    },
};

// ── Variante 2: Proceso Laboral (solo demandados) ────────────────────────────

export const procesoLaboral: PoderTestData = {
    tipoProceso: 'proceso-laboral',
    poderdante: poderdanteBase,
    apoderado: apoderadoBase,
    proceso: {
        demandados: ['Construcciones Andinas S.A.S.'],
    },
};

// ── Variante 3: Trámites Notariales (solo inmueble) ──────────────────────────

export const tramitesNotariales: PoderTestData = {
    tipoProceso: 'tramites-notariales',
    poderdante: poderdanteConInmueble,
    apoderado: apoderadoBase,
    proceso: {
        objetoPoder:
            'Adelantar la escrituracion del inmueble y firmar todos los documentos necesarios ante la Notaria Tercera del Circulo de Bogota.',
    },
};

// ── Variante 4: Administración de Bienes (inmueble + objeto libre) ───────────

export const administracionBienes: PoderTestData = {
    tipoProceso: 'administracion-bienes',
    poderdante: poderdanteConInmueble,
    apoderado: apoderadoBase,
    proceso: {
        objetoPoder:
            'Administrar el inmueble, suscribir contratos de arrendamiento, recibir canones y representar al poderdante ante terceros.',
    },
};

// ── Variante 5: Proceso de Familia con multiples demandados ──────────────────

export const procesoFamiliaMultiplesDemandados: PoderTestData = {
    tipoProceso: 'proceso-familia',
    poderdante: poderdanteBase,
    apoderado: apoderadoBase,
    proceso: {
        demandados: ['Carlos Eduardo Ramirez Pena', 'Marta Lucia Gomez Ortiz', 'Sofia Ramirez Gomez'],
    },
};
