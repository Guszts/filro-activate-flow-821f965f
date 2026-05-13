-- Storage bucket para assets do negócio (logos, produtos, modelos de referência)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas: usuário gerencia seus próprios arquivos (pasta = user_id)
CREATE POLICY "Public read business-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-assets');

CREATE POLICY "Users upload own business-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own business-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own business-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins manage all business-assets"
ON storage.objects FOR ALL
USING (bucket_id = 'business-assets' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'business-assets' AND has_role(auth.uid(), 'admin'::app_role));