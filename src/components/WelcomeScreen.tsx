import React, { useState } from 'react';
import { Play, RotateCcw, HelpCircle, Settings as SettingsIcon, Rocket, AlertTriangle } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface WelcomeScreenProps {
  hasSavedGame: boolean;
  onStartMission: () => void;
  onContinueMission: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  hasSavedGame,
  onStartMission,
  onContinueMission,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  const handleStartClick = () => {
    audioSystem.playClick();
    audioSystem.startAmbience();
    if (hasSavedGame) {
      setConfirmOverwrite(true);
    } else {
      onStartMission();
    }
  };

  const handleConfirmNewMission = () => {
    audioSystem.playClick();
    setConfirmOverwrite(false);
    onStartMission();
  };

  const handleContinueClick = () => {
    if (!hasSavedGame) return;
    audioSystem.playClick();
    audioSystem.startAmbience();
    onContinueMission();
  };

  const handleHowToPlay = () => {
    audioSystem.playClick();
    onOpenHowToPlay();
  };

  const handleSettings = () => {
    audioSystem.playClick();
    onOpenSettings();
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-8 z-20 select-none bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/65">
      {/* Top Bar: Brand Title & Single Settings Button */}
      <header className="flex items-start justify-between w-full pointer-events-auto">
        <div className="flex flex-col">
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            LUNABASE: FIRST LIGHT
          </h1>
          <p className="text-sm md:text-base font-medium text-cyan-300/90 mt-1">
            Moon Outpost Exploration &amp; Science Game
          </p>
        </div>

        <button
          onClick={handleSettings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-400/60 text-slate-100 text-sm font-semibold transition-all duration-150 backdrop-blur-md shadow-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          <SettingsIcon className="w-4 h-4 text-cyan-400" />
          <span>Settings</span>
        </button>
      </header>

      {/* Center Action Stack: Strictly Three Consistent Primary Buttons */}
      <main className="pointer-events-auto self-center my-auto flex flex-col items-center gap-3.5 w-72">
        {confirmOverwrite ? (
          <div className="w-full rounded-2xl bg-slate-950/95 border border-amber-500/50 p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3.5 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-display font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Start a New Mission?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You already have saved mission progress. Starting fresh will replace your current save.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleConfirmNewMission}
                className="w-full h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all duration-150 cursor-pointer"
              >
                Start New Mission
              </button>
              <button
                onClick={() => {
                  audioSystem.playClick();
                  setConfirmOverwrite(false);
                }}
                className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all duration-150 cursor-pointer"
              >
                Keep Saved Mission
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. Start Mission */}
            <button
              onClick={handleStartClick}
              className="w-72 h-14 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-base tracking-wide flex items-center justify-between shadow-lg shadow-cyan-950/50 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Rocket className="w-5 h-5" />
                <span>Start Mission</span>
              </span>
              <Play className="w-4 h-4 fill-slate-950" />
            </button>

            {/* 2. Continue Mission */}
            <button
              onClick={handleContinueClick}
              disabled={!hasSavedGame}
              className={`w-72 h-14 px-5 rounded-xl border font-display font-bold text-base tracking-wide flex items-center justify-between transition-all duration-150 backdrop-blur-md ${
                hasSavedGame
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-cyan-400/60 text-white hover:-translate-y-0.5 cursor-pointer shadow-lg'
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-3">
                <RotateCcw className={`w-5 h-5 ${hasSavedGame ? 'text-cyan-400' : 'text-slate-600'}`} />
                <span>Continue Mission</span>
              </span>
              <span className="text-xs font-sans font-medium text-slate-400">
                {hasSavedGame ? 'Saved' : 'Empty'}
              </span>
            </button>

            {/* 3. How to Play */}
            <button
              onClick={handleHowToPlay}
              className="w-72 h-14 px-5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-100 font-display font-bold text-base tracking-wide flex items-center justify-between transition-all duration-150 hover:-translate-y-0.5 backdrop-blur-md shadow-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>How to Play</span>
              </span>
            </button>
          </>
        )}
      </main>

      {/* Clean Bottom Spacer */}
      <div className="h-4" />
    </div>
  );
};
