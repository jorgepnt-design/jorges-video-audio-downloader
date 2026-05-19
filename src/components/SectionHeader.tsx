interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="mb-5">
      {eyebrow && <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gold">{eyebrow}</p>}
      <h2 className="text-3xl font-black text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-white/70">{description}</p>}
    </header>
  );
}
