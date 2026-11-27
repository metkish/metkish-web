// TEMPORARY DIAGNOSTIC PAGE -- not for main. Renders three real
// JourneyMapScene maps with nothing else on the page at all (no
// header, no photos, no other sections):
//   1. TENERIFE_DUQUE_FRESH_REBUILD_TEST -- a journey object built from
//      scratch as a literal structural copy of the always-working
//      TENERIFE_HOME_TO_VIENNA_JOURNEY (same field order/set, no
//      routeLand, no shared-corridor spreads, no edit history),
//      substituting only the real Duque route data. If this ALSO
//      breaks, it rules out any leftover artifact from this session's
//      many edits to the original Duque journey object below.
//   2. TENERIFE_ROCA_TO_DUQUE_JOURNEY -- the original, repeatedly-
//      edited-this-session Duque journey, kept for direct comparison
//      against #1 in the same page load.
//   3. Sardinia Casagliana -> Principe, using the exact same real
//      route data that was embedded directly in an earlier standalone
//      (plain HTML/JS, no React/Next.js) test page and reproduced
//      perfectly there.
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { TENERIFE_DUQUE_FRESH_REBUILD_TEST, TENERIFE_ROCA_TO_DUQUE_JOURNEY } from '@/lib/journeys/tenerife';
import { SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY } from '@/lib/journeys/sardinia';
import { ICELAND_HOME_TO_LJUBLJANA_TIGHT_ZOOM_TEST } from '@/lib/journeys/iceland';

export default function TestMapIsolatedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', padding: '24px 16px' }}>
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 1 of 4 -- FRESH REBUILD, same shape as Home-&gt;Vienna, Duque's real data.
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/tenerife.json"
        region="canary"
        journey={TENERIFE_DUQUE_FRESH_REBUILD_TEST}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '40vh' }} />
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 2 of 4 -- the original (repeatedly-edited) Tenerife Roca Nivaria to Playa del Duque.
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/tenerife.json"
        region="canary"
        journey={TENERIFE_ROCA_TO_DUQUE_JOURNEY}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '40vh' }} />
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 3 of 4 -- Sardinia, Casagliana to Principe (same real data that
        passed cleanly as a plain HTML/JS test earlier).
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/sardinia.json"
        region="sardinia"
        journey={SARDINIA_CASAGLIANA_TO_PRINCIPE_JOURNEY}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '40vh' }} />
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Map 4 of 4 -- Iceland Home-&gt;Ljubljana, the EXACT real, always-working
        route/geometry, with ONLY camera.spanDeg forced down to 0.15
        (Duque's real zoom). Isolates CTM scale alone as the variable.
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/iceland.json"
        journey={ICELAND_HOME_TO_LJUBLJANA_TIGHT_ZOOM_TEST}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '60vh' }} />
    </div>
  );
}
