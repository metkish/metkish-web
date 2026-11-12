'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A decorative, muted/looped background video (Þingvellir / Geysir /
 * Gullfoss style clips) that defers fetching its source until the visitor
 * scrolls close to it, instead of downloading immediately on page load the
 * way a plain `<video autoPlay src=...>` does.
 *
 * Shape: this reuses the same "IntersectionObserver drives real
 * video.play()/pause() calls" idiom as the existing `ViewportVideo`
 * component (see app/barcelona/page.tsx) -- the project's own established
 * pattern for this kind of clip -- and extends it with the one thing that
 * component doesn't need: deferring the `src` attribute itself (not just
 * play/pause) until the video is within `preloadMargin` of the viewport,
 * so the browser never begins transferring the file until it's actually
 * about to be needed. A second, independent observer (tighter threshold,
 * no margin) then drives play()/pause() exactly like ViewportVideo does,
 * so playback starts smoothly once the clip is actually on screen and
 * pauses again once it scrolls away.
 *
 * `prefers-reduced-motion` is respected by simply never calling play():
 * the video still loads (so it's not blank) and shows its first frame,
 * it just never starts moving on its own for a visitor who asked their
 * system not to animate things.
 *
 * The wrapping aspect-ratio container in each page stays exactly as it
 * was (unchanged) -- this component only replaces the inner <video>, so
 * there is no layout shift: the box is already fully sized by the parent
 * before the clip ever loads.
 */
export function LazyAutoplayVideo({
  src,
  ariaLabel,
  className,
  preloadMargin = '800px',
}: {
  src: string;
  ariaLabel: string;
  className?: string;
  /**
   * How far below/above the viewport to start fetching the video, so it
   * has a head start and is ready (or nearly ready) by the time a visitor
   * actually scrolls to it at a normal pace. Default of 800px is roughly
   * a screen's worth of lead time on mobile.
   */
  preloadMargin?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Lazy initializers compute the right starting value synchronously at
  // mount time (no setState call in an effect body needed for either).
  // Critically, this must stay false during server-side rendering: Node
  // has no `IntersectionObserver` global either, so a naive "fail open
  // when IntersectionObserver is missing" check is also true during SSR
  // -- which would bake the real `src` straight into the server-rendered
  // HTML and defeat lazy loading entirely (the browser starts fetching
  // from the raw markup before React/the observer ever run). Only an old
  // *browser* that genuinely lacks IntersectionObserver should fail open.
  const [shouldLoad, setShouldLoad] = useState(() => {
    if (typeof window === 'undefined') return false;
    return typeof IntersectionObserver === 'undefined';
  });
  const [allowMotion, setAllowMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Subscribe to prefers-reduced-motion changes (the initial value above
  // already reflects it; this effect only keeps it in sync afterward).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setAllowMotion(!mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Observer #1: trigger loading the real src once the video element is
  // getting close to the viewport (rootMargin gives the early lead time).
  // Fires once, then disconnects -- after that the clip behaves like a
  // normal already-loaded video for the rest of its life on the page.
  // (In environments with no IntersectionObserver, shouldLoad is already
  // true from the lazy initializer above, so this effect is a no-op.)
  useEffect(() => {
    const el = videoRef.current;
    if (!el || shouldLoad || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: preloadMargin }
    );
    loadObserver.observe(el);
    return () => loadObserver.disconnect();
  }, [preloadMargin, shouldLoad]);

  // Observer #2: once loaded, drive real play()/pause() based on actual
  // visibility -- same threshold-based approach as ViewportVideo. Skipped
  // entirely when reduced motion is requested, so the clip simply sits on
  // its first frame once loaded.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad || !allowMotion) return;

    if (typeof IntersectionObserver === 'undefined') {
      void el.play().catch(() => {});
      return;
    }

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    playObserver.observe(el);
    return () => playObserver.disconnect();
  }, [shouldLoad, allowMotion]);

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? src : undefined}
      muted
      loop
      playsInline
      preload={shouldLoad ? 'auto' : 'none'}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
