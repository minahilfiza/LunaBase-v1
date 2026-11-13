import { GameState, ScoreBreakdown, GameAchievement } from '../types/game';
import { MISSION_SHIFTS } from '../data/missions';

export const INITIAL_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'habitat_explorer',
    title: 'Outpost Arrival',
    description: 'Inspected the Spaceship Lander and checked Central Habitat in Stage 1.',
    icon: '🚀',
    unlocked: false,
  },
  {
    id: 'life_support_specialist',
    title: 'Air System Fixer',
    description: 'Repaired the oxygen valve seal right away in Stage 1.',
    icon: '💨',
    unlocked: false,
  },
  {
    id: 'power_engineer',
    title: 'Solar & Battery Helper',
    description: 'Cleaned all Moon dust off the Solar Panels and checked Battery Station.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'water_recycler',
    title: 'Clean Water Engineer',
    description: 'Completed all 5 water recovery steps in the right order.',
    icon: '💧',
    unlocked: false,
  },
  {
    id: 'greenhouse_gardener',
    title: 'Greenhouse Grower',
    description: 'Planted seeds and helped crops sprout inside the Greenhouse.',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'safety_commander',
    title: 'Storm Drill Leader',
    description: 'Moved the crew inside the Radiation Shelter during Stage 6.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'earth_communicator',
    title: 'Beacon & Spaceship Finder',
    description: 'Sent the Earth radio signal and located the Missing Spaceship in Stage 7.',
    icon: '📡',
    unlocked: false,
  },
  {
    id: 'junior_specialist',
    title: 'Mission Finisher',
    description: 'Completed all 7 training stages of LunaBase: First Light.',
    icon: '🎖️',
    unlocked: false,
  },
];

export class ScoringSystem {
  public static getCompletionStats(state: GameState): {
    completedTasks: number;
    totalTasks: number;
    completionPercent: number;
  } {
    const totalTasks = MISSION_SHIFTS.reduce((acc, s) => acc + s.objectives.length, 0);
    const completedTasks = MISSION_SHIFTS.reduce((acc, s) => {
      if (s.shiftNumber < state.currentShift) return acc + s.objectives.length;
      if (s.shiftNumber === state.currentShift) return acc + state.currentObjectiveIndex;
      return acc;
    }, 0);
    const completionPercent = Math.min(
      100,
      Math.max(0, Math.round((completedTasks / Math.max(1, totalTasks)) * 100))
    );
    return { completedTasks, totalTasks, completionPercent };
  }

  public static calculateScore(state: GameState): ScoreBreakdown {
    // 1. Crew Safety (max 30)
    let crewSafety = 0;
    if (state.resources.oxygen > 50) crewSafety += 10;
    else if (state.resources.oxygen > 25) crewSafety += 5;

    if (state.resources.radiationSafety >= 85) crewSafety += 10;
    else if (state.resources.radiationSafety >= 60) crewSafety += 5;

    if (state.decisionsMade[6] === 'enter_shelter') crewSafety += 10;
    else if (state.decisionsMade[6] === 'stay_habitat') crewSafety += 5;
    crewSafety = Math.min(30, crewSafety);

    // 2. Resource Efficiency (max 25)
    const avgRes =
      (state.resources.oxygen +
        state.resources.water +
        state.resources.power +
        state.resources.food) /
      4;
    const resourceEfficiency = Math.min(25, Math.max(0, Math.round((avgRes / 100) * 25)));

    // 3. Mission Completion (max 20)
    const { completionPercent } = this.getCompletionStats(state);
    const missionCompletion = Math.min(20, Math.round((completionPercent / 100) * 20));

    // 4. Engineering Tasks (max 15)
    let engineeringTasks = 0;
    if (state.decisionsMade[1] === 'repair_life_support') engineeringTasks += 5;
    if (state.solarCleanliness >= 100) engineeringTasks += 5;
    if (state.waterFilterSolved) engineeringTasks += 5;
    engineeringTasks = Math.min(15, engineeringTasks);

    // 5. Scientific Understanding (max 10)
    let scientificUnderstanding = 0;
    if (
      state.plant.stage === 'sprout' ||
      state.plant.stage === 'growing' ||
      state.plant.stage === 'harvest_ready' ||
      state.plant.stage === 'harvested'
    ) {
      scientificUnderstanding += 4;
    } else if (state.plant.seedType) {
      scientificUnderstanding += 2;
    }
    if (state.harvestCompleted || state.plant.stage === 'harvested') {
      scientificUnderstanding += 3;
    }
    if (state.antennaConnected) {
      scientificUnderstanding += 3;
    }
    scientificUnderstanding = Math.min(10, scientificUnderstanding);

    // Authoritative sum: displayed categories ALWAYS equal total
    const total =
      crewSafety +
      resourceEfficiency +
      missionCompletion +
      engineeringTasks +
      scientificUnderstanding;

    let stars: 1 | 2 | 3 = 1;
    let status: 'Successful' | 'Partially successful' | 'Unsuccessful' = 'Partially successful';

    if (total >= 80 && state.currentShift > 7) {
      stars = 3;
      status = 'Successful';
    } else if (total >= 50 || state.currentShift >= 4) {
      stars = 2;
      status = 'Partially successful';
    } else {
      stars = 1;
      status = 'Unsuccessful';
    }

    return {
      crewSafety,
      resourceEfficiency,
      missionCompletion,
      engineeringTasks,
      scientificUnderstanding,
      total,
      completionPercent,
      stars,
      status,
    };
  }

  public static checkNewAchievements(state: GameState): GameAchievement[] {
    const updated = state.achievements.map((a) => ({ ...a }));
    const unlock = (id: string) => {
      const item = updated.find((a) => a.id === id);
      if (item && !item.unlocked) {
        item.unlocked = true;
        item.earnedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    };

    if (state.currentShift > 1 || state.currentObjectiveIndex >= 2) unlock('habitat_explorer');
    if (state.decisionsMade[1] === 'repair_life_support') unlock('life_support_specialist');
    if (state.solarCleanliness >= 100 && state.currentShift >= 3) unlock('power_engineer');
    if (state.waterFilterSolved) unlock('water_recycler');
    if (
      state.plant.stage === 'sprout' ||
      state.plant.stage === 'growing' ||
      state.plant.stage === 'harvest_ready' ||
      state.plant.stage === 'harvested' ||
      state.harvestCompleted
    ) {
      unlock('greenhouse_gardener');
    }
    if (state.decisionsMade[6] === 'enter_shelter') unlock('safety_commander');
    if (state.antennaConnected && state.currentShift > 7) unlock('earth_communicator');
    if (state.currentShift > 7) unlock('junior_specialist');

    return updated;
  }
}
