import type { ReactNode } from "react";
import { Navigation, type PageId } from "./Navigation";

interface Props {
  page: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}

export function Layout({ page, onNavigate, children }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 pb-24 md:pb-4">
      <Navigation current={page} onNavigate={onNavigate} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
