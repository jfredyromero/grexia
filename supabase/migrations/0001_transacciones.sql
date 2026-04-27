CREATE TABLE transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_payco TEXT UNIQUE NOT NULL,
  transaction_id TEXT,
  estado TEXT NOT NULL,
  codigo_aprobacion TEXT,
  motivo_rechazo TEXT,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  monto NUMERIC(12,2),
  moneda TEXT NOT NULL DEFAULT 'COP',
  franquicia TEXT,
  tipo_pago TEXT,
  banco TEXT,
  tarjeta TEXT,
  cuotas TEXT,
  descripcion TEXT,
  resumen_caso TEXT,
  fecha_transaccion TIMESTAMPTZ,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transacciones_ref_payco ON transacciones (ref_payco);
CREATE INDEX idx_transacciones_estado ON transacciones (estado);
CREATE INDEX idx_transacciones_email ON transacciones (email);
CREATE INDEX idx_transacciones_created_at ON transacciones (created_at DESC);
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE transacciones IS 'updated_at is set explicitly in writes; no trigger.';
