
-- Make business-assets bucket private and add user-scoped read policy.
UPDATE storage.buckets SET public = false WHERE id = 'business-assets';

DROP POLICY IF EXISTS "Public read business-assets" ON storage.objects;

CREATE POLICY "Users read own business-assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-assets'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Backfill: convert any public business-assets URLs stored in projects.business_info
-- into bucket-relative paths so existing uploads keep working with signed URLs.
UPDATE public.projects
SET business_info = jsonb_set(
  business_info,
  '{logo_url}',
  to_jsonb(regexp_replace(business_info->>'logo_url',
    '^https?://[^/]+/storage/v1/object/public/business-assets/', ''))
)
WHERE business_info->>'logo_url' LIKE '%/storage/v1/object/public/business-assets/%';

UPDATE public.projects
SET business_info = jsonb_set(
  business_info,
  '{model_file_url}',
  to_jsonb(regexp_replace(business_info->>'model_file_url',
    '^https?://[^/]+/storage/v1/object/public/business-assets/', ''))
)
WHERE business_info->>'model_file_url' LIKE '%/storage/v1/object/public/business-assets/%';

-- Rewrite products[].image_url inside the JSONB array.
UPDATE public.projects p
SET business_info = jsonb_set(
  p.business_info,
  '{products}',
  COALESCE((
    SELECT jsonb_agg(
      CASE
        WHEN (prod->>'image_url') LIKE '%/storage/v1/object/public/business-assets/%'
          THEN jsonb_set(prod, '{image_url}',
            to_jsonb(regexp_replace(prod->>'image_url',
              '^https?://[^/]+/storage/v1/object/public/business-assets/', '')))
        ELSE prod
      END
    )
    FROM jsonb_array_elements(p.business_info->'products') prod
  ), '[]'::jsonb)
)
WHERE jsonb_typeof(p.business_info->'products') = 'array'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(p.business_info->'products') x
    WHERE x->>'image_url' LIKE '%/storage/v1/object/public/business-assets/%'
  );
