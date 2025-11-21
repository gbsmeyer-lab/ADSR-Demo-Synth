export enum Waveform {
  Sine = 'sine',
  Square = 'square',
  Sawtooth = 'sawtooth',
  Triangle = 'triangle',
}

export interface ADSRState {
  attack: number;  // 0 to 2 seconds
  decay: number;   // 0 to 2 seconds
  sustain: number; // 0 to 1 (amplitude)
  release: number; // 0 to 5 seconds
}

export interface FilterState {
  cutoff: number; // Frequency in Hz
  resonance: number; // Q factor
}

export interface LFOState {
  rate: number; // Hz
  depth: number; // Amount
  active: boolean;
}

export interface SynthState {
  waveform: Waveform;
  adsr: ADSRState;
  filter: FilterState;
  lfo: LFOState;
  volume: number;
}