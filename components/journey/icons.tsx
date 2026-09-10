import type { JourneyMode } from '@/lib/journeys/types';

const common = {
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} {...common}>
      <path d='M4 15.5 5.4 10a2 2 0 0 1 1.9-1.4h9.4A2 2 0 0 1 18.6 10L20 15.5' />
      <path d='M3.5 15.5h17v2.2a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V17H6.7v.7a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1z' />
      <circle cx='7.5' cy='15.5' r='1.3' />
      <circle cx='16.5' cy='15.5' r='1.3' />
    </svg>
  );
}

export function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} {...common}>
      <path d='M11.2 3.2 12 2.4l.8.8v6.1l6.3 4v1.6l-6.3-2v4.6l1.9 1.5v1.4L12 19.6l-2.7.8v-1.4l1.9-1.5v-4.6l-6.3 2v-1.6l6.3-4z' />
    </svg>
  );
}

export function TransferIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} {...common}>
      <path d='M4 16 5 10.6a2 2 0 0 1 2-1.6h7.6a2 2 0 0 1 1.9 1.3l1.5 4.2' />
      <path d='M3.5 16h17v2.6h-2v-.4a1 1 0 0 0-1-1h-.4a1 1 0 0 0-1 1v.4H7.9v-.4a1 1 0 0 0-1-1h-.4a1 1 0 0 0-1 1v.4h-2z' />
      <circle cx='7' cy='16.2' r='1.2' />
      <circle cx='16.5' cy='16.2' r='1.2' />
      <path d='M9.2 9.4V6.8h5.6v2.6' />
    </svg>
  );
}

export function journeyModeIcon(mode: JourneyMode) {
  switch (mode) {
    case 'plane':
      return PlaneIcon;
    case 'transfer':
    case 'train':
      return TransferIcon;
    default:
      return CarIcon;
  }
}
