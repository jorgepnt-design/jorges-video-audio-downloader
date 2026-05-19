import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-6 text-center">
      <p className="text-xl font-black">{title}</p>
      {children && <div className="mt-2 text-white/65">{children}</div>}
    </div>
  );
}
