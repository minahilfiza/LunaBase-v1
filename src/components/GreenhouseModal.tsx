import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Droplets,
  Sun,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { PlantExperiment } from '../types/game';
import { audioSystem } from '../game/AudioSystem';
import { NasaDataService, OsdrStudy, FALLBACK_OSDR_STUDIES } from '../services/nasaDataService';

interface GreenhouseModalProps {
  plant: PlantExperiment;
  onUpdatePlant: (newPlant: PlantExperiment, resourceDelta?: { water?: number; power?: number }) => void;
  onHarvest: () => void;
  onClose: () => void;
}

export const GreenhouseModal: React.FC<GreenhouseModalProps> = ({
  plant,
  onUpdatePlant,
  onHarvest,
  onClose,
}) => {
  const [seedChoice, setSeedChoice] = useState<'radish' | 'wheat' | 'tomato'>(plant.seedType || 'radish');
  const [lightSlider, setLightSlider] = useState<number>(plant.lightLevel || 80);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [osdrStudy, setOsdrStudy] = useState<OsdrStudy>(
    FALLBACK_OSDR_STUDIES.find((s) => s.studyId === 'OSD-480') || FALLBACK_OSDR_STUDIES[0]
  );
  const [showOsdrScience, setShowOsdrScience] = useState(false);

  useEffect(() => {
    NasaDataService.getOsdrStudies().then((res) => {
      const study = res.datasets.find((s) => s.studyId === 'OSD-480');
      if (study) setOsdrStudy(study);
    });
  }, []);

  const handlePlant = () => {
    audioSystem.playWaterFlow();
    const nextPlant: PlantExperiment = {
      seedType: seedChoice,
      stage: 'seed',
      waterLevel: 60,
      lightLevel: lightSlider,
      health: 100,
      growthProgress: 25,
    };
    onUpdatePlant(nextPlant, { water: -4, power: -2 });
    setStatusNote(`Planted ${seedChoice} seeds (-4% Water, -2% Power). Next, water & light your seeds so they sprout!`);
  };

  const handleFeedAndGrow = () => {
    audioSystem.playSuccess();
    const nextProgress = Math.min(100, plant.growthProgress + 38);
    const nextStage =
      nextProgress >= 100 ? 'harvest_ready' : nextProgress >= 65 ? 'growing' : 'sprout';
    const nextPlant: PlantExperiment = {
      ...plant,
      waterLevel: 90,
      lightLevel: lightSlider,
      growthProgress: nextProgress,
      stage: nextStage,
    };
    onUpdatePlant(nextPlant, { water: -5, power: -3 });
    setStatusNote(
      nextStage === 'harvest_ready'
        ? 'Your crops are ready to harvest!'
        : 'Water and grow lights helped your seedlings grow! (-5% Water, -3% Power)'
    );
  };

  const handleHarvestClick = () => {
    audioSystem.playHarvestFanfare();
    onHarvest();
    setStatusNote('Harvest complete! Added +25% Food and +5% Oxygen.');
  };

  const selectedLabel = plant.seedType
    ? plant.seedType.charAt(0).toUpperCase() + plant.seedType.slice(1)
    : seedChoice.charAt(0).toUpperCase() + seedChoice.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Plant Greenhouse</h2>
              <p className="text-xs text-slate-400">
                Simulated Space Crop Care
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

        {/* Clear Crop Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Selected Plant</span>
            <span className="font-bold text-white">{selectedLabel}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Growth Stage</span>
            <span className="font-bold text-emerald-300 capitalize">{plant.stage.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Growth Progress</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">{Math.round(plant.growthProgress)}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Action Cost</span>
            <span className="font-semibold text-amber-300">
              {plant.stage === 'none' || !plant.seedType ? '4% Water · 2% Power' : '5% Water · 3% Power'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[11px]">Expected Result</span>
            <span className="font-semibold text-cyan-300">Grows crop tray · Harvest adds +25% Food &amp; +5% Air</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, plant.growthProgress)}%` }}
          />
        </div>

        {statusNote && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{statusNote}</span>
          </div>
        )}

        {plant.stage === 'harvested' ? (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center">
              <div className="font-display font-bold text-base text-white">Greenhouse Harvest Complete!</div>
              <p className="text-xs text-emerald-200 mt-1">
                Your simulated {selectedLabel} crop boosted Food (+25%) and Air (+5%)!
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Continue Mission
            </button>
          </div>
        ) : plant.stage === 'none' || !plant.seedType ? (
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-300">
              Choose a Fictional Training Crop to Plant:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'radish', name: 'Radish' },
                { id: 'wheat', name: 'Wheat' },
                { id: 'tomato', name: 'Tomato' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    audioSystem.playClick();
                    setSeedChoice(s.id as 'radish' | 'wheat' | 'tomato');
                  }}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold cursor-pointer ${
                    seedChoice === s.id
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <button
              onClick={handlePlant}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
            >
              Plant {seedChoice.charAt(0).toUpperCase() + seedChoice.slice(1)} Seeds
            </button>
          </div>
        ) : plant.stage === 'harvest_ready' ? (
          <button
            onClick={handleHarvestClick}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Harvest Crops (+25% Food, +5% Air)
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" /> Grow Light Level
                </span>
                <span className="font-mono font-bold tabular-nums text-white">{lightSlider}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={lightSlider}
                onChange={(e) => setLightSlider(Number(e.target.value))}
                className="accent-pink-400 w-full cursor-pointer"
              />
            </div>

            <button
              onClick={handleFeedAndGrow}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Droplets className="w-4 h-4" /> Water &amp; Light {selectedLabel} Crop
            </button>
          </div>
        )}

        {/* Concise Expandable NASA OSD-480 Learning Card */}
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <button
            onClick={() => setShowOsdrScience(!showOsdrScience)}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Real Spaceflight Science: NASA OSDR {osdrStudy.studyId}</span>
            </div>
            {showOsdrScience ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOsdrScience && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 text-left">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono font-bold text-emerald-300">
                    {osdrStudy.studyId} · <span className="text-cyan-300 font-sans">{osdrStudy.experimentType}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">{osdrStudy.title}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">Organism: {osdrStudy.organism}</div>
                </div>
                <a
                  href={osdrStudy.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white shrink-0"
                  title="Open NASA OSDR OSD-480"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{osdrStudy.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
