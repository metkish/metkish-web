// TEMPORARY DIAGNOSTIC PAGE -- not for main. Renders two real
// JourneyMapScene maps with nothing else on the page at all (no
// header, no photos, no other sections):
//   1. Tenerife Roca Nivaria -> Playa del Duque (the leg that's been
//      breaking throughout this investigation).
//   2. Sardinia Casagliana -> Principe, using the exact same real
//      route data that was embedded directly in an earlier standalone
//      (plain HTML/JS, no React/Next.js) test page and reproduced
//      perfectly there.
// Both run through the real component, real data, real React/Next.js
// -- the only variable that differs between them is WHICH journey's
// data. If #2 ALSO breaks here despite having passed cleanly as plain
// JS, that isolates React/Next.js itself (not this specific route's
// geometry) as the real remaining differentiator.
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { TENERIFE_ROCA_TO_DUQUE_JOURNEY } from '@/lib/journeys/tenerife';
import { SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY } from '@/lib/journeys/sardinia';

export default function TestMapIsolatedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', padding: '24px 16px' }}>
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 1 of 2 -- Tenerife, Roca Nivaria to Playa del Duque.
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/tenerife.json"
        region="canary"
        journey={TENERIFE_ROCA_TO_DUQUE_JOURNEY}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '40vh' }} />
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 2 of 2 -- Sardinia, Casagliana to Principe (same real data that
        passed cleanly as a plain HTML/JS test earlier).
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/sardinia.json"
        region="sardinia"
        journey={SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '60vh' }} />
    </div>
  );
}
