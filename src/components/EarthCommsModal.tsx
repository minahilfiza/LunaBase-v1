import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, X, Globe, Clock, Compass } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface EarthCommsModalProps {
  antennaConnected: boolean;
  currentShift: number;
  onTransmitFinalReport: () => void;
  onClose: () => void;
}

export const EarthCommsModal: React.FC<EarthCommsModalProps> = ({
  antennaConnected,
  currentShift,
  onTransmitFinalReport,
  onClose,
}) => {
  const [dishAligned, setDishAligned] = useState(antennaConnected || currentShift < 7);
  const [messageText, setMessageText] = useState(
    'Final Mission Report: Asteria Outpost training checks finished!'
  );
  const [signalState, setSignalState] = useState<
    'idle' | 'traveling_to_earth' | 'traveling_back' | 'received'
  >('idle');
  const [earthReply, setEarthReply] = useState<string | null>(null);

  const isStage7Signal = currentShift === 7;

  React.useEffect(() => {
    if (signalState !== 'received') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [signalState, onClose]);

  const handleSendReport = () => {
    if (signalState === 'traveling_to_earth' || signalState === 'traveling_back') return;
    audioSystem.playPing();
    setEarthReply(null);
    setSignalState('traveling_to_earth');

    setTimeout(() => {
      setSignalState('traveling_back');
    }, 1280);

    setTimeout(() => {
      audioSystem.playSuccess();
      setSignalState('received');
      setEarthReply(
        isStage7Signal
          ? 'Earth Control: Signal received! We tracked the Missing Spaceship beacon southeast past the Greenhouse. Go find the spaceship to finish your mission!'
          : `Earth Control: Signal received across 384,400 km! Stage ${Math.min(7, currentShift)} telemetry logged cleanly.`
      );
      if (isStage7Signal) {
        onTransmitFinalReport();
      }
    }, 2560);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Communication Station</h2>
              <p className="text-xs text-slate-400">
                {dishAligned ? 'Antenna Aligned Toward Earth' : 'Step 1: Align Dish Toward Earth'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            aria-label="Close modal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-cyan-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Simulated Moon-to-Earth Link</div>
                <div className="text-xs text-slate-400">
                  384,400 km · Real radio waves take 1.28 seconds each way
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-cyan-300 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>2.56s round trip</span>
            </div>
          </div>

          {!dishAligned ? (
            <button
              onClick={() => {
                audioSystem.playSuccess();
                setDishAligned(true);
              }}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Compass className="w-4 h-4" /> Align Radio Dish Toward Earth
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">
                {isStage7Signal ? 'Send Beacon Signal to Earth' : 'Send a Simulated Message to Earth'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSendReport}
                  disabled={signalState === 'traveling_to_earth' || signalState === 'traveling_back'}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{isStage7Signal ? 'Send Signal' : 'Ping Earth'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 min-h-[60px] flex items-center">
            {signalState === 'idle' && (
              <span className="text-xs text-slate-400">
                {isStage7Signal
                  ? 'Align the dish and press Send Signal so Earth Control can pinpoint the Missing Spaceship!'
                  : 'Press Ping Earth to test the 2.56-second Moon-to-Earth radio travel time.'}
              </span>
            )}
            {signalState === 'traveling_to_earth' && (
              <span className="text-xs font-semibold text-cyan-300">
                Radio telemetry racing toward Earth at light speed... (1.28s)
              </span>
            )}
            {signalState === 'traveling_back' && (
              <span className="text-xs font-semibold text-amber-300">
                Earth Control confirmed! Beacon coordinates coming back to the Moon...
              </span>
            )}
            {signalState === 'received' && earthReply && (
              <div className="flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{earthReply}</span>
              </div>
            )}
          </div>

          {signalState === 'received' && (
            <button
              onClick={(e) => {
                e.currentTarget.blur();
                audioSystem.playClick();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              {isStage7Signal ? 'Go Find the Missing Spaceship' : 'Continue Mission'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
