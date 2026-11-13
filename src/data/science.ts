export type ScienceCategory =
  | 'air_life_support'
  | 'water_recycling'
  | 'solar_power'
  | 'growing_plants'
  | 'radiation_protection'
  | 'crew_health_osdr'
  | 'real_nasa_missions'
  | 'spaceflight_history';

export interface ScienceTopic {
  id: string;
  title: string;
  category: ScienceCategory;
  categoryLabel: string;
  briefExplanation: string;
  interestingFact: string;
  learnMoreDetails: string;
  relatedEquipment: string;
  nasaReference: {
    source: string;
    url: string;
  };
  secondaryReference?: {
    source: string;
    url: string;
  };
}

export const SCIENCE_CATEGORIES: { id: ScienceCategory; label: string }[] = [
  { id: 'air_life_support', label: 'Air & Life Support' },
  { id: 'water_recycling', label: 'Water Recovery' },
  { id: 'solar_power', label: 'Solar Power' },
  { id: 'growing_plants', label: 'Growing Plants (OSD-480)' },
  { id: 'radiation_protection', label: 'Radiation & Storms' },
  { id: 'crew_health_osdr', label: 'Crew Health (OSD-481)' },
  { id: 'real_nasa_missions', label: 'Moon Mapping (LRO)' },
  { id: 'spaceflight_history', label: 'Remembering Spaceflight History' },
];

