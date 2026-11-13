import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Music,
  Zap,
  Waves,
  Camera,
  RotateCcw,
  Trash2,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { audioSystem } from '../game/AudioSystem';
import { narrationSystem } from '../game/NarrationSystem';
import { SaveSystem } from '../game/SaveSystem';

interface SettingsModalProps {
  onClose: () => void;
  onResetSave: () => void;
  cameraSettings: {
    sensitivity: number;
    invertY: boolean;
    distance: number;
  };
  onUpdateCameraSettings: (next: {
    sensitivity?: number;
    invertY?: boolean;
    distance?: number;
    reset?: boolean;
  }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onResetSave,
  cameraSettings,
  onUpdateCameraSettings,
}) => {
  const [masterVol, setMasterVol] = useState(audioSystem.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(audioSystem.isMusicEnabled());
  const [musicVol, setMusicVol] = useState(audioSystem.getMusicVolume());
  const [sfxEnabled, setSfxEnabled] = useState(audioSystem.isSfxEnabled());
  const [sfxVol, setSfxVol] = useState(audioSystem.getSfxVolume());
  const [ambientEnabled, setAmbientEnabled] = useState(audioSystem.isAmbientEnabled());
  const [ambientVol, setAmbientVol] = useState(audioSystem.getAmbientVolume());
  const [voiceEnabled, setVoiceEnabled] = useState(narrationSystem.getEnabled());

  const [confirmClear, setConfirmClear] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const handleMasterChange = (val: number) => {
    setMasterVol(val);
    audioSystem.setVolume(val);
  };

  const handleMusicToggle = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    audioSystem.setMusicEnabled(next);
    audioSystem.playClick();
  };

  const handleMusicVolChange = (val: number) => {
    setMusicVol(val);
    audioSystem.setMusicVolume(val);
  };

  const handleSfxToggle = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    audioSystem.setSfxEnabled(next);
    if (next) audioSystem.playClick();
  };

  const handleSfxVolChange = (val: number) => {
    setSfxVol(val);
    audioSystem.setSfxVolume(val);
  };

  const handleAmbientToggle = () => {
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    audioSystem.setAmbientEnabled(next);
    audioSystem.playClick();
  };

  const handleAmbientVolChange = (val: number) => {
    setAmbientVol(val);
    audioSystem.setAmbientVolume(val);
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    narrationSystem.setEnabled(next);
    audioSystem.playClick();
  };

  const handleClearProgress = () => {
    if (confirmClear) {
      SaveSystem.clear();
      onResetSave();
      onClose();
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm select-none">
      <aside className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-700/80 shadow-2xl text-slate-100 flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Settings</h2>
              <p className="text-xs text-slate-400">Audio, camera, and saved data</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            aria-label="Close Settings"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* SECTION 1: AUDIO CONTROLS */}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Audio Controls</h3>

            {/* Master Volume */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  Master Volume
                </span>
                <span className="text-xs font-mono tabular-nums text-cyan-300">
                  {Math.round(masterVol * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVol}
                onChange={(e) => handleMasterChange(Number(e.target.value))}
                className="accent-cyan-400 w-full cursor-pointer"
              />
            </div>

            {/* Background Music */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  Background Music
                </span>
                <button
                  onClick={handleMusicToggle}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    musicEnabled
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {musicEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{musicEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>
              {musicEnabled && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVol}
                    onChange={(e) => handleMusicVolChange(Number(e.target.value))}
                    className="accent-purple-400 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-300 w-9 text-right">
                    {Math.round(musicVol * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Sound Effects */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Sound Effects
                </span>
                <button
                  onClick={handleSfxToggle}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    sfxEnabled
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{sfxEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>
              {sfxEnabled && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVol}
                    onChange={(e) => handleSfxVolChange(Number(e.target.value))}
                    className="accent-amber-400 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-300 w-9 text-right">
                    {Math.round(sfxVol * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Ambient Audio */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Waves className="w-4 h-4 text-emerald-400" />
                  Ambient Audio
                </span>
                <button
                  onClick={handleAmbientToggle}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    ambientEnabled
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {ambientEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{ambientEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>
              {ambientEnabled && (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVol}
                    onChange={(e) => handleAmbientVolChange(Number(e.target.value))}
                    className="accent-emerald-400 w-full cursor-pointer"
                  />
                  <span className="text-xs font-mono tabular-nums text-slate-300 w-9 text-right">
                    {Math.round(ambientVol * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Crew Voice Reader */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Crew Voice Reader</span>
                <span className="text-xs text-slate-400">Reads Nia &amp; Leo dialogue aloud</span>
              </div>
              <button
                onClick={handleVoiceToggle}
                className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  voiceEnabled
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {voiceEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </section>

          {/* SECTION 2: CAMERA CONTROLS */}
          <section className="flex flex-col gap-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5" /> Camera Controls
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-4">
              {/* Mouse Sensitivity */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Mouse Sensitivity</span>
                  <span className="text-xs font-mono tabular-nums text-cyan-300">
                    {cameraSettings.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={cameraSettings.sensitivity}
                  onChange={(e) => onUpdateCameraSettings({ sensitivity: Number(e.target.value) })}
                  className="accent-cyan-400 w-full cursor-pointer"
                />
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: 'Low', val: 0.5 },
                    { label: 'Medium', val: 1.0 },
                    { label: 'High', val: 2.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        audioSystem.playClick();
                        onUpdateCameraSettings({ sensitivity: preset.val });
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        Math.abs(cameraSettings.sensitivity - preset.val) < 0.05
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invert Vertical Look */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Invert Vertical Look</span>
                  <span className="text-xs text-slate-400">Flip up/down mouse camera motion</span>
                </div>
                <button
                  onClick={() => {
                    audioSystem.playClick();
                    onUpdateCameraSettings({ invertY: !cameraSettings.invertY });
                  }}
                  className={`px-3 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    cameraSettings.invertY
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {cameraSettings.invertY ? 'On' : 'Off'}
                </button>
              </div>

              {/* Zoom Distance */}
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Camera Distance (Zoom)</span>
                  <span className="text-xs font-mono tabular-nums text-cyan-300">
                    {cameraSettings.distance.toFixed(1)} m
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="14.0"
                  step="0.5"
                  value={cameraSettings.distance}
                  onChange={(e) => onUpdateCameraSettings({ distance: Number(e.target.value) })}
                  className="accent-cyan-400 w-full cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  audioSystem.playClick();
                  onUpdateCameraSettings({ reset: true });
                }}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Camera View
              </button>
            </div>
          </section>

          {/* SECTION 3: SAVED PROGRESS & CREDITS */}
          <section className="flex flex-col gap-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Save Data &amp; Sources</h3>

            <button
              onClick={handleClearProgress}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                confirmClear
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-slate-950/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmClear ? 'Click Again to Reset Save Data' : 'Reset Saved Progress'}
            </button>

            <button
              onClick={() => setShowCredits(!showCredits)}
              className="py-2.5 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition cursor-pointer"
            >
              <span>NASA Scientific Data &amp; Sources</span>
              <span className="text-cyan-400">{showCredits ? 'Hide' : 'Show'}</span>
            </button>

            {showCredits && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col gap-2.5 leading-relaxed">
                <p>
                  LunaBase: First Light is an educational training game. Outpost structures and scores are simulated, while space science is informed by real NASA data:
                </p>
                <a
                  href="https://ccmc.gsfc.nasa.gov/DONKI/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  NASA CCMC DONKI Space Weather <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-480"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  NASA OSDR Space Biology Archive (OSD-480) <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://trek.nasa.gov/moon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  NASA LRO &amp; Moon Trek <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 shrink-0 flex justify-end">
          <button
            onClick={() => {
              audioSystem.playClick();
              onClose();
            }}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" /> Save &amp; Close
          </button>
        </div>
      </aside>
    </div>
  );
};
