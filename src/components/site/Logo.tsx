export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="42" height="30" viewBox="0 0 42 30" fill="none" aria-hidden="true">
        <path d="M2 20 L24 6 L24 12 L10 20 Z" fill="var(--navy)" />
        <path d="M40 10 L18 24 L18 18 L32 10 Z" fill="var(--brand)" />
        <path d="M24 6 L40 6 L40 10 L24 10 Z" fill="var(--brand)" />
        <path d="M2 20 L18 20 L18 24 L2 24 Z" fill="var(--navy)" />
      </svg>
      <span className="leading-none">
        <span
          className={`block text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}
        >
          Secure <span className="text-brand">Tech</span>
        </span>
        <span
          className={`block text-[9px] font-semibold tracking-wide ${light ? "text-white/70" : "text-muted-foreground"}`}
        >
          Consultancy (Pvt) Ltd
        </span>
      </span>
    </span>
  );
}
