type IconProps = { size?: number };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function ArrowLeftIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function UndoIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

export function RestartIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 3.5V9H15" />
    </svg>
  );
}

export function BulbIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M9.5 18h5" />
      <path d="M10.5 21h3" />
      <path d="M12 3a6 6 0 0 0-3.4 10.9c.5.4.9 1.1.9 1.9v.2h5v-.2c0-.8.4-1.5.9-1.9A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function SpeakerIcon({ size = 15 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function SpeakerOffIcon({ size = 15 }: IconProps) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4Z" />
      <path d="m16.5 9.5 5 5" />
      <path d="m21.5 9.5-5 5" />
    </svg>
  );
}
