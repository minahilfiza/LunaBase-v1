/**
 * NASA Data Service for LunaBase
 * Handles client-side fetching and honest live/archived attribution for:
 * 1. NASA CCMC DONKI (https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP)
 * 2. NASA OSDR (OSD-480, OSD-481)
 * 3. NASA LRO & JPL Moon Trek WMTS
 */

export interface DonkiSepEvent {
  sepID: string;
  eventTime: string;
  eventDateLabel?: string;
  observationStatusLabel?: string;
  instruments: Array<{ displayName: string }>;
  linkedEvents: Array<{ activityID: string }>;
  link: string;
  note: string;
  source: string;
  eventType: string;
  solarSourceLocation: string;
  educationalContext: string;
}

export interface OsdrStudy {
  studyId: string;
  title: string;
  organism: string;
  investigators: string;
  summary: string;
  category: 'plant_biology' | 'crew_health';
  experimentType:
    | 'Actual Spaceflight Experiment (ISS Flight Program)'
    | 'Actual Human Spaceflight Study (Optional Crew-Health Reading)';
  sourceUrl: string;
  source: string;
  flightMission?: string;
}

export interface LroInstrumentInfo {
  instrument: string;
  observation: string;
  dataProduct: string;
  findings: string;
  sourceUrl: string;
}

export interface MoonTrekWmtsInfo {
  status: 'verified' | 'cached_reference';
  service: string;
  apiDocsUrl: string;
  southPoleIlluminationWMTS: string;
  globalMosaicWMTS: string;
  verifiedSampleTile: string;
  corsSupported: boolean;
  attribution: string;
}

export interface LunarSurfaceData {
  region: string;
  coordinates: string;
  fictionalDisclaimer: string;
  lroOverviewUrl: string;
  instruments: {
    lola: LroInstrumentInfo;
    lroc: LroInstrumentInfo;
    diviner: LroInstrumentInfo;
    lend: LroInstrumentInfo;
    crater: LroInstrumentInfo;
  };
  moonTrekWMTS: MoonTrekWmtsInfo;
}

export const FALLBACK_DONKI_SEP: DonkiSepEvent = {
  sepID: '2024-05-09T13:59:00-SEP-001',
  eventTime: '2024-05-09T13:59Z',
  eventDateLabel: 'May 9, 2024',
  observationStatusLabel: 'Archived NASA Observation — May 9, 2024',
  instruments: [{ displayName: 'GOES-16 / ACE EPAM' }],
  linkedEvents: [{ activityID: '2024-05-09T08:45:00-FLR-001' }],
  link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30609/-1',
  note: 'Historical Solar Energetic Particle (SEP) observation recorded during the May 9, 2024 solar storm period.',
  source: 'Archived NASA Observation — May 9, 2024',
  eventType: 'Solar Energetic Particle (SEP) Event',
  solarSourceLocation: 'Active Region AR3664',
  educationalContext:
    'Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.',
};

export const FALLBACK_OSDR_STUDIES: OsdrStudy[] = [
  {
    studyId: 'OSD-480',
    title: 'Plant Gravity Perception (PGP) Flight Study',
    organism: 'Arabidopsis thaliana (Thale cress seedlings)',
    investigators: 'NASA Space Biology / ISS Plant Gravity Perception Team',
    summary:
      'Actual spaceflight study aboard the International Space Station observing how Arabidopsis seedlings sense gravity. (Radish, wheat, and tomato choices in LunaBase are fictional educational crop options, not crops proven by this study to grow on the Moon.)',
    category: 'plant_biology',
    experimentType: 'Actual Spaceflight Experiment (ISS Flight Program)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-480',
    source: 'NASA Open Science Data Repository (OSDR OSD-480)',
    flightMission: 'International Space Station Spaceflight Study',
  },
  {
    studyId: 'OSD-481',
    title: 'New insights into the role of lncRNA after spaceflight',
    organism: 'Homo sapiens (Human peripheral blood research)',
    investigators: 'NASA OSDR Spaceflight Crew Health Researchers',
    summary:
      'Optional crew-health study comparing human blood samples before and after spaceflight to understand how astronaut bodies adapt in orbit.',
    category: 'crew_health',
    experimentType: 'Actual Human Spaceflight Study (Optional Crew-Health Reading)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-481',
    source: 'NASA Open Science Data Repository (OSDR OSD-481)',
    flightMission: 'Human Spaceflight Research Archive',
  },
];

