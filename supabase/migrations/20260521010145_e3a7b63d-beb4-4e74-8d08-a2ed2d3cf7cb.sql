
-- OAuth clients (Dynamic Client Registration, RFC 7591)
CREATE TABLE public.oauth_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL UNIQUE,
  client_name text NOT NULL DEFAULT '',
  redirect_uris text[] NOT NULL DEFAULT '{}',
  scope text NOT NULL DEFAULT 'mcp',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;

-- Authorization codes (uso único, 10 min)
CREATE TABLE public.oauth_authorization_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  client_id text NOT NULL,
  user_id uuid NOT NULL,
  redirect_uri text NOT NULL,
  code_challenge text NOT NULL,
  code_challenge_method text NOT NULL DEFAULT 'S256',
  scope text NOT NULL DEFAULT 'mcp',
  resource text,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_oauth_codes_expires ON public.oauth_authorization_codes(expires_at);
ALTER TABLE public.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;

-- Access tokens (1h)
CREATE TABLE public.oauth_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  client_id text NOT NULL,
  user_id uuid NOT NULL,
  scope text NOT NULL DEFAULT 'mcp',
  resource text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_oauth_access_user ON public.oauth_access_tokens(user_id);
CREATE INDEX idx_oauth_access_expires ON public.oauth_access_tokens(expires_at);
ALTER TABLE public.oauth_access_tokens ENABLE ROW LEVEL SECURITY;

-- Refresh tokens (30 dias)
CREATE TABLE public.oauth_refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  client_id text NOT NULL,
  user_id uuid NOT NULL,
  scope text NOT NULL DEFAULT 'mcp',
  resource text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  rotated_from uuid REFERENCES public.oauth_refresh_tokens(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_oauth_refresh_user ON public.oauth_refresh_tokens(user_id);
ALTER TABLE public.oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Sem políticas: acesso somente via supabaseAdmin (service role) no servidor
