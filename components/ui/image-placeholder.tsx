// Elegant neutral stand-in for a real photograph or screenshot, sized and
// positioned exactly where the future image will go. Used across
// destination pages until real photography/screenshots are dropped in —
// deliberately quiet so it never reads as "broken", just "not yet".
export interface ImagePlaceholderProps {
  label: string;
  sublabel?: string;
  variant?: 'hero' | 'landscape' | 'vertical' | 'detail' | 'screenshot';
  /** Overrides the variant's default aspect ratio class entirely. */
  aspectClassName?: string;
  className?: string;
}

const DEFAULT_ASPECT: Record<NonNullable<ImagePlaceholderProps['variant']>, string> = {
  hero: 'aspect-[16/10]',
  landscape: 'aspect-[16/10]',
  vertical: 'aspect-[3/4]',
  detail: 'aspect-square',
  screenshot: 'aspect-[16/10]',
};

export default function ImagePlaceholder({
  label,
  sublabel,
  variant = 'landscape',
  aspectClassName,
  className = '',
}: ImagePlaceholderProps) {
  const isScreenshot = variant === 'screenshot';

  return (
    <div
      className={`relative w-full overflow-hidden ${
        variant === 'hero' ? '' : 'rounded-[2px] border border-black/10 dark:border-white/15'
      } ${aspectClassName ?? DEFAULT_ASPECT[variant]} ${className}`}
      style={{
        background: isScreenshot
          ? 'linear-gradient(155deg, #f1efe9, #e6e2d8)'
          : 'linear-gradient(155deg, #efece5, #e2ddd0)',
      }}
    >
      {isScreenshot && (
        <div className='absolute top-0 left-0 right-0 h-7 flex items-center gap-1.5 px-3 border-b border-black/10 bg-black/[0.03]'>
          <span className='w-2 h-2 rounded-full bg-black/15' />
          <span className='w-2 h-2 rounded-full bg-black/15' />
          <span className='w-2 h-2 rounded-full bg-black/15' />
        </div>
      )}
      <div className='absolute inset-3 border border-black/[0.06] dark:border-white/10 pointer-events-none' />
      <div className='absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-2'>
        <span className='text-[0.7rem] sm:text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-poppins)] font-semibold text-black/35 dark:text-white/40'>
          {label}
        </span>
        {sublabel && (
          <span className='max-w-xs text-[0.7rem] sm:text-xs font-[family-name:var(--font-poppins)] text-black/30 dark:text-white/30'>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
