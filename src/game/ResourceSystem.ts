import { GameResources, DecisionOption } from '../types/game';

export class ResourceSystem {
  public static getInitialResources(): GameResources {
    return {
      oxygen: 85,
      water: 75,
      power: 70,
      food: 70,
      radiationSafety: 100,
      lifeSupportCondition: 65,
      waterRecoveryCondition: 60,
      solarGenerationRate: 60,
      greenhouseCondition: 75,
    };
  }

  public static clamp(value: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, value));
  }

  public static applyDecision(option: DecisionOption, current: GameResources): GameResources {
    const next = { ...current };
    (Object.keys(option.effects) as (keyof GameResources)[]).forEach((key) => {
      const delta = option.effects[key];
      if (typeof delta === 'number') {
        next[key] = this.clamp(next[key] + delta);
      }
    });
    return next;
  }

  public static tick(
    current: GameResources,
    dt: number,
    context: {
      hasOxygenLeak: boolean;
      solarCleanliness: number;
      isGreenhouseActive: boolean;
      inShelterLockdown: boolean;
    }
  ): GameResources {
    const next = { ...current };

    // Oxygen consumption (faster during Stage 1 air leak until repaired)
    const oxygenDrain = context.hasOxygenLeak ? 0.35 : 0.06;
    const oxygenGain = context.isGreenhouseActive ? 0.04 : 0;
    next.oxygen = this.clamp(next.oxygen - (oxygenDrain - oxygenGain) * dt);

    // Water consumption (gently reduced when water recovery condition is high)
    const waterDrain = next.waterRecoveryCondition >= 95 ? 0.025 : 0.05;
    next.water = this.clamp(next.water - waterDrain * dt);

    // Solar power balance based on solar panel cleanliness
    const solarRecharge = (context.solarCleanliness / 100) * 0.11;
    const powerDraw = context.inShelterLockdown ? 0.09 : 0.055;
    next.power = this.clamp(next.power + (solarRecharge - powerDraw) * dt);

    // Food supply gradual crew usage
    next.food = this.clamp(next.food - 0.025 * dt);

    // Gentle recovery of radiation safety while secured in shelter
    if (context.inShelterLockdown && next.radiationSafety < 100) {
      next.radiationSafety = this.clamp(next.radiationSafety + 0.1 * dt);
    }

    return next;
  }
}
