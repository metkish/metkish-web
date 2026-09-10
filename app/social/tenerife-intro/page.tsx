'use client';

// TEST #1 — Tenerife intro Reel, a standalone social/vertical-video
// composition. Completely isolated from the production Tenerife page
// (app/tenerife/page.tsx): it reuses the same real journey data, map math
// and the shared /public photo asset (see components/social/SocialMapScene.tsx
// for exactly what's imported vs. re-implemented), but nothing here
// modifies, imports from, or renders the production page, its
// JourneyMapScene component, or the shared RouteLabel/annotation-kit
// component (this page defines its own larger SocialCaption below
// instead, sized for a phone-viewed Reel).
//
// Fixed 1080x1920 (9:16) canvas, authored at that literal pixel size and
// scaled down (one CSS transform, recomputed on resize) to fit whatever
// viewport this is opened in — so what's on screen is always a faithful,
// un-distorted preview of the exported frame, never a squeezed/stretched
// approximation. No scrolling, autoplays once on load, ~12s of authored
// motion (see the T constants below) then holds on the end frame.
//
// REFINEMENT PASS (round 3, from the live-preview review):
//   1. Intro unchanged — it already worked.
//   2. Home -> Vienna keeps its camera-keyframe pan; added one small,
//      static "Home -> Vienna Airport" caption (SmallCaption below) so the
//      route has immediate context, positioned in the frame's calm top
//      area, clear of both the Instagram top safe-zone and the Vienna
//      Airport map label that appears near the end of the scene.
//   3. Vienna -> Tenerife: geography opacity nudged up again inside
//      SocialMapScene (still restrained), plane sized up a little more,
//      and the SocialCaption pushed down slightly for a safer top margin.
//   4. Visual hierarchy (vehicle/route > labels > geography) reinforced
//      inside SocialMapScene: route/dot size bumped alongside the
//      geography opacity increase, so the route stays the strongest thing
//      on screen.
//   5. Timing extended to ~13-15s total: ~2s intro, ~3.5s drive, ~4s
//      flight, then holding on the real photo.
//   6-8. The temporary placeholder is replaced with the actual production
//      hero photo (public/2026-07 - Tenerife/Tenerife_hero.jpeg — the
//      exact file app/tenerife/page.tsx's own hero uses, not copied or
//      altered), given its own object-position tuned for a 9:16 crop
//      instead of the desktop hero's wide-crop percentages. Text
//      hierarchy/copy unchanged; positioning double-checked against an
//      Instagram-style safe zone (comfortably clear of the top edge,
//      bottom third and right column).

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import SocialMapScene from '@/components/social/SocialMapScene';
import type { SocialMapCameraKeyframe } from '@/components/social/SocialMapScene';
import {
  TENERIFE_HOME_TO_VIENNA_JOURNEY,
  TENERIFE_VIENNA_TO_TENERIFE_JOURNEY,
} from '@/lib/journeys/tenerife';

const LOGO_SRC = '/metkish-logo.png';
// The exact same asset the production Tenerife hero uses (see
// app/tenerife/page.tsx) — read here, never duplicated or edited.
const HERO_PHOTO_SRC = '/2026-07%20-%20Tenerife/Tenerife_hero.jpeg';

// The real, verified leg data (from/to points, real route waypoints,
// coastline-safety land polygons) — pulled straight out of the existing,
// approved journey definitions rather than re-entered, so "the same real
// locations and route logic" is structurally guaranteed, not just visually
// similar. Only the camera framing below is new: recomposed for a 9:16
// canvas instead of the desktop map's wide aspect.
const HOME_TO_VIENNA_LEG = TENERIFE_HOME_TO_VIENNA_JOURNEY.legs[0];
const VIENNA_TO_TENERIFE_LEG = TENERIFE_VIENNA_TO_TENERIFE_JOURNEY.legs[0];

// A small, authored "editorial pan": tight near Home as the drive begins,
// a mid-route frame that keeps the growing pink line and the car as the
// visual focus (rather than sitting in a wide, mostly-empty frame for the
// whole scene), then eased back at the end to the same wide resting frame
// as before — the complete Home -> Vienna Airport journey, comfortably
// inside the frame. SocialMapScene blends between these with its own
// eased interpolation, so the motion is gentle rather than a literal
// camera-follows-the-pin effect.
const HOME_TO_VIENNA_CAMERA_KEYFRAMES: SocialMapCameraKeyframe[] = [
  { t: 0, center: [16.08, 46.85], spanDeg: 0.55 },
  { t: 0.55, center: [16.07, 47.29], spanDeg: 0.85 },
  { t: 1, center: [16.28, 47.46], spanDeg: 1.35 },
];

