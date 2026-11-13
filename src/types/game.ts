export type ScreenType = 'welcome' | 'briefing' | 'game' | 'results' | 'science' | 'how_to_play' | 'settings';

export type CrewId = 'player' | 'nia' | 'leo' | 'alex' | 'maya' | 'robo' | 'nova';

export interface CrewMember {
  id: CrewId;
  name: string;
  role: string;
  bio: string;
  greeting: string;
  speechPitch: number;
  speechRate: number;
  color: string;
}

export interface GameResources {
  oxygen: number; // 0 - 100
  water: number; // 0 - 100
  power: number; // 0 - 100
  food: number; // 0 - 100
  radiationSafety: number; // 0 - 100
  lifeSupportCondition: number; // 0 - 100
  waterRecoveryCondition: number; // 0 - 100
  solarGenerationRate: number; // 0 - 100
  greenhouseCondition: number; // 0 - 100
}

export type EquipmentId =
  | 'lander'
  | 'habitat'
  | 'life_support'
  | 'power_station'
  | 'solar_array'
  | 'greenhouse'
  | 'water_recovery'
  | 'radiation_shelter'
  | 'antenna'
  | 'rover'
  | 'missing_spaceship';

export type TaskIconType =
  | 'rocket'
  | 'wind'
  | 'battery'
  | 'droplet'
  | 'leaf'
  | 'shield'
  | 'antenna'
  | 'home';

export interface EquipmentItem {
  id: EquipmentId;
  name: string;
  category: 'life_support' | 'power' | 'research' | 'safety' | 'transport';
  position: [number, number, number];
  interactionRadius: number;
  status: 'nominal' | 'warning' | 'critical' | 'offline' | 'active';
  description: string;
  promptText: string;
  condition: number;
}

export interface MissionObjective {
  id: string;
  shift: number;
  title: string;
  description: string;
  targetEquipment: EquipmentId;
  targetPosition: [number, number, number];
  hint: string;
  scienceTopicId?: string;
  taskIcon?: TaskIconType;
}

export interface DecisionOption {
  id: string;
  label: string;
  simpleExplanation?: string;
  expectedConsequence?: string;
  educationalFeedback: string;
  effects: Partial<GameResources>;
  isSafe?: boolean;
  scoreImpact: number;
}

export interface MissionDecision {
  id: string;
  shift: number;
  title: string;
  situation: string;
  speaker: CrewId;
  dialogue: string;
  options: DecisionOption[];
}

export type PlantStage = 'none' | 'seed' | 'germination' | 'sprout' | 'growing' | 'harvest_ready' | 'harvested';

export interface PlantExperiment {
  seedType: 'radish' | 'wheat' | 'tomato' | null;
  stage: PlantStage;
  waterLevel: number; // 0 - 100
  lightLevel: number; // 0 - 100
  health: number; // 0 - 100
  growthProgress: number; // 0 - 100
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  earnedAt?: string;
}

export interface ScoreBreakdown {
  crewSafety: number; // max 30
  resourceEfficiency: number; // max 25
  missionCompletion: number; // max 20
  engineeringTasks: number; // max 15
  scientificUnderstanding: number; // max 10
  total: number; // exact sum of the 5 categories (max 100)
  completionPercent: number; // 0 - 100 based on objectives finished
  stars: 1 | 2 | 3;
  status: 'Successful' | 'Partially successful' | 'Unsuccessful';
}

export interface GameState {
  currentScreen: ScreenType;
  currentShift: number; // 1 to 7 (8 when completed)
  currentObjectiveIndex: number; // index within currentShift objectives
  resources: GameResources;
  decisionsMade: Record<number, string>; // shiftNumber -> optionId
  plant: PlantExperiment;
  achievements: GameAchievement[];
  isPaused: boolean;
  solarCleanliness: number; // 0 - 100
  waterFilterSequence: number[]; // order of activated filters
  waterFilterSolved: boolean;
  antennaConnected: boolean;
  commSignalState: 'idle' | 'sending' | 'waiting' | 'received';
  commSignalProgress: number;
  shelterLockedDown: boolean;
  harvestCompleted: boolean;
  astronautPos: [number, number, number];
  astronautRot: number;
  scoreBreakdown: ScoreBreakdown;
  hasSavedGame: boolean;
}
