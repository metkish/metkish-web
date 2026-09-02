'use client';

import { type ReactNode } from 'react';
import { useJourneyProgress } from './journey-context';
import { smoothstep } from './geo';

export type JourneyDock =
  | 'center'
  | 'upper-left'
  | 'upper-center'
  | 'upper-right'
  | 'lower-left'
  | 'lower-center'
  | 'lower-right';

interface JourneyAnnotationProps {
  /** [start, end] progress (0..1) within the enclosing scene this
   * annotation is visible for. Fades in/out at the edges of the range. */
  range: [number, number];
  dock?: JourneyDock;
  className?: string;
  children: ReactNode;
}

// Horizontal alignment only applies from md up — on mobile every
// annotation collapses to a single centered column so nothing gets
// squeezed into an unreadable side-by-side layout.
const DOCK_CLASSES: Record<JourneyDock, string> = {
  center: 'items-center justify-center text-center',
  'upper-left':
    'items-start justify-center text-center md:justify-start md:text-left',
  'upper-center': 'items-start justify-center text-center',
  'upper-right':
    'items-start justify-center text-center md:justify-end md:text-right',
  'lower-left':
    'items-end justify-center text-center md:justify-start md:text-left',
  'lower-center': 'items-end justify-center text-center',
  'lower-right':
    'items-end justify-center text-center md:justify-end md:text-right',
};

export default function JourneyAnnotation({
  range,
  dock = 'center',
  className = '',
  children,
}: JourneyAnnotationProps) {
  const progress = useJourneyProgress();
  const [start, end] = range;
  const span = Math.max(end - start, 0.0001);
  const fade = Math.min(0.18, span * 0.35);
  const fadeIn = smoothstep(start, start + fade, progress);
  const fadeOut = 1 - smoothstep(end - fade, end, progress);
  const visible = progress >= start && progress <= end;
  const opacity = visible ? Math.min(fadeIn, fadeOut) : 0;
  const translate = (1 - opacity) * 14;

  return (
    <div
      className={`absolute inset-0 flex p-6 sm:p-10 md:p-14 pointer-events-none ${DOCK_CLASSES[dock]}`}
      style={{
        opacity,
        transform: `translateY(${translate}px)`,
      }}
      aria-hidden={opacity < 0.05}
    >
      <div className={className}>{children}</div>
    </div>
  );
}
