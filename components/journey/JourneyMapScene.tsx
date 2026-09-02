'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Journey, JourneyLeg, JourneyMode } from '@/lib/journeys/types';
import { bezierPoint, bearing } from './geo';
import { CarIcon, PlaneIcon, TransferIcon } from './icons';
import { JourneyProgressContext } from './journey-context';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ROUTE_SOURCE_ID = 'journey-route';
const ROUTE_SAMPLES = 48;
const MUTED_WATER = '#e4ddcf';
const MUTED_LAND = '#f4efe4';
const MUTED_BACKGROUND = '#f6f1e6';
const MUTED_LINE = '#ddd3bd';
const ROUTE_PINK = '#e8639f';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type LineData = {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
};

function lineData(coordinates: [number, number][]): LineData {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
}

// The light-v11 style is muted further here (warm beige/grey, labels
// hidden) rather than reaching for a bespoke Mapbox Studio style — this
// keeps the map self-contained in code, with no external style asset to
// keep in sync. Every layer is wrapped individually: paint properties vary
// by layer type across style versions, so a rejected property on one
// layer should never take the rest of the pass down with it.
function muteStyle(map: mapboxgl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;
  for (const layer of style.layers) {
    try {
      if (layer.type === 'symbol') {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        continue;
      }
      if (layer.id === 'background') {
        map.setPaintProperty(layer.id, 'background-color', MUTED_BACKGROUND);
      } else if (layer.id.includes('water')) {
        map.setPaintProperty(layer.id, 'fill-color', MUTED_WATER);
      } else if (
        layer.type === 'fill' &&
        (layer.id.includes('landuse') || layer.id.includes('landcover') || layer.id.includes('land'))
      ) {
        map.setPaintProperty(layer.id, 'fill-color', MUTED_LAND);
      } else if (layer.type === 'line') {
        if (layer.id.includes('road') || layer.id.includes('bridge') || layer.id.includes('tunnel')) {
          map.setPaintProperty(layer.id, 'line-color', MUTED_LINE);
          map.setPaintProperty(layer.id, 'line-opacity', 0.5);
        } else if (layer.id.includes('admin') || layer.id.includes('boundary')) {
          map.setPaintProperty(layer.id, 'line-color', MUTED_LINE);
          map.setPaintProperty(layer.id, 'line-opacity', 0.4);
        }
      }
    } catch {
      // Property not supported on this layer/style version — skip it.
    }
  }
}

interface LegRange {
  leg: JourneyLeg;
  start: number;
  end: number;
}

function computeLegRanges(legs: JourneyLeg[]): LegRange[] {
  const total = legs.reduce((sum, leg) => sum + (leg.weight ?? 1), 0) || 1;
  let cumulative = 0;
  return legs.map((leg) => {
    const start = cumulative / total;
    cumulative += leg.weight ?? 1;
    const end = cumulative / total;
    return { leg, start, end };
  });
}

function sampleLeg(leg: JourneyLeg, samples: number): [number, number][] {
  const points: [number, number][] = [];
  for (let s = 0; s <= samples; s++) {
    points.push(bezierPoint(leg.from.coords, leg.to.coords, leg.curve ?? 0, s / samples));
  }
  return points;
}

export interface JourneyMapSceneProps {
  journey: Journey;
  /** Total scroll distance for the whole scene, in viewport heights. */
  heightVh?: number;
  className?: string;
  children?: ReactNode;
}

