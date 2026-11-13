import { GameState } from '../types/game';
import { ResourceSystem } from './ResourceSystem';

export const SAVE_STORAGE_KEY = 'lunabase_junior_astronaut_save_v1';

export class SaveSystem {
  public static hasSavedGame(): boolean {
    try {
      const dataStr = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!dataStr) return false;
      const parsed = JSON.parse(dataStr);
      return Boolean(parsed && typeof parsed.currentShift === 'number' && parsed.resources);
    } catch {
      return false;
    }
  }

  public static save(state: GameState): void {
    try {
      const serializable = {
        currentShift: state.currentShift,
        currentObjectiveIndex: state.currentObjectiveIndex,
        resources: state.resources,
        decisionsMade: state.decisionsMade,
        plant: state.plant,
        achievements: state.achievements,
        solarCleanliness: state.solarCleanliness,
        waterFilterSequence: state.waterFilterSequence,
        waterFilterSolved: state.waterFilterSolved,
        antennaConnected: state.antennaConnected,
        shelterLockedDown: state.shelterLockedDown,
        harvestCompleted: state.harvestCompleted,
        astronautPos: state.astronautPos,
        astronautRot: state.astronautRot,
        scoreBreakdown: state.scoreBreakdown,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(serializable));
    } catch (err) {
      console.warn('Failed to save game to localStorage:', err);
    }
  }

  public static load(): Partial<GameState> | null {
    try {
      const dataStr = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!dataStr) return null;
      const parsed = JSON.parse(dataStr);
      if (!parsed || typeof parsed.currentShift !== 'number') return null;

      const fallbackRes = ResourceSystem.getInitialResources();
      return {
        currentShift: Math.max(1, Math.min(8, parsed.currentShift)),
        currentObjectiveIndex: Math.max(0, parsed.currentObjectiveIndex || 0),
        resources: { ...fallbackRes, ...(parsed.resources || {}) },
        decisionsMade: parsed.decisionsMade || {},
        plant: parsed.plant || {
          seedType: null,
          stage: 'none',
          waterLevel: 50,
          lightLevel: 80,
          health: 100,
          growthProgress: 0,
        },
        achievements: parsed.achievements,
        solarCleanliness: typeof parsed.solarCleanliness === 'number' ? parsed.solarCleanliness : 60,
        waterFilterSequence: Array.isArray(parsed.waterFilterSequence) ? parsed.waterFilterSequence : [],
        waterFilterSolved: Boolean(parsed.waterFilterSolved),
        antennaConnected: Boolean(parsed.antennaConnected),
        shelterLockedDown: Boolean(parsed.shelterLockedDown),
        harvestCompleted: Boolean(parsed.harvestCompleted),
        astronautPos: parsed.astronautPos || [0, 0, 7.5],
        astronautRot: typeof parsed.astronautRot === 'number' ? parsed.astronautRot : 0,
        scoreBreakdown: parsed.scoreBreakdown,
      };
    } catch (err) {
      console.warn('Failed to load game from localStorage:', err);
      return null;
    }
  }

  public static clear(): void {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
      localStorage.removeItem('lunabase_junior_astronaut_save_v2');
    } catch (err) {
      console.warn('Failed to clear localStorage:', err);
    }
  }
}
