import type { Journey, JourneyPoint } from './types';

// General home area only — Vidonci / Grad, Goricko, Prekmurje — never an
// exact address.
const HOME: JourneyPoint = {
  id: 'home',
  name: 'Goricko, Slovenia',
  coords: [16.2, 46.88],
};

const VIENNA: JourneyPoint = {
  id: 'vienna',
  name: 'Vienna',
  coords: [16.5697, 48.1103],
};

const TENERIFE_SOUTH: JourneyPoint = {
  id: 'tenerife-south',
  name: 'Tenerife South',
  coords: [-16.5725, 28.0445],
};

const ROCA_NIVARIA: JourneyPoint = {
  id: 'roca-nivaria',
  name: 'Roca Nivaria',
  sublabel: 'Playa Paraiso',
  coords: [-16.77648, 28.12059],
  showMapLabel: true,
};

// Act one: home -> Vienna -> (flight) -> Tenerife South, ending with a
// cinematic zoom from the wide Europe/Atlantic view into the island.
export const TENERIFE_ARRIVAL_JOURNEY: Journey = {
  id: 'tenerife-arrival',
  initialCamera: { center: [16.32, 47.55], zoom: 6.4 },
  legs: [
    {
      id: 'home-to-vienna',
      mode: 'car',
      from: HOME,
      to: VIENNA,
      camera: { center: [16.38, 47.49], zoom: 6.7 },
      curve: 0.14,
      weight: 0.4,
      transition: 'ease',
    },
    {
      id: 'vienna-to-tenerife',
      mode: 'plane',
      from: VIENNA,
      to: TENERIFE_SOUTH,
      camera: { center: [-2.5, 38.6], zoom: 3.1 },
      curve: -0.16,
      weight: 0.5,
      transition: 'fly',
    },
    {
      id: 'tenerife-arrival-zoom',
      mode: 'plane',
      from: TENERIFE_SOUTH,
      to: TENERIFE_SOUTH,
      camera: { center: [-16.55, 28.22], zoom: 9.1 },
      weight: 0.1,
      transition: 'fly',
      showRoute: false,
    },
  ],
};

// Act two: the airport transfer, from Tenerife South to our actual hotel in
// Playa Paraiso — the home base the later Tenerife exploration section will
// also start and end from.
export const TENERIFE_TRANSFER_JOURNEY: Journey = {
  id: 'tenerife-transfer',
  initialCamera: { center: [-16.55, 28.22], zoom: 9.1 },
  legs: [
    {
      id: 'airport-to-hotel',
      mode: 'transfer',
      from: TENERIFE_SOUTH,
      to: ROCA_NIVARIA,
      camera: { center: [-16.665, 28.083], zoom: 10.9 },
      curve: 0.2,
      weight: 1,
      transition: 'ease',
    },
  ],
};
