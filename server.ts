import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must run on port 3000.
const PORT = 3000;

app.use(express.json());

interface CachedDataset<T = unknown> {
  timestamp: number;
  data: T;
  status: 'live' | 'archived' | 'cached';
  source: string;
}

const cacheStore: Record<string, CachedDataset> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Archived NASA CCMC DONKI SEP Record (May 9, 2024 historical observation)
const ARCHIVED_NASA_DONKI_SEP = [
  {
    sepID: '2024-05-09T13:59:00-SEP-001',
    eventTime: '2024-05-09T13:59Z',
    eventDateLabel: 'May 9, 2024',
    observationStatusLabel: 'Archived NASA Observation — May 9, 2024',
    instruments: [{ displayName: 'GOES-16 / ACE EPAM' }],
    linkedEvents: [{ activityID: '2024-05-09T08:45:00-FLR-001' }],
    link: 'https://ccmc.gsfc.nasa.gov/DONKI/view/SEP/30609/-1',
    note: 'Historical Solar Energetic Particle (SEP) observation recorded during the May 9, 2024 solar storm period (Active Region AR3664).',
    source: 'Archived NASA Observation — May 9, 2024 (NASA CCMC DONKI)',
    eventType: 'Solar Energetic Particle (SEP) Event',
    solarSourceLocation: 'Active Region AR3664',
    educationalContext:
      'Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.',
  },
];

