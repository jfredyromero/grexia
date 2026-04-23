// ── Personas reutilizables ────────────────────────────────────────────────────

export interface LaboralTestEmpleador {
    nombreCompleto: string;
    tipoDocumento: 'CC' | 'NIT';
    numeroDocumento: string;
    ciudad: string;
    direccion: string;
}

export interface LaboralTestTrabajador {
    nombreCompleto: string;
    tipoDocumento: 'CC' | 'CE' | 'Pasaporte';
    numeroDocumento: string;
    ciudad: string;
    direccion: string;
}

export interface LaboralTestCondicionesTerminoFijo {
    cargo: string;
    salario: string;
    frecuenciaPago: string;
    metodoPago: string;
    cuentaBancaria?: string;
    jornada: string;
    lugarPrestacion: string;
    duracionNumero: string;
    duracionUnidad: string;
}

export interface LaboralTestCondicionesObraLabor {
    descripcionObra: string;
    oficio: string;
    salario: string;
    modalidadPago: string;
    lugar: string;
}

export interface LaboralTestData {
    tipoContrato: 'termino-fijo' | 'obra-labor';
    empleador: LaboralTestEmpleador;
    trabajador: LaboralTestTrabajador;
    condicionesTerminoFijo?: LaboralTestCondicionesTerminoFijo;
    condicionesObraLabor?: LaboralTestCondicionesObraLabor;
}

// ── Empleadores ──────────────────────────────────────────────────────────────

export const empleadorPersonaNatural: LaboralTestEmpleador = {
    nombreCompleto: 'Carlos Alberto Gomez Ruiz',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    ciudad: 'Bogota D.C.',
    direccion: 'Calle 123 No. 45-67',
};

export const empleadorEmpresa: LaboralTestEmpleador = {
    nombreCompleto: 'Construcciones Andinas S.A.S.',
    tipoDocumento: 'NIT',
    numeroDocumento: '900123456',
    ciudad: 'Medellin',
    direccion: 'Carrera 70 No. 10-15',
};

// ── Trabajadores ─────────────────────────────────────────────────────────────

export const trabajadorPrincipal: LaboralTestTrabajador = {
    nombreCompleto: 'Maria Fernanda Lopez Torres',
    tipoDocumento: 'CC',
    numeroDocumento: '9876543210',
    ciudad: 'Bogota D.C.',
    direccion: 'Carrera 15 No. 80-22 Apt 301',
};

// ── Contrato a Termino Fijo ──────────────────────────────────────────────────

export const contratoTerminoFijo: LaboralTestData = {
    tipoContrato: 'termino-fijo',
    empleador: empleadorPersonaNatural,
    trabajador: trabajadorPrincipal,
    condicionesTerminoFijo: {
        cargo: 'Analista de Sistemas',
        salario: '3500000',
        frecuenciaPago: 'Mensual',
        metodoPago: 'Transferencia bancaria',
        cuentaBancaria: '1234567890',
        jornada: 'Lunes a viernes \u2014 8:00 a.m. a 5:00 p.m.',
        lugarPrestacion: 'Calle 123 No. 45-67, Bogota D.C.',
        duracionNumero: '6',
        duracionUnidad: 'Meses',
    },
};

// ── Contrato a Termino Fijo con transferencia bancaria ───────────────────────

export const contratoTerminoFijoTransferencia: LaboralTestData = {
    tipoContrato: 'termino-fijo',
    empleador: empleadorPersonaNatural,
    trabajador: trabajadorPrincipal,
    condicionesTerminoFijo: {
        cargo: 'Diseñadora Gráfica',
        salario: '2800000',
        frecuenciaPago: 'Quincenal',
        metodoPago: 'Transferencia bancaria',
        cuentaBancaria: '1234567890123',
        jornada: 'Lunes a viernes \u2014 7:00 a.m. a 4:00 p.m.',
        lugarPrestacion: 'Calle 123 No. 45-67, Bogota D.C.',
        duracionNumero: '1',
        duracionUnidad: 'Años',
    },
};

// ── Contrato por Obra o Labor ────────────────────────────────────────────────

export const contratoObraLabor: LaboralTestData = {
    tipoContrato: 'obra-labor',
    empleador: empleadorEmpresa,
    trabajador: trabajadorPrincipal,
    condicionesObraLabor: {
        descripcionObra:
            'Construccion de edificio residencial de 5 pisos. La obra se entiende finalizada cuando se obtenga el certificado de ocupacion.',
        oficio: 'Maestro de obra',
        salario: '2500000',
        modalidadPago: 'mensual',
        lugar: 'Carrera 70 No. 10-15, Medellin',
    },
};