export const SCIENCE_TOPICS: ScienceTopic[] = [
  {
    id: 'air_life_support',
    title: 'Making Fresh Air in Space',
    category: 'air_life_support',
    categoryLabel: 'Air & Life Support',
    briefExplanation:
      'There is no air outside on the Moon. Inside a space station, two systems help keep cabin air fresh: electrolysis makes oxygen from water, and the Sabatier reactor turns breathed-out carbon dioxide back into water.',
    interestingFact:
      'Electricity splits water (H2O) into breathable oxygen (O2) and hydrogen gas (H2).',
    learnMoreDetails:
      '1) Water electrolysis creates fresh oxygen for the crew to breathe. 2) The Sabatier system mixes leftover hydrogen with carbon dioxide (CO2) exhaled by astronauts to make water again, reducing how much needs to be launched from Earth.',
    relatedEquipment: 'Life-Support System',
    nasaReference: {
      source: 'NASA Environmental Control & Life Support (ECLSS)',
      url: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=7532',
    },
  },
  {
    id: 'water_recycling',
    title: 'How Space Stations Recycle Water',
    category: 'water_recycling',
    categoryLabel: 'Water Recovery',
    briefExplanation:
      'Carrying heavy water tanks on rockets is hard. Inspired by NASA’s International Space Station Water Recovery System, astronauts collect used water and clean it in stages so almost every drop is reused.',
    interestingFact:
      'NASA’s actual ISS system uses separate urine-processing and water-processing assemblies, including multifiltration beds and catalytic treatment!',
    learnMoreDetails:
      'In this training game, you practice a simplified 5-step sequence: 1) Collect used water, 2) Remove small particles, 3) Filter out dissolved impurities, 4) Run catalytic treatment for remaining contaminants, and 5) Check water quality. Note: This mini-game is a simplified educational simulation rather than an exact replica of ISS hardware.',
    relatedEquipment: 'Water Recovery Station',
    nasaReference: {
      source: 'NASA ISS Water Recovery System Overview',
      url: 'https://www.nasa.gov/centers/marshall/history/eclss.html',
    },
  },
  {
    id: 'solar_power',
    title: 'Sunlight at the Lunar South Pole',
    category: 'solar_power',
    categoryLabel: 'Solar Power',
    briefExplanation:
      'Near the Moon’s equator, nights last 14 Earth days. High rims near the Lunar South Pole receive low, sideways sunlight for up to 86%–92% of summer—making tall vertical solar panels very helpful.',
    interestingFact:
      'Sticky lunar dust can block solar glass, so wiping dust off keeps solar electricity flowing to base batteries.',
    learnMoreDetails:
      'Crater walls still cast moving shadows across the ground, which is why moon bases pair solar panels with strong backup battery banks.',
    relatedEquipment: 'Solar Panels & Battery Station',
    nasaReference: {
      source: 'NASA Lunar Reconnaissance Orbiter (LRO) Science & Data',
      url: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
  },
  {
    id: 'growing_plants',
    title: 'Space Plant Biology (NASA OSDR OSD-480)',
    category: 'growing_plants',
    categoryLabel: 'Growing Plants',
    briefExplanation:
      'In space, without Earth’s downward tug, plants still need water, light, and clues about which way roots should grow. NASA Open Science Data Repository study OSD-480 studied how Arabidopsis seedlings sense gravity aboard the International Space Station.',
    interestingFact:
      'Actual Spaceflight Study (OSD-480): Plant Gravity Perception (PGP) studied tiny Arabidopsis thaliana seedlings on the ISS.',
    learnMoreDetails:
      'Important distinction: OSD-480 is a real International Space Station experiment using Arabidopsis seedlings under different gravity levels. The radish, wheat, and tomato options inside LunaBase are fictional educational crop choices for gameplay, not crops proven by OSD-480 to grow on the Moon.',
    relatedEquipment: 'Plant Greenhouse',
    nasaReference: {
      source: 'NASA OSDR Study OSD-480 (Actual Spaceflight Experiment)',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-480',
    },
  },
  {
    id: 'radiation_protection',
    title: 'Solar Particle Storms & Moon Shelters',
    category: 'radiation_protection',
    categoryLabel: 'Radiation & Storms',
    briefExplanation:
      'Earth’s atmosphere and magnetic field shield us from fast solar particles. Because the Moon lacks that shield, astronauts watch space weather using NASA CCMC DONKI data and practice moving into sheltered areas.',
    interestingFact:
      'Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.',
    learnMoreDetails:
      'Notice the difference between real science and game drills: NASA DONKI’s May 9, 2024 Solar Energetic Particle record is an archived historical space-weather observation, while LunaBase’s Stage 6 storm alert and shelter percentage are fictional training simulations.',
    relatedEquipment: 'Radiation Shelter',
    nasaReference: {
      source: 'NASA CCMC DONKI Space Weather Portal',
      url: 'https://ccmc.gsfc.nasa.gov/DONKI/',
    },
  },
  {
    id: 'crew_health_osdr',
    title: 'Optional Reading: Crew Health in Space (OSD-481)',
    category: 'crew_health_osdr',
    categoryLabel: 'Crew Health',
    briefExplanation:
      'Living in space changes how human bodies work—from fluid shifts to muscles and immune signals. Researchers study astronaut health carefully so future crews stay strong.',
    interestingFact:
      'NASA OSDR study OSD-481 ("New insights into the role of lncRNA after spaceflight") examined human blood samples before and after orbit.',
    learnMoreDetails:
      'You do not need complex biology terms to understand the goal: scientists compare safe medical checkups before and after real spaceflights so doctors know how exercise, food, and shelters support astronauts on longer Moon journeys.',
    relatedEquipment: 'Central Habitat (Optional Science)',
    nasaReference: {
      source: 'NASA OSDR Study OSD-481',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-481',
    },
  },
  {
    id: 'real_nasa_missions',
    title: 'Real NASA Moon Mapping (LRO & Moon Trek)',
    category: 'real_nasa_missions',
    categoryLabel: 'Moon Mapping (LRO)',
    briefExplanation:
      'Asteria Outpost is a fictional training base, while NASA’s real Lunar Reconnaissance Orbiter (LRO) has been mapping the Moon’s craters, temperatures, radiation, and polar sunlight since 2009.',
    interestingFact:
      'Radio waves take about 1.28 seconds each way (2.56 seconds round trip) to travel 384,400 km between the Moon and Earth!',
    learnMoreDetails:
      'LRO carries five key instruments: LOLA (laser slopes & elevation), LROC (surface & sunlight photos), Diviner (−233°C crater shadow temperatures), LEND (neutron hydrogen hints), and CRaTER (radiation studies). NASA JPL Moon Trek shares these maps publicly.',
    relatedEquipment: 'Communication Station & Map',
    nasaReference: {
      source: 'NASA Lunar Reconnaissance Orbiter Science & Data',
      url: 'https://science.nasa.gov/mission/lro/science-and-data/',
    },
  },
  {
    id: 'spaceflight_history',
    title: 'Remembering Spaceflight History',
    category: 'spaceflight_history',
    categoryLabel: 'Remembering Spaceflight History',
    briefExplanation:
      'Space exploration has always been built on careful engineering, teamwork, and learning from past missions. NASA honors astronauts from historic Space Shuttle missions STS-51L (Challenger) and STS-107 (Columbia) and teaches future engineers why safety checks come first.',
    interestingFact:
      'Remembering Space Shuttle Challenger (STS-51L) and Space Shuttle Columbia (STS-107) reminds engineers why checking seals, heat shields, and safety rules saves lives.',
    learnMoreDetails:
      'You can read the respectful official NASA memorial pages for both missions below. These real historical resources are shared purely for education and remembrance.',
    relatedEquipment: 'Optional Educational Archive',
    nasaReference: {
      source: 'NASA History: Space Shuttle Challenger (STS-51L)',
      url: 'https://www.nasa.gov/mission/sts-51L/',
    },
    secondaryReference: {
      source: 'NASA History: Remembering Columbia (STS-107)',
      url: 'https://www.nasa.gov/remembering-columbia-sts-107/',
    },
  },
];
