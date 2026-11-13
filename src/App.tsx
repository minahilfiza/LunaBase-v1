import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ThreeEngine, InteractionTarget } from './game/ThreeEngine';
import { GameState, DecisionOption, PlantExperiment, EquipmentId, MissionDecision } from './types/game';
import { ResourceSystem } from './game/ResourceSystem';
import { ScoringSystem, INITIAL_ACHIEVEMENTS } from './game/ScoringSystem';
import { SaveSystem } from './game/SaveSystem';
import { narrationSystem } from './game/NarrationSystem';
import { audioSystem } from './game/AudioSystem';
import { MISSION_SHIFTS } from './data/missions';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MissionBriefingScreen } from './components/MissionBriefingScreen';
import { MissionResultsScreen } from './components/MissionResultsScreen';
import { GameHUD } from './components/GameHUD';
import { DecisionModal } from './components/DecisionModal';
import { SolarCleaningModal } from './components/SolarCleaningModal';
import { WaterFiltrationModal } from './components/WaterFiltrationModal';
import { GreenhouseModal } from './components/GreenhouseModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { MapModal } from './components/MapModal';
import { ScienceLibraryModal } from './components/ScienceLibraryModal';
import { EarthCommsModal } from './components/EarthCommsModal';
import { MissionHistoryModal } from './components/MissionHistoryModal';
import { PauseModal } from './components/PauseModal';

const EQUIPMENT_SHIFT_MAP: Record<EquipmentId, number> = {
  lander: 1,
  habitat: 1,
  life_support: 1,
  solar_array: 2,
  power_station: 2,
  water_recovery: 3,
  greenhouse: 4,
  radiation_shelter: 6,
  antenna: 7,
  missing_spaceship: 7,
  rover: 0,
};

