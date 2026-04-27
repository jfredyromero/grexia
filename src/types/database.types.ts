export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.5';
    };
    public: {
        Tables: {
            transacciones: {
                Row: {
                    banco: string | null;
                    calendly_event_id: string | null;
                    codigo_aprobacion: string | null;
                    created_at: string;
                    cuotas: string | null;
                    descripcion: string | null;
                    direccion: string | null;
                    email: string | null;
                    es_prueba: boolean | null;
                    estado: string;
                    fecha_reunion: string | null;
                    fecha_transaccion: string | null;
                    franquicia: string | null;
                    id: string;
                    moneda: string;
                    monto: number | null;
                    motivo_rechazo: string | null;
                    nombre: string | null;
                    numero_documento: string | null;
                    raw: Json | null;
                    redimido: boolean;
                    ref_hash: string | null;
                    ref_payco: string;
                    resumen_caso: string | null;
                    tarjeta: string | null;
                    telefono: string | null;
                    tipo_documento: string | null;
                    tipo_pago: string | null;
                    transaction_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    banco?: string | null;
                    calendly_event_id?: string | null;
                    codigo_aprobacion?: string | null;
                    created_at?: string;
                    cuotas?: string | null;
                    descripcion?: string | null;
                    direccion?: string | null;
                    email?: string | null;
                    es_prueba?: boolean | null;
                    estado: string;
                    fecha_reunion?: string | null;
                    fecha_transaccion?: string | null;
                    franquicia?: string | null;
                    id?: string;
                    moneda?: string;
                    monto?: number | null;
                    motivo_rechazo?: string | null;
                    nombre?: string | null;
                    numero_documento?: string | null;
                    raw?: Json | null;
                    redimido?: boolean;
                    ref_hash?: string | null;
                    ref_payco: string;
                    resumen_caso?: string | null;
                    tarjeta?: string | null;
                    telefono?: string | null;
                    tipo_documento?: string | null;
                    tipo_pago?: string | null;
                    transaction_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    banco?: string | null;
                    calendly_event_id?: string | null;
                    codigo_aprobacion?: string | null;
                    created_at?: string;
                    cuotas?: string | null;
                    descripcion?: string | null;
                    direccion?: string | null;
                    email?: string | null;
                    es_prueba?: boolean | null;
                    estado?: string;
                    fecha_reunion?: string | null;
                    fecha_transaccion?: string | null;
                    franquicia?: string | null;
                    id?: string;
                    moneda?: string;
                    monto?: number | null;
                    motivo_rechazo?: string | null;
                    nombre?: string | null;
                    numero_documento?: string | null;
                    raw?: Json | null;
                    redimido?: boolean;
                    ref_hash?: string | null;
                    ref_payco?: string;
                    resumen_caso?: string | null;
                    tarjeta?: string | null;
                    telefono?: string | null;
                    tipo_documento?: string | null;
                    tipo_pago?: string | null;
                    transaction_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;
