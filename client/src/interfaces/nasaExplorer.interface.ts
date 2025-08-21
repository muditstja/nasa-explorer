export type EonetGeometry = {
  date: string;
  type: 'Point' | 'Polygon' | 'MultiPolygon' | string;
  coordinates: any;
};

export type EonetCategory = { id: number | string; title: string };

export type EonetEvent = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  closed?: string | null;
  categories: EonetCategory[];
  geometry: EonetGeometry[];
};

export type NasaNeoObject = {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid?: boolean;
  close_approach_data?: Array<{
    miss_distance?: { kilometers?: string };
    relative_velocity?: { kilometers_per_hour?: string };
    close_approach_date?: string;
    close_approach_date_full?: string;
  }>;
  estimated_diameter?: {
    meters?: { estimated_diameter_min?: number; estimated_diameter_max?: number };
  };
};

export type DrawableNeo = {
  id: string;
  name: string;
  hazard: boolean;
  missKm: number;
  velKmh: number;
  diamM: number;
  date: string;
  ecc: number;       // visual “ellipticity” used to vary orbits
  period: number;    // visual period (for animation)
  angle0: number;    // initial angle
  // screen-space bookkeeping (set by renderer)
  __x?: number;
  __y?: number;
  __r?: number;
};

export type Props = {
  items: DrawableNeo[];
  hazardousOnly: boolean;
  animate: boolean;
  timeOffset: number;
  onTimeOffset: (n: number) => void;
};


export type ControlProps = {
  start: string;
  end: string;
  hazardousOnly: boolean;
  animate: boolean;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onHazardousOnly: (v: boolean) => void;
  onAnimate: (v: boolean) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
};