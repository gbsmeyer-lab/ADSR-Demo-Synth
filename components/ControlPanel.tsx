
import React from 'react';
import { SynthState, Waveform } from '../types';

interface Props {
  state: SynthState;
  onChange: (newState: SynthState) => void;
}

// Extracted Slider component
const Slider = React.memo(({ label, value, min, max, step = 0.01, onChangeValue, unit = '' }: any) => (
  <div className="flex flex-col w-full mb-1.5">
    <div className="flex justify-between items-end mb-0.5">
      <label className="text-[9px] uppercase font-bold text-slate-400 tracking-wider select-none">{label}</label>
      <span className="text-[9px] font-mono text-cyan-200 select-none">{value.toFixed(2)}{unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChangeValue(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 
        [&::-webkit-slider-thumb]:hover:bg-cyan-400 [&::-webkit-slider-thumb]:transition-colors
        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:border-0
        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-cyan-500"
    />
  </div>
));

const ControlPanel: React.FC<Props> = ({ state, onChange }) => {

  const updateADSR = (key: keyof SynthState['adsr'], value: number) => {
    onChange({ ...state, adsr: { ...state.adsr, [key]: value } });
  };

  const updateFilter = (key: keyof SynthState['filter'], value: number) => {
    onChange({ ...state, filter: { ...state.filter, [key]: value } });
  };

  const updateLFO = (key: keyof SynthState['lfo'], value: any) => {
    onChange({ ...state, lfo: { ...state.lfo, [key]: value } });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      
      {/* Section: Envelope */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 shadow-md backdrop-blur-sm">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1 select-none">Envelope</h3>
        <div className="flex flex-col gap-0.5">
          <Slider label="Attack" value={state.adsr.attack} min={0} max={2} onChangeValue={(v:number) => updateADSR('attack', v)} unit="s" />
          <Slider label="Decay" value={state.adsr.decay} min={0} max={2} onChangeValue={(v:number) => updateADSR('decay', v)} unit="s" />
          <Slider label="Sustain" value={state.adsr.sustain} min={0} max={1} onChangeValue={(v:number) => updateADSR('sustain', v)} />
          <Slider label="Release" value={state.adsr.release} min={0} max={4} onChangeValue={(v:number) => updateADSR('release', v)} unit="s" />
        </div>
      </div>

      {/* Section: Filter & Tone */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 shadow-md backdrop-blur-sm flex flex-col">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-1 select-none">Timbre & Filter</h3>
        
        {/* Waveform Selector */}
        <div className="flex justify-between items-center bg-slate-800 p-1 rounded-md mb-4">
            {Object.values(Waveform).map(w => (
                <button 
                    key={w}
                    onClick={() => onChange({ ...state, waveform: w })}
                    className={`flex-1 py-1 text-[9px] uppercase font-bold rounded transition-all select-none ${state.waveform === w ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {w.slice(0,3)}
                </button>
            ))}
        </div>
        
        <div className="flex flex-col gap-0.5 flex-1">
            <Slider label="Cutoff" value={state.filter.cutoff} min={20} max={10000} step={1} onChangeValue={(v:number) => updateFilter('cutoff', v)} unit="Hz" />
            <Slider label="Resonance" value={state.filter.resonance} min={0} max={20} onChangeValue={(v:number) => updateFilter('resonance', v)} />
        </div>
      </div>

      {/* Section: LFO */}
      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50 shadow-md backdrop-blur-sm flex flex-col">
        <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider select-none">LFO</h3>
            <button 
                onClick={() => updateLFO('active', !state.lfo.active)}
                className={`w-7 h-3.5 rounded-full relative transition-colors ${state.lfo.active ? 'bg-green-500' : 'bg-slate-700'}`}
                title="LFO Toggle"
            >
                <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${state.lfo.active ? 'translate-x-3.5' : 'translate-x-0'}`} />
            </button>
        </div>
        <div className={`flex flex-col gap-0.5 transition-opacity flex-1 ${state.lfo.active ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <Slider label="Rate" value={state.lfo.rate} min={0.1} max={20} onChangeValue={(v:number) => updateLFO('rate', v)} unit="Hz" />
          <Slider label="Depth" value={state.lfo.depth} min={0} max={1} onChangeValue={(v:number) => updateLFO('depth', v)} />
        </div>
        
        <div className="mt-3 pt-2 border-t border-slate-800">
             <Slider label="Master Volume" value={state.volume} min={0} max={1} onChangeValue={(v:number) => onChange({ ...state, volume: v })} />
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