// Unchanged from the first pass — this wide diagonal composition already
// worked, so only the map's own legibility (inside SocialMapScene) and
// this page's timing/label changed, not the framing itself.
const VIENNA_TO_TENERIFE_CAMERA = { center: [0, 38.07] as [number, number], spanDeg: 44 };

// Scene timing in seconds — extended from the previous pass so nothing
// feels rushed (~13-15s total once the final photo's own hold is
// included). Scene 2 -> Scene 3 stays a genuine sequential dissolve
// (scene 2 finishes fading out before scene 3 starts fading in) so the
// two route systems are never both partially visible; every other
// boundary is a quiet ~0.4s crossfade.
const T = {
  s1FadeInEnd: 0.5,
  s1HoldEnd: 1.5,
  s2FadeInEnd: 1.9, // scene 1 fades out / scene 2 fades in together
  s2TravelEnd: 5.4, // 1.9 -> 5.4 = 3.5s drive
  s2HoldEnd: 5.8, // brief pause on the completed Home->Vienna frame
  s2FadeOutEnd: 6.2, // scene 2 fully gone before scene 3 begins
  s3FadeInEnd: 6.6,
  s3TravelEnd: 10.6, // 6.6 -> 10.6 = 4.0s flight
  s3HoldEnd: 11.0, // brief pause on the completed Vienna->Tenerife route
  s4FadeInEnd: 11.4, // scene 3 fades out / scene 4 (real photo) fades in together
};

// A local stand-in for the production RouteLabel (components/journey/
// annotation-kit.tsx) — same visual language (pink tick + uppercase
// tracked Poppins semibold), just sized for a phone-viewed vertical Reel
// instead of a desktop map caption. Kept local rather than resizing the
// shared component, since annotation-kit.tsx is production code used on
// the live Tenerife page and must not change for this test.
function SocialCaption({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-col items-center gap-3'>
      <span className='h-1 w-16 bg-pink-300' />
      <p className='text-[2.15rem] uppercase tracking-[0.2em] font-[family-name:var(--font-poppins)] font-semibold text-black/80'>
        {children}
      </p>
    </div>
  );
}

// A quieter, smaller sibling of SocialCaption — a plain context line, not
// a heading: no pink tick, muted color, closer to the site's own small
// "Fact" label typography (uppercase, tracked, semibold, muted). Used only
// for the one-line "Home -> Vienna Airport" caption on the drive scene.
function SmallCaption({ children }: { children: ReactNode }) {
  return (
    <p className='text-[1.2rem] uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-black/45'>
      {children}
    </p>
  );
}

