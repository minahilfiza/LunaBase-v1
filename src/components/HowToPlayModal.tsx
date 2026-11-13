import React from 'react';
import { HelpCircle, Navigation, Cpu, CheckCircle2, X } from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">How to Play</h2>
              <p className="text-xs text-slate-400">Your quick guide to running LunaBase (Ages 7–12)</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            aria-label="Close How to Play"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-cyan-400">How Each Stage Works</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-100 font-semibold text-center">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">1. Explore Outpost</div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">2. Walk to Station</div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">3. Press E / Enter</div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">4. Solve &amp; Learn</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-display font-bold text-xs text-cyan-300 flex items-center gap-1.5">
              <Navigation className="w-4 h-4" /> Walking &amp; Camera
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li><strong className="text-white">W, A, S, D</strong> or <strong className="text-white">Arrow Keys</strong>: Walk around</li>
              <li><strong className="text-white">Mouse</strong>: Turn camera smoothly &amp; click activity controls</li>
              <li><strong className="text-white">Mouse Wheel</strong>: Zoom camera in and out</li>
              <li><strong className="text-white">Esc Key</strong>: Pause mission or unlock mouse</li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <h3 className="font-display font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Base Stations &amp; Menus
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li><strong className="text-white">E</strong> (or <strong className="text-white">Enter</strong>): Open nearby equipment</li>
              <li><strong className="text-white">Hint Button</strong>: Get directions whenever you need a hand</li>
              <li><strong className="text-white">Top-Right</strong>: Open Pause (with Map, Science &amp; Steps) or Settings</li>
              <li><strong className="text-white">Crew</strong>: Nia &amp; Leo guide you through all 7 stages</li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
          <h3 className="font-display font-bold text-xs text-white">Seven Training Stages</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
            <div>Stage 1: Arrive at the Moon Base</div>
            <div>Stage 2: Clean and Align Solar Panels</div>
            <div>Stage 3: Restore Clean Water</div>
            <div>Stage 4 &amp; 5: Plant Seeds &amp; Care for Crops</div>
            <div>Stage 6: Complete the Solar Storm Safety Drill</div>
            <div>Stage 7: Send Final Mission Report to Earth</div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
