import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, Radio, ExternalLink, X, BookOpen } from 'lucide-react';
import { MissionDecision, DecisionOption, GameResources } from '../types/game';
import { audioSystem } from '../game/AudioSystem';
import { NasaDataService, DonkiSepEvent, FALLBACK_DONKI_SEP } from '../services/nasaDataService';

interface DecisionModalProps {
  decision: MissionDecision;
  currentResources: GameResources;
  onConfirmDecision: (option: DecisionOption) => void;
  onClose: () => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  decision,
  onConfirmDecision,
  onClose,
}) => {
  const [selectedOption, setSelectedOption] = useState<DecisionOption>(decision.options[0]);
  const [confirmedOption, setConfirmedOption] = useState<DecisionOption | null>(null);
  const [donkiEvent, setDonkiEvent] = useState<DonkiSepEvent>(FALLBACK_DONKI_SEP);
  const [donkiStatus, setDonkiStatus] = useState<'live' | 'archived' | 'cached'>('archived');
  const [showDonkiDetails, setShowDonkiDetails] = useState(false);

  const isStormDecision = decision.shift === 6;

  useEffect(() => {
    if (!isStormDecision) return;
    NasaDataService.getSpaceWeatherDonki().then((res) => {
      setDonkiEvent(res.event);
      setDonkiStatus(res.status);
    });
  }, [isStormDecision]);

  const handleConfirm = React.useCallback(() => {
    if (selectedOption.isSafe) {
      audioSystem.playSuccess();
    } else {
      audioSystem.playWarning();
    }
    onConfirmDecision(selectedOption);
    setConfirmedOption(selectedOption);
  }, [selectedOption, onConfirmDecision]);

  useEffect(() => {
    let keyboardReady = false;
    const readyTimer = window.setTimeout(() => {
      keyboardReady = true;
    }, 80);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!keyboardReady || e.repeat) return;

      if (confirmedOption) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = decision.options.findIndex((o) => o.id === selectedOption.id);
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const nextIdx = (idx + dir + decision.options.length) % decision.options.length;
        setSelectedOption(decision.options[nextIdx]);
        audioSystem.playClick();
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        const opt = decision.options[Number(e.key) - 1];
        if (opt) {
          setSelectedOption(opt);
          audioSystem.playClick();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [confirmedOption, decision.options, selectedOption, handleConfirm, onClose]);

  const observationBadgeText =
    donkiEvent.observationStatusLabel ||
    (donkiStatus === 'live'
      ? `Observed NASA CCMC DONKI (${donkiEvent.eventTime.slice(0, 10)})`
      : 'Archived NASA Observation — May 9, 2024');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">{decision.title}</h2>
              <p className="text-xs text-slate-400">Stage {decision.shift} Training Decision</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.currentTarget.blur();
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {confirmedOption ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-bold text-base text-white">{confirmedOption.label}</h3>
                <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                  {confirmedOption.educationalFeedback}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.currentTarget.blur();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Continue Mission
            </button>
          </div>
        ) : (
          <>
            <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              {decision.situation}
            </div>

            <p className="text-xs text-slate-300">{decision.dialogue}</p>

            {/* NASA CCMC DONKI Historical Science Context for Stage 6 */}
            {isStormDecision && (
              <div className="p-3.5 rounded-xl bg-slate-950/85 border border-purple-500/35 flex flex-col gap-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> NASA Space-Weather Context (DONKI)
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300">
                    {observationBadgeText}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200">
                  <strong>{donkiEvent.eventType}</strong> · Recorded: {donkiEvent.eventDateLabel || donkiEvent.eventTime}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Thick layers of lunar soil could help protect astronauts from harmful space radiation. Scientists are studying how much protection different materials and thicknesses can provide.
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Training Note: Your drill alert and shelter protection bar are simulated game mechanics, not real radiation dose measurements.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowDonkiDetails(!showDonkiDetails)}
                    className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" /> {showDonkiDetails ? 'Hide event notes' : 'Event details'}
                  </button>
                  <a
                    href={donkiEvent.link || 'https://ccmc.gsfc.nasa.gov/DONKI/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 text-[11px] font-semibold"
                  >
                    Open NASA DONKI Record <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {showDonkiDetails && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    Record ID: {donkiEvent.sepID} · {donkiEvent.note}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {decision.options.map((opt) => {
                const isSelected = selectedOption.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedOption(opt);
                      audioSystem.playClick();
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-white'
                        : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{opt.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                    {opt.simpleExplanation && <p className="text-xs text-slate-300">{opt.simpleExplanation}</p>}
                    {opt.expectedConsequence && (
                      <p className="text-[11px] text-amber-300 font-medium">{opt.expectedConsequence}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Confirm Plan
            </button>
          </>
        )}
      </div>
    </div>
  );
};
