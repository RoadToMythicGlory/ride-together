export function StatusText({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'danger';
}) {
  const color =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'success'
        ? 'text-success'
        : tone === 'danger'
          ? 'text-danger'
          : 'text-muted';
  return (
    <span className={`text-xs font-semibold tracking-[0.08em] uppercase ${color}`}>
      {children}
    </span>
  );
}