export default function TenerifeIntroReel() {
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);
  const [scale, setScale] = useState(0.3);
  const scene1Ref = useRef<HTMLDivElement | null>(null);
  const scene2Ref = useRef<HTMLDivElement | null>(null);
  const scene3Ref = useRef<HTMLDivElement | null>(null);
  const scene4Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(window.innerWidth / 1080, window.innerHeight / 1920));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    const scene1 = scene1Ref.current;
    const scene2 = scene2Ref.current;
    const scene3 = scene3Ref.current;
    const scene4 = scene4Ref.current;
    if (!scene1 || !scene2 || !scene3 || !scene4) return;

    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    gsap.set([scene1, scene2, scene3, scene4], { opacity: 0 });

    if (reducedMotion) {
      // Same philosophy as the production map: someone with reduced
      // motion gets the completed, calm end state directly rather than
      // the autoplay sequence.
      gsap.set(scene4, { opacity: 1 });
      setProgress2(1);
      setProgress3(1);
      return;
    }

    const proxy2 = { p: 0 };
    const proxy3 = { p: 0 };
    const tl = gsap.timeline();

    tl.to(scene1, { opacity: 1, duration: T.s1FadeInEnd, ease: 'power1.out' }, 0)
      .to(scene1, { opacity: 0, duration: T.s2FadeInEnd - T.s1HoldEnd, ease: 'power1.inOut' }, T.s1HoldEnd)
      .to(scene2, { opacity: 1, duration: T.s2FadeInEnd - T.s1HoldEnd, ease: 'power1.inOut' }, T.s1HoldEnd)
      .to(
        proxy2,
        { p: 1, duration: T.s2TravelEnd - T.s2FadeInEnd, ease: 'none', onUpdate: () => setProgress2(proxy2.p) },
        T.s2FadeInEnd
      )
      // Sequential dissolve: scene 2 fades all the way to invisible first
      // (revealing the shared cream background underneath), and only then
      // does scene 3 begin fading in — so the two route systems are never
      // both on screen at once.
      .to(scene2, { opacity: 0, duration: T.s2FadeOutEnd - T.s2HoldEnd, ease: 'power1.inOut' }, T.s2HoldEnd)
      .to(scene3, { opacity: 1, duration: T.s3FadeInEnd - T.s2FadeOutEnd, ease: 'power1.inOut' }, T.s2FadeOutEnd)
      .to(
        proxy3,
        { p: 1, duration: T.s3TravelEnd - T.s3FadeInEnd, ease: 'none', onUpdate: () => setProgress3(proxy3.p) },
        T.s3FadeInEnd
      )
      // Vienna -> Tenerife into the real photo stays a soft crossfade —
      // the "visual payoff" moment, so it dissolves rather than cutting.
      .to(scene3, { opacity: 0, duration: T.s4FadeInEnd - T.s3HoldEnd, ease: 'power1.inOut' }, T.s3HoldEnd)
      .to(scene4, { opacity: 1, duration: T.s4FadeInEnd - T.s3HoldEnd, ease: 'power1.inOut' }, T.s3HoldEnd);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className='fixed inset-0 overflow-hidden bg-[#1a1a1a] flex items-center justify-center'>
      <div
        className='relative bg-[#faf9f6]'
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* SCENE 1 — INTRO. Unchanged from round 2 — plain fade, no
            slide, generous cream margin. */}
        <div ref={scene1Ref} className='absolute inset-0 flex flex-col items-center justify-center bg-[#faf9f6]'>
          <Image
            src={LOGO_SRC}
            alt='Metkish'
            width={640}
            height={640}
            className='w-[340px] h-[340px]'
            priority
          />
          <p className='mt-10 text-[38px] italic lowercase font-[family-name:var(--font-poppins)] font-medium text-black/70'>
            travel · memories · places worth remembering
          </p>
        </div>

        {/* SCENE 2 — HOME -> VIENNA AIRPORT. Camera pans gently with the
            drive (HOME_TO_VIENNA_CAMERA_KEYFRAMES). One small, static
            context caption added at a fixed screen position in the
            frame's calm top area — comfortably below the very top edge,
            and well above where the "Vienna Airport" map label lands even
            once the camera has pulled back at the end of the scene, so
            the two never collide. */}
        <div ref={scene2Ref} className='absolute inset-0'>
          <div className='absolute top-[130px] left-1/2 -translate-x-1/2 z-10'>
            <SmallCaption>Home → Vienna Airport</SmallCaption>
          </div>
          <SocialMapScene leg={HOME_TO_VIENNA_LEG} cameraKeyframes={HOME_TO_VIENNA_CAMERA_KEYFRAMES} progress={progress2} showLabels />
        </div>

        {/* SCENE 3 — VIENNA -> TENERIFE. Same wide diagonal composition as
            before; caption pushed down slightly (pt-36 instead of pt-28)
            for a safer top margin, map legibility/plane size increased
            inside SocialMapScene. */}
        <div ref={scene3Ref} className='absolute inset-0 flex flex-col'>
          <div className='pt-36 flex justify-center'>
            <SocialCaption>Vienna → Tenerife</SocialCaption>
          </div>
          <div className='flex-1'>
            <SocialMapScene
              leg={VIENNA_TO_TENERIFE_LEG}
              camera={VIENNA_TO_TENERIFE_CAMERA}
              progress={progress3}
              showLabels={false}
            />
          </div>
        </div>

        {/* SCENE 4 — END FRAME. The real, approved Tenerife hero photo
            (same file the production hero uses — see HERO_PHOTO_SRC
            above), given its own object-position for a 9:16 crop that
            keeps the volcanic landscape, the sky and the foreground plant
            all in frame rather than the desktop hero's wide crop.  Text
            hierarchy/copy is exactly the production hero's; position/size
            adapted for a phone-viewed frame and checked against an
            Instagram-style safe zone (clear of the top edge, the bottom
            third, and the right-side control column). */}
        <div ref={scene4Ref} className='absolute inset-0'>
          <Image
            src={HERO_PHOTO_SRC}
            alt='The volcanic highlands of Teide National Park, Tenerife, under a wide open sky.'
            fill
            priority
            sizes='1080px'
            className='object-cover object-[50%_38%]'
          />
          <div className='absolute inset-0 bg-black/15' />
          <div className='relative h-full flex flex-col items-center justify-center text-center px-16'>
            <h2 className='text-[84px] leading-none font-[family-name:var(--font-playfair)] font-medium tracking-tight text-white'>
              Tenerife
            </h2>
            <p className='mt-8 text-[23px] uppercase tracking-[0.22em] font-[family-name:var(--font-poppins)] font-semibold text-white/85'>
              Spain · Canary Islands · July 2026
            </p>
            <p className='mt-14 max-w-[740px] text-[34px] leading-snug italic font-[family-name:var(--font-playfair)] text-white/90'>
              An island we could easily come back to.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