export default function JourneyMapScene({
  journey,
  heightVh = 500,
  className = '',
  children,
}: JourneyMapSceneProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const vehicleOuterRef = useRef<HTMLDivElement | null>(null);
  const vehicleInnerRef = useRef<HTMLDivElement | null>(null);
  const vehicleMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const labelMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [progress, setProgress] = useState(0);
  const [vehicleMode, setVehicleMode] = useState<JourneyMode>(
    journey.legs[0]?.mode ?? 'car'
  );

  const tokenMissing = !MAPBOX_TOKEN;
  const legRanges = useMemo(() => computeLegRanges(journey.legs), [journey]);

  // Map init — once per journey.
  useEffect(() => {
    if (!MAPBOX_TOKEN) return;
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: journey.initialCamera.center,
      zoom: journey.initialCamera.zoom,
      pitch: journey.initialCamera.pitch ?? 0,
      bearing: journey.initialCamera.bearing ?? 0,
      interactive: false,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });
    mapRef.current = map;

    map.on('load', () => {
      muteStyle(map);
      map.addSource(ROUTE_SOURCE_ID, { type: 'geojson', data: lineData([]) });
      map.addLayer({
        id: 'journey-route-glow',
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_PINK, 'line-width': 7, 'line-opacity': 0.16, 'line-blur': 1.5 },
      });
      map.addLayer({
        id: 'journey-route-line',
        type: 'line',
        source: ROUTE_SOURCE_ID,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_PINK, 'line-width': 2.2, 'line-opacity': 0.9 },
      });

      if (vehicleOuterRef.current) {
        vehicleMarkerRef.current = new mapboxgl.Marker({
          element: vehicleOuterRef.current,
          anchor: 'center',
        })
          .setLngLat(journey.legs[0]?.from.coords ?? journey.initialCamera.center)
          .addTo(map);
      }

      // Only points explicitly flagged for it get a visible map label — the
      // map itself should carry almost no text; place names are told
      // through the scroll narrative instead.
      outer: for (const leg of journey.legs) {
        for (const point of [leg.from, leg.to]) {
          if (point.showMapLabel) {
            const el = document.createElement('div');
            el.className =
              'flex items-center gap-2 opacity-0 transition-opacity duration-700 ease-out';
            el.innerHTML = `
              <span class="block w-2 h-2 rounded-full bg-[#e8639f] ring-2 ring-[#f6f1e6]"></span>
              <span class="flex flex-col leading-tight font-[family-name:var(--font-poppins)]">
                <span class="text-[0.65rem] uppercase tracking-[0.16em] font-semibold text-black/70">${point.name}</span>
                ${point.sublabel ? `<span class="text-[0.6rem] text-black/45">${point.sublabel}</span>` : ''}
              </span>
            `;
            labelMarkerRef.current = new mapboxgl.Marker({
              element: el,
              anchor: 'left',
              offset: [10, 0] as [number, number],
            })
              .setLngLat(point.coords)
              .addTo(map);
            break outer;
          }
        }
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      vehicleMarkerRef.current = null;
      labelMarkerRef.current = null;
    };
  }, [journey]);

  // Scroll-driven progress. CSS `sticky` (below, in the JSX) handles the
  // visual pin; GSAP ScrollTrigger just measures how far through the tall
  // wrapper the page has scrolled and drives the map + annotations from
  // that single number.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let activeLegIndex = -1;
    let activeMode: JourneyMode | null = null;
    let lastApplied = -1;

    const applyProgress = (raw: number) => {
      const clamped = Math.min(1, Math.max(0, raw));
      let legIndex = legRanges.findIndex((r) => clamped >= r.start && clamped <= r.end);
      if (legIndex === -1) legIndex = legRanges.length - 1;
      const range = legRanges[legIndex];
      const leg = range.leg;
      const span = range.end - range.start || 1;
      const localProgress = Math.min(1, Math.max(0, (clamped - range.start) / span));

      const map = mapRef.current;
      if (legIndex !== activeLegIndex) {
        activeLegIndex = legIndex;
        if (map) {
          const fly = leg.transition === 'fly';
          const camOpts = {
            center: leg.camera.center,
            zoom: leg.camera.zoom,
            pitch: leg.camera.pitch ?? 0,
            bearing: leg.camera.bearing ?? 0,
            duration: fly ? 1900 : 1300,
            essential: true,
          };
          if (fly) map.flyTo(camOpts);
          else map.easeTo(camOpts);
        }
        if (labelMarkerRef.current) {
          const involvesLabel = leg.from.showMapLabel || leg.to.showMapLabel;
          if (involvesLabel) labelMarkerRef.current.getElement().style.opacity = '1';
        }
        if (leg.mode !== activeMode) {
          activeMode = leg.mode;
          setVehicleMode(leg.mode);
        }
      }

      if (leg.showRoute !== false) {
        const coordinates: [number, number][] = [];
        legRanges.forEach((r, i) => {
          if (r.leg.showRoute === false) return;
          if (i < legIndex) {
            coordinates.push(...sampleLeg(r.leg, ROUTE_SAMPLES));
          } else if (i === legIndex) {
            const steps = Math.max(1, Math.round(ROUTE_SAMPLES * localProgress));
            for (let s = 0; s <= steps; s++) {
              coordinates.push(bezierPoint(r.leg.from.coords, r.leg.to.coords, r.leg.curve ?? 0, s / ROUTE_SAMPLES));
            }
          }
        });
        const source = map?.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
        source?.setData(lineData(coordinates));
      }

      if (vehicleMarkerRef.current) {
        if (leg.showRoute === false) {
          vehicleMarkerRef.current.setLngLat(leg.from.coords);
        } else {
          const point = bezierPoint(leg.from.coords, leg.to.coords, leg.curve ?? 0, localProgress);
          const lookAhead = bezierPoint(
            leg.from.coords,
            leg.to.coords,
            leg.curve ?? 0,
            Math.min(1, localProgress + 0.02)
          );
          vehicleMarkerRef.current.setLngLat(point);
          if (vehicleInnerRef.current && localProgress < 0.999) {
            const angle = bearing(point, lookAhead);
            vehicleInnerRef.current.style.transform = `rotate(${angle}deg)`;
          }
        }
      }

      if (Math.abs(clamped - lastApplied) > 0.0015) {
        lastApplied = clamped;
        setProgress(clamped);
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
    });

    return () => {
      trigger.kill();
    };
  }, [journey, legRanges]);

  return (
    <div ref={wrapperRef} style={{ height: `${heightVh}vh` }} className={`relative ${className}`}>
      <div className='sticky top-0 h-[100svh] md:h-screen w-full overflow-hidden bg-[#f6f1e6] dark:bg-[#161310]'>
        <div ref={mapContainerRef} className='absolute inset-0' />

        {tokenMissing && (
          <>
            <div className='absolute inset-0 bg-gradient-to-br from-[#f4efe4] to-[#e9e2d2] dark:from-[#1a1815] dark:to-[#141210]' />
            <div className='absolute bottom-5 right-5 sm:bottom-8 sm:right-8 max-w-[11rem] text-right pointer-events-none'>
              <span className='block text-[0.65rem] uppercase tracking-[0.18em] font-[family-name:var(--font-poppins)] font-semibold text-black/25 dark:text-white/30'>
                Journey map
              </span>
              <span className='mt-1 block text-[0.62rem] leading-snug font-[family-name:var(--font-poppins)] text-black/20 dark:text-white/25'>
                Add a Mapbox access token to enable the interactive route.
              </span>
            </div>
          </>
        )}

        {!tokenMissing && (
          <div ref={vehicleOuterRef} className='flex items-center justify-center w-8 h-8 pointer-events-none'>
            <div
              ref={vehicleInnerRef}
              className='w-7 h-7 rounded-full bg-[#faf9f6] border border-[#e8639f]/70 shadow-[0_1px_8px_rgba(0,0,0,0.18)] flex items-center justify-center text-[#7a3348]'
            >
              {vehicleMode === 'plane' ? (
                <PlaneIcon className='w-3.5 h-3.5' />
              ) : vehicleMode === 'transfer' || vehicleMode === 'train' ? (
                <TransferIcon className='w-3.5 h-3.5' />
              ) : (
                <CarIcon className='w-3.5 h-3.5' />
              )}
            </div>
          </div>
        )}

        <div className='absolute inset-0'>
          <JourneyProgressContext.Provider value={progress}>
            {children}
          </JourneyProgressContext.Provider>
        </div>
      </div>
    </div>
  );
}
