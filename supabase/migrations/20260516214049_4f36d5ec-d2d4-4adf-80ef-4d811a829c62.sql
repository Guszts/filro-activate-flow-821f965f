
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

INSERT INTO public.plans (slug, name, activation_price, monthly_price, description, features, display_order, active, hidden)
VALUES (
  'promocional',
  'Promocional',
  3090,
  990,
  'Oferta promocional especial: pague apenas a ativação e tenha sua presença digital no ar com manutenção simbólica.',
  '["Página única responsiva", "Botão de WhatsApp em destaque", "Informações essenciais do negócio (horário, endereço, contato)", "Seção curta sobre o negócio", "Layout adaptado por nossa equipe", "Hospedagem inclusa", "Suporte por e-mail"]'::jsonb,
  99,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  activation_price = EXCLUDED.activation_price,
  monthly_price = EXCLUDED.monthly_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active,
  hidden = EXCLUDED.hidden;
