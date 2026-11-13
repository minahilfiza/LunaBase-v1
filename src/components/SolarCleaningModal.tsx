import React, { useState } from 'react';
import { Sun, CheckCircle2, X, Sparkles } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface SolarCleaningModalProps {
  currentCleanliness: number;
  onCleanUpdate: (cleanliness: number) => void;
  onComplete: () => void;
  onClose: () => void;
}

export const SolarCleaningModal: React.FC<SolarCleaningModalProps> = ({
  currentCleanliness,
  onCleanUpdate,
  onComplete,
  onClose,
}) => {
  const [cleanedBanks, setCleanedBanks] = useState<number[]>(currentCleanliness >= 100 ? [1, 2, 3] : []);
  const [isFinished, setIsFinished] = useState<boolean>(currentCleanliness >= 100);

  const displayCleanliness = isFinished
    ? 100
    : cleanedBanks.length === 0
    ? currentCleanliness
    : Math.min(100, 60 + cleanedBanks.length * 14);

  const handleCleanBank = (bankId: number) => {
    if (cleanedBanks.includes(bankId) || isFinished) return;
    const next = [...cleanedBanks, bankId];
    setCleanedBanks(next);
    audioSystem.playLaserWipe();

    const nextClean = next.length >= 3 ? 100 : Math.min(99, 60 + next.length * 14);
    onCleanUpdate(nextClean);

    if (next.length >= 3) {
      setIsFinished(true);
      audioSystem.playSuccess();
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Clean Dust Off Solar Panels</h2>
              <p className="text-xs text-slate-400 tabular-nums">
                Panel Cleanliness: <span className="text-amber-300 font-bold">{Math.round(displayCleanliness)}%</span>
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

        {!isFinished ? (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              Static-charged Moon dust settled on all 3 solar banks. Click each dusty solar bank below to sweep it clean and restore full outpost sunlight power!
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 1, label: 'West Wing' },
                { id: 2, label: 'Center Array' },
                { id: 3, label: 'East Wing' },
              ].map((bank) => {
                const clean = cleanedBanks.includes(bank.id);
                return (
                  <button
                    key={bank.id}
                    onClick={() => handleCleanBank(bank.id)}
                    disabled={clean}
                    className={`p-4 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
                      clean
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    {clean ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="text-xs font-bold">{bank.label}</span>
                    <span className="text-[10px] text-slate-400">{clean ? 'Clean (100%)' : 'Dusty — Clean'}</span>
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
                <h3 className="font-display font-bold text-base text-white">Solar Panels Sparkling Clean!</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  All 3 solar wings are at 100% efficiency! Walk to the Battery Station next to check backup storage.
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
      </div>
    </div>
  );
};
