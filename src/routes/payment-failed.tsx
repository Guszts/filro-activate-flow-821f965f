import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { X } from "lucide-react";

export const Route = createFileRoute("/payment-failed")({
  component: FailedPage,
  head: () => ({ meta: [
    { title: "Pagamento não concluído · Filro" },
    { name: "robots", content: "noindex,nofollow" },
  ]}),
});

function FailedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 grid place-items-center px-5 py-16">
        <div className="text-center max-w-xl">
          <div className="mx-auto h-20 w-20 rounded-full bg-flame grid place-items-center">
            <X className="h-10 w-10 text-paper" strokeWidth={3} />
          </div>
          <h1 className="mt-8 editorial-headline text-5xl md:text-6xl text-ink">Pagamento não concluído</h1>
          <p className="mt-4 text-ink-soft">Seu plano segue selecionado. Você pode tentar novamente.</p>
          <div className="mt-10 flex gap-3 justify-center">
            <Link to="/checkout" className="inline-flex items-center h-13 px-7 rounded-full bg-ink text-paper font-semibold">Tentar de novo</Link>
            <Link to="/" className="inline-flex items-center h-13 px-7 rounded-full border border-ink text-ink font-semibold">Voltar</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