function createFreshGameState(
  screen: 'welcome' | 'briefing' | 'game' = 'welcome',
  hasSaved = SaveSystem.hasSavedGame()
): GameState {
  const initialRes = ResourceSystem.getInitialResources();
  const base: GameState = {
    currentScreen: screen,
    currentShift: 1,
    currentObjectiveIndex: 0,
    resources: initialRes,
    decisionsMade: {},
    plant: {
      seedType: null,
      stage: 'none',
      waterLevel: 50,
      lightLevel: 80,
      health: 100,
      growthProgress: 0,
    },
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
    isPaused: false,
    solarCleanliness: 60,
    waterFilterSequence: [],
    waterFilterSolved: false,
    antennaConnected: false,
    commSignalState: 'idle',
    commSignalProgress: 0,
    shelterLockedDown: false,
    harvestCompleted: false,
    astronautPos: [0, 0, 7.5],
    astronautRot: 0,
    scoreBreakdown: {
      crewSafety: 20,
      resourceEfficiency: 18,
      missionCompletion: 0,
      engineeringTasks: 0,
      scientificUnderstanding: 0,
      total: 38,
      completionPercent: 0,
      stars: 1,
      status: 'Partially successful',
    },
    hasSavedGame: hasSaved,
  };
  base.scoreBreakdown = ScoringSystem.calculateScore(base);
  return base;
}

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = SaveSystem.load();
    const fresh = createFreshGameState('welcome', SaveSystem.hasSavedGame());
    if (!saved) return fresh;
    const merged: GameState = {
      ...fresh,
      ...saved,
      currentScreen: 'welcome',
      isPaused: false,
      hasSavedGame: SaveSystem.hasSavedGame(),
    };
    merged.scoreBreakdown = ScoringSystem.calculateScore(merged);
    merged.achievements = ScoringSystem.checkNewAchievements(merged);
    return merged;
  });

  const [activeModal, setActiveModal] = useState<
    | null
    | 'decision'
    | 'solar_cleaning'
    | 'water_filtration'
    | 'greenhouse'
    | 'how_to_play'
    | 'settings'
    | 'map'
    | 'science'
    | 'earth_comms'
    | 'history'
  >(null);
  const [activeDecision, setActiveDecision] = useState<MissionDecision | null>(null);

  const [nearestTarget, setNearestTarget] = useState<InteractionTarget | null>(null);
  const [boundaryWarning, setBoundaryWarning] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    sensitivity: 1.0,
    invertY: false,
    distance: 7.5,
  });

  // Initialize 3D Engine once
  useEffect(() => {
    if (!canvasContainerRef.current || engineRef.current) return;

    const engine = new ThreeEngine(canvasContainerRef.current);
    engineRef.current = engine;

    engine.onProximityChange = (target) => {
      setNearestTarget(target);
    };
    engine.onBoundaryWarning = (nearEdge) => {
      setBoundaryWarning(nearEdge);
    };
    engine.onPauseRequested = () => {
      setGameState((prev) => (prev.currentScreen === 'game' ? { ...prev, isPaused: true } : prev));
    };

    setCameraSettings(engine.getCameraSettings());

    if (gameState.plant.stage !== 'none') {
      engine.greenhouse.setPlantStage(gameState.plant.stage, gameState.plant.seedType);
    }
    engine.solarArray.setDustCleanliness(gameState.solarCleanliness);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync camera mode
  useEffect(() => {
    if (!engineRef.current) return;
    if (gameState.currentScreen === 'game') {
      engineRef.current.setMode('gameplay');
      audioSystem.startAmbience();
    } else {
      engineRef.current.setMode('cinematic');
      setBoundaryWarning(false);
    }
  }, [gameState.currentScreen]);

  // Freeze astronaut & unlock pointer while modals or pause are open
  useEffect(() => {
    const locked = Boolean(activeModal) || gameState.isPaused || gameState.currentScreen !== 'game';
    engineRef.current?.setInteracting(locked);
  }, [activeModal, gameState.isPaused, gameState.currentScreen]);

  // Pulse Missing Spaceship distress beacon once Stage 7 signal reveals its coordinates
  useEffect(() => {
    const isBeaconTarget =
      gameState.currentShift === 7 && gameState.currentObjectiveIndex === 1;
    engineRef.current?.setMissingSpaceshipBeaconActive(isBeaconTarget);
  }, [gameState.currentShift, gameState.currentObjectiveIndex]);

  const openModal = useCallback(
    (
      modal:
        | 'decision'
        | 'solar_cleaning'
        | 'water_filtration'
        | 'greenhouse'
        | 'how_to_play'
        | 'settings'
        | 'map'
        | 'science'
        | 'earth_comms'
        | 'history',
      decisionSnapshot?: MissionDecision | null
    ) => {
      if (modal === 'decision' && !decisionSnapshot) return;
      engineRef.current?.setInteracting(true);
      if (modal === 'decision' && decisionSnapshot) {
        setActiveDecision(decisionSnapshot);
      }
      setActiveModal(modal);
    },
    []
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setActiveDecision(null);
    if (gameState.currentScreen === 'game' && !gameState.isPaused) {
      engineRef.current?.resumeFromModal(false);
    }
  }, [gameState.currentScreen, gameState.isPaused]);

  // Continuous 1-second simulation tick during active gameplay
  // Ends mission automatically to certificate if oxygen <= 15% (no refill option!)
  useEffect(() => {
    if (gameState.currentScreen !== 'game' || gameState.isPaused || activeModal) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.currentScreen !== 'game' || prev.isPaused) return prev;
        const hasOxygenLeak = prev.currentShift >= 1 && prev.decisionsMade[1] !== 'repair_life_support';
        const isGreenhouseActive =
          prev.plant.stage === 'growing' ||
          prev.plant.stage === 'harvest_ready' ||
          prev.plant.stage === 'harvested';

        const updatedRes = ResourceSystem.tick(prev.resources, 1.0, {
          hasOxygenLeak,
          solarCleanliness: prev.solarCleanliness,
          isGreenhouseActive,
          inShelterLockdown: prev.shelterLockedDown,
        });

        // Low oxygen threshold (<= 15%): immediately end game and show certificate
        if (updatedRes.oxygen <= 15) {
          audioSystem.playLowOxygenBeep();
          narrationSystem.speak(
            'nia',
            'Oxygen reserves dropped to 15 percent. Ending mission to view your Training Completion Award.',
            'Nia'
          );
          const ended: GameState = {
            ...prev,
            resources: updatedRes,
            currentScreen: 'results',
            isPaused: false,
          };
          ended.scoreBreakdown = ScoringSystem.calculateScore(ended);
          ended.achievements = ScoringSystem.checkNewAchievements(ended);
          SaveSystem.save(ended);
          return ended;
        }

        const nextState: GameState = {
          ...prev,
          resources: updatedRes,
        };
        nextState.scoreBreakdown = ScoringSystem.calculateScore(nextState);
        nextState.achievements = ScoringSystem.checkNewAchievements(nextState);
        return nextState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.currentScreen, gameState.isPaused, activeModal]);

  // Auto-save on shift/objective progress
  useEffect(() => {
    if (gameState.currentScreen === 'game') {
      SaveSystem.save(gameState);
    }
  }, [
    gameState.currentScreen,
    gameState.currentShift,
    gameState.currentObjectiveIndex,
    gameState.decisionsMade,
    gameState.solarCleanliness,
    gameState.waterFilterSolved,
    gameState.plant.stage,
    gameState.harvestCompleted,
    gameState.shelterLockedDown,
    gameState.antennaConnected,
  ]);

  const currentShiftData =
    MISSION_SHIFTS.find((s) => s.shiftNumber === gameState.currentShift) || MISSION_SHIFTS[0];
  const currentObjective =
    gameState.currentShift <= 7
      ? currentShiftData.objectives[gameState.currentObjectiveIndex] || null
      : null;

  const completeCurrentObjective = useCallback(() => {
    setGameState((prev) => {
      const shiftData = MISSION_SHIFTS.find((s) => s.shiftNumber === prev.currentShift);
      if (!shiftData) return prev;

      const nextObjIndex = prev.currentObjectiveIndex + 1;
      let nextShift = prev.currentShift;
      let finalObjIndex = nextObjIndex;

      if (nextObjIndex >= shiftData.objectives.length) {
        nextShift = prev.currentShift + 1;
        finalObjIndex = 0;

        if (nextShift <= 7) {
          const nextStory = MISSION_SHIFTS.find((s) => s.shiftNumber === nextShift);
          if (nextStory) {
            setTimeout(() => {
              narrationSystem.speak(nextStory.introDialogue.speaker, nextStory.introDialogue.text);
            }, 350);
          }
        }
      }

      const nextScreen = nextShift > 7 ? 'results' : prev.currentScreen;
      const updated: GameState = {
        ...prev,
        currentShift: nextShift,
        currentObjectiveIndex: finalObjIndex,
        currentScreen: nextScreen,
        hasSavedGame: true,
      };
      updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
      updated.achievements = ScoringSystem.checkNewAchievements(updated);
      SaveSystem.save(updated);
      return updated;
    });
  }, []);

  const resetEntireMission = useCallback((targetScreen: 'welcome' | 'briefing' | 'game') => {
    SaveSystem.clear();
    const fresh = createFreshGameState(targetScreen, false);
    setActiveModal(null);
    setActiveDecision(null);
    setGameState(fresh);
    engineRef.current?.solarArray.setDustCleanliness(60);
    engineRef.current?.greenhouse.setPlantStage('none', null);
    engineRef.current?.teleportAstronautTo([0, 0, 7.5]);
  }, []);

  const syncAstronautPosition = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return [0, 0, 7.5] as [number, number, number];
    const pos: [number, number, number] = [
      engine.astronautPos.x,
      engine.astronautPos.y,
      engine.astronautPos.z,
    ];
    setGameState((prev) => ({ ...prev, astronautPos: pos }));
    return pos;
  }, []);

  const handleUpdateCameraSettings = useCallback(
    (next: { sensitivity?: number; invertY?: boolean; distance?: number; reset?: boolean }) => {
      const engine = engineRef.current;
      if (next.reset) {
        engine?.resetCamera();
        if (engine) setCameraSettings(engine.getCameraSettings());
        return;
      }
      if (typeof next.sensitivity === 'number') engine?.setCameraSensitivity(next.sensitivity);
      if (typeof next.invertY === 'boolean') engine?.setInvertY(next.invertY);
      if (typeof next.distance === 'number') engine?.setCameraDistance(next.distance);
      if (engine) {
        setCameraSettings(engine.getCameraSettings());
      } else {
        setCameraSettings((prev) => ({
          sensitivity: next.sensitivity ?? prev.sensitivity,
          invertY: next.invertY ?? prev.invertY,
          distance: next.distance ?? prev.distance,
        }));
      }
    },
    []
  );

  // Station interaction router (single-visit tasks, no repeat habitat returns)
  const handleInteract = useCallback(() => {
    if (!nearestTarget) return;
    const eqId = nearestTarget.equipmentId;

    if (eqId === 'rover') {
      audioSystem.playAirlock();
      engineRef.current?.triggerWave();
      narrationSystem.speak('leo', 'Rover systems look awesome! All 6 wheels are ready for lunar dust.', 'Leo');
      return;
    }

    if (eqId === 'lander') {
      engineRef.current?.triggerRocketLanding();
      audioSystem.playThruster();
      narrationSystem.speak('nia', 'Spaceship Lander hull and landing legs checked out great!', 'Nia');
      if (gameState.currentShift === 1 && gameState.currentObjectiveIndex === 0) {
        completeCurrentObjective();
      }
      return;
    }

    if (eqId === 'habitat') {
      audioSystem.playAirlock();
      if (gameState.currentShift === 1 && gameState.currentObjectiveIndex === 1) {
        narrationSystem.speak('nia', 'Airlock is sealed! Next, walk east to Life Support to fix the oxygen leak.', 'Nia');
        completeCurrentObjective();
      } else {
        narrationSystem.speak('nia', 'Central Habitat airlock and pressure are steady and safe.', 'Nia');
      }
      return;
    }

    if (eqId === 'life_support') {
      audioSystem.playAirlock();
      if (gameState.currentShift === 1 && gameState.currentObjectiveIndex < 2) {
        audioSystem.playWarning();
        const nextStepMsg =
          gameState.currentObjectiveIndex === 0
            ? 'Inspect the Spaceship Lander first, then check the Central Habitat before fixing Life Support.'
            : 'Check the Central Habitat airlock first, then come back here to seal the oxygen leak.';
        narrationSystem.speak('nia', nextStepMsg, 'Nia');
      } else if (gameState.currentShift === 1 && gameState.currentObjectiveIndex === 2) {
        if (!gameState.decisionsMade[1]) {
          openModal('decision', currentShiftData.decision ?? null);
        } else {
          completeCurrentObjective();
        }
      } else {
        narrationSystem.speak('nia', 'Life-Support oxygen maker is running smoothly.', 'Nia');
      }
      return;
    }

    if (eqId === 'solar_array') {
      openModal('solar_cleaning');
      return;
    }

    if (eqId === 'power_station') {
      audioSystem.playClick();
      if (gameState.currentShift === 2 && gameState.currentObjectiveIndex === 1) {
        if (gameState.solarCleanliness < 100) {
          audioSystem.playWarning();
          narrationSystem.speak('nia', 'Clean the Solar Panels first so the batteries can recharge.', 'Nia');
          return;
        }
        audioSystem.playSuccess();
        setGameState((prev) => ({
          ...prev,
          resources: { ...prev.resources, power: ResourceSystem.clamp(prev.resources.power + 12) },
        }));
        completeCurrentObjective();
      } else {
        narrationSystem.speak('nia', 'Battery bank storage looks healthy.', 'Nia');
      }
      return;
    }

    if (eqId === 'water_recovery') {
      openModal('water_filtration');
      return;
    }

    if (eqId === 'greenhouse') {
      openModal('greenhouse');
      return;
    }

    if (eqId === 'radiation_shelter') {
      if (gameState.currentShift === 6 && !gameState.decisionsMade[6]) {
        openModal('decision', currentShiftData.decision ?? null);
      } else if (gameState.currentShift < EQUIPMENT_SHIFT_MAP.radiation_shelter) {
        audioSystem.playWarning();
        narrationSystem.speak('nia', 'Storm shelter drill unlocks in Stage 6. Follow your current task first!', 'Nia');
      } else {
        narrationSystem.speak('nia', 'Storm shelter blast hatch is tested and secure.', 'Nia');
      }
      return;
    }

    if (eqId === 'antenna') {
      audioSystem.playPing();
      openModal('earth_comms');
      return;
    }

    if (eqId === 'missing_spaceship') {
      if (gameState.currentShift === 7 && gameState.currentObjectiveIndex === 1) {
        audioSystem.playSuccess();
        engineRef.current?.triggerWave();
        narrationSystem.speak(
          'leo',
          'Missing Spaceship found and secured! Mission complete — opening your Training Completion Award!',
          'Leo'
        );
        completeCurrentObjective();
      } else if (gameState.currentShift === 7 && gameState.currentObjectiveIndex === 0) {
        audioSystem.playWarning();
        narrationSystem.speak(
          'nia',
          'Send a signal at the Communication Station first so Earth Control can lock onto the Missing Spaceship!',
          'Nia'
        );
      } else {
        audioSystem.playWarning();
        narrationSystem.speak(
          'nia',
          'An emergency craft is out here, but finish your active stage tasks first before investigating!',
          'Nia'
        );
      }
    }
  }, [
    nearestTarget,
    gameState.currentShift,
    gameState.currentObjectiveIndex,
    gameState.decisionsMade,
    gameState.solarCleanliness,
    currentShiftData.decision,
    completeCurrentObjective,
    openModal,
  ]);

  // Global keyboard shortcuts (E/Enter interact, Esc close/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'Escape') {
        if (activeModal) {
          audioSystem.playClick();
          closeModal();
          return;
        }
        if (gameState.currentScreen === 'game') {
          audioSystem.playClick();
          setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
        }
        return;
      }

      if (
        (e.key === 'Enter' || e.key.toLowerCase() === 'e') &&
        !activeModal &&
        !gameState.isPaused &&
        gameState.currentScreen === 'game'
      ) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        handleInteract();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, gameState.isPaused, gameState.currentScreen, handleInteract, closeModal]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* SCREEN 1: Welcome Screen */}
      {gameState.currentScreen === 'welcome' && (
        <WelcomeScreen
          hasSavedGame={gameState.hasSavedGame}
          onStartMission={() => resetEntireMission('briefing')}
          onContinueMission={() => {
            const saved = SaveSystem.load();
            if (saved) {
              const restored: GameState = {
                ...createFreshGameState('game', true),
                ...saved,
                currentScreen: 'game',
                isPaused: false,
                hasSavedGame: true,
              };
              restored.scoreBreakdown = ScoringSystem.calculateScore(restored);
              restored.achievements = ScoringSystem.checkNewAchievements(restored);
              setGameState(restored);
              engineRef.current?.solarArray.setDustCleanliness(restored.solarCleanliness);
              engineRef.current?.greenhouse.setPlantStage(restored.plant.stage, restored.plant.seedType);
              engineRef.current?.teleportAstronautTo(restored.astronautPos);
            } else {
              setGameState((prev) => ({ ...prev, currentScreen: 'game', isPaused: false }));
            }
          }}
          onOpenHowToPlay={() => openModal('how_to_play')}
          onOpenSettings={() => openModal('settings')}
        />
      )}

      {/* SCREEN 2: Mission Briefing */}
      {gameState.currentScreen === 'briefing' && (
        <MissionBriefingScreen
          onStartShift1={() => {
            setGameState((prev) => ({ ...prev, currentScreen: 'game', isPaused: false }));
            engineRef.current?.resumeFromModal(false);
          }}
          onBackToWelcome={() => {
            setGameState((prev) => ({ ...prev, currentScreen: 'welcome' }));
          }}
        />
      )}

      {/* SCREEN 3: Active 3D Gameplay HUD (Bottom Dock Removed; Settings Top-Right) */}
      {gameState.currentScreen === 'game' && (
        <GameHUD
          state={gameState}
          currentObjective={currentObjective}
          nearestTarget={nearestTarget}
          boundaryWarning={boundaryWarning}
          onInteract={handleInteract}
          onTogglePause={() => setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
          onOpenSettings={() => openModal('settings')}
          onJoystickMove={(vx, vy) => engineRef.current?.setJoystickVector(vx, vy)}
        />
      )}

      {/* PAUSE OVERLAY */}
      {gameState.currentScreen === 'game' && gameState.isPaused && !activeModal && (
        <PauseModal
          currentShift={gameState.currentShift}
          onResume={() => {
            setGameState((prev) => ({ ...prev, isPaused: false }));
            engineRef.current?.resumeFromModal(true);
          }}
          onOpenMap={() => {
            syncAstronautPosition();
            openModal('map');
          }}
          onOpenScience={() => openModal('science')}
          onOpenHistory={() => openModal('history')}
          onOpenSettings={() => openModal('settings')}
          onOpenHowToPlay={() => openModal('how_to_play')}
          onEndMission={() => {
            const pos = syncAstronautPosition();
            setGameState((prev) => {
              const ended: GameState = {
                ...prev,
                astronautPos: pos,
                currentScreen: 'results',
                isPaused: false,
                hasSavedGame: true,
              };
              ended.scoreBreakdown = ScoringSystem.calculateScore(ended);
              ended.achievements = ScoringSystem.checkNewAchievements(ended);
              SaveSystem.save(ended);
              return ended;
            });
          }}
          onExitToTitle={() => {
            const pos = syncAstronautPosition();
            setGameState((prev) => {
              const savedState: GameState = {
                ...prev,
                astronautPos: pos,
                currentScreen: 'welcome',
                isPaused: false,
                hasSavedGame: true,
              };
              SaveSystem.save(savedState);
              return savedState;
            });
          }}
        />
      )}

      {/* SCREEN 4: Mission Results & Training Completion Award */}
      {gameState.currentScreen === 'results' && (
        <MissionResultsScreen
          state={gameState}
          onPlayAgain={() => resetEntireMission('game')}
          onReturnHome={() =>
            setGameState((prev) => ({
              ...prev,
              currentScreen: 'welcome',
              isPaused: false,
              hasSavedGame: SaveSystem.hasSavedGame(),
            }))
          }
        />
      )}

      {/* ACTIVE MODALS */}

      {activeModal === 'decision' && activeDecision && (
        <DecisionModal
          decision={activeDecision}
          currentResources={gameState.resources}
          onConfirmDecision={(option: DecisionOption) => {
            engineRef.current?.triggerRepair();
            setGameState((prev) => {
              const nextRes = ResourceSystem.applyDecision(option, prev.resources);
              const nextDecisions = { ...prev.decisionsMade, [prev.currentShift]: option.id };
              const nextShelter =
                prev.currentShift === 6 ? option.id === 'enter_shelter' : prev.shelterLockedDown;
              const updated: GameState = {
                ...prev,
                resources: nextRes,
                decisionsMade: nextDecisions,
                shelterLockedDown: nextShelter,
              };
              updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
              updated.achievements = ScoringSystem.checkNewAchievements(updated);
              return updated;
            });
            if (
              (gameState.currentShift === 1 && gameState.currentObjectiveIndex === 2) ||
              (gameState.currentShift === 6 && gameState.currentObjectiveIndex === 0)
            ) {
              completeCurrentObjective();
            }
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'solar_cleaning' && (
        <SolarCleaningModal
          currentCleanliness={gameState.solarCleanliness}
          onCleanUpdate={(cleanliness) => {
            setGameState((prev) => ({
              ...prev,
              solarCleanliness: cleanliness,
              resources: {
                ...prev.resources,
                solarGenerationRate: Math.max(prev.resources.solarGenerationRate, cleanliness),
              },
            }));
            engineRef.current?.solarArray.setDustCleanliness(cleanliness);
          }}
          onComplete={() => {
            engineRef.current?.triggerRepair();
            engineRef.current?.solarArray.setDustCleanliness(100);
            setGameState((prev) => {
              const updated: GameState = {
                ...prev,
                solarCleanliness: 100,
                resources: { ...prev.resources, solarGenerationRate: 100 },
              };
              updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
              updated.achievements = ScoringSystem.checkNewAchievements(updated);
              return updated;
            });
            if (gameState.currentShift === 2 && gameState.currentObjectiveIndex <= 1) {
              completeCurrentObjective();
            }
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'water_filtration' && (
        <WaterFiltrationModal
          onComplete={() => {
            engineRef.current?.triggerRepair();
            setGameState((prev) => {
              const updated: GameState = {
                ...prev,
                waterFilterSequence: [1, 2, 3, 4, 5],
                waterFilterSolved: true,
                resources: {
                  ...prev.resources,
                  water: ResourceSystem.clamp(prev.resources.water + 15),
                  waterRecoveryCondition: 100,
                },
              };
              updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
              updated.achievements = ScoringSystem.checkNewAchievements(updated);
              return updated;
            });
            if (gameState.currentShift === 3) {
              completeCurrentObjective();
            }
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'greenhouse' && (
        <GreenhouseModal
          plant={gameState.plant}
          onUpdatePlant={(newPlant: PlantExperiment, resourceDelta) => {
            engineRef.current?.greenhouse.setPlantStage(newPlant.stage, newPlant.seedType);
            setGameState((prev) => {
              const updated: GameState = {
                ...prev,
                plant: newPlant,
                resources: {
                  ...prev.resources,
                  water: ResourceSystem.clamp(prev.resources.water + (resourceDelta?.water ?? 0)),
                  power: ResourceSystem.clamp(prev.resources.power + (resourceDelta?.power ?? 0)),
                },
              };
              updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
              updated.achievements = ScoringSystem.checkNewAchievements(updated);
              return updated;
            });
            if (gameState.currentShift === 4 && (newPlant.stage === 'seed' || newPlant.seedType !== null)) {
              completeCurrentObjective();
            } else if (
              gameState.currentShift === 5 &&
              (newPlant.stage === 'sprout' || newPlant.stage === 'growing' || newPlant.stage === 'harvest_ready')
            ) {
              completeCurrentObjective();
            }
          }}
          onHarvest={() => {
            engineRef.current?.greenhouse.setPlantStage('harvested', gameState.plant.seedType);
            setGameState((prev) => {
              const updated: GameState = {
                ...prev,
                harvestCompleted: true,
                plant: { ...prev.plant, stage: 'harvested', growthProgress: 100 },
                resources: {
                  ...prev.resources,
                  food: ResourceSystem.clamp(prev.resources.food + 25),
                  oxygen: ResourceSystem.clamp(prev.resources.oxygen + 5),
                },
              };
              updated.scoreBreakdown = ScoringSystem.calculateScore(updated);
              updated.achievements = ScoringSystem.checkNewAchievements(updated);
              return updated;
            });
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'map' && (
        <MapModal
          astronautPos={gameState.astronautPos}
          currentObjective={currentObjective}
          currentShift={gameState.currentShift}
          solarCleanliness={gameState.solarCleanliness}
          waterFilterSolved={gameState.waterFilterSolved}
          shelterLockedDown={gameState.shelterLockedDown}
          onClose={closeModal}
        />
      )}

      {activeModal === 'science' && <ScienceLibraryModal onClose={closeModal} />}

      {activeModal === 'earth_comms' && (
        <EarthCommsModal
          antennaConnected={gameState.antennaConnected}
          currentShift={gameState.currentShift}
          onTransmitFinalReport={() => {
            setGameState((prev) => ({ ...prev, antennaConnected: true }));
            if (gameState.currentShift === 7 && gameState.currentObjectiveIndex === 0) {
              completeCurrentObjective();
              setTimeout(() => {
                narrationSystem.speak(
                  'leo',
                  'Signal locked! Walk southeast past the Greenhouse to find the Missing Spaceship!',
                  'Leo'
                );
              }, 350);
            }
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'history' && (
        <MissionHistoryModal
          currentShift={gameState.currentShift}
          currentObjectiveIndex={gameState.currentObjectiveIndex}
          onClose={closeModal}
        />
      )}

      {activeModal === 'how_to_play' && <HowToPlayModal onClose={closeModal} />}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={closeModal}
          cameraSettings={cameraSettings}
          onUpdateCameraSettings={handleUpdateCameraSettings}
          onResetSave={() => resetEntireMission('welcome')}
        />
      )}
    </div>
  );
}