export const FALLBACK_LUNAR_SURFACE: LunarSurfaceData = {
  region: 'Real Lunar South Pole Reference Region',
  coordinates: '89.9°S, 0.0°E (Real Lunar South Pole Reference; Asteria Outpost is a fictional training site)',
  fictionalDisclaimer:
    'Lunar terrain science is informed by real NASA Lunar Reconnaissance Orbiter (LRO) observations. Asteria Outpost buildings, coordinates, and crew tasks are fictional training simulations.',
  lroOverviewUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
  instruments: {
    lola: {
      instrument: 'LOLA (Lunar Orbiter Laser Altimeter)',
      observation: 'Elevation & Surface Slopes',
      dataProduct: 'LOLA South Pole Digital Elevation Model',
      findings: 'Maps heights and slopes so engineers can choose flatter, safer places to land and build habitats.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    lroc: {
      instrument: 'LROC (Lunar Reconnaissance Orbiter Camera)',
      observation: 'Polar Sunlight & Surface Photos',
      dataProduct: 'LROC South Pole Illumination Map',
      findings: 'Shows sunlit South Pole crater rims receive up to 86%–92% summer sunlight for solar power.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    diviner: {
      instrument: 'Diviner Lunar Radiometer Experiment',
      observation: 'Surface Temperatures',
      dataProduct: 'Diviner Polar Thermal Map',
      findings: 'Measures sunlit ridges (+40°C to +70°C) beside −233°C (40 K) permanently shadowed crater floors.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    lend: {
      instrument: 'LEND (Lunar Exploration Neutron Detector)',
      observation: 'Hydrogen & Potential Water-Ice Hints',
      dataProduct: 'LEND Epithermal Neutron Flux Map',
      findings: 'Detects hydrogen inside freezing polar shadows where water ice may be trapped in lunar soil.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    crater: {
      instrument: 'CRaTER (Cosmic Ray Telescope for the Effects of Radiation)',
      observation: 'Space Radiation Research',
      dataProduct: 'CRaTER Radiation Observations',
      findings: 'Studies how cosmic rays and solar particles interact with lunar rock and shielding materials.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
  },
  moonTrekWMTS: {
    status: 'cached_reference',
    service: 'NASA JPL Moon Trek OGC WMTS',
    apiDocsUrl: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=moon',
    southPoleIlluminationWMTS:
      'https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/WMTSCapabilities.xml',
    globalMosaicWMTS:
      'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml',
    verifiedSampleTile:
      'https://trek.nasa.gov/tiles/Moon/SP/WAC_POLE_ILL_PCT_SOUTH_100M/1.0.0/default/default028mm/0/0/0.png',
    corsSupported: true,
    attribution: 'NASA / JPL-Caltech / USGS / ASU / GSFC Moon Trek',
  },
};

export class NasaDataService {
  public static async getSpaceWeatherDonki(): Promise<{
    event: DonkiSepEvent;
    status: 'live' | 'archived' | 'cached';
  }> {
    try {
      const res = await fetch('/api/nasa/space-weather');
      if (res.ok) {
        const json = await res.json();
        const event = json.events && json.events[0] ? json.events[0] : FALLBACK_DONKI_SEP;
        const status: 'live' | 'archived' | 'cached' =
          json.status === 'live' ? 'live' : 'archived';
        return { event, status };
      }
    } catch {
      // Fallback safely
    }
    return { event: FALLBACK_DONKI_SEP, status: 'archived' };
  }

  public static async getOsdrStudies(): Promise<{
    datasets: OsdrStudy[];
    status: 'live' | 'cached';
  }> {
    try {
      const res = await fetch('/api/nasa/osdr');
      if (res.ok) {
        const json = await res.json();
        return {
          datasets: json.datasets || FALLBACK_OSDR_STUDIES,
          status: json.status === 'live' ? 'live' : 'cached',
        };
      }
    } catch {
      // Fallback safely
    }
    return { datasets: FALLBACK_OSDR_STUDIES, status: 'cached' };
  }

  public static async getLunarSurfaceData(): Promise<LunarSurfaceData> {
    try {
      const res = await fetch('/api/nasa/lunar-surface');
      if (res.ok) {
        const json = await res.json();
        return json.surfaceData || FALLBACK_LUNAR_SURFACE;
      }
    } catch {
      // Fallback safely
    }
    return FALLBACK_LUNAR_SURFACE;
  }
}
