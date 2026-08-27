'use client';
import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  TouchEvent,
  WheelEvent,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc?: string;
  posterSrc?: string;
  /** Background media shown behind the hero (fades out as you scroll). */
  bgImageSrc: string;
  /** Set to true when `bgImageSrc` points to a video file instead of an image. */
  bgIsVideo?: boolean;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  bgIsVideo = false,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Reset the expand progress whenever `mediaType` changes. Adjusted during
  // render (React's recommended pattern for resetting state in response to a
  // prop change) rather than in an effect, which would cause an extra render
  // and briefly show stale state before the reset took effect.
  const [prevMediaType, setPrevMediaType] = useState(mediaType);
  if (prevMediaType !== mediaType) {
    setPrevMediaType(mediaType);
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }

  // The browser's own scroll-position memory (native "scroll
  // restoration") can restore a deep scroll position from a previous visit
  // to this page — independently of, and sometimes after, the logic below
  // — leaving the hero's expand state and the actual scroll position out
  // of sync (the page can land mid-gallery instead of on the hero image).
  // Taking manual control here makes this component's own effects (the
  // hash jump below, or simply starting at the top) the only source of
  // truth for where the page opens.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // If this page was opened via a link straight to a section further down
  // (e.g. a "Back to destinations" link using "/#travels" from a
  // destination page), skip the scroll-driven hero intro entirely and show
  // the expanded state immediately, then jump to that section. Without
  // this, the scroll-hijacking below would repeatedly reset the page back
  // to the top instead of landing on the linked section. A normal visit to
  // "/" with no hash is completely unaffected: this effect is a no-op then.
  //
  // These three updates are one atomic "skip the intro" transition (React
  // batches them into a single re-render) driven by window.location, which
  // isn't available at render time without risking a hydration mismatch —
  // so it has to live in an effect rather than as derived render state.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time bootstrap from window.location.hash on mount; see comment above
    setScrollProgress(1);
    setMediaFullyExpanded(true);
    setShowContent(true);
    const id = window.location.hash.slice(1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });
    });
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0016;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);
        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Increase sensitivity for mobile, especially when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Higher sensitivity for scrolling back
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);
        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
        setTouchStartY(touchY);
      }
    };
    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };
    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('wheel', handleWheel as unknown as EventListener, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll as EventListener);
    window.addEventListener(
      'touchstart',
      handleTouchStart as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove as unknown as EventListener,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd as EventListener);
    return () => {
      window.removeEventListener(
        'wheel',
        handleWheel as unknown as EventListener
      );
      window.removeEventListener('scroll', handleScroll as EventListener);
      window.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      );
      window.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const mediaWidth = 300 + scrollProgress * (isMobileState ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobileState ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);
  const dateTextScale = 1 + scrollProgress * (isMobileState ? 0 : 0.12);
  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100svh] md:min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100svh] md:min-h-[100dvh]'>
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {bgIsVideo ? (
              <video
                src={bgImageSrc}
                autoPlay
                muted
                loop
                playsInline
                preload='auto'
                className='w-screen h-screen object-cover'
              />
            ) : (
              <Image
                src={bgImageSrc}
                alt='Background'
                width={1920}
                height={1080}
                className='w-screen h-screen'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                priority
              />
            )}
            <div className='absolute inset-0 bg-black/10' />
          </motion.div>
          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100svh] md:h-[100dvh] relative'>
              {!mediaSrc && (
                <div
                  className='absolute z-0 top-[34%] sm:top-[24%] left-1/2 flex flex-col items-center justify-center px-6 transition-none w-full max-w-[92vw] sm:max-w-[90vw]'
                  style={{
                    transform: `translate(-50%, calc(-50% - 32px)) scale(${dateTextScale})`,
                  }}
                >
                  {date && (
                    <p
                      className='text-2xl sm:text-5xl md:text-6xl xl:text-7xl text-[#F5F1E8] font-[family-name:var(--font-playfair)] font-medium tracking-tight whitespace-normal sm:whitespace-nowrap text-center'
                      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.5)' }}
                    >
                      {date}
                    </p>
                  )}
                  <p
                    className='mt-4 text-xs sm:text-sm md:text-base text-[#F5F1E8]/85 font-[family-name:var(--font-poppins)] font-medium tracking-normal whitespace-normal sm:whitespace-nowrap lowercase text-center'
                    style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
                  >
                    travel • memories • places worth remembering
                  </p>
                </div>
              )}
              {mediaSrc && (
                <div
                  className='absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl'
                  style={{
                    width: `${mediaWidth}px`,
                    height: `${mediaHeight}px`,
                    maxWidth: '95vw',
                    maxHeight: '85vh',
                    boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {mediaType === 'video' ? (
                    mediaSrc.includes('youtube.com') ? (
                      <div className='relative w-full h-full pointer-events-none'>
                        <iframe
                          width='100%'
                          height='100%'
                          src={
                            mediaSrc.includes('embed')
                              ? mediaSrc +
                                (mediaSrc.includes('?') ? '&' : '?') +
                                'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                              : mediaSrc.replace('watch?v=', 'embed/') +
                                '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                                mediaSrc.split('v=')[1]
                          }
                          className='w-full h-full rounded-xl'
                          frameBorder='0'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                        />
                        <div
                          className='absolute inset-0 z-10'
                          style={{ pointerEvents: 'none' }}
                        ></div>
                        <motion.div
                          className='absolute inset-0 bg-black/30 rounded-xl'
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    ) : (
                      <div className='relative w-full h-full pointer-events-none'>
                        <video
                          src={mediaSrc}
                          poster={posterSrc}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload='auto'
                          className='w-full h-full object-cover rounded-xl'
                          controls={false}
                          disablePictureInPicture
                          disableRemotePlayback
                        />
                        <div
                          className='absolute inset-0 z-10'
                          style={{ pointerEvents: 'none' }}
                        ></div>
                        <motion.div
                          className='absolute inset-0 bg-black/30 rounded-xl'
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    )
                  ) : (
                    <div className='relative w-full h-full'>
                      <Image
                        src={mediaSrc}
                        alt={title || 'Media content'}
                        width={1280}
                        height={720}
                        className='w-full h-full object-cover rounded-xl'
                      />
                      <motion.div
                        className='absolute inset-0 bg-black/50 rounded-xl'
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )}
                  <div className='absolute inset-0 flex flex-col items-center justify-start text-center z-10 px-4 pt-6 transition-none'>
                    {date && (
                      <p
                        className='text-2xl text-white font-[family-name:var(--font-fredoka)] font-bold uppercase tracking-wide'
                        style={{ transform: `scale(${dateTextScale})`, transformOrigin: 'top center' }}
                      >
                        {date}
                      </p>
                    )}
                    {scrollToExpand && (
                      <p
                        className='text-blue-200 font-medium text-center'
                        style={{ transform: `translateX(${textTranslateX}vw)` }}
                      >
                        {scrollToExpand}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.h2
                  className='text-4xl md:text-5xl lg:text-6xl font-bold text-blue-200 transition-none'
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className='text-4xl md:text-5xl lg:text-6xl font-bold text-center text-blue-200 transition-none'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>
            <motion.section
              className='flex flex-col w-full px-8 pt-20 pb-10 md:px-16 md:pt-16 lg:pb-20'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
