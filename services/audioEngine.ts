import { SynthState, Waveform } from '../types';

interface ActiveVoice {
  osc: OscillatorNode;
  gain: GainNode;
  filter: BiquadFilterNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
  startTime: number; // Track when the note started
}

export class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private analyser: AnalyserNode;
  private activeVoices: Map<string, ActiveVoice> = new Map();

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.3; // Default master volume
    
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  public resumeContext() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public triggerAttack(note: string, frequency: number, state: SynthState) {
    this.resumeContext();

    // If voice exists, stop it first (retrigger)
    if (this.activeVoices.has(note)) {
      this.triggerRelease(note, state);
    }

    const t = this.ctx.currentTime;
    const { adsr, filter, lfo, waveform } = state;

    // 1. Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = waveform;
    osc.frequency.setValueAtTime(frequency, t);

    // 2. Filter (VCF)
    const biquadFilter = this.ctx.createBiquadFilter();
    biquadFilter.type = 'lowpass';
    biquadFilter.Q.value = filter.resonance;
    biquadFilter.frequency.setValueAtTime(filter.cutoff, t);

    // 3. Amplifier (VCA - ADSR applies here)
    const vca = this.ctx.createGain();
    vca.gain.setValueAtTime(0, t);
    
    // Attack
    vca.gain.linearRampToValueAtTime(1.0, t + adsr.attack);
    
    // Decay to Sustain
    // Ensure minimal duration for math safety
    const decayDuration = Math.max(0.01, adsr.decay);
    const sustainLevel = Math.max(0.0001, adsr.sustain); 
    vca.gain.exponentialRampToValueAtTime(sustainLevel, t + adsr.attack + decayDuration);

    // 4. LFO (Modulates Filter Cutoff)
    let lfoOsc: OscillatorNode | undefined;
    let lfoGain: GainNode | undefined;

    if (lfo.active && lfo.depth > 0) {
      lfoOsc = this.ctx.createOscillator();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.value = lfo.rate;

      lfoGain = this.ctx.createGain();
      lfoGain.gain.value = lfo.depth * 500; // Scale depth to Hz

      lfoOsc.connect(lfoGain);
      lfoGain.connect(biquadFilter.frequency);
      lfoOsc.start(t);
    }

    // Connections: Osc -> Filter -> VCA -> Master
    osc.connect(biquadFilter);
    biquadFilter.connect(vca);
    vca.connect(this.masterGain);

    osc.start(t);

    this.activeVoices.set(note, {
      osc,
      gain: vca,
      filter: biquadFilter,
      lfo: lfoOsc,
      lfoGain,
      startTime: t
    });
  }

  public triggerRelease(note: string, state: SynthState) {
    const voice = this.activeVoices.get(note);
    if (!voice) return;

    const t = this.ctx.currentTime;
    const { adsr } = state;
    
    // Calculate minimal lifecycle (Attack + Decay)
    // To ensure the envelope is "run through completely", we wait for A+D to finish.
    const minDuration = adsr.attack + adsr.decay;
    const timeSinceStart = t - voice.startTime;
    
    // Determine effective release start time
    // If key is released early, we defer the release until after Attack + Decay
    const releaseStart = (timeSinceStart < minDuration) 
      ? voice.startTime + minDuration 
      : t;

    const releaseDuration = Math.max(0.01, adsr.release);

    if (timeSinceStart >= minDuration) {
        // Standard behavior: We are in Sustain phase (or later), so we release from current value
        voice.gain.gain.cancelScheduledValues(t);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, t);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, t + releaseDuration);
    } else {
        // Early release: We let the already scheduled Attack & Decay play out.
        // We just assume the volume will be at Sustain Level at `releaseStart` time.
        // We schedule the release ramp starting from that future point.
        // Note: No cancelScheduledValues here, to preserve the A/D curve!
        
        // Ensure sustain level is captured for the start of release ramp
        const sustainLevel = Math.max(0.0001, adsr.sustain);
        voice.gain.gain.setValueAtTime(sustainLevel, releaseStart);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, releaseStart + releaseDuration);
    }

    // Stop oscillators
    voice.osc.stop(releaseStart + releaseDuration + 0.1);
    if (voice.lfo) {
      voice.lfo.stop(releaseStart + releaseDuration + 0.1);
    }

    // Cleanup map
    setTimeout(() => {
       if(this.activeVoices.get(note) === voice) {
         voice.osc.disconnect();
         voice.gain.disconnect();
         voice.filter.disconnect();
         this.activeVoices.delete(note);
       }
    }, (releaseStart - t + releaseDuration + 0.2) * 1000);
  }

  public setMasterVolume(val: number) {
    this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
  }
}