UPDATE public.plans SET display_order = CASE slug
  WHEN 'start' THEN 1
  WHEN 'essencial' THEN 2
  WHEN 'plus' THEN 3
  WHEN 'profissional' THEN 4
  WHEN 'priority' THEN 5
  WHEN 'premium' THEN 6
  ELSE display_order
END
WHERE slug IN ('start','essencial','plus','profissional','priority','premium');