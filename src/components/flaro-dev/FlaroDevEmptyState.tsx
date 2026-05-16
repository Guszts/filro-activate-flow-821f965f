import { type ReactNode } from "react";

export function FlaroDevEmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-dashed border-border bg-paper/50">
      {icon && <div className="mb-4 text-ink-soft/60">{icon}</div>}
      <h3 className="font-display font-bold text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-soft max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
