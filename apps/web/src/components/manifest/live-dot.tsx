export function LiveDot({ label = 'LIVE' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-accent">
      <span className="relative flex h-2 w-2">
        <span className="rt-pulse absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      {label}
    </span>
  );
}
