export interface VendedorData {
    nombre: string;
    cc: string;
    ccExpedidaEn: string;
    departamento: string;
    ciudad: string;
}

export interface CompradorData {
    nombre: string;
    cc: string;
    ccExpedidaEn: string;
    departamento: string;
    ciudad: string;
}

export interface InmuebleData {
    direccion: string;
    departamento: string;
    ciudad: string;
    area: string;
    linderoNorte: string;
    linderoSur: string;
    linderoOriente: string;
    linderoOccidente: string;
    matricula: string;
    cedulaCatastral: string;
}

export interface TradicionData {
    tipoActo: string;
    escrituraNro: string;
    notaria: string;
    folioMatricula: string;
    ciudadRegistro: string;
}

export interface EconomicoData {
    precioTotal: string;
    precioIncluyeDescripcion: string;
    formaDePago: string;
    arrasValor: string;
    clausulaPenalValor: string;
}

export interface EscrituraData {
    notaria: string;
    fecha: string;
    gastosDistribucion: string;
    domicilioDepartamento: string;
    domicilioCiudad: string;
    incluyeTestigo: boolean;
    testigoNombre: string;
    testigoCC: string;
}

export interface CompraventaFormData {
    vendedor: VendedorData;
    comprador: CompradorData;
    inmueble: InmuebleData;
    tradicion: TradicionData;
    economico: EconomicoData;
    escritura: EscrituraData;
}

export const INITIAL_COMPRAVENTA_DATA: CompraventaFormData = {
    vendedor: {
        nombre: '',
        cc: '',
        ccExpedidaEn: '',
        departamento: '',
        ciudad: '',
    },
    comprador: {
        nombre: '',
        cc: '',
        ccExpedidaEn: '',
        departamento: '',
        ciudad: '',
    },
    inmueble: {
        direccion: '',
        departamento: '',
        ciudad: '',
        area: '',
        linderoNorte: '',
        linderoSur: '',
        linderoOriente: '',
        linderoOccidente: '',
        matricula: '',
        cedulaCatastral: '',
    },
    tradicion: {
        tipoActo: '',
        escrituraNro: '',
        notaria: '',
        folioMatricula: '',
        ciudadRegistro: '',
    },
    economico: {
        precioTotal: '',
        precioIncluyeDescripcion: '',
        formaDePago: '',
        arrasValor: '',
        clausulaPenalValor: '',
    },
    escritura: {
        notaria: '',
        fecha: '',
        gastosDistribucion: '',
        domicilioDepartamento: '',
        domicilioCiudad: '',
        incluyeTestigo: false,
        testigoNombre: '',
        testigoCC: '',
    },
};

export const COMPRAVENTA_STEPS = [
    { number: 1, label: 'Vendedor' },
    { number: 2, label: 'Comprador' },
    { number: 3, label: 'Inmueble' },
    { number: 4, label: 'Tradicion' },
    { number: 5, label: 'Economico' },
    { number: 6, label: 'Escritura' },
    { number: 7, label: 'Preview' },
] as const;
