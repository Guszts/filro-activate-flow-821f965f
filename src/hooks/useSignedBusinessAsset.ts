import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { signBusinessAsset } from "@/lib/business-assets.functions";

/**
 * Resolves a `business-assets` value (either a bucket-relative path or a
 * legacy public URL) into a short-lived signed URL.
 *
 * Returns null while loading or if the input is empty / fails to sign.
 */
export function useSignedBusinessAsset(value: string | null | undefined): string | null {
  const sign = useServerFn(signBusinessAsset);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) { setUrl(null); return; }
    // Absolute external URLs (not our bucket) can be rendered as-is.
    if (/^https?:\/\//.test(value) && !value.includes("/business-assets/")) {
      setUrl(value);
      return;
    }
    sign({ data: { path: value } })
      .then((r) => { if (!cancelled) setUrl(r.url); })
      .catch(() => { if (!cancelled) setUrl(null); });
    return () => { cancelled = true; };
  }, [value, sign]);

  return url;
}
