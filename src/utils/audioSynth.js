// Procedural audio synthesizer using native Web Audio API
// This avoids loading external audio assets and guarantees reliable sound effects.

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.humNode = null;
    this.analysisNode = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    if (mute) {
      this.stopHum();
      this.stopAnalysisHum();
    }
  }

  // A dual-oscillator mechanical click sound
  playClick() {
    if (this.isMuted) return;
    this.init();

    const t = this.ctx.currentTime;
    
    // High click component
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2500, t);
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.02);
    
    gain1.gain.setValueAtTime(0.3, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    
    // Mid/Thud click component
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(80, t + 0.04);
    
    gain2.gain.setValueAtTime(0.4, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.05);
    
    osc2.start(t);
    osc2.stop(t + 0.05);
  }

  // Low hum for recording mode
  startHum() {
    if (this.isMuted) return;
    this.init();
    if (this.humNode) return; // already running

    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(85, t); // 85Hz hum
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, t);

    // LFO for subtle tremolo
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(3, t); // 3Hz modulation
    lfoGain.gain.setValueAtTime(0.03, t);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.5); // Fade-in hum

    // Connect LFO to gain
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);

    this.humNode = { osc, lfo, gain };
  }

  stopHum() {
    if (!this.humNode) return;
    const t = this.ctx.currentTime;
    const { osc, lfo, gain } = this.humNode;
    
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2); // Smooth fade-out
      
      setTimeout(() => {
        try {
          osc.stop();
          lfo.stop();
        } catch(e){}
      }, 300);
    } catch(e) {}
    
    this.humNode = null;
  }

  // Futuristic compute sound with sweeps and high-frequency beeps
  startAnalysisHum() {
    if (this.isMuted) return;
    this.init();
    if (this.analysisNode) return;

    const t = this.ctx.currentTime;
    
    // Core low hum
    const oscMain = this.ctx.createOscillator();
    const gainMain = this.ctx.createGain();
    oscMain.type = 'triangle';
    oscMain.frequency.setValueAtTime(110, t);
    gainMain.gain.setValueAtTime(0.1, t);
    
    // Sweep oscillator
    const oscSweep = this.ctx.createOscillator();
    const gainSweep = this.ctx.createGain();
    oscSweep.type = 'sine';
    oscSweep.frequency.setValueAtTime(220, t);
    oscSweep.frequency.setValueAtTime(150, t);
    
    gainSweep.gain.setValueAtTime(0.05, t);

    const mainGainNode = this.ctx.createGain();
    mainGainNode.gain.setValueAtTime(0, t);
    mainGainNode.gain.linearRampToValueAtTime(0.15, t + 0.5);

    oscMain.connect(gainMain);
    gainMain.connect(mainGainNode);
    
    oscSweep.connect(gainSweep);
    gainSweep.connect(mainGainNode);

    mainGainNode.connect(this.ctx.destination);

    oscMain.start(t);
    oscSweep.start(t);

    const sweepInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.analysisNode) {
        clearInterval(sweepInterval);
        return;
      }
      const now = this.ctx.currentTime;
      try {
        oscSweep.frequency.cancelScheduledValues(now);
        oscSweep.frequency.setValueAtTime(oscSweep.frequency.value, now);
        oscSweep.frequency.exponentialRampToValueAtTime(100 + Math.random() * 400, now + 0.8);
      } catch(e) {}
    }, 1000);

    this.analysisNode = { oscMain, oscSweep, mainGainNode, interval: sweepInterval };
  }

  stopAnalysisHum() {
    if (!this.analysisNode) return;
    const t = this.ctx.currentTime;
    const { oscMain, oscSweep, mainGainNode, interval } = this.analysisNode;
    
    clearInterval(interval);
    
    try {
      mainGainNode.gain.cancelScheduledValues(t);
      mainGainNode.gain.setValueAtTime(mainGainNode.gain.value, t);
      mainGainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      setTimeout(() => {
        try {
          oscMain.stop();
          oscSweep.stop();
        } catch(e) {}
      }, 300);
    } catch(e) {}

    this.analysisNode = null;
  }

  // Futuristic clean chime (major arpeggio C5 -> E5 -> G5 -> C6)
  playChime() {
    if (this.isMuted) return;
    this.init();

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const t = now + index * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 1.0);
    });
  }
}

export const synth = new AudioSynth();