export interface OsdrStudyRecord {
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

// Verified public NASA OSDR studies (verified against osdr.nasa.gov/osdr/data/osd/meta/{480,481})
const VERIFIED_OSDR_FALLBACK: OsdrStudyRecord[] = [
  {
    studyId: 'OSD-480',
    title: 'Plant Gravity Perception (PGP) Flight Study',
    organism: 'Arabidopsis thaliana (Thale cress seedlings)',
    investigators: 'NASA Space Biology / ISS Plant Gravity Perception Team',
    summary:
      'Actual spaceflight study aboard the International Space Station observing how tiny Arabidopsis seedlings sense gravity so roots grow down and shoots grow up. (In LunaBase, radish, wheat, and tomato are fictional educational crop choices, not crops proven by this study to grow on the Moon.)',
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
      'Actual human spaceflight blood research comparing astronaut samples before and after orbit to learn how space travel affects human health.',
    category: 'crew_health',
    experimentType: 'Actual Human Spaceflight Study (Optional Crew-Health Reading)',
    sourceUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-481',
    source: 'NASA Open Science Data Repository (OSDR OSD-481)',
    flightMission: 'Human Spaceflight Research Archive',
  },
];

// Authentic NASA LRO Science Reference (strictly separated from fictional Asteria Outpost coordinates)
const NASA_LRO_SURFACE_DATA = {
  region: 'Real Lunar South Pole Reference Region',
  coordinates: '89.9°S, 0.0°E (Real Lunar South Pole Reference; Asteria Outpost is a fictional training site)',
  fictionalDisclaimer:
    'Lunar terrain science is informed by real NASA Lunar Reconnaissance Orbiter (LRO) observations. Asteria Outpost buildings, coordinates, and training exercises are fictional and are not NASA installations.',
  lroOverviewUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
  instruments: {
    lola: {
      instrument: 'LOLA (Lunar Orbiter Laser Altimeter)',
      observation: 'Elevation & Surface Slopes',
      dataProduct: 'LOLA South Pole Digital Elevation Model',
      findings:
        'Maps mountains, crater rims, and steep slopes so mission planners can find flat, safe spots for landers and habitats.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    lroc: {
      instrument: 'LROC (Lunar Reconnaissance Orbiter Camera)',
      observation: 'Polar Sunlight & Surface Photos',
      dataProduct: 'LROC South Pole Illumination Map (WAC_POLE_ILL_PCT_SOUTH_100M)',
      findings:
        'Shows that tall South Pole crater rims catch low-angle sunlight for up to 86%–92% of the summer, unlike equatorial spots with 14-day nights.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    diviner: {
      instrument: 'Diviner Lunar Radiometer Experiment',
      observation: 'Surface Temperatures',
      dataProduct: 'Diviner Polar Thermal Map',
      findings:
        'Measures extreme lunar temperatures from warm sunlit peaks (+40°C to +70°C) down to −233°C (40 K) inside permanently shadowed craters.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    lend: {
      instrument: 'LEND (Lunar Exploration Neutron Detector)',
      observation: 'Hydrogen & Potential Water-Ice Hints',
      dataProduct: 'LEND Epithermal Neutron Flux Map',
      findings:
        'Detects hydrogen signals inside permanently shadowed polar craters where ancient water ice may be trapped in freezing Moon soil.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
    crater: {
      instrument: 'CRaTER (Cosmic Ray Telescope for the Effects of Radiation)',
      observation: 'Space Radiation Research',
      dataProduct: 'CRaTER Radiation Science Observations',
      findings:
        'Measures how cosmic rays and solar particles interact with Moon rock and shielding materials to guide safe shelter research.',
      sourceUrl: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
  },
  moonTrekWMTS: {
    status: 'cached_reference' as 'verified' | 'cached_reference',
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

function formatDateYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// 1. GET /api/nasa/space-weather (NASA CCMC DONKI-API SEP endpoint)
app.get('/api/nasa/space-weather', async (_req, res) => {
  const now = Date.now();
  const cacheKey = 'donki_ccmc_sep_v2';

  if (cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return res.json({
      events: cacheStore[cacheKey].data,
      source: cacheStore[cacheKey].source,
      status: cacheStore[cacheKey].status,
      retrievedAt: new Date(cacheStore[cacheKey].timestamp).toISOString(),
    });
  }

  try {
    // Check last 30 days on official CCMC DONKI API base (ccmc.gsfc.nasa.gov/DONKI-API/get/SEP)
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const liveUrl = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=${formatDateYmd(start)}&endDate=${formatDateYmd(end)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const liveRes = await fetch(liveUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (liveRes.ok) {
      const liveJson = await liveRes.json();
      if (Array.isArray(liveJson) && liveJson.length > 0) {
        const recent = liveJson[liveJson.length - 1];
        const eventDateStr = typeof recent.eventTime === 'string' ? recent.eventTime.slice(0, 10) : 'Recent';
        const normalized = [
          {
            sepID: recent.sepID || 'CCMC-SEP-RECENT',
            eventTime: recent.eventTime || '',
            eventDateLabel: eventDateStr,
            observationStatusLabel: `NASA DONKI Observation — ${eventDateStr}`,
            instruments: recent.instruments || [],
            linkedEvents: recent.linkedEvents || [],
            link: recent.link || 'https://ccmc.gsfc.nasa.gov/DONKI/',
            note: 'Solar Energetic Particle (SEP) observation retrieved from NASA CCMC DONKI.',
            source: 'NASA CCMC DONKI API (ccmc.gsfc.nasa.gov/DONKI-API/get/SEP)',
            eventType: 'Solar Energetic Particle (SEP) Event',
            solarSourceLocation: 'Solar Particle Observation',
            educationalContext:
              'Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.',
          },
        ];
        cacheStore[cacheKey] = {
          timestamp: now,
          data: normalized,
          status: 'live',
          source: `NASA CCMC DONKI API (Observed ${eventDateStr})`,
        };
        return res.json({
          events: normalized,
          source: cacheStore[cacheKey].source,
          status: 'live',
          retrievedAt: new Date(now).toISOString(),
        });
      }
    }

    // Fetch archived May 9, 2024 historical SEP event from CCMC DONKI API
    const archController = new AbortController();
    const archTimeout = setTimeout(() => archController.abort(), 3500);
    const archRes = await fetch(
      'https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP?startDate=2024-05-01&endDate=2024-05-15',
      { signal: archController.signal }
    );
    clearTimeout(archTimeout);

    if (archRes.ok) {
      const archJson = await archRes.json();
      if (Array.isArray(archJson) && archJson.length > 0) {
        const picked = archJson[0];
        const archived = [
          {
            sepID: picked.sepID || ARCHIVED_NASA_DONKI_SEP[0].sepID,
            eventTime: picked.eventTime || ARCHIVED_NASA_DONKI_SEP[0].eventTime,
            eventDateLabel: 'May 9, 2024',
            observationStatusLabel: 'Archived NASA Observation — May 9, 2024',
            instruments: picked.instruments || ARCHIVED_NASA_DONKI_SEP[0].instruments,
            linkedEvents: picked.linkedEvents || ARCHIVED_NASA_DONKI_SEP[0].linkedEvents,
            link: picked.link || ARCHIVED_NASA_DONKI_SEP[0].link,
            note: ARCHIVED_NASA_DONKI_SEP[0].note,
            source: 'Archived NASA Observation — May 9, 2024',
            eventType: 'Solar Energetic Particle (SEP) Event',
            solarSourceLocation: 'Active Region AR3664',
            educationalContext: ARCHIVED_NASA_DONKI_SEP[0].educationalContext,
          },
        ];
        cacheStore[cacheKey] = {
          timestamp: now,
          data: archived,
          status: 'archived',
          source: 'Archived NASA Observation — May 9, 2024',
        };
        return res.json({
          events: archived,
          source: cacheStore[cacheKey].source,
          status: 'archived',
          retrievedAt: new Date(now).toISOString(),
        });
      }
    }
    throw new Error('DONKI endpoints returned empty');
  } catch {
    cacheStore[cacheKey] = {
      timestamp: now,
      data: ARCHIVED_NASA_DONKI_SEP,
      status: 'archived',
      source: 'Archived NASA Observation — May 9, 2024',
    };
    return res.json({
      events: ARCHIVED_NASA_DONKI_SEP,
      source: cacheStore[cacheKey].source,
      status: 'archived',
      retrievedAt: new Date(now).toISOString(),
    });
  }
});

// 2. GET /api/nasa/osdr (Verified NASA OSDR Studies: OSD-480, OSD-481)
app.get('/api/nasa/osdr', async (_req, res) => {
  const now = Date.now();
  const cacheKey = 'osdr_verified_studies_v2';

  if (cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return res.json({
      datasets: cacheStore[cacheKey].data,
      source: cacheStore[cacheKey].source,
      status: cacheStore[cacheKey].status,
      retrievedAt: new Date(cacheStore[cacheKey].timestamp).toISOString(),
    });
  }

  try {
    const ids = ['480', '481'];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const responses = await Promise.all(
      ids.map(async (id) => {
        const r = await fetch(`https://osdr.nasa.gov/osdr/data/osd/meta/${id}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) return null;
        return r.json();
      })
    );
    clearTimeout(timeoutId);

    const anyLive = responses.some((j) => j && j.hits > 0);
    if (anyLive) {
      const merged = VERIFIED_OSDR_FALLBACK.map((base, idx) => {
        const json = responses[idx];
        const key = base.studyId;
        const metaTitle = json?.study?.[key]?.studies?.[0]?.title;
        return {
          ...base,
          title: typeof metaTitle === 'string' && metaTitle.trim().length > 0 ? metaTitle : base.title,
        };
      });

      cacheStore[cacheKey] = {
        timestamp: now,
        data: merged,
        status: 'live',
        source: 'NASA OSDR Metadata API (osdr.nasa.gov)',
      };
      return res.json({
        datasets: merged,
        source: cacheStore[cacheKey].source,
        status: 'live',
        retrievedAt: new Date(now).toISOString(),
      });
    }
    throw new Error('OSDR metadata returned no hits');
  } catch {
    cacheStore[cacheKey] = {
      timestamp: now,
      data: VERIFIED_OSDR_FALLBACK,
      status: 'cached',
      source: 'NASA OSDR Verified Archive (OSD-480 & OSD-481)',
    };
    return res.json({
      datasets: VERIFIED_OSDR_FALLBACK,
      source: cacheStore[cacheKey].source,
      status: 'cached',
      retrievedAt: new Date(now).toISOString(),
    });
  }
});

// 3. GET /api/nasa/lunar-surface (LRO Science + Verified Moon Trek WMTS Capabilities)
app.get('/api/nasa/lunar-surface', async (_req, res) => {
  const now = Date.now();
  const cacheKey = 'lro_moontrek_surface_v2';

  if (cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return res.json({
      surfaceData: cacheStore[cacheKey].data,
      status: cacheStore[cacheKey].status,
      retrievedAt: new Date(cacheStore[cacheKey].timestamp).toISOString(),
    });
  }

  let wmtsVerified = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const r = await fetch(NASA_LRO_SURFACE_DATA.moonTrekWMTS.southPoleIlluminationWMTS, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (r.ok) {
      const xml = await r.text();
      wmtsVerified = xml.includes('WAC_POLE_ILL_PCT_SOUTH_100M');
    }
  } catch {
    wmtsVerified = false;
  }

  const payload = {
    ...NASA_LRO_SURFACE_DATA,
    moonTrekWMTS: {
      ...NASA_LRO_SURFACE_DATA.moonTrekWMTS,
      status: wmtsVerified ? ('verified' as const) : ('cached_reference' as const),
    },
  };

  cacheStore[cacheKey] = {
    timestamp: now,
    data: payload,
    status: wmtsVerified ? 'live' : 'cached',
    source: 'NASA LRO Science & JPL Moon Trek WMTS',
  };

  return res.json({
    surfaceData: payload,
    status: wmtsVerified ? 'live_wmts_verified' : 'cached_reference',
    retrievedAt: new Date(now).toISOString(),
  });
});

// 4. GET /api/nasa/status (Consolidated Verification Endpoint)
app.get('/api/nasa/status', (_req, res) => {
  res.json({
    donki: {
      name: 'NASA CCMC DONKI Space Weather Service',
      endpoint: '/api/nasa/space-weather',
      officialApi: 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/SEP',
      docsUrl: 'https://ccmc.gsfc.nasa.gov/DONKI/api/',
      status: cacheStore['donki_ccmc_sep_v2']?.status || 'ready',
    },
    osdr: {
      name: 'NASA Open Science Data Repository (OSDR)',
      endpoint: '/api/nasa/osdr',
      officialApi: 'https://osdr.nasa.gov/osdr/data/osd/meta/480',
      verifiedStudies: ['OSD-480', 'OSD-481'],
      status: cacheStore['osdr_verified_studies_v2']?.status || 'ready',
    },
    moonTrek: {
      name: 'NASA LRO Science & JPL Moon Trek WMTS',
      endpoint: '/api/nasa/lunar-surface',
      lroInfo: 'https://science.nasa.gov/mission/lro/science-and-data/',
      wmtsCapabilities: NASA_LRO_SURFACE_DATA.moonTrekWMTS.southPoleIlluminationWMTS,
      instrumentsAttributed: ['LOLA', 'LROC', 'Diviner', 'LEND', 'CRaTER'],
      status: cacheStore['lro_moontrek_surface_v2']?.status || 'ready',
    },
    checkedAt: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LunaBase Server running on port ${PORT} [${isProd ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
