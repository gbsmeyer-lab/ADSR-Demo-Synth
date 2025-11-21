
import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from './services/audioEngine';
import { SynthState, Waveform } from './types';
import { KEYS } from './constants';
import ControlPanel from './components/ControlPanel';
import EnvelopeGraph from './components/EnvelopeGraph';
import Oscilloscope from './components/Oscilloscope';
import DiscoOverlay from './components/DiscoOverlay';

const App: React.FC = () => {
  const engine = useRef<AudioEngine | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [isDisco, setIsDisco] = useState(false);
  
  // Gate state for visuals
  const [gate, setGate] = useState<{
    state: 'open' | 'closed';
    lastTriggerTime: number;
    lastReleaseTime: number;
  }>({
    state: 'closed',
    lastTriggerTime: 0,
    lastReleaseTime: 0
  });
  
  const [state, setState] = useState<SynthState>({
    waveform: Waveform.Sawtooth,
    adsr: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.5,
      release: 0.8
    },
    filter: {
      cutoff: 2000,
      resonance: 5,
    },
    lfo: {
      active: false,
      rate: 4,
      depth: 0.5
    },
    volume: 0.3
  });

  // Ref to hold current state for event handlers to access without re-binding
  const stateRef = useRef(state);

  // Initialize Audio Engine
  useEffect(() => {
    if (!engine.current) {
      engine.current = new AudioEngine();
      setAnalyser(engine.current.getAnalyser());
    }
  }, []);

  // Sync state ref and update engine parameters
  useEffect(() => {
    stateRef.current = state;
    if (engine.current) {
      engine.current.setMasterVolume(state.volume);
    }
  }, [state]);

  // Monitor active notes to toggle gate visual
  useEffect(() => {
    if (activeNotes.length > 0 && gate.state === 'closed') {
        setGate(prev => ({ ...prev, state: 'open', lastTriggerTime: Date.now() }));
    } else if (activeNotes.length === 0 && gate.state === 'open') {
        setGate(prev => ({ ...prev, state: 'closed', lastReleaseTime: Date.now() }));
    }
    // Note: Retrigger logic could be added here if desired (e.g. if new note added, reset trigger time)
    // For simple ADSR, usually gate stays open as long as at least one key is held.
    // If we want to re-trigger animation on every new note even if gate is open:
    if (activeNotes.length > 0) {
       // Optional: Uncomment to re-trigger attack animation on every new key press (legato retrigger)
       setGate(prev => ({ ...prev, state: 'open', lastTriggerTime: Date.now() }));
    }
  }, [activeNotes]);

  // Keyboard Handlers - optimized to run once and use ref
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const freq = KEYS[key];
      
      if (freq && engine.current) {
        engine.current.triggerAttack(key, freq, stateRef.current);
        setActiveNotes(prev => [...prev, key]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEYS[key] && engine.current) {
        engine.current.triggerRelease(key, stateRef.current);
        setActiveNotes(prev => prev.filter(k => k !== key));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-1000 ${isDisco ? 'bg-black' : 'bg-slate-950'}`}>
      
      <DiscoOverlay active={isDisco} />

      <main className="w-full max-w-6xl flex flex-col gap-6 relative z-10">
        
        {/* Header with prominent Disco Button */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400 select-none">
              ADSR Hüllkurve
            </h1>
            <p className="text-slate-500 text-sm font-mono mt-1 select-none">
              Am Beispiel eines Synthesizers
            </p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:block text-right">
                 <div className="text-xs text-slate-400 font-mono mb-1 select-none">MASTER OUTPUT</div>
                 <div className={`text-xs font-bold select-none ${activeNotes.length > 0 ? "text-green-400 animate-pulse" : "text-slate-600"}`}>
                    {activeNotes.length > 0 ? "SIGNAL ACTIVE" : "STANDBY"}
                 </div>
             </div>
             
             <button 
                onClick={() => setIsDisco(!isDisco)}
                className={`
                    px-5 py-2 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg border-2 select-none
                    ${isDisco 
                        ? 'border-pink-500 bg-pink-600 text-white shadow-[0_0_30px_rgba(236,72,153,0.8)] scale-110 rotate-2' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'}
                `}
             >
                {isDisco ? 'DISCO!' : 'Disco?'}
             </button>
          </div>
        </header>

        {/* Top Section: Visuals - Increased height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-80">
            {/* ADSR Graph (Magenta) */}
            <div className="flex flex-col h-full">
                <EnvelopeGraph adsr={state.adsr} gate={gate} />
            </div>

            {/* Oscilloscope (Expanded) */}
            <div className="flex flex-col h-full">
                <Oscilloscope analyser={analyser} color={isDisco ? "#ffff00" : "#22d3ee"} />
            </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-950 rounded-2xl p-1 mt-2">
            <ControlPanel state={state} onChange={setState} />
        </div>

        <footer className="text-center text-slate-700 text-xs font-mono select-none">
            Use your computer keyboard to play the synthesizer.
        </footer>
      </main>
    </div>
  );
};

export default App;
