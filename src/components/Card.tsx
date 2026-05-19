import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-white/10 bg-white/7 p-4 shadow-xl shadow-black/10 ${className}`}>{children}</section>;
}
