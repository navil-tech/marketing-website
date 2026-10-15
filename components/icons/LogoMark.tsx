import type { JSX } from "react";

interface LogoMarkProps {
  size: number;
}

export function LogoMark({ size }: LogoMarkProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path
        d="M10 22 L22 10"
        stroke="var(--accent-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="0.1 4.6"
      />
      <circle cx="9.5" cy="22.5" r="3.2" fill="var(--accent-ink)" />
      <circle cx="22.5" cy="9.5" r="3.2" fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" />
    </svg>
  );
}
