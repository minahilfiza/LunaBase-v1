import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  RotateCcw,
  Star,
  Award,
  FileText,
  ExternalLink,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { GameState } from '../types/game';
import { ScoringSystem } from '../game/ScoringSystem';
import { audioSystem } from '../game/AudioSystem';

interface MissionResultsScreenProps {
  state: GameState;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export const MissionResultsScreen: React.FC<MissionResultsScreenProps> = ({
  state,
  onPlayAgain,
  onReturnHome,
}) => {
  // Use ONE authoritative live calculation directly from current saved state
  const authoritativeScore = ScoringSystem.calculateScore(state);
  const isCompletedAll = state.currentShift > 7;
  const isLowOxygenStop = state.resources.oxygen <= 15;

  const [activeTab, setActiveTab] = useState<'award' | 'report' | 'achievements' | 'sources'>('award');
  const [animatedScore, setAnimatedScore] = useState(0);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);

  useEffect(() => {
    if (isCompletedAll) {
      audioSystem.playHarvestFanfare();
    }
  }, [isCompletedAll]);

  useEffect(() => {
    let current = 0;
    const target = authoritativeScore.total;
    const step = Math.max(1, Math.floor(target / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedScore(current);
    }, 25);
    return () => clearInterval(timer);
  }, [authoritativeScore.total]);

