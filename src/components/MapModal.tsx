import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Navigation,
  X,
  Rocket,
  Home,
  Wind,
  Sun,
  BatteryCharging,
  Droplets,
  Sprout,
  Shield,
  Radio,
  Compass,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { BASE_EQUIPMENT } from '../data/equipment';
import { EquipmentId, MissionObjective } from '../types/game';
import { audioSystem } from '../game/AudioSystem';
import { NasaDataService, LunarSurfaceData, FALLBACK_LUNAR_SURFACE } from '../services/nasaDataService';

interface MapModalProps {
  astronautPos: [number, number, number];
  currentObjective: MissionObjective | null;
  currentShift: number;
  solarCleanliness: number;
  waterFilterSolved: boolean;
  shelterLockedDown: boolean;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  astronautPos,
  currentObjective,
  currentShift,
  solarCleanliness,
  waterFilterSolved,
  shelterLockedDown,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'outpost' | 'nasa_south_pole'>('outpost');
  const [surfaceData, setSurfaceData] = useState<LunarSurfaceData>(FALLBACK_LUNAR_SURFACE);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    NasaDataService.getLunarSurfaceData().then((data) => {
      setSurfaceData(data);
    });
  }, []);

  const worldToPercent = (x: number, z: number) => {
    const px = 50 + (x / 40) * 39;
    const py = 50 + (z / 40) * 39;
    return {
      left: `${Math.max(6, Math.min(94, px))}%`,
      top: `${Math.max(6, Math.min(94, py))}%`,
    };
  };

  const getEquipmentStatusLabel = (id: EquipmentId) => {
    if (id === 'solar_array') {
      return solarCleanliness >= 100 ? 'Working normally' : 'Needs cleaning';
    }
    if (id === 'water_recovery') {
      return waterFilterSolved ? 'Working normally' : 'Needs attention';
    }
    if (id === 'radiation_shelter') {
      return shelterLockedDown ? 'Secured' : 'Ready';
    }
    if (id === currentObjective?.targetEquipment) {
      return 'Active task';
    }
    if (id === 'missing_spaceship') {
      return currentShift > 7 ? 'Located' : 'Awaiting beacon';
    }
    return 'Working normally';
  };

  const getIcon = (id: EquipmentId) => {
    switch (id) {
      case 'lander':
        return <Rocket className="w-3.5 h-3.5 text-amber-400" />;
      case 'habitat':
        return <Home className="w-3.5 h-3.5 text-cyan-400" />;
      case 'life_support':
        return <Wind className="w-3.5 h-3.5 text-cyan-400" />;
      case 'solar_array':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'power_station':
        return <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />;
      case 'water_recovery':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'greenhouse':
        return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
      case 'radiation_shelter':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'antenna':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      case 'missing_spaceship':
        return <Rocket className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const playerStyle = worldToPercent(astronautPos[0], astronautPos[2]);
  const instruments = [
    surfaceData.instruments.lola,
    surfaceData.instruments.lroc,
    surfaceData.instruments.diviner,
    surfaceData.instruments.lend,
    surfaceData.instruments.crater,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <MapIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Outpost Map &amp; Real Lunar Data</h2>
              <p className="text-xs text-slate-400">
                Stage {Math.min(7, currentShift)} of 7 · Walk toward the highlighted target station
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
              <button
                onClick={() => {
                  audioSystem.playClick();
                  setViewMode('outpost');
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  viewMode === 'outpost' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Asteria Outpost Map
              </button>
              <button
                onClick={() => {
                  audioSystem.playClick();
                  setViewMode('nasa_south_pole');
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  viewMode === 'nasa_south_pole' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                NASA LRO &amp; Moon Trek
              </button>
            </div>

            <button
              onClick={() => {
                audioSystem.playClick();
                onClose();
              }}
              aria-label="Close Map"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'outpost' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 p-6 overflow-y-auto">
            <div className="lg:col-span-3 relative aspect-square w-full max-h-[460px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[82%] h-[82%] rounded-full border border-slate-800/80" />
                <div className="w-[54%] h-[54%] rounded-full border border-slate-800/60" />
                <div className="w-[26%] h-[26%] rounded-full border border-slate-800/50" />
              </div>

              <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-slate-500">N</span>
              <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-slate-500">S</span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-500">W</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-slate-500">E</span>

              {BASE_EQUIPMENT.map((eq) => {
                const pos = worldToPercent(eq.position[0], eq.position[2]);
                const isTarget = currentObjective?.targetEquipment === eq.id;
                return (
                  <div
                    key={eq.id}
                    style={pos}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-md transition ${
                        isTarget
                          ? 'bg-cyan-500/25 border-cyan-400 ring-2 ring-cyan-400/50'
                          : 'bg-slate-900/95 border-slate-700'
                      }`}
                      title={eq.name}
                    >
                      {getIcon(eq.id)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${
                        isTarget ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950/85 text-slate-300'
                      }`}
                    >
                      {eq.name}
                    </span>
                  </div>
                );
              })}

              <div
                style={playerStyle}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center">
                  <Navigation className="w-2.5 h-2.5 text-slate-950" />
                </div>
                <span className="mt-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 rounded">
                  You
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Outpost Stations
              </h3>
              {BASE_EQUIPMENT.map((eq) => {
                const isTarget = currentObjective?.targetEquipment === eq.id;
                const statusText = getEquipmentStatusLabel(eq.id);
                return (
                  <div
                    key={eq.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isTarget
                        ? 'bg-cyan-500/10 border-cyan-400/60'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        {getIcon(eq.id)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{eq.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{eq.description}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        statusText === 'Active task'
                          ? 'text-cyan-300'
                          : statusText === 'Needs cleaning' || statusText === 'Needs attention'
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/35 flex flex-col gap-1.5 text-xs">
              <div className="font-bold text-cyan-300">{surfaceData.region}</div>
              <div className="font-mono text-slate-200">{surfaceData.coordinates}</div>
              <p className="text-slate-300 leading-relaxed">{surfaceData.fictionalDisclaimer}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-1 rounded-xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>NASA JPL Moon Trek WMTS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    South Polar Summer Illumination Layer ({surfaceData.moonTrekWMTS.status === 'verified' ? 'WMTS Verified' : 'Reference Layer'})
                  </p>
                </div>

                {!tileError ? (
                  <img
                    src={surfaceData.moonTrekWMTS.verifiedSampleTile}
                    alt="NASA Moon Trek South Pole WAC Illumination Tile"
                    referrerPolicy="no-referrer"
                    onError={() => setTileError(true)}
                    className="w-full aspect-square object-cover rounded-lg border border-slate-700 bg-slate-900"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg border border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 gap-2">
                    <Compass className="w-6 h-6 text-cyan-400" />
                    <span>Moon Trek WMTS Tile Preview Offline — Open Capabilities Link Below</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 text-[11px]">
                  <a
                    href={surfaceData.moonTrekWMTS.apiDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Moon Trek WMTS API Docs <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={surfaceData.lroOverviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    NASA LRO Science &amp; Data <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {instruments.map((inst) => (
                  <div
                    key={inst.instrument}
                    className="p-3.5 rounded-xl bg-slate-950/75 border border-slate-800 flex flex-col justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{inst.instrument}</div>
                      <div className="text-[11px] text-cyan-300 font-medium mt-0.5">{inst.observation}</div>
                      <p className="text-slate-300 mt-1.5 leading-relaxed">{inst.findings}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-800">
                      Product: {inst.dataProduct}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
