export const contratoVivienda = {
    inmueble: {
        tipo: 'Apartamento' as const,
        ph: false,
        direccion: 'Calle 45 # 23-15, Apto 301',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        estrato: '3',
        areaMq: '65',
    },
    arrendador: {
        nombre: 'Juan Carlos Gómez Martínez',
        tipoDoc: 'CC',
        numDoc: '1234567890',
        telefono: '300 123 4567',
        email: 'juan.gomez@lexiatest.co',
    },
    arrendatario: {
        nombre: 'María Fernanda López Castro',
        tipoDoc: 'CC',
        numDoc: '9876543210',
        telefono: '310 987 6543',
        email: '',
    },
    condiciones: {
        fechaInicio: '2026-03-01',
        duracion: '12',
        canon: '1500000',
        deposito: '3000000',
        diaPago: '5',
    },
} as const;

export const contratoLocalComercial = {
    ...contratoVivienda,
    inmueble: {
        tipo: 'Local Comercial' as const,
        ph: true,
        direccion: 'Carrera 15 # 93-47, Local 204',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        estrato: '5',
        areaMq: '85',
    },
    condiciones: {
        ...contratoVivienda.condiciones,
        canon: '4500000',
        deposito: '9000000',
        actividad: 'Restaurante de comida rápida',
    },
} as const;

export const contratoOficinaPH = {
    ...contratoVivienda,
    inmueble: {
        tipo: 'Oficina' as const,
        ph: true,
        direccion: 'Avenida El Dorado # 85-70, Piso 12, Of. 1201',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        estrato: '6',
        areaMq: '45',
    },
    condiciones: {
        ...contratoVivienda.condiciones,
        canon: '3200000',
        deposito: '6400000',
    },
} as const;
