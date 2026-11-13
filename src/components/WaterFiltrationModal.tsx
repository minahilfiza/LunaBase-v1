import React, { useState } from 'react';
import { Droplets, CheckCircle2, AlertTriangle, X, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface WaterFiltrationModalProps {
  onComplete: () => void;
  onClose: () => void;
}

const STAGES = [
  { id: 1, name: '1. Collect used cabin & wash water' },
  { id: 2, name: '2. Remove small particles & lint' },
  { id: 3, name: '3. Filter out dissolved impurities (Multifiltration)' },
  { id: 4, name: '4. Treat remaining contaminants (Catalytic Reactor)' },
  { id: 5, name: '5. Check clean water quality' },
];

export const WaterFiltrationModal: React.FC<WaterFiltrationModalProps> = ({
  onComplete,
  onClose,
}) => {
  const [selectedSequence, setSelectedSequence] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderHint, setOrderHint] = useState<string | null>(null);
  const [showScience, setShowScience] = useState(false);

  const handleStageClick = (stageId: number) => {
    if (selectedSequence.includes(stageId) || isSuccess) return;

    const expectedNext = selectedSequence.length + 1;
    if (stageId !== expectedNext) {
      audioSystem.playWarning();
      setOrderHint(`Start with Step ${expectedNext} first so large particles do not clog the filters!`);
      return;
    }

    setOrderHint(null);
    audioSystem.playWaterFlow();
    const nextSeq = [...selectedSequence, stageId];
    setSelectedSequence(nextSeq);

    if (nextSeq.length === STAGES.length) {
      setIsSuccess(true);
      audioSystem.playSuccess();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Restore Clean Water</h2>
              <p className="text-xs text-slate-400 tabular-nums">
                Training Simulation · Step {selectedSequence.length} of {STAGES.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSuccess ? (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              Run all 5 clean-water steps in order from Step 1 to Step 5 in this simplified water-recovery simulation!
            </p>

            {orderHint && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{orderHint}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {STAGES.map((stage) => {
                const isEngaged = selectedSequence.includes(stage.id);
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleStageClick(stage.id)}
                    disabled={isEngaged}
                    className={`p-3 rounded-xl border text-left transition font-semibold text-sm cursor-pointer flex items-center justify-between ${
                      isEngaged
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{stage.name}</span>
                    {isEngaged && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-base text-white">Clean Water Restored!</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  All 5 steps finished cleanly. Water reserves increased by +15% in the simulation!
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Continue Mission
            </button>
          </div>
        )}

        <div className="border-t border-slate-800 pt-3">
          <button
            onClick={() => setShowScience(!showScience)}
            className="w-full flex items-center justify-between text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> How Real ISS Water Recycling Works
            </span>
            {showScience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showScience && (
            <p className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              NASA’s actual International Space Station Water Recovery System uses separate urine-processing and water-processing assemblies, including multifiltration and catalytic treatment, to recycle about 98% of station water. This game activity is a simplified training simulation, not an exact replica of NASA hardware.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