  const burstConfetti = () => {
    audioSystem.playSuccess();
    const colors = ['#22d3ee', '#f59e0b', '#10b981', '#a855f7'];
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      particlesRef.current.push({
        x: canvas.width / 2,
        y: canvas.height * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.18,
      });
    }
  };

  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    if (isCompletedAll) {
      burstConfetti();
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y > canvas.height + 20) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isCompletedAll]);

  const earnedCount = state.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none">
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none z-10 w-full h-full"
      />

      {/* Top Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className={`text-xs font-semibold ${isLowOxygenStop ? 'text-red-400' : 'text-cyan-400'}`}>
              {isLowOxygenStop
                ? 'Simulation Ended: Oxygen Reached 15%'
                : isCompletedAll
                ? 'Simulation Complete · 100% Tasks Finished'
                : `Simulation Summary · ${authoritativeScore.completionPercent}% Tasks Finished`}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white mt-0.5">
              LunaBase Junior Mission Specialist
            </h1>
          </div>
        </div>

        {isCompletedAll && (
          <button
            onClick={burstConfetti}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Award className="w-4 h-4 text-amber-400" /> Celebrate
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-20 my-5 max-w-4xl mx-auto w-full flex flex-col gap-5 flex-1">
        {/* Clean 4 Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('award');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'award'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Award
          </button>

          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('report');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Score ({authoritativeScore.total}/100)
          </button>

          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('achievements');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Badges ({earnedCount}/{state.achievements.length})
          </button>

          <button
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('sources');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sources'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Sources &amp; History
          </button>
        </div>

        {/* TAB 1: TRAINING COMPLETION AWARD */}
        {activeTab === 'award' && (
          <div className="bg-slate-900/95 border-2 border-amber-400/55 rounded-2xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-5">
            <div>
              <div className="text-xs font-bold text-amber-300">
                Training Completion Award
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                LunaBase Junior Mission Specialist
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Asteria Outpost — Fictional Lunar South Pole Training Site
              </p>
            </div>

            <p className="text-sm text-slate-200 max-w-lg leading-relaxed">
              {isLowOxygenStop
                ? 'Educational simulation ended when oxygen reached 15%. Repair the air valve early on your next mission!'
                : isCompletedAll
                ? 'Completed all 7 simulated moon base training tasks: air repair, solar cleaning, water recovery, plant care, storm drill, Earth signal, and finding the Missing Spaceship.'
                : 'Completed an educational Moon outpost simulation session at Asteria Outpost.'}
            </p>

            {/* Consistent Score + Completion */}
            <div className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 w-full max-w-2xl">
              <div className="flex flex-col items-center">
                <span className="text-xs text-cyan-400 font-semibold">Simulation Score</span>
                <div className="text-3xl sm:text-4xl font-bold text-amber-300 font-mono tabular-nums mt-1">
                  {animatedScore} <span className="text-base text-slate-500 font-normal">/ 100</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-emerald-400 font-semibold">Tasks Completed</span>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums mt-1">
                  {authoritativeScore.completionPercent}%
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-xs text-purple-300 font-semibold">Rating</span>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= authoritativeScore.stars
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-white mt-1">{authoritativeScore.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-slate-800 max-w-lg">
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-sm text-cyan-300">Commander (You)</span>
                <span className="text-[11px] text-slate-400 pt-0.5">Mission Commander</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-sm text-amber-300">Nia</span>
                <span className="text-[11px] text-slate-400 pt-0.5">Life-support Engineer</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-sm text-emerald-300">Leo</span>
                <span className="text-[11px] text-slate-400 pt-0.5">Plant Scientist</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950/70 px-4 py-2 rounded-lg border border-slate-800">
              This is an educational simulation award, not an official NASA qualification or endorsement.
            </p>
          </div>
        )}

        {/* TAB 2: SIMPLE AUTHORITATIVE SCORE & RESOURCE SUMMARY */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-white">Score Breakdown</h3>
                <span className="text-sm font-mono font-bold text-amber-300 tabular-nums">
                  Total: {authoritativeScore.total} / 100
                </span>
              </div>

              {[
                { label: 'Crew Safety', val: authoritativeScore.crewSafety, max: 30, color: 'bg-emerald-400' },
                { label: 'Resource Balance', val: authoritativeScore.resourceEfficiency, max: 25, color: 'bg-amber-400' },
                { label: 'Mission Stages', val: authoritativeScore.missionCompletion, max: 20, color: 'bg-cyan-400' },
                { label: 'Engineering Tasks', val: authoritativeScore.engineeringTasks, max: 15, color: 'bg-cyan-500' },
                { label: 'Science Care', val: authoritativeScore.scientificUnderstanding, max: 10, color: 'bg-purple-400' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1 tabular-nums">
                    <span className="text-slate-300">{row.label}</span>
                    <span className="font-mono text-white">
                      {row.val} / {row.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${row.color} h-full rounded-full`}
                      style={{ width: `${(row.val / row.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
              <h3 className="font-display text-base font-bold text-white">Final Saved Supplies</h3>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  { name: 'Oxygen', val: Math.round(state.resources.oxygen) },
                  { name: 'Water', val: Math.round(state.resources.water) },
                  { name: 'Battery / Power', val: Math.round(state.resources.power) },
                  { name: 'Food', val: Math.round(state.resources.food) },
                  { name: 'Shelter Protection', val: Math.round(state.resources.radiationSafety) },
                ].map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/75 border border-slate-800 tabular-nums"
                  >
                    <span className="text-slate-300">{r.name}</span>
                    <span className="font-mono font-bold text-white">{r.val}%</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                Campaign completion: <strong className="text-cyan-300">{authoritativeScore.completionPercent}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BADGES */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {state.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-2.5 ${
                  ach.unlocked
                    ? 'bg-slate-900 border-cyan-500/40'
                    : 'bg-slate-950/50 border-slate-800 opacity-55'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{ach.icon}</span>
                    <span className={ach.unlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {ach.unlocked ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-white">{ach.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{ach.description}</p>
                </div>
                {ach.unlocked && ach.earnedAt && (
                  <div className="text-[11px] text-cyan-300 pt-2 border-t border-slate-800">
                    Earned at {ach.earnedAt}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: DATA SOURCES & SPACEFLIGHT HISTORY */}
        {activeTab === 'sources' && (
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 text-xs text-slate-300">
            <p className="leading-relaxed">
              LunaBase: First Light is an educational simulation inspired by real NASA public research:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2">
                <div>
                  <div className="font-bold text-purple-300">NASA CCMC DONKI</div>
                  <p className="mt-1 text-slate-400">
                    Archived May 9, 2024 Solar Energetic Particle (SEP) observation for storm context.
                  </p>
                </div>
                <a
                  href="https://ccmc.gsfc.nasa.gov/DONKI/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Open CCMC DONKI <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2">
                <div>
                  <div className="font-bold text-emerald-300">NASA OSDR (OSD-480 &amp; OSD-481)</div>
                  <p className="mt-1 text-slate-400">
                    ISS plant gravity study (OSD-480) and optional human crew-health study (OSD-481).
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-480"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    OSD-480 <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-481"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    OSD-481 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2">
                <div>
                  <div className="font-bold text-cyan-300">NASA LRO &amp; Moon Trek</div>
                  <p className="mt-1 text-slate-400">
                    Lunar South Pole topography and illumination data from LOLA, LROC, Diviner, LEND, and CRaTER.
                  </p>
                </div>
                <a
                  href="https://science.nasa.gov/mission/lro/science-and-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Open NASA LRO Science <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2">
                <div>
                  <div className="font-bold text-amber-300">Remembering Spaceflight History</div>
                  <p className="mt-1 text-slate-400">
                    Honoring crew safety lessons from Space Shuttle Challenger (STS-51L) and Columbia (STS-107).
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="https://www.nasa.gov/mission/sts-51L/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    STS-51L <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.nasa.gov/remembering-columbia-sts-107/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    STS-107 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 max-w-4xl mx-auto w-full">
        <button
          onClick={() => {
            audioSystem.playClick();
            onReturnHome();
          }}
          className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
        >
          Back to Title
        </button>

        <button
          onClick={() => {
            audioSystem.playClick();
            onPlayAgain();
          }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-7 py-3 rounded-xl shadow-lg transition cursor-pointer text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>
    </div>
  );
};
