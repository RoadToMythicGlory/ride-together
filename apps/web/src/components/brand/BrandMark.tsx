import Image from 'next/image';
import Link from 'next/link';

export function BrandMark({
  href = '/home',
  size = 36,
  priority = false,
  className = '',
}: {
  href?: string | null;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  const mark = (
    <Image
      src="/brand/logo.png"
      alt="RideTogether"
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 rounded-md ${className}`}
    />
  );

  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="RideTogether">
      {mark}
    </Link>
  );
}
