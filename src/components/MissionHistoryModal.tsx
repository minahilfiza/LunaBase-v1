import React from 'react';
import {
  History,
  X,
  CheckCircle2,
  Lock,
  Rocket,
  Wind,
  BatteryCharging,
  Droplets,
  Sprout,
  Shield,
  Radio,
  Home,
} from 'lucide-react';
import { MISSION_SHIFTS } from '../data/missions';
import { TaskIconType } from '../types/game';
import { audioSystem } from '../game/AudioSystem';

interface MissionHistoryModalProps {
  currentShift: number;
  currentObjectiveIndex: number;
  onClose: () => void;
}

export function renderTaskIcon(iconType?: TaskIconType, className = 'w-4 h-4') {
  switch (iconType) {
    case 'rocket':
      return <Rocket className={`${className} text-amber-400`} />;
    case 'wind':
      return <Wind className={`${className} text-cyan-400`} />;
    case 'battery':
      return <BatteryCharging className={`${className} text-amber-400`} />;
    case 'droplet':
      return <Droplets className={`${className} text-cyan-400`} />;
    case 'leaf':
      return <Sprout className={`${className} text-emerald-400`} />;
    case 'shield':
      return <Shield className={`${className} text-purple-400`} />;
    case 'antenna':
      return <Radio className={`${className} text-purple-400`} />;
    case 'home':
      return <Home className={`${className} text-cyan-400`} />;
    default:
      return <Rocket className={`${className} text-cyan-400`} />;
  }
}

export const MissionHistoryModal: React.FC<MissionHistoryModalProps> = ({
  currentShift,
  currentObjectiveIndex,
  onClose,
}) => {
  const allSteps = MISSION_SHIFTS.flatMap((shift) =>
    shift.objectives.map((obj, idx) => {
      const isComplete =
        shift.shiftNumber < currentShift ||
        (shift.shiftNumber === currentShift && idx < currentObjectiveIndex);
      const isActive = shift.shiftNumber === currentShift && idx === currentObjectiveIndex;
      return {
        id: obj.id,
        shiftNumber: shift.shiftNumber,
        stepNumber: idx + 1,
        title: obj.title,
        icon: obj.taskIcon,
        status: isComplete ? 'Complete' : isActive ? 'Active' : 'Locked',
      } as const;
    })
  );

  const completedCount = allSteps.filter((s) => s.status === 'Complete').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Mission History &amp; Steps</h2>
              <p className="text-xs text-slate-400 tabular-nums">
                {completedCount} of {allSteps.length} tasks complete across 7 Stages
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            aria-label="Close Mission History"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
          {allSteps.map((step) => (
            <div
              key={step.id}
              className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 ${
                step.status === 'Complete'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : step.status === 'Active'
                  ? 'bg-cyan-500/15 border-cyan-400/60'
                  : 'bg-slate-950/50 border-slate-800 opacity-65'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                  {renderTaskIcon(step.icon)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{step.title}</div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    Stage {step.shiftNumber} · Step {step.stepNumber}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                {step.status === 'Complete' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Complete
                  </span>
                )}
                {step.status === 'Active' && <span className="text-cyan-300">Active</span>}
                {step.status === 'Locked' && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
