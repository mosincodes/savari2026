CREATE TABLE IF NOT EXISTS otp_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       text NOT NULL,
  token       text NOT NULL,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_verifications_phone_idx ON otp_verifications (phone);

-- Only accessible server-side via service role; no RLS needed (table is not exposed to anon/authenticated).
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
-- Deny all access from client keys; service role bypasses RLS automatically.
