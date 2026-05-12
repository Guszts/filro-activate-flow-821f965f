
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

INSERT INTO public.plans (slug, name, description, activation_price, monthly_price, features, display_order, active)
VALUES
  ('essencial', 'Essencial', 'Página única, ideal para começar com presença digital profissional.', 29700, 4900,
    '["Página única responsiva","Domínio personalizado","Formulário de contato","SEO básico","Suporte por e-mail"]'::jsonb, 1, true),
  ('profissional', 'Profissional', 'Site completo com múltiplas seções, perfeito para negócios em crescimento.', 49700, 7900,
    '["Até 5 páginas","Design premium personalizado","Integração WhatsApp","Galeria de imagens","SEO avançado","Suporte prioritário"]'::jsonb, 2, true),
  ('premium', 'Premium', 'Experiência editorial completa com animações e identidade visual única.', 89700, 12900,
    '["Páginas ilimitadas","Animações premium","Identidade visual completa","Integração com sistemas","Analytics avançado","Suporte dedicado","Revisões ilimitadas"]'::jsonb, 3, true)
ON CONFLICT (slug) DO NOTHING;
