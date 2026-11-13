import React, { useState } from 'react';
import { Play, Settings, HelpCircle, LogOut, Award, AlertTriangle, BookOpen, Map as MapIcon, History } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface PauseModalProps {
  currentShift: number;
  onResume: () => void;
  onOpenMap: () => void;
  onOpenScience: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onEndMission: () => void;
  onExitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  currentShift,
  onResume,
  onOpenMap,
  onOpenScience,
  onOpenHistory,
  onOpenSettings,
  onOpenHowToPlay,
  onEndMission,
  onExitToTitle,
}) => {
  const [confirmEnd, setConfirmEnd] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center border-b border-slate-800 pb-3.5">
          <h2 className="font-display text-2xl font-bold text-white">Mission Paused</h2>
          <p className="text-xs text-slate-400 mt-1">
            Stage {Math.min(7, currentShift)} of 7 · Progress saved automatically
          </p>
        </div>

        {confirmEnd ? (
          <div className="flex flex-col gap-3 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Finish &amp; See Results?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will wrap up your current Moon mission and open your Training Completion Award and Score Breakdown.
            </p>
            <button
              onClick={() => {
                audioSystem.playClick();
                onEndMission();
              }}
              className="w-full h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Yes, Show Results
            </button>
            <button
              onClick={() => {
                audioSystem.playClick();
                setConfirmEnd(false);
              }}
              className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              Keep Playing
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                audioSystem.playClick();
                onResume();
              }}
              className="w-full h-11 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Resume Mission
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  audioSystem.playClick();
                  onOpenMap();
                }}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <MapIcon className="w-4 h-4 text-cyan-400" />
                <span>Map</span>
              </button>
              <button
                onClick={() => {
                  audioSystem.playClick();
                  onOpenScience();
                }}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Science</span>
              </button>
              <button
                onClick={() => {
                  audioSystem.playClick();
                  onOpenHistory();
                }}
                className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex flex-col items-center gap-1 transition cursor-pointer"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>Steps</span>
              </button>
            </div>

            <button
              onClick={() => {
                audioSystem.playClick();
                onOpenSettings();
              }}
              className="w-full h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-cyan-400" /> Settings &amp; Controls
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                onOpenHowToPlay();
              }}
              className="w-full h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" /> How to Play
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setConfirmEnd(true);
              }}
              className="w-full h-10 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Award className="w-4 h-4" /> End Mission &amp; View Results
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                onExitToTitle();
              }}
              className="w-full h-10 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Return to Title Screen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
