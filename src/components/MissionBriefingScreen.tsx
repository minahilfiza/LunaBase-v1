import React, { useState } from 'react';
import { Play, Volume2, Cpu, Navigation } from 'lucide-react';
import { CREW_MEMBERS } from '../data/crew';
import { CrewId } from '../types/game';
import { narrationSystem } from '../game/NarrationSystem';
import { audioSystem } from '../game/AudioSystem';

interface MissionBriefingScreenProps {
  onStartShift1: () => void;
  onBackToWelcome: () => void;
}

export const MissionBriefingScreen: React.FC<MissionBriefingScreenProps> = ({
  onStartShift1,
  onBackToWelcome,
}) => {
  const [selectedCrew, setSelectedCrew] = useState<CrewId>('player');
  const [activeTab, setActiveTab] = useState<'crew' | 'controls'>('crew');

  const currentCrew = CREW_MEMBERS[selectedCrew];

  const handleCrewClick = (id: CrewId) => {
    setSelectedCrew(id);
    const member = CREW_MEMBERS[id];
    audioSystem.playClick();
    narrationSystem.speak(id, member.greeting, member.name);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col justify-between p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 max-w-4xl mx-auto w-full">
        <div>
          <span className="text-xs font-semibold text-cyan-400">
            Mission Introduction
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mt-0.5">
            Meet Your LunaBase Crew
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('crew');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'crew'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Crew Roster
          </button>
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('controls');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Controls
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 my-6 flex flex-col justify-center max-w-4xl mx-auto w-full">
        {activeTab === 'crew' && (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-slate-400 text-center">
              Click a crew member to hear their greeting before you step onto the Moon:
            </p>

            {/* Exactly Three Main Crew Members */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['player', 'nia', 'leo'] as CrewId[]).map((id) => {
                const m = CREW_MEMBERS[id];
                const isSelected = selectedCrew === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleCrewClick(id)}
                    className={`p-5 rounded-2xl border text-center transition flex flex-col items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl border-2"
                      style={{ backgroundColor: `${m.color}20`, borderColor: m.color, color: m.color }}
                    >
                      {m.name[0]}
                    </div>
                    <div>
                      <div className="font-display font-bold text-base text-white">{m.name}</div>
                      <div className="text-xs text-cyan-400 font-medium mt-0.5">{m.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Crew Greeting */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{currentCrew.name}</h3>
                  <span className="text-xs text-cyan-400 font-medium">{currentCrew.role}</span>
                </div>
                <button
                  onClick={() => narrationSystem.speak(currentCrew.id, currentCrew.greeting, currentCrew.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Hear Voice
                </button>
              </div>

              <p className="text-sm text-slate-100 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                &ldquo;{currentCrew.greeting}&rdquo;
              </p>
              <p className="text-xs text-slate-400">{currentCrew.bio}</p>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/85 p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col gap-3">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" /> Walking &amp; Camera Look
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-300">W A S D</span>
                  <span>or Arrow keys to walk in camera direction.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-300">Click + Move Mouse</span>
                  <span>Look smoothly around the outpost.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-300">Mouse Wheel</span>
                  <span>Zoom camera closer or farther.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> Station Tasks
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-300">Enter / E</span>
                  <span>Open nearby station when the prompt appears.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-amber-300">Esc</span>
                  <span>Unlock mouse and open the Pause menu.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => {
            audioSystem.playClick();
            onBackToWelcome();
          }}
          className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
        >
          Back to Title
        </button>

        <button
          onClick={() => {
            audioSystem.playClick();
            narrationSystem.speak('nia', "Welcome to Asteria Outpost! Let's inspect the Spaceship Lander first.", 'Nia');
            onStartShift1();
          }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-7 py-3 rounded-xl shadow-lg transition cursor-pointer text-sm"
        >
          <Play className="w-4 h-4 fill-slate-950" /> Begin Stage 1
        </button>
      </div>
    </div>
  );
};
