import { useRef, useState } from "react";
import { PlayCircle, RotateCcw } from "lucide-react";

export function TutorialVideo({ url, planName }: { url: string | null; planName: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  if (!url) {
    return (
      <div className="mt-8 relative rounded-3xl overflow-hidden border border-border bg-ink/5 aspect-video">
        <div className="absolute inset-0 grid place-items-center text-center px-6">
          <div>
            <PlayCircle className="mx-auto h-14 w-14 text-ink-soft" />
            <p className="mt-4 text-sm text-ink-soft max-w-md">
              Tutorial em produção. Em breve um vídeo curto mostrando como adaptamos o modelo {planName} ao seu negócio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const restart = () => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    setEnded(false);
  };

  return (
    <div className="mt-8 space-y-3">
      <div className="relative rounded-3xl overflow-hidden border border-border bg-ink aspect-video">
        <video
          ref={ref}
          src={url}
          controls
          playsInline
          preload="metadata"
          onEnded={() => setEnded(true)}
          onPlay={() => setEnded(false)}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          {ended ? "Assistir novamente" : "Recomeçar vídeo"}
        </button>
      </div>
    </div>
  );
}
