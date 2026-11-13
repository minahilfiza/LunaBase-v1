import { MissionObjective, MissionDecision } from '../types/game';

export interface ShiftStory {
  shiftNumber: number;
  actTitle: string;
  subtitle: string;
  introDialogue: {
    speaker: 'nia' | 'leo' | 'player';
    text: string;
  };
  objectives: MissionObjective[];
  decision?: MissionDecision;
  scienceTakeaway: string;
}

export const MISSION_SHIFTS: ShiftStory[] = [
  // STAGE 1: Arrive at the Moon Base
  {
    shiftNumber: 1,
    actTitle: 'Stage 1: Arrive at the Moon Base',
    subtitle: 'Check Lander, Habitat & Fix Air Leak',
    introDialogue: {
      speaker: 'nia',
      text: 'Welcome to Asteria Outpost! First, inspect the Spaceship Lander, check the Central Habitat airlock, and repair the oxygen pipe at Life Support.',
    },
    objectives: [
      {
        id: 's1_lander',
        shift: 1,
        title: 'Inspect Spaceship Lander',
        description: 'Confirm your spacecraft landed safely on the pad.',
        targetEquipment: 'lander',
        targetPosition: [-24, 0, -22],
        hint: 'Walk northwest to the tall Spaceship Lander and press E (or Enter).',
        scienceTopicId: 'real_nasa_missions',
        taskIcon: 'rocket',
      },
      {
        id: 's1_habitat',
        shift: 1,
        title: 'Check Central Habitat',
        description: 'Inspect the airlock entrance at the center of Asteria Outpost.',
        targetEquipment: 'habitat',
        targetPosition: [0, 0, 0],
        hint: 'Walk to the Central Habitat dome in the middle of the base and press E (or Enter).',
        scienceTopicId: 'air_life_support',
        taskIcon: 'home',
      },
      {
        id: 's1_life_support',
        shift: 1,
        title: 'Fix Oxygen Air Leak',
        description: 'Open the Life-Support System controls and choose a repair plan.',
        targetEquipment: 'life_support',
        targetPosition: [12, 0, -8],
        hint: 'Walk east to the blue Life-Support tanks and press E (or Enter) to repair the air leak.',
        scienceTopicId: 'air_life_support',
        taskIcon: 'wind',
      },
    ],
    decision: {
      id: 's1_air_decision',
      shift: 1,
      title: 'Life-Support Air System Alert',
      situation: 'A valve gasket on the Life-Support System is loose, letting cabin air slowly escape.',
      speaker: 'nia',
      dialogue: 'Nia (Life-support Engineer): Choose Plan A, B, or C to handle the oxygen valve leak.',
      options: [
        {
          id: 'repair_life_support',
          label: 'A. Repair the air system now.',
          simpleExplanation: 'Bolts in a new gasket seal and restarts the oxygen generator right away.',
          expectedConsequence: 'Cost: -4% Power · Result: +14% Oxygen, +35% Life Support',
          educationalFeedback:
            'Strong choice! Fixing the seal stops the air leak right away and helps keep cabin oxygen steady.',
          effects: {
            oxygen: 14,
            lifeSupportCondition: 35,
            power: -4,
          },
          isSafe: true,
          scoreImpact: 15,
        },
        {
          id: 'patch_tape',
          label: 'B. Use backup mode to save power.',
          simpleExplanation: 'Switches to low-power backup valves without replacing the worn gasket.',
          expectedConsequence: 'Cost: 0% Power · Result: +5% Oxygen, +12% Life Support',
          educationalFeedback:
            'Backup mode saves a little power, though a full repair gives much safer long-term air pressure.',
          effects: {
            oxygen: 5,
            lifeSupportCondition: 12,
          },
          isSafe: false,
          scoreImpact: 7,
        },
        {
          id: 'ignore_leak',
          label: 'C. Delay the repair and monitor the system.',
          simpleExplanation: 'Waits and watches sensors while the slow air leak keeps draining oxygen.',
          expectedConsequence: 'Cost: 0% Power · Result: -6% Oxygen (leak stays active)',
          educationalFeedback:
            'Careful! Air leaks do not fix themselves in a space habitat—prompt repairs keep the air supply healthy.',
          effects: {
            oxygen: -6,
          },
          isSafe: false,
          scoreImpact: 0,
        },
      ],
    },
    scienceTakeaway:
      'There is no breathable air outside on the Moon. Habitats use electricity to split water into breathable oxygen gas.',
  },

  // STAGE 2: Clean and Align Solar Panels
  {
    shiftNumber: 2,
    actTitle: 'Stage 2: Clean and Align Solar Panels',
    subtitle: 'Clear Moon Dust & Check Batteries',
    introDialogue: {
      speaker: 'nia',
      text: 'Lunar dust is blocking sunlight on our Solar Panels! Clean the panels, then check the Battery Station.',
    },
    objectives: [
      {
        id: 's2_solar',
        shift: 2,
        title: 'Clean Dust Off Solar Panels',
        description: 'Wipe Moon dust off the solar array so sunlight powers the base.',
        targetEquipment: 'solar_array',
        targetPosition: [-22, 0, 18],
        hint: 'Walk southwest to the Solar Panels and press E (or Enter).',
        scienceTopicId: 'solar_power',
        taskIcon: 'battery',
      },
      {
        id: 's2_power',
        shift: 2,
        title: 'Check Battery Station',
        description: 'Verify the backup battery banks are recharging from clean solar panels.',
        targetEquipment: 'power_station',
        targetPosition: [-14, 0, 8],
        hint: 'Walk to the nearby Battery Station and press E (or Enter) to check power storage.',
        scienceTopicId: 'solar_power',
        taskIcon: 'battery',
      },
    ],
    scienceTakeaway:
      'Tall solar panels near the Lunar South Pole catch low-angle summer sunlight, while batteries cover passing shadows.',
  },

  // STAGE 3: Restore Clean Water
  {
    shiftNumber: 3,
    actTitle: 'Stage 3: Restore Clean Water',
    subtitle: 'Run the Water Recovery Steps in Order',
    introDialogue: {
      speaker: 'nia',
      text: 'Visit the Water Recovery Station and run all 5 clean-water steps in the right order!',
    },
    objectives: [
      {
        id: 's3_water',
        shift: 3,
        title: 'Restore Clean Water',
        description: 'Follow all 5 training steps from collecting used water to checking clean water quality.',
        targetEquipment: 'water_recovery',
        targetPosition: [8, 0, -18],
        hint: 'Walk northeast to the Water Recovery Station and press E (or Enter).',
        scienceTopicId: 'water_recycling',
        taskIcon: 'droplet',
      },
    ],
    scienceTakeaway:
      'NASA’s International Space Station Water Recovery System uses separate urine-processing and water-processing units with multifiltration and catalytic treatment to recycle about 98% of station water.',
  },

  // STAGE 4: Plant the First Seeds
  {
    shiftNumber: 4,
    actTitle: 'Stage 4: Plant the First Seeds',
    subtitle: 'Pick & Plant Crop Seeds in the Greenhouse',
    introDialogue: {
      speaker: 'leo',
      text: 'Welcome to Stage 4! Visit the Plant Greenhouse to choose seeds and plant your first tray.',
    },
    objectives: [
      {
        id: 's4_plant',
        shift: 4,
        title: 'Plant the First Seeds',
        description: 'Visit the Plant Greenhouse and plant a tray of simulated space seeds.',
        targetEquipment: 'greenhouse',
        targetPosition: [18, 0, 14],
        hint: 'Walk southeast to the glass Plant Greenhouse dome and press E (or Enter).',
        scienceTopicId: 'growing_plants',
        taskIcon: 'leaf',
      },
    ],
    scienceTakeaway:
      'NASA OSDR study OSD-480 studied how Arabidopsis seedlings sense gravity aboard the ISS. The crop choices in LunaBase are fictional training examples.',
  },

  // STAGE 5: Care for Growing Plants
  {
    shiftNumber: 5,
    actTitle: 'Stage 5: Care for Growing Plants',
    subtitle: 'Water & Light Sprouts Until Ready',
    introDialogue: {
      speaker: 'leo',
      text: 'Your seeds are planted! Adjust the grow lights and water your plants in the Greenhouse so they sprout and grow.',
    },
    objectives: [
      {
        id: 's5_grow',
        shift: 5,
        title: 'Care for Growing Plants',
        description: 'Water and light your Greenhouse crops until they sprout and mature.',
        targetEquipment: 'greenhouse',
        targetPosition: [18, 0, 14],
        hint: 'Open the Plant Greenhouse and care for your seedlings until they grow.',
        scienceTopicId: 'growing_plants',
        taskIcon: 'leaf',
      },
    ],
    scienceTakeaway:
      'Plants need balanced water and grow lights in spaceflight experiments like NASA OSDR OSD-480.',
  },

  // STAGE 6: Complete the Solar Storm Safety Drill
  {
    shiftNumber: 6,
    actTitle: 'Stage 6: Complete the Solar Storm Safety Drill',
    subtitle: 'Practice Crew Safety Inside the Radiation Shelter',
    introDialogue: {
      speaker: 'nia',
      text: 'Safety drill time! Head to the Radiation Shelter bunker and pick Plan A, B, or C for the crew.',
    },
    objectives: [
      {
        id: 's6_shelter',
        shift: 6,
        title: 'Complete the Solar Storm Safety Drill',
        description: 'Open the Radiation Shelter controls and pick Plan A, B, or C.',
        targetEquipment: 'radiation_shelter',
        targetPosition: [-8, 0, -20],
        hint: 'Walk north to the buried Radiation Shelter vault and press E (or Enter).',
        scienceTopicId: 'radiation_protection',
        taskIcon: 'shield',
      },
    ],
    decision: {
      id: 's6_storm_decision',
      shift: 6,
      title: 'Solar Storm Safety Drill (A / B / C)',
      situation:
        'Simulated Training Alert: A solar particle alert has been triggered for this crew safety exercise.',
      speaker: 'nia',
      dialogue: 'Nia (Life-support Engineer): Pick the safest plan for our crew during the drill.',
      options: [
        {
          id: 'enter_shelter',
          label: 'A. Move Crew Inside Storm Shelter & Seal Hatch',
          simpleExplanation: 'Brings every astronaut under thick lunar soil cover and seals the blast hatch.',
          expectedConsequence: 'Cost: -8% Power · Result: +10% Shelter Protection',
          educationalFeedback:
            'Safest choice! Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.',
          effects: {
            power: -8,
            radiationSafety: 10,
          },
          isSafe: true,
          scoreImpact: 15,
        },
        {
          id: 'stay_habitat',
          label: 'B. Wait in Central Habitat Without Entering Vault',
          simpleExplanation: 'Keeps the crew indoors under the thinner surface dome.',
          expectedConsequence: 'Cost: -4% Power · Result: -12% Shelter Protection',
          educationalFeedback:
            'Staying indoors helps a little, though thin walls provide less shielding than the buried storm shelter.',
          effects: {
            power: -4,
            radiationSafety: -12,
          },
          isSafe: false,
          scoreImpact: 7,
        },
        {
          id: 'continue_eva',
          label: 'C. Keep Working Outside in Spacesuits',
          simpleExplanation: 'Ignores the safety drill and keeps astronauts outside on the open surface.',
          expectedConsequence: 'Cost: 0% Power · Result: -35% Shelter Protection',
          educationalFeedback:
            'Unsafe choice! Spacesuits hold breathable air, not thick radiation shielding—crews move into shelter during solar particle storms.',
          effects: {
            radiationSafety: -35,
          },
          isSafe: false,
          scoreImpact: 0,
        },
      ],
    },
    scienceTakeaway:
      'Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists study historical events like May 9, 2024 using NASA CCMC DONKI.',
  },

  // STAGE 7: Send Signal & Find the Missing Spaceship
  {
    shiftNumber: 7,
    actTitle: 'Stage 7: Signal Earth & Find Missing Spaceship',
    subtitle: 'Send Signal & Locate Lost Craft',
    introDialogue: {
      speaker: 'leo',
      text: 'Final stage! Head to the Communication Station to send a signal to Earth, then follow the beacon coordinates to find the Missing Spaceship!',
    },
    objectives: [
      {
        id: 's7_antenna',
        shift: 7,
        title: 'Send Signal to Earth',
        description: 'Open the Communication Station, align the dish, and transmit a signal to lock onto the lost craft.',
        targetEquipment: 'antenna',
        targetPosition: [22, 0, -18],
        hint: 'Walk northeast to the Communication Station dish and press E (or Enter).',
        scienceTopicId: 'real_nasa_missions',
        taskIcon: 'antenna',
      },
      {
        id: 's7_missing_spaceship',
        shift: 7,
        title: 'Find the Missing Spaceship',
        description: 'Walk southeast past the Greenhouse to locate the Missing Spaceship using the beacon from Earth.',
        targetEquipment: 'missing_spaceship',
        targetPosition: [32, 0, 26],
        hint: 'Walk southeast past the Greenhouse toward the glowing beacon to inspect the Missing Spaceship, then press E (or Enter).',
        scienceTopicId: 'real_nasa_missions',
        taskIcon: 'rocket',
      },
    ],
    scienceTakeaway:
      'Radio signals travel across the 384,400 km gap between the Moon and Earth in about 1.28 seconds each way, helping Earth Control guide crews to lost equipment.',
  },
];

export const MISSION_CHAPTERS = MISSION_SHIFTS;
export const ALL_MISSION_OBJECTIVES = MISSION_SHIFTS.flatMap((s) => s.objectives);
