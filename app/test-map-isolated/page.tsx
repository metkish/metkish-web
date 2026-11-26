// TEMPORARY DIAGNOSTIC PAGE -- not for main. Renders the real
// JourneyMapScene component with real Tenerife route data, with
// nothing else on the page at all (no header, no photos, no other
// sections) -- to isolate whether the vehicle/route-disappearing bug
// is caused by this component's own interaction with React/Next.js,
// or by something in the surrounding real page's CSS/DOM structure.
import JourneyMapScene from '@/components/journey/JourneyMapScene';
import { TENERIFE_ROCA_TO_DUQUE_JOURNEY } from '@/lib/journeys/tenerife';

export default function TestMapIsolatedPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', padding: '24px 16px' }}>
      <p style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#666', marginBottom: 16 }}>
        Isolated test: just the Roca Nivaria to Playa del Duque map, nothing else on the page.
      </p>
      <JourneyMapScene
        routeCacheUrl="/route-cache/tenerife.json"
        region="canary"
        journey={TENERIFE_ROCA_TO_DUQUE_JOURNEY}
        heightClassName="h-[340px] sm:h-[380px] md:h-[440px]"
      />
      <div style={{ height: '60vh' }} />
    </div>
  );
}
