export type TipoInteres = 'corriente' | 'moratorio';

export interface InteresesFormData {
    capital: string;
    tipoInteres: TipoInteres | '';
    fechaIniciaMora: string;
    fechaPago: string;
}

export const INITIAL_INTERESES_DATA: InteresesFormData = {
    capital: '',
    tipoInteres: '',
    fechaIniciaMora: '',
    fechaPago: '',
};

export const INTERESES_STEPS = [
    { number: 1, label: 'Obligación' },
    { number: 2, label: 'Liquidación' },
] as const;
