import React, { useState } from 'react';
import {
  BookOpen,
  Wind,
  Droplets,
  Sun,
  Sprout,
  Shield,
  Rocket,
  HeartPulse,
  History,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Lightbulb,
} from 'lucide-react';
import { SCIENCE_CATEGORIES, SCIENCE_TOPICS, ScienceCategory } from '../data/science';
import { audioSystem } from '../game/AudioSystem';

interface ScienceLibraryModalProps {
  onClose: () => void;
}

export const ScienceLibraryModal: React.FC<ScienceLibraryModalProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<ScienceCategory>('air_life_support');
  const [expandedMore, setExpandedMore] = useState(false);

  const topic = SCIENCE_TOPICS.find((t) => t.category === selectedCategory) || SCIENCE_TOPICS[0];

  const getCategoryIcon = (cat: ScienceCategory) => {
    switch (cat) {
      case 'air_life_support':
        return <Wind className="w-5 h-5 text-cyan-400" />;
      case 'water_recycling':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'solar_power':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'growing_plants':
        return <Sprout className="w-5 h-5 text-emerald-400" />;
      case 'radiation_protection':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'crew_health_osdr':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'real_nasa_missions':
        return <Rocket className="w-5 h-5 text-cyan-400" />;
      case 'spaceflight_history':
        return <History className="w-5 h-5 text-amber-300" />;
    }
  };

  const renderEquipmentIllustration = (cat: ScienceCategory) => {
    switch (cat) {
      case 'air_life_support':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="18" y="16" width="28" height="48" rx="6" className="fill-cyan-500/15" />
            <rect x="74" y="16" width="28" height="48" rx="6" className="fill-emerald-500/15" stroke="#10b981" />
            <path d="M46 32 H74 M46 48 H74" strokeDasharray="4 3" />
            <circle cx="32" cy="40" r="6" />
            <circle cx="88" cy="40" r="6" stroke="#10b981" />
          </svg>
        );
      case 'water_recycling':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 20 V60 M50 20 V60 M78 20 V60" strokeLinecap="round" />
            <rect x="14" y="28" width="16" height="24" rx="4" className="fill-cyan-500/15" />
            <rect x="42" y="28" width="16" height="24" rx="4" className="fill-cyan-500/20" />
            <rect x="70" y="28" width="16" height="24" rx="4" className="fill-cyan-500/25" />
            <path d="M100 28 C100 28 110 42 110 49 A10 10 0 0 1 90 49 C90 42 100 28 100 28 Z" className="fill-cyan-400/25" />
          </svg>
        );
      case 'solar_power':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="96" cy="20" r="9" className="fill-amber-400/25" />
            <polygon points="18,52 68,26 84,38 34,64" className="fill-cyan-500/20" stroke="#38bdf8" />
            <line x1="51" y1="54" x2="51" y2="70" stroke="#94a3b8" />
            <line x1="36" y1="70" x2="66" y2="70" stroke="#94a3b8" />
          </svg>
        );
      case 'growing_plants':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="24" y="54" width="72" height="14" rx="4" className="fill-slate-800" stroke="#64748b" />
            <path d="M60 54 V24" />
            <path d="M60 40 C46 38 40 28 46 22 C54 22 60 30 60 40 Z" className="fill-emerald-400/25" />
            <path d="M60 34 C74 32 80 22 74 16 C66 16 60 24 60 34 Z" className="fill-emerald-400/25" />
          </svg>
        );
      case 'radiation_protection':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 58 C22 30 98 30 98 58 Z" className="fill-slate-700/40" stroke="#94a3b8" />
            <path d="M60 38 L72 44 V53 C72 60 60 66 60 66 C60 66 48 60 48 53 V44 Z" className="fill-purple-500/25" />
          </svg>
        );
      case 'crew_health_osdr':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 42 H36 L46 22 L58 60 L70 34 L78 42 H104" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'real_nasa_missions':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="60" cy="44" r="22" className="fill-slate-700/30" stroke="#94a3b8" />
            <ellipse cx="60" cy="40" rx="44" ry="14" transform="rotate(-18 60 40)" strokeDasharray="4 3" />
          </svg>
        );
      case 'spaceflight_history':
        return (
          <svg viewBox="0 0 120 80" className="w-24 h-16 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M60 14 L70 36 L94 40 L76 56 L80 76 L60 65 L40 76 L44 56 L26 40 L50 36 Z" className="fill-amber-400/15" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Science Library</h2>
              <p className="text-xs text-slate-400">Clear, kid-friendly space science &amp; verified NASA links</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            aria-label="Close Science Library"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 p-6 overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {SCIENCE_CATEGORIES.map((cat) => {
              const isSelected = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    audioSystem.playClick();
                    setSelectedCategory(cat.id);
                    setExpandedMore(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:text-white font-medium'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span className="text-xs sm:text-sm">{cat.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="md:col-span-2 rounded-2xl bg-slate-950/75 border border-slate-800 p-6 flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-cyan-400">
                    {topic.categoryLabel} · {topic.relatedEquipment}
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                    {topic.title}
                  </h3>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 flex items-center justify-center shrink-0">
                  {renderEquipmentIllustration(topic.category)}
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">
                {topic.briefExplanation}
              </p>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-amber-300">Key Fact</span>
                  <p className="text-sm text-slate-100 mt-0.5">{topic.interestingFact}</p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    audioSystem.playClick();
                    setExpandedMore(!expandedMore);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                >
                  {expandedMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{expandedMore ? 'Hide Extra Details' : 'Read More Details'}</span>
                </button>

                {expandedMore && (
                  <p className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 leading-relaxed">
                    {topic.learnMoreDetails}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">{topic.nasaReference.source}</span>
                <a
                  href={topic.nasaReference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5 shrink-0"
                >
                  <span>Open NASA Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              {topic.secondaryReference && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400">{topic.secondaryReference.source}</span>
                  <a
                    href={topic.secondaryReference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open NASA Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
