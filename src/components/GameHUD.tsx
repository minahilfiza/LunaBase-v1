import React, { useState, useEffect, useRef } from 'react';
import {
  Wind,
  Droplets,
  BatteryCharging,
  Apple,
  Shield,
  HelpCircle,
  Pause,
  Settings,
  AlertTriangle,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Hand,
} from 'lucide-react';
import { GameState, MissionObjective } from '../types/game';
import { InteractionTarget } from '../game/ThreeEngine';
import { SubtitleEvent, narrationSystem } from '../game/NarrationSystem';
import { audioSystem } from '../game/AudioSystem';
import { CREW_MEMBERS } from '../data/crew';
import { MISSION_SHIFTS } from '../data/missions';
import { renderTaskIcon } from './MissionHistoryModal';

interface GameHUDProps {
  state: GameState;
  currentObjective: MissionObjective | null;
  nearestTarget: InteractionTarget | null;
  boundaryWarning: boolean;
  onInteract: () => void;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onJoystickMove?: (vx: number, vy: number) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  currentObjective,
  nearestTarget,
  boundaryWarning,
  onInteract,
  onTogglePause,
  onOpenSettings,
  onJoystickMove,
}) => {
  const [subtitle, setSubtitle] = useState<SubtitleEvent | null>(null);
  const [isVoiceMuted, setIsVoiceMuted] = useState(narrationSystem.isVoiceMuted());
  const [showHint, setShowHint] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    setShowHint(false);
    setShowLearnMore(false);
  }, [currentObjective?.id]);

  useEffect(() => {
    if (state.resources.oxygen <= 15) {
      audioSystem.playLowOxygenBeep();
    }
  }, [state.resources.oxygen]);

  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickStickRef = useRef<HTMLDivElement>(null);
  const isDraggingJoystick = useRef(false);

  useEffect(() => {
    const unsub = narrationSystem.subscribeSubtitles((ev) => {
      setSubtitle(ev);
    });
    return unsub;
  }, []);

  const handleMuteToggle = () => {
    const next = !isVoiceMuted;
    setIsVoiceMuted(next);
    narrationSystem.setMuted(next);
    audioSystem.playClick();
  };

  const handleReplayDialogue = () => {
    audioSystem.playClick();
    narrationSystem.replay();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingJoystick.current = true;
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingJoystick.current || !joystickBaseRef.current || !joystickStickRef.current) return;
    const touch = e.touches[0];
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const maxDist = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }

    joystickStickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    onJoystickMove?.(dx / maxDist, dy / maxDist);
  };

  const handleTouchEnd = () => {
    isDraggingJoystick.current = false;
    if (joystickStickRef.current) {
      joystickStickRef.current.style.transform = 'translate(0px, 0px)';
    }
    onJoystickMove?.(0, 0);
  };

  const displayShiftNum = Math.min(7, state.currentShift);
  const currentShiftStory =
    MISSION_SHIFTS.find((s) => s.shiftNumber === displayShiftNum) || MISSION_SHIFTS[0];

  const getBarColor = (value: number, type: 'normal' | 'shield') => {
    if (value <= 20) return 'bg-red-500';
    if (value <= 45) return 'bg-amber-400';
    return type === 'shield' ? 'bg-purple-500' : 'bg-emerald-400';
  };

  // Clean 5-resource display with active stage shown on top
  const resourceRows = [
    {
      id: 'oxygen',
      label: 'Oxygen',
      value: Math.round(state.resources.oxygen),
      icon: <Wind className="w-4 h-4 text-cyan-400 shrink-0" />,
      barColor: getBarColor(state.resources.oxygen, 'normal'),
    },
    {
      id: 'water',
      label: 'Water',
      value: Math.round(state.resources.water),
      icon: <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />,
      barColor: getBarColor(state.resources.water, 'normal'),
    },
    {
      id: 'power',
      label: 'Battery / Power',
      value: Math.round(state.resources.power),
      icon: <BatteryCharging className="w-4 h-4 text-amber-400 shrink-0" />,
      barColor: getBarColor(state.resources.power, 'normal'),
    },
    {
      id: 'food',
      label: 'Food',
      value: Math.round(state.resources.food),
      icon: <Apple className="w-4 h-4 text-emerald-400 shrink-0" />,
      barColor: getBarColor(state.resources.food, 'normal'),
    },
    {
      id: 'shelter',
      label: 'Shelter Protection',
      value: Math.round(state.resources.radiationSafety),
      icon: <Shield className="w-4 h-4 text-purple-400 shrink-0" />,
      barColor: getBarColor(state.resources.radiationSafety, 'shield'),
    },
  ];

  const speaker = subtitle ? CREW_MEMBERS[subtitle.speaker] || CREW_MEMBERS.nia : null;

  return (
    <>
      {state.resources.oxygen <= 15 && (
        <div className="absolute inset-0 pointer-events-none z-10 border-4 border-red-500/80 shadow-[inset_0_0_90px_rgba(239,68,68,0.4)]" />
      )}

      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 select-none">
        {/* TOP ROW */}
        <div className="flex items-start justify-between w-full gap-4">
          {/* LEFT COLUMN: Active Stage Header + Clean 5-Resource Bars (Single Box) */}
          <div className="pointer-events-auto w-60 shrink-0">
            <section className="rounded-xl bg-slate-950/85 border border-slate-700/70 p-3.5 backdrop-blur-md shadow-xl flex flex-col gap-2.5">
              <div className="pb-2 border-b border-slate-800/90 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-cyan-300 truncate">
                  {currentShiftStory.actTitle}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400 shrink-0 tabular-nums">
                  {displayShiftNum}/7
                </span>
              </div>

              {resourceRows.map((res) => (
                <div key={res.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {res.icon}
                      <span className="font-semibold text-slate-100 truncate">{res.label}</span>
                    </div>
                    <span className="font-mono text-xs font-bold tabular-nums text-slate-200 shrink-0">
                      {res.value}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800/90 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${res.barColor}`}
                      style={{ width: `${Math.max(0, Math.min(100, res.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* CENTER TOP ALERT */}
          <div className="flex-1 flex flex-col items-center gap-2 pointer-events-none">
            {boundaryWarning && (
              <div className="pointer-events-auto px-4 py-2.5 rounded-xl bg-amber-950/90 border border-amber-400/70 text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-xl backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>You&apos;ve reached the edge of the safe training zone. Return toward the outpost.</span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TOP-RIGHT SETTINGS ICON + PAUSE + COMPACT TASK PANEL */}
          <div className="pointer-events-auto flex flex-col items-end gap-2.5 w-64 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  audioSystem.playClick();
                  onTogglePause();
                }}
                aria-label="Pause Mission"
                className="px-3 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition backdrop-blur-md cursor-pointer"
                title="Pause (Esc)"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>

              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  audioSystem.playClick();
                  onOpenSettings();
                }}
                aria-label="Settings"
                className="p-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-cyan-300 transition backdrop-blur-md cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {currentObjective && (
              <section className="w-full rounded-xl bg-slate-950/85 border border-slate-700/70 p-3.5 backdrop-blur-md shadow-xl flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      {renderTaskIcon(currentObjective.taskIcon)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-sm font-bold text-white leading-tight truncate">
                        {currentObjective.title}
                      </h2>
                      <span className="text-[11px] font-medium text-cyan-300">
                        Stage {displayShiftNum} Task
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      audioSystem.playClick();
                      setShowHint(!showHint);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                      showHint
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hint</span>
                  </button>
                </div>

                {showHint && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/50 text-xs text-slate-100 flex items-start justify-between gap-2 leading-relaxed">
                    <span>{currentObjective.hint}</span>
                    <button
                      onClick={(e) => {
                        e.currentTarget.blur();
                        audioSystem.playClick();
                        setShowHint(false);
                      }}
                      aria-label="Close Hint"
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {/* BOTTOM STACK (NO DOCK MENU DURING GAMEPLAY) */}
        <div className="flex flex-col items-center gap-2.5 w-full pb-1">
          {nearestTarget && (
            <div className="pointer-events-auto">
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  audioSystem.playClick();
                  onInteract();
                }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-cyan-400/80 text-white text-sm font-bold shadow-xl backdrop-blur-md transition cursor-pointer"
              >
                <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-xs font-bold">
                  E / Enter
                </span>
                <span>{nearestTarget.promptText}</span>
              </button>
            </div>
          )}

          {subtitle && speaker && (
            <div className="pointer-events-auto max-w-xl w-full rounded-xl bg-slate-950/90 border border-slate-700/80 px-4 py-3 shadow-xl backdrop-blur-md flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 shrink-0"
                    style={{
                      backgroundColor: `${speaker.color}22`,
                      borderColor: speaker.color,
                      color: speaker.color,
                    }}
                  >
                    {speaker.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold" style={{ color: speaker.color }}>
                      {speaker.name} · <span className="text-slate-400 font-medium">{speaker.role}</span>
                    </div>
                    <p className="text-xs text-slate-100 leading-snug">{subtitle.text}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      setShowLearnMore(!showLearnMore);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-cyan-300 transition cursor-pointer"
                  >
                    {showLearnMore ? 'Hide' : 'Learn More'}
                  </button>
                  <button
                    onClick={handleReplayDialogue}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Replay Voice"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleMuteToggle}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    title={isVoiceMuted ? 'Unmute Voice' : 'Mute Voice'}
                  >
                    {isVoiceMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                </div>
              </div>

              {showLearnMore && (
                <div className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 leading-relaxed">
                  {currentShiftStory.scienceTakeaway}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Touch Controls */}
        <div className="pointer-events-auto flex items-end justify-between w-full md:hidden absolute bottom-6 left-5 right-5">
          <div
            ref={joystickBaseRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-24 h-24 rounded-full bg-slate-950/75 border border-cyan-500/40 relative flex items-center justify-center backdrop-blur-sm touch-none"
          >
            <div
              ref={joystickStickRef}
              className="w-10 h-10 rounded-full bg-cyan-500/80 border border-cyan-300 pointer-events-none shadow"
            />
          </div>

          {nearestTarget && (
            <button
              onClick={() => {
                audioSystem.playClick();
                onInteract();
              }}
              className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 cursor-pointer"
            >
              <Hand className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
