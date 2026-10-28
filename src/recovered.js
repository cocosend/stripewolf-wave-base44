// Recovered application logic from the user-owned Base44 deployment, 2026-10-24.
// Third-party runtime code excluded; resolved through package.json.
import * as _ from 'react';
import * as L from 'react/jsx-runtime';
import { NavLink as $s, Outlet as us, useNavigate as Ro } from 'react-router-dom';
import { ResponsiveContainer as hT, BarChart as FK, CartesianGrid as MW, XAxis as YW, YAxis as fG, Tooltip as Xw, Bar as OV } from 'recharts';
import { dataApi as J } from './data';
import { importTrack, importRenderedTrack, resumeAudio } from './audio-import';
import { DemoPicker } from './DemoPicker';
import { WaveMixer } from './WaveMixer';
import {loopBounds,trackPosition as calculateTrackPosition} from './track-loop';
var PRESETS = {
    maddix: {
      name: `HARDWELL & MADDIX RUMBLE`,
      artist: `Maddix / Hardwell`,
      gearUsed: `TR-909 + Virus TI (Supersaw Layer)`,
      filterType: `lowpass`,
      cutoff: 420,
      resonance: 9,
      drive: 750,
      delayTime: .22,
      feedback: .35,
      has909Punch: !0,
      has808Sub: !0,
      has303Acid: !1
    },
    artbat: {
      name: `ARTBAT SPACE ATMOSPHERE`,
      artist: `ARTBAT`,
      gearUsed: `Prophet-6 + Moog Sub 37 + Jupiter-8 Pads`,
      filterType: `lowpass`,
      cutoff: 1400,
      resonance: 2.5,
      drive: 60,
      delayTime: .48,
      feedback: .6,
      has909Punch: !1,
      has808Sub: !0,
      has303Acid: !1
    },
    brejcha: {
      name: `BORIS BREJCHA HIGH-TECH`,
      artist: `Boris Brejcha`,
      gearUsed: `MS-20 (Rubber Bass) + TR-808 Clicks`,
      filterType: `peaking`,
      cutoff: 240,
      resonance: 7,
      drive: 120,
      delayTime: .12,
      feedback: .3,
      has909Punch: !1,
      has808Sub: !1,
      has303Acid: !1
    },
    guetta: {
      name: `FUTURE RAVE HYMNS`,
      artist: `David Guetta`,
      gearUsed: `Roland JP-8000 (Supersaw) + TR-909 Punch`,
      filterType: `lowpass`,
      cutoff: 1800,
      resonance: 3,
      drive: 280,
      delayTime: .33,
      feedback: .4,
      has909Punch: !0,
      has808Sub: !1,
      has303Acid: !1
    },
    kazantip: {
      name: `KAZANTIP RETRO REVOLUTION`,
      artist: `Kazantip`,
      gearUsed: `Nord Lead 2 (Bright Stabs) + TB-303 Acid`,
      filterType: `lowpass`,
      cutoff: 650,
      resonance: 15,
      drive: 400,
      delayTime: .26,
      feedback: .45,
      has909Punch: !0,
      has808Sub: !0,
      has303Acid: !0
    },
    legends: {
      name: `PURE ACID LEGENDS LIVE`,
      artist: `Hawtin / Hardfloor / DJ Pierre`,
      gearUsed: `3x TB-303 Modded (Devil Fish) + TR-606`,
      filterType: `lowpass`,
      cutoff: 350,
      resonance: 28,
      drive: 520,
      delayTime: .3,
      feedback: .5,
      has909Punch: !1,
      has808Sub: !1,
      has303Acid: !0
    },
    modern: {
      name: `MODERN LIVE AGGRESSION`,
      artist: `Charlotte / Reinier / 999999999`,
      gearUsed: `TD-3-MO + Custom Analog Euro Kick`,
      filterType: `lowpass`,
      cutoff: 290,
      resonance: 19,
      drive: 990,
      delayTime: .15,
      feedback: .22,
      has909Punch: !0,
      has808Sub: !0,
      has303Acid: !0
    }
  },
  PRESET_KEYS = Object.keys(PRESETS);
function presetKey(e) {
  return PRESET_KEYS.find(t => PRESETS[t] === e) || `modern`;
}
function safeFilter(e) {
  return {
    cutoff: Math.min(14e3, Math.max(1200, e.cutoff * 6)),
    q: Math.min(.9, .58 + e.resonance / 60)
  };
}
var clamp = (e, t, n) => Math.min(n, Math.max(t, e)),
  hg = e => 300 * (2e4 / 300) ** clamp(e, 0, 1),
  gg = {
    master: .82,
    wet: .18,
    feedback: .16,
    echoSend: .17
  };
function _g(e) {
  let t = clamp(e, 0, 1),
    n = .82;
  return [Math.cos(t * Math.PI / 2) * n, Math.sin(t * Math.PI / 2) * n];
}
function vg(e, t, n) {
  return Math.min(.94, clamp(e, 0, 1) * clamp(t, 0, 1.2) * clamp(n, 0, 2.2) * .86);
}
var yg = 25,
  bg = .12,
  xg = e => 55 * 2 ** (e / 12),
  Sg = [0, 4, 8, 12],
  Cg = [4, 12],
  wg = [2, 6, 10, 14],
  Tg = [7, 15],
  Eg = [6, 14],
  Dg = [0, 10],
  Og = [0, 0, 12, 0, 3, 0, 10, 0, 0, 12, 0, 7, 0, 3, 10, 5],
  kg = [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  SynthGroove = class {
    constructor(e, t) {
      this.engine = e, this.key = t, this.timer = null, this.step = 0, this.nextNoteTime = 0, this.subGain = null, this.subCtx = null;
    }
    get deck() {
      return this.engine.get(this.key);
    }
    get running() {
      return !!this.timer;
    }
    ensureSub() {
      let e = this.engine.ctx,
        t = this.deck;
      !e || !t || this.subGain && this.subCtx === e || (this.subGain = e.createGain(), this.subGain.gain.value = 0, this.subCtx = e, this.subGain.connect(t.gain));
    }
    reset() {
      this.subGain = null, this.subCtx = null;
    }
    setPreset(e) {
      !this.subGain || !this.engine.ctx || this.subGain.gain.setTargetAtTime(e.has808Sub ? .8 : 0, this.engine.ctx.currentTime, .05);
    }
    start() {
      if (this.timer) return;
      let e = this.engine.ctx;
      e && (this.ensureSub(), this.setPreset(this.engine.preset), this.step = 0, this.nextNoteTime = e.currentTime + .09, this.timer = window.setInterval(() => this.schedule(), yg));
    }
    stop() {
      this.timer && window.clearInterval(this.timer), this.timer = null;
    }
    schedule() {
      let e = this.engine.ctx,
        t = this.deck;
      if (!e || !t) return;
      if (e.state !== `running`) {
        this.nextNoteTime = e.currentTime + .08;
        return;
      }
      this.subCtx !== e && this.ensureSub();
      let n = 60 / clamp(t.baseBpm * t.tempoRatio * t.pitch, 60, 200) / 4;
      for (this.nextNoteTime < e.currentTime && (this.nextNoteTime = e.currentTime + .02); this.nextNoteTime < e.currentTime + bg;) this.playStep(this.step, this.nextNoteTime), this.nextNoteTime += n, this.step = (this.step + 1) % 16;
    }
    playStep(e, t) {
      let n = this.engine.preset;
      Sg.includes(e) && this.kick(t, n.has909Punch), Cg.includes(e) && this.snare(t), wg.includes(e) && this.hat(t, !1, 1), Tg.includes(e) && this.hat(t, !1, .4), Eg.includes(e) && this.stab(t, e === 6 ? 8 : 3), n.has808Sub && Dg.includes(e) && this.sub(t), n.has303Acid && this.acid(t, Og[e], kg[e]);
    }
    kick(e, t) {
      let n = this.engine.ctx,
        r = this.deck;
      if (!n || !r) return;
      let i = n.createOscillator(),
        a = n.createGain();
      i.type = `sine`, i.frequency.setValueAtTime(t ? 190 : 140, e), i.frequency.exponentialRampToValueAtTime(t ? 48 : 52, e + (t ? .07 : .14)), a.gain.setValueAtTime(1e-4, e), a.gain.exponentialRampToValueAtTime(vg(1, t ? 1 : .85, 1), e + .006), a.gain.exponentialRampToValueAtTime(1e-4, e + (t ? .36 : .52)), i.connect(a), a.connect(r.filter), i.start(e), i.stop(e + .7);
    }
    snare(e) {
      let t = this.engine.ctx,
        n = this.deck;
      if (!t || !n) return;
      let r = t.createBufferSource(),
        i = t.createBiquadFilter(),
        a = t.createGain();
      r.buffer = this.engine.noiseBuffer, i.type = `highpass`, i.frequency.value = 1500, a.gain.setValueAtTime(.26, e), a.gain.exponentialRampToValueAtTime(1e-4, e + .16), r.connect(i), i.connect(a), a.connect(n.filter), r.start(e), r.stop(e + .2);
    }
    hat(e, t, n) {
      let r = this.engine.ctx,
        i = this.deck;
      if (!r || !i) return;
      let a = r.createBufferSource(),
        o = r.createBiquadFilter(),
        s = r.createGain();
      a.buffer = this.engine.noiseBuffer, o.type = `highpass`, o.frequency.value = 7e3, s.gain.setValueAtTime((t ? .11 : .05) * n, e), s.gain.exponentialRampToValueAtTime(1e-4, e + (t ? .22 : .045)), a.connect(o), o.connect(s), s.connect(i.filter), a.start(e), a.stop(e + .26);
    }
    sub(e) {
      if (!this.subGain) return;
      let t = this.engine.ctx;
      if (!t) return;
      let n = t.createOscillator(),
        r = t.createGain();
      n.type = `sine`, n.frequency.setValueAtTime(85, e), n.frequency.exponentialRampToValueAtTime(38, e + .45), r.gain.setValueAtTime(1e-4, e), r.gain.exponentialRampToValueAtTime(vg(1, .9, 1), e + .02), r.gain.exponentialRampToValueAtTime(1e-4, e + .85), n.connect(r), r.connect(this.subGain), n.start(e), n.stop(e + 1);
    }
    acid(e, t, n) {
      let r = this.engine.ctx,
        i = this.deck;
      if (!r || !i) return;
      let a = this.engine.preset,
        o = r.createOscillator(),
        s = r.createBiquadFilter(),
        c = r.createGain();
      o.type = `sawtooth`, o.frequency.setValueAtTime(xg(t), e), s.type = `lowpass`, s.Q.value = clamp(a.resonance, 1, 30), s.frequency.setValueAtTime(clamp(a.cutoff * (n ? 3.4 : 1.4), 60, 6e3), e), s.frequency.exponentialRampToValueAtTime(clamp(a.cutoff * .5, 50, 6e3), e + .22), c.gain.setValueAtTime(1e-4, e), c.gain.exponentialRampToValueAtTime(n ? .5 : .32, e + .005), c.gain.exponentialRampToValueAtTime(1e-4, e + .24), o.connect(s), s.connect(c), c.connect(i.filter), o.start(e), o.stop(e + .3);
    }
    stab(e, t) {
      let n = this.engine.ctx,
        r = this.deck;
      if (!n || !r) return;
      let i = n.createGain(),
        a = n.createBiquadFilter();
      a.type = `lowpass`, a.frequency.setValueAtTime(4200, e), a.frequency.exponentialRampToValueAtTime(900, e + .2), i.gain.setValueAtTime(1e-4, e), i.gain.exponentialRampToValueAtTime(.06, e + .01), i.gain.exponentialRampToValueAtTime(1e-4, e + .24), [-8, 8, 0].forEach(r => {
        let i = n.createOscillator();
        i.type = `sawtooth`, i.frequency.value = xg(t + 24), i.detune.value = r, i.connect(a), i.start(e), i.stop(e + .28);
      }), a.connect(i), i.connect(r.filter);
    }
  },
  jg = 145,
  StripewolfEngine = class {
    constructor() {
      this.ctx = null, this.noiseBuffer = null, this.deckA = null, this.deckB = null, this.grooves = {
        A: new SynthGroove(this, `A`),
        B: new SynthGroove(this, `B`)
      }, this.masterFilter = null, this.punchEQ = null, this.driveIn = null, this.distNode = null, this.delayNode = null, this.delayWet = null, this.feedbackGain = null, this.masterInput = null, this.dcBlock = null, this.dry = null, this.echoSend = null, this.glue = null, this.masterGain = null, this.driveOut = null, this.limiter = null, this.cueBus = null, this.micGain = null, this.micAnalyser = null, this.micSource = null, this.micStream = null, this.micEnabled = !1, this.micLevel = .6, this.lfo = null, this.lfoGain = null, this.automixTimer = null, this.cueMonitor = !1, this.cueLevel = .7, this.outputDeviceId = ``, this.fxActive = {}, this.preset = PRESETS.modern, this.masterLevel = .8, this.resumePromise = null;
    }
    get(e) {
      return e === `A` ? this.deckA : this.deckB;
    }
    groove(e) {
      return this.grooves[e];
    }
    anyPlaying() {
      return !!(this.deckA && this.deckA.playing || this.deckB && this.deckB.playing);
    }
    init() {
      if (this.ctx && this.ctx.state !== `closed`) return this.ctx;
      let e = window.AudioContext || window.webkitAudioContext;
      if (!e) return null;
      this.releaseGraph();
      let t;
      try {
        t = new e({
          latencyHint: `interactive`
        });
      } catch {
        t = new e();
      }
      return this.ctx = t, this.buildGraph(t), t;
    }
    releaseGraph() {
      this.stopLFO(), this.deckA = null, this.deckB = null, this.masterFilter = null, this.punchEQ = null, this.driveIn = null, this.distNode = null, this.delayNode = null, this.delayWet = null, this.feedbackGain = null, this.masterInput = null, this.dcBlock = null, this.dry = null, this.echoSend = null, this.glue = null, this.masterGain = null, this.driveOut = null, this.limiter = null, this.cueBus = null, this.micGain = null, this.micAnalyser = null, this.micSource = null, this.noiseBuffer = null, this.grooves.A.reset(), this.grooves.B.reset();
    }
    buildGraph(e) {
      let t = () => {
        let t = e.createBiquadFilter();
        t.type = `lowpass`, t.frequency.value = 2e4, t.Q.value = .7;
        let n = e.createBiquadFilter();
        n.type = `lowpass`, n.frequency.value = 2e4, n.Q.value = .7;
        let r = e.createBiquadFilter();
        r.type = `lowshelf`, r.frequency.value = 120;
        let i = e.createBiquadFilter();
        i.type = `peaking`, i.frequency.value = 1e3, i.Q.value = .9;
        let a = e.createBiquadFilter();
        a.type = `highshelf`, a.frequency.value = 3500;
        let o = e.createGain();
        o.gain.value = 0;
        let s = e.createGain();
        s.gain.value = 1;
        let c = e.createGain();
        c.gain.value = 0;
        let l = e.createGain();
        let analyser = e.createAnalyser(); analyser.fftSize = 1024;
        return l.gain.value = 0, t.connect(n), n.connect(r), r.connect(i), i.connect(a), a.connect(o), o.connect(s), o.connect(c), o.connect(l), o.connect(analyser), {
          analyser,
          filter: t,
          tone: n,
          eqLow: r,
          eqMid: i,
          eqHigh: a,
          gain: o,
          mainGain: s,
          cueGain: c,
          fxSend: l,
          route: `main`,
          mode: `track`,
          buffer: null,
          source: null,
          startedAt: 0,
          offset: 0,
          loopBeats: null,
          loopStart: 0,
          loopEnd: 0,
          baseBpm: jg,
          pitch: 1,
          tempoRatio: 1,
          volume: .8,
          fade: Math.SQRT1_2,
          playing: !1
        };
      };
      this.deckA = t(), this.deckB = t(), this.masterFilter = e.createBiquadFilter(), this.masterFilter.type = `lowpass`, this.masterFilter.Q.value = .58, this.punchEQ = e.createBiquadFilter(), this.punchEQ.type = `peaking`, this.punchEQ.frequency.value = 135, this.punchEQ.Q.value = 1.4, this.punchEQ.gain.value = 0, this.driveIn = e.createGain(), this.driveIn.gain.value = 1, this.distNode = e.createWaveShaper(), this.driveOut = e.createGain(), this.driveOut.gain.value = 1.95, this.masterInput = e.createGain(), this.masterInput.gain.value = .5, this.dcBlock = e.createBiquadFilter(), this.dcBlock.type = `highpass`, this.dcBlock.frequency.value = 20, this.dcBlock.Q.value = .707, this.dry = e.createGain(), this.dry.gain.value = 1, this.echoSend = e.createGain(), this.echoSend.gain.value = gg.echoSend, this.delayNode = e.createDelay(1.5), this.delayWet = e.createGain(), this.delayWet.gain.value = gg.wet, this.feedbackGain = e.createGain(), this.feedbackGain.gain.value = gg.feedback, this.glue = e.createDynamicsCompressor(), this.glue.threshold.value = -8, this.glue.ratio.value = 2, this.glue.knee.value = 9, this.glue.attack.value = .012, this.glue.release.value = .18, this.masterGain = e.createGain(), this.masterGain.gain.value = this.masterLevel * gg.master, this.limiter = e.createDynamicsCompressor(), this.limiter.threshold.value = -2.4, this.limiter.knee.value = 1.2, this.limiter.ratio.value = 18, this.limiter.attack.value = .002, this.limiter.release.value = .085, this.cueBus = e.createGain(), this.cueBus.gain.value = 0, this.micGain = e.createGain(), this.micGain.gain.value = 0, this.micAnalyser = e.createAnalyser(), this.micAnalyser.fftSize = 1024, this.deckA.mainGain.connect(this.masterInput), this.deckB.mainGain.connect(this.masterInput), this.masterInput.connect(this.dcBlock), this.dcBlock.connect(this.masterFilter), this.masterFilter.connect(this.punchEQ), this.punchEQ.connect(this.driveIn), this.driveIn.connect(this.distNode), this.distNode.connect(this.driveOut), this.driveOut.connect(this.dry), this.dry.connect(this.glue), this.driveOut.connect(this.echoSend), this.echoSend.connect(this.delayNode), this.delayNode.connect(this.feedbackGain), this.feedbackGain.connect(this.delayNode), this.delayNode.connect(this.delayWet), this.delayWet.connect(this.glue), this.deckA.fxSend.connect(this.echoSend), this.deckB.fxSend.connect(this.echoSend), this.deckA.cueGain.connect(this.cueBus), this.deckB.cueGain.connect(this.cueBus), this.cueBus.connect(this.glue), this.micAnalyser.connect(this.micGain), this.micGain.connect(this.glue), this.glue.connect(this.limiter), this.limiter.connect(this.masterGain), this.masterGain.connect(e.destination);
      let n = e.createBuffer(1, Math.floor(e.sampleRate * 2), e.sampleRate),
        r = n.getChannelData(0);
      for (let e = 0; e < r.length; e += 1) r[e] = Math.random() * 2 - 1;
      this.noiseBuffer = n, e.onstatechange = () => {
        this.ctx === e && (e.state === `suspended` || e.state === `interrupted`) && this.anyPlaying() && this.ensureRunning();
      }, this.setCurve(this.preset.drive), this.applyPreset(this.preset), this.updateGain(`A`), this.updateGain(`B`);
    }
    async ensureRunning() {
      const context = this.init();
      return context ? resumeAudio(context) : false;
    }
    setCurve(e) {
      if (!this.distNode) return;
      let t = 2048,
        n = new Float32Array(t),
        r = 1 + clamp(e, 0, 1200) / 400;
      for (let e = 0; e < t; e += 1) {
        let t = e * 2 / 2047 - 1;
        n[e] = Math.tanh(r * t) / r;
      }
      this.distNode.curve = n, this.distNode.oversample = `2x`;
    }
    applyPreset(e) {
      this.preset = e;
      let t = this.init();
      if (!t) return;
      let n = t.currentTime,
        r = safeFilter(e);
      this.masterFilter.type = `lowpass`, this.masterFilter.frequency.setTargetAtTime(r.cutoff, n, .08), this.masterFilter.Q.setTargetAtTime(r.q, n, .08), this.punchEQ.gain.setTargetAtTime(e.has909Punch ? 4 : 0, n, .1), this.driveIn.gain.setTargetAtTime(1 + e.drive / 2500, n, .1), this.setCurve(e.drive), this.delayNode.delayTime.setTargetAtTime(clamp(e.delayTime, .01, 1), n, .1), this.feedbackGain.gain.setTargetAtTime(clamp(e.feedback * .35, 0, gg.feedback), n, .1), this.delayWet.gain.setTargetAtTime(gg.wet, n, .1), this.stopLFO(), e.has303Acid && this.startLFO(1.6 + e.resonance / 40, r.cutoff * .08), this.grooves.A.setPreset(e), this.grooves.B.setPreset(e);
    }
    updateGain(e) {
      if (!this.ctx) return;
      let t = this.get(e);
      t && t.gain.gain.setTargetAtTime(clamp(t.volume * t.fade, 0, 1.5), this.ctx.currentTime, .02);
    }
    setMaster(e) {
      this.masterLevel = clamp(e, 0, 1), this.masterGain && this.ctx && this.masterGain.gain.setTargetAtTime(this.masterLevel * gg.master, this.ctx.currentTime, .03);
    }
    setVolume(e, t) {
      let n = this.get(e);
      n && (n.volume = clamp(t, 0, 1), this.updateGain(e));
    }
    setDeckBpm(e, t) {
      let n = this.get(e);
      n && (n.baseBpm = clamp(t, 60, 200), this.applyRate(e));
    }
    setDeckTone(e, t) {
      let n = this.get(e);
      !n || !this.ctx || n.tone.frequency.setTargetAtTime(hg(t), this.ctx.currentTime, .03);
    }
    setDeckEq(e, t, n) {
      let r = this.get(e);
      !r || !this.ctx || (t === `low` ? r.eqLow : t === `mid` ? r.eqMid : r.eqHigh).gain.setTargetAtTime(clamp(n, -26, 6), this.ctx.currentTime, .03);
    }
    setDeckFxSend(e, t) {
      let n = this.get(e);
      !n || !this.ctx || n.fxSend.gain.setTargetAtTime(clamp(t, 0, 1), this.ctx.currentTime, .04);
    }
    setDeckRoute(e, t) {
      let n = this.get(e);
      if (!n || !this.ctx) return;
      n.route = t;
      let r = this.ctx.currentTime;
      n.mainGain.gain.setTargetAtTime(+(t === `main`), r, .03), n.cueGain.gain.setTargetAtTime(+(t === `cue`), r, .03);
    }
    applyCueLevel() {
      if (!this.cueBus || !this.ctx) return;
      let e = this.cueMonitor ? this.cueLevel : 0;
      this.cueBus.gain.setTargetAtTime(e, this.ctx.currentTime, .05);
    }
    setCueLevel(e) {
      this.cueLevel = clamp(e, 0, 1), this.applyCueLevel();
    }
    setCueMonitor(e) {
      this.cueMonitor = !!e, this.applyCueLevel();
    }
    rateFor(e) {
      return clamp(e.pitch * e.tempoRatio, .25, 4);
    }
    applyRate(e) {
      let t = this.get(e);
      if (!t || !this.ctx || !t.source) return;
      t.offset = this.trackPosition(e);
      t.startedAt = this.ctx.currentTime;
      t.source.playbackRate.setTargetAtTime(this.rateFor(t), this.ctx.currentTime, .02);
    }
    syncDeck(e) {
      let t = this.get(e === `B` ? `A` : `B`),
        n = this.get(e);
      !t || !n || (n.tempoRatio = clamp(t.baseBpm / n.baseBpm, .5, 2), this.applyRate(e));
    }
    getSyncAccuracy() {
      return this.deckB ? clamp(100 - Math.abs(this.deckB.tempoRatio - 1) * 100, 0, 100) : 100;
    }
    async setMode(e, t) {
      let n = this.get(e);
      if (!n || n.mode === t) return;
      let r = n.playing;
      r && this.pause(e), n.mode = t, r && (await this.play(e));
    }
    async play(e) {
      let t = this.get(e);
      return !t || t.mode === `track` && !t.buffer || !(await this.ensureRunning()) || !this.ctx || !this.get(e) ? !1 : (t.playing = !0, this.updateGain(e), t.mode === `track` ? this.startTrack(e) : this.groove(e).start(), !0);
    }
    pause(e) {
      let t = this.get(e);
      t && (t.mode === `track` && this.stopTrack(e), this.groove(e).stop(), t.playing = !1);
    }
    async toggle(e) {
      let t = this.get(e);
      return t ? t.playing ? (this.pause(e), !1) : this.play(e) : !1;
    }
    async loadFile(e, t) {
      let n = this.init();
      if (!n) return null;
      return importTrack(this, e, t);
    }
    startTrack(e) {
      let t = this.ctx,
        n = this.get(e);
      if (!t || !n || !n.buffer) return;
      this.stopTrack(e);
      let r = t.createBufferSource();
      r.buffer = n.buffer, r.loop = !0, r.playbackRate.value = this.rateFor(n), r.connect(n.filter);
      let i = n.offset % n.buffer.duration;
      if (n.loopBeats) {
        const bounds=loopBounds(i,n.buffer.duration,n.loopBeats,n.baseBpm);
        n.loopStart=bounds.start;
        n.loopEnd=bounds.end;
        r.loopStart = n.loopStart;
        r.loopEnd = n.loopEnd;
      }
      r.start(0, i), n.source = r, n.offset = i, n.startedAt = t.currentTime;
    }
    trackPosition(e) {
      const deck = this.get(e);
      if (!deck?.buffer) return 0;
      if (!deck.playing || !deck.source || !this.ctx) return deck.offset;
      return calculateTrackPosition(deck.offset,this.ctx.currentTime-deck.startedAt,deck.source.playbackRate.value,deck.buffer.duration,deck.loopBeats?deck.loopStart:0,deck.loopBeats?deck.loopEnd:0);
    }
    stopTrack(e) {
      let t = this.get(e);
      if (!(!t || !t.source)) {
        if (this.ctx) {
          t.offset = this.trackPosition(e);
        }
        try {
          t.source.stop();
        } catch {}
        t.source.disconnect(), t.source = null;
      }
    }
    seekTrack(id, seconds) {
      const deck = this.get(id);
      if (!deck || deck.mode !== `track` || !deck.buffer) return;
      const duration = deck.buffer.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const next = Math.max(0, Math.min(duration - .001, seconds));
      if (deck.source) this.stopTrack(id);
      deck.offset = next;
      if (deck.playing) this.startTrack(id);
    }
    setLoop(id, beats) {
      const deck = this.get(id);
      if (!deck || !deck.buffer || deck.mode !== `track`) return;
      const position = this.trackPosition(id);
      if (deck.source) this.stopTrack(id);
      deck.offset = position;
      deck.loopBeats = beats;
      deck.loopStart = 0;
      deck.loopEnd = 0;
      if (deck.playing) this.startTrack(id);
    }
    engageFx(e) {
      let t = this.init();
      if (!t) return;
      let n = t.currentTime,
        r = safeFilter(this.preset);
      switch (this.fxActive[e] = !0, e) {
        case `filter`:
          this.masterFilter.frequency.cancelScheduledValues(n), this.masterFilter.frequency.setTargetAtTime(Math.max(220, r.cutoff * .25), n, .05);
          break;
        case `highpass`:
          [`A`, `B`].forEach(e => {
            let t = this.get(e);
            t.filter.type = `highpass`, t.filter.frequency.setTargetAtTime(1400, n, .03);
          });
          break;
        case `delay`:
          this.delayWet.gain.setTargetAtTime(.42, n, .03), this.feedbackGain.gain.setTargetAtTime(.34, n, .03);
          break;
        case `drive`:
          this.driveIn.gain.setTargetAtTime(3.5, n, .03);
          break;
        case `brake`:
          this.deckA.pitch = .15, this.deckB.pitch = .15, this.applyRate(`A`), this.applyRate(`B`);
      }
    }
    releaseFx(e) {
      if (!this.ctx || !this.fxActive[e]) return;
      this.fxActive[e] = !1;
      let t = this.ctx.currentTime,
        n = safeFilter(this.preset);
      switch (e) {
        case `filter`:
          this.masterFilter.frequency.setTargetAtTime(n.cutoff, t, .08);
          break;
        case `highpass`:
          [`A`, `B`].forEach(e => {
            let n = this.get(e);
            n.filter.type = `lowpass`, n.filter.frequency.setTargetAtTime(2e4, t, .06);
          });
          break;
        case `delay`:
          this.delayWet.gain.setTargetAtTime(gg.wet, t, .06), this.feedbackGain.gain.setTargetAtTime(clamp(this.preset.feedback * .35, 0, gg.feedback), t, .06);
          break;
        case `drive`:
          this.driveIn.gain.setTargetAtTime(1 + this.preset.drive / 2500, t, .06);
          break;
        case `brake`:
          this.deckA.pitch = 1, this.deckB.pitch = 1, this.applyRate(`A`), this.applyRate(`B`);
      }
    }
    async setOutputDevice(e) {
      let t = this.init();
      if (!t || typeof t.setSinkId != `function`) return !1;
      try {
        return await t.setSinkId(e || ``), this.outputDeviceId = e || ``, !0;
      } catch {
        return !1;
      }
    }
    async setMicEnabled(e, t) {
      let n = this.init();
      if (!n) return !1;
      if (!e) {
        if (this.micSource) {
          try {
            this.micSource.disconnect();
          } catch {}
          this.micSource = null;
        }
        return this.micStream &&= (this.micStream.getTracks().forEach(e => e.stop()), null), this.micGain.gain.setTargetAtTime(0, n.currentTime, .05), this.micEnabled = !1, !1;
      }
      await this.ensureRunning();
      try {
        let e = t ? {
            audio: {
              deviceId: {
                exact: t
              }
            }
          } : {
            audio: !0
          },
          r = await navigator.mediaDevices.getUserMedia(e);
        if (this.micSource) try {
          this.micSource.disconnect();
        } catch {}
        return this.micStream && this.micStream.getTracks().forEach(e => e.stop()), this.micStream = r, this.micSource = n.createMediaStreamSource(r), this.micSource.connect(this.micAnalyser), this.micEnabled = !0, this.setMicGain(this.micLevel), !0;
      } catch {
        return this.micEnabled = !1, !1;
      }
    }
    setMicGain(e) {
      this.micLevel = clamp(e, 0, 1), this.micGain && this.ctx && this.micEnabled && this.micGain.gain.setTargetAtTime(this.micLevel, this.ctx.currentTime, .05);
    }
    getMicLevel() {
      if (!this.micAnalyser || !this.micEnabled) return 0;
      let e = new Uint8Array(this.micAnalyser.fftSize);
      this.micAnalyser.getByteTimeDomainData(e);
      let t = 0;
      for (let n = 0; n < e.length; n += 1) {
        let r = (e[n] - 128) / 128;
        t += r * r;
      }
      return Math.min(1, Math.sqrt(t / e.length) * 3);
    }
    async triggerAIAutomix(e, t, n) {
      let r = this.init();
      if (!r || this.automixTimer || !(await this.ensureRunning())) return !1;
      let i = this.deckA,
        a = this.deckB;
      if (!i?.buffer || !a?.buffer || i.mode !== `track` || a.mode !== `track`) return !1;
      i.baseBpm = e, a.baseBpm = e, a.tempoRatio = 1, this.applyRate(`A`), this.applyRate(`B`), i.playing || (await this.play(`A`)), a.playing || (await this.play(`B`)), i.filter.type = `highpass`, i.filter.Q.value = .7, a.filter.type = `lowpass`, a.filter.Q.value = .7, a.filter.frequency.setValueAtTime(250, r.currentTime);
      let o = performance.now(),
        s = () => {
          if (!this.automixTimer) return;
          let e = clamp((performance.now() - o) / (t * 1e3), 0, 1),
            s = r.currentTime,
            [c, l] = _g(e);
          i.fade = c, a.fade = l, this.updateGain(`A`), this.updateGain(`B`), i.filter.frequency.setTargetAtTime(20 + e * 380, s, .04), a.filter.frequency.setTargetAtTime(250 + e * 12e3, s, .04), n && n(e), e >= 1 && this.finishAutomix();
        };
      this.automixTimer = window.setInterval(s, 30);
      return !0;
    }
    finishAutomix() {
      this.automixTimer && window.clearInterval(this.automixTimer), this.automixTimer = null;
      let e = this.deckA,
        t = this.deckB;
      !e || !t || !this.ctx || (e.fade = 0, t.fade = 1, this.pause(`A`), e.pitch = 1, e.offset = 0, e.filter.type = `lowpass`, e.filter.frequency.setValueAtTime(2e4, this.ctx.currentTime), t.filter.type = `lowpass`, t.filter.frequency.setValueAtTime(2e4, this.ctx.currentTime), this.updateGain(`A`), this.updateGain(`B`));
    }
    startLFO(e, t) {
      !this.ctx || !this.masterFilter || (this.stopLFO(), this.lfo = this.ctx.createOscillator(), this.lfoGain = this.ctx.createGain(), this.lfo.type = `triangle`, this.lfo.frequency.setValueAtTime(e, this.ctx.currentTime), this.lfoGain.gain.setValueAtTime(t, this.ctx.currentTime), this.lfo.connect(this.lfoGain), this.lfoGain.connect(this.masterFilter.frequency), this.lfo.start());
    }
    stopLFO() {
      if (this.lfo) {
        try {
          this.lfo.stop();
        } catch {}
        this.lfo.disconnect(), this.lfoGain && this.lfoGain.disconnect(), this.lfo = null, this.lfoGain = null;
      }
    }
    dispose() {
      if (this.automixTimer && window.clearInterval(this.automixTimer), this.automixTimer = null, this.grooves.A.stop(), this.grooves.B.stop(), this.micStream && this.micStream.getTracks().forEach(e => e.stop()), this.micStream = null, this.micSource = null, this.stopLFO(), this.ctx && this.ctx.state !== `closed`) try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
  },
  EngineContext = (0, _.createContext)(null),
  Pg = null;
function getEngine() {
  return Pg ||= new StripewolfEngine(), Pg;
}
var Ig = [`pointerdown`, `touchstart`, `keydown`];
function EngineProvider({
  children: e
}) {
  let [t] = (0, _.useState)(getEngine);
  return (0, _.useEffect)(() => {
    let e = () => {
      t.ensureRunning();
    };
    return Ig.forEach(t => window.addEventListener(t, e, {
      passive: !0
    })), () => {
      Ig.forEach(t => window.removeEventListener(t, e));
    };
  }, [t]), (0, L.jsx)(EngineContext.Provider, {
    value: t,
    children: e
  });
}
function useEngine() {
  return (0, _.useContext)(EngineContext);
}
var zg = [{
  to: `/dashboard`,
  label: `МИКШЕР`
}, {
  to: `/presets`,
  label: `ПРЕСЕТЫ`
}, {
  to: `/automix-settings`,
  label: `АВТОМИКС`
}];
var secondaryNavigation = [{
  to: `/analytics`,
  label: `Аналитика`
}, {
  to: `/hardware-setup`,
  label: `MIDI`
}, {
  to: `/audio-routing`,
  label: `Аудиомаршруты`
}, {
  to: `/profile`,
  label: `Профиль`
}];
function Layout() {
  return (0, L.jsx)(EngineProvider, {
    children: (0, L.jsxs)(`div`, {
      className: `sw-shell`,
      children: [(0, L.jsxs)(`header`, {
        className: `sw-topbar`,
        children: [(0, L.jsx)(`div`, {
          className: `sw-brand`,
          children: `STRIPEWOLFWAVE`
        }), (0, L.jsxs)(`nav`, {
          className: `sw-nav`,
          "aria-label": `Основная навигация`,
          children: [zg.map(e => (0, L.jsx)($s, {
            to: e.to,
            className: ({
              isActive: e
            }) => `sw-nav-link ${e ? `active` : ``}`,
            children: e.label
          }, e.to)), (0, L.jsxs)(`details`, {
            className: `sw-more`,
            children: [(0, L.jsx)(`summary`, {
              children: `ЕЩЁ`
            }), (0, L.jsx)(`div`, {
              className: `sw-more-links`,
              children: secondaryNavigation.map(e => (0, L.jsx)($s, {
                to: e.to,
                className: ({
                  isActive: e
                }) => `sw-nav-link ${e ? `active` : ``}`,
                onClick: e => { e.currentTarget.closest(`details`).open = !1; },
                children: e.label
              }, e.to))
            })]
          })]
        })]
      }), (0, L.jsx)(`main`, {
        children: (0, L.jsx)(us, {})
      })]
    })
  });
}
function PresetSelector({
  activeKey: e,
  onSelect: t
}) {
  return (0, L.jsxs)(`div`, {
    className: `presets-sidebar`,
    children: [(0, L.jsx)(`h3`, {
      children: `SELECT PRESET ROUTING:`
    }), (0, L.jsx)(`div`, {
      className: `preset-stack`,
      children: PRESET_KEYS.map(n => (0, L.jsxs)(`button`, {
        type: `button`,
        className: `preset-selector-row ${e === n ? `selected` : ``}`,
        onClick: () => t(n),
        children: [(0, L.jsx)(`div`, {
          className: `row-title`,
          children: PRESETS[n].artist
        }), (0, L.jsx)(`div`, {
          className: `row-sub`,
          children: PRESETS[n].name
        })]
      }, n))
    })]
  });
}
function Deck({
  deckKey: e,
  deck: t,
  onMode: n,
  onPlay: r,
  onBpm: i,
  onVolume: a,
  onFile: o,
  onSync: s,
  onDemo: onDemo
}) {
  const [importError, setImportError] = _.useState("");
  let [c, l] = (0, _.useState)(!1),
    u = (0, _.useRef)(null),
    d = async e => {
      let t = e.target,
        n = t.files && t.files[0];
      if (n) {
        l(!0);
        setImportError("");
        try {
          await o(n);
        } catch (error) {
          setImportError(error instanceof Error ? error.message : "Не удалось загрузить трек");
        } finally {
          l(!1), t.value = ``;
        }
      }
    },
    f = !!t.trackName;
  return (0, L.jsxs)(`div`, {
    className: `deck-panel`,
    children: [(0, L.jsxs)(`div`, {
      className: `deck-head`,
      children: [(0, L.jsxs)(`span`, {
        className: `deck-tag`,
        children: [`КАНАЛ `, e]
      }), (0, L.jsx)(`span`, {
        className: `deck-status ${t.playing ? `live` : ``}`,
        children: t.playing ? `RUNNING` : `STANDBY`
      })]
    }), (0, L.jsxs)(L.Fragment, {
      children: [(0, L.jsxs)(`label`, {
        className: `deck-file-btn`,
        children: [c ? `ЗАГРУЗКА...` : `LOAD AUDIO FILE`, (0, L.jsx)(`input`, {
          ref: u,
          type: `file`,
          accept: `audio/*,.mp3,.wav,.m4a,.aac,.aiff,.aif,.flac,.ogg,.opus`,
          "aria-label": `Загрузить трек в канал ${e}`,
          disabled: c,
          onChange: d
        })]
      }), (0, L.jsx)(`div`, {
        className: `deck-track`,
        role: importError ? `alert` : undefined,
        children: importError || (t.trackName ? `${t.trackName} · ${Math.floor(t.duration / 60)}:${String(Math.floor(t.duration % 60)).padStart(2, `0`)}` : `NO FILE LOADED — выберите аудиофайл`)
      })]
    }), (0, L.jsx)(DemoPicker, {
      busy: c,
      onLoad: async (rendering, bpm) => {
        l(true);
        setImportError("");
        try {
          await onDemo(rendering, bpm);
        } catch (error) {
          setImportError(error instanceof Error ? error.message : "Ошибка загрузки");
        } finally {
          l(false);
        }
      }
    }), (0, L.jsxs)(`div`, {
      className: `deck-row`,
      children: [(0, L.jsx)(`span`, {
        children: `BPM`
      }), (0, L.jsx)(`input`, {
        type: `number`,
        min: 60,
        max: 200,
        value: t.bpm,
        onChange: e => i(Number(e.target.value))
      })]
    }), (0, L.jsxs)(`div`, {
      className: `deck-row`,
      children: [(0, L.jsx)(`span`, {
        children: `LEVEL`
      }), (0, L.jsx)(`input`, {
        type: `range`,
        min: 0,
        max: 1,
        step: .01,
        value: t.volume,
        onChange: e => a(Number(e.target.value))
      })]
    }), (0, L.jsxs)(`div`, {
      className: `deck-actions`,
      children: [(0, L.jsx)(`button`, {
        type: `button`,
        className: `deck-play ${t.playing ? `playing` : ``}`,
        onClick: r,
        disabled: !f,
        children: t.playing ? `❚❚ PAUSE` : `▶ PLAY`
      }), e === `B` ? (0, L.jsx)(`button`, {
        type: `button`,
        className: `deck-sync`,
        onClick: s,
        children: `SYNC TO A`
      }) : null]
    })]
  });
}
var qg = [{
  id: `low`,
  label: `LOW`
}, {
  id: `mid`,
  label: `MID`
}, {
  id: `high`,
  label: `HIGH`
}];
function DeckRouting({
  deckKey: e,
  mix: t,
  onChange: n
}) {
  return (0, L.jsxs)(`div`, {
    className: `sw-panel`,
    children: [(0, L.jsxs)(`h3`, {
        children: [`КАНАЛ `, e, ` · ЗВУК`]
    }), (0, L.jsxs)(`label`, {
      className: `mix-row`,
      children: [(0, L.jsx)(`span`, {
        children: `TONE`
      }), (0, L.jsx)(`input`, {
        className: `sw-range`,
        type: `range`,
        min: 0,
        max: 1,
        step: .01,
        value: t.tone,
        onChange: e => n(`tone`, Number(e.target.value))
      })]
    }), qg.map(e => (0, L.jsxs)(`label`, {
      className: `mix-row`,
      children: [(0, L.jsx)(`span`, {
        children: e.label
      }), (0, L.jsx)(`input`, {
        className: `sw-range`,
        type: `range`,
        min: -26,
        max: 6,
        step: 1,
        value: t[e.id],
        onChange: t => n(e.id, Number(t.target.value))
      }), (0, L.jsxs)(`em`, {
        children: [t[e.id], ` dB`]
      })]
    }, e.id)), (0, L.jsxs)(`label`, {
      className: `mix-row`,
      children: [(0, L.jsx)(`span`, {
        children: `FX SEND`
      }), (0, L.jsx)(`input`, {
        className: `sw-range`,
        type: `range`,
        min: 0,
        max: 1,
        step: .01,
        value: t.fx,
        onChange: e => n(`fx`, Number(e.target.value))
      })]
    }), (0, L.jsxs)(`div`, {
      className: `mix-route`,
      children: [(0, L.jsx)(`span`, {
        children: `ROUTE`
      }), (0, L.jsxs)(`div`, {
        className: `mode-switch`,
        children: [(0, L.jsx)(`button`, {
          type: `button`,
          className: `mode-btn ${t.route === `main` ? `active` : ``}`,
          onClick: () => n(`route`, `main`),
          children: `MAIN`
        }), (0, L.jsx)(`button`, {
          type: `button`,
          className: `mode-btn ${t.route === `cue` ? `active` : ``}`,
          onClick: () => n(`route`, `cue`),
          children: `CUE`
        })]
      })]
    })]
  });
}
var Yg = [{
  id: `filter`,
  label: `FILTER SWEEP`
}, {
  id: `highpass`,
  label: `HIGHPASS RISE`
}, {
  id: `delay`,
  label: `DELAY THROW`
}, {
  id: `drive`,
  label: `DRIVE BOOST`
}, {
  id: `brake`,
  label: `BRAKE / STOP`
}];
function Effects({
  held: e,
  onEngage: t,
  onRelease: n
}) {
  return (0, L.jsxs)(`div`, {
    className: `sw-panel`,
    children: [(0, L.jsx)(`h3`, {
      children: `SOUND EFFECTS — HOLD TO ENGAGE`
    }), (0, L.jsx)(`div`, {
      className: `fx-grid`,
      children: Yg.map(r => (0, L.jsx)(`button`, {
        type: `button`,
        className: `fx-pad ${e[r.id] ? `held` : ``}`,
        onPointerDown: () => t(r.id),
        onPointerUp: () => n(r.id),
        onPointerLeave: () => n(r.id),
        onPointerCancel: () => n(r.id),
        children: r.label
      }, r.id))
    })]
  });
}
function Telemetry({
  preset: e,
  decks: t
}) {
  let n = safeFilter(e);
  return (0, L.jsxs)(`div`, {
    className: `telemetry-bar`,
    children: [(0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`TB-303: `, (0, L.jsx)(`span`, {
        className: e.has303Acid ? `green` : `red`,
        children: e.has303Acid ? `ON` : `OFF`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`TR-909 PUNCH: `, (0, L.jsx)(`span`, {
        className: e.has909Punch ? `green` : `red`,
        children: e.has909Punch ? `ON` : `OFF`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`TR-808 SUB-BOOM: `, (0, L.jsx)(`span`, {
        className: e.has808Sub ? `green` : `red`,
        children: e.has808Sub ? `ON` : `OFF`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`CUTOFF: `, (0, L.jsxs)(`span`, {
        className: `green`,
        children: [Math.round(n.cutoff), ` Hz`]
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`DRIVE: `, (0, L.jsx)(`span`, {
        className: `green`,
        children: e.drive
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`DELAY: `, (0, L.jsxs)(`span`, {
        className: `green`,
        children: [e.delayTime.toFixed(2), `s`]
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`КАНАЛ A: `, (0, L.jsxs)(`span`, {
        className: `green`,
        children: [t.A.mode === `synth` ? `SYNTH` : `TRACK`, ` / `, t.A.bpm, ` BPM`]
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell`,
      children: [`КАНАЛ B: `, (0, L.jsxs)(`span`, {
        className: `green`,
        children: [t.B.mode === `synth` ? `SYNTH` : `TRACK`, ` / `, t.B.bpm, ` BPM`]
      })]
    }), (0, L.jsxs)(`div`, {
      className: `telemetry-cell long`,
      children: [`GEAR: `, e.gearUsed]
    })]
  });
}
function MasterControls({
  aiRunning: e,
  mixProgress: t,
  master: n,
  onMaster: r,
  onAutomix: i,
  profileLabel: a
}) {
  return (0, L.jsxs)(`div`, {
    className: `header-node`,
    children: [(0, L.jsxs)(`div`, {
      children: [(0, L.jsx)(`h1`, {
        children: `LIVE MIX`
      }), (0, L.jsx)(`div`, {
        className: `header-sub`,
        children: `STRIPEWOLF · ДВА КАНАЛА`
      }), a ? (0, L.jsx)(`div`, {
        className: `header-sub`,
        children: a
      }) : null]
    }), (0, L.jsxs)(`div`, {
      className: `master-node`,
      children: [(0, L.jsxs)(`div`, {
        className: `master-slider`,
        children: [(0, L.jsx)(`span`, {
          children: `MASTER`
        }), (0, L.jsx)(`input`, {
          type: `range`,
          min: 0,
          max: 1,
          step: .01,
          value: n,
          onChange: e => r(Number(e.target.value))
        })]
      }), (0, L.jsx)(`button`, {
        type: `button`,
        className: `ai-trigger-btn ${e ? `active` : ``}`,
        onClick: i,
        disabled: e,
        children: e ? `ПЕРЕХОД ${t}%` : `АВТОМИКС A → B`
      })]
    })]
  });
}
var $g = e => {
  let t = Math.max(0, Math.floor(e));
  return `${String(Math.floor(t / 60)).padStart(2, `0`)}:${String(t % 60).padStart(2, `0`)}`;
};
function SetLog({
  engine: e,
  decks: t,
  presetKey: n,
  automixProfile: r
}) {
  let [i, a] = (0, _.useState)(null),
    [o, s] = (0, _.useState)(0),
    [c, l] = (0, _.useState)(null),
    [u, d] = (0, _.useState)([]),
    [f, p] = (0, _.useState)(!1),
    [m, h] = (0, _.useState)(``),
    g = (0, _.useRef)([]),
    v = t.A.playing || t.B.playing;
  return (0, _.useEffect)(() => {
    v && !i && a(Date.now());
  }, [v, i]), (0, _.useEffect)(() => {
    if (!i) {
      s(0);
      return;
    }
    let e = window.setInterval(() => s((Date.now() - i) / 1e3), 1e3);
    return () => window.clearInterval(e);
  }, [i]), (0, _.useEffect)(() => {
    if (!i) return;
    let t = window.setInterval(() => {
      g.current = [...g.current, e.getSyncAccuracy()];
      let t = g.current.reduce((e, t) => e + t, 0);
      l(t / g.current.length);
    }, 2e3);
    return () => window.clearInterval(t);
  }, [i, e]), (0, _.useEffect)(() => {
    let e = [];
    t.A.trackName && e.push(`A: ${t.A.trackName}`), t.B.trackName && e.push(`B: ${t.B.trackName}`);
    let n = e.filter(e => !u.includes(e));
    n.length && d(e => [...e, ...n]);
  }, [t.A.trackName, t.B.trackName, u]), (0, L.jsxs)(`div`, {
    className: `sw-panel`,
    children: [(0, L.jsx)(`h3`, {
      children: `SET LOG — ЗАПИСЬ СЕТА`
    }), (0, L.jsxs)(`div`, {
      className: `setlog-grid`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-kv`,
        children: [(0, L.jsx)(`span`, {
          children: `SET TIME`
        }), (0, L.jsx)(`span`, {
          className: `green`,
          children: $g(o)
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-kv`,
        children: [(0, L.jsx)(`span`, {
          children: `BPM ACCURACY`
        }), (0, L.jsx)(`span`, {
          className: `green`,
          children: c === null ? `—` : `${c.toFixed(1)}%`
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-kv`,
        children: [(0, L.jsx)(`span`, {
          children: `ACTIVE AUTOMIX`
        }), (0, L.jsxs)(`span`, {
          children: [r.name, ` · `, r.transition_seconds, `s · `, r.target_bpm, ` BPM`]
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-kv`,
        children: [(0, L.jsx)(`span`, {
          children: `TRACKS IN SET`
        }), (0, L.jsx)(`span`, {
          children: u.length || `—`
        })]
      })]
    }), u.length ? (0, L.jsx)(`div`, {
      className: `setlog-tracks`,
      children: u.map(e => (0, L.jsxs)(`div`, {
        className: `sw-muted`,
        children: [`• `, e]
      }, e))
    }) : (0, L.jsx)(`div`, {
      className: `sw-muted`,
      children: `Запустите канал — таймер сета и точность бит-мэтчинга начнут писаться автоматически.`
    }), (0, L.jsxs)(`div`, {
      className: `sw-row sw-mt-small`,
      children: [(0, L.jsx)(`button`, {
        type: `button`,
        className: `sw-btn primary`,
        onClick: async () => {
          if (!i) return;
          p(!0), h(``);
          let e = g.current,
            r = e.length ? e.reduce((e, t) => e + t, 0) / e.length : 100;
          await J.entities.PerformanceSession.create({
            set_name: `SET ${new Date().toLocaleString(`ru-RU`, {
              day: `2-digit`,
              month: `2-digit`,
              hour: `2-digit`,
              minute: `2-digit`
            })}`,
            session_date: new Date().toISOString(),
            duration_seconds: Math.round((Date.now() - i) / 1e3),
            bpm_accuracy: Math.round(r * 10) / 10,
            preset_key: n,
            played_tracks: [...u, `PRESET: ${n.toUpperCase()}`],
            deck_a_bpm: t.A.bpm,
            deck_b_bpm: t.B.bpm
          }), p(!1), a(null), l(null), g.current = [], d([]), h(`СЕТ СОХРАНЁН В АНАЛИТИКУ`);
        },
        disabled: !i || f,
        children: f ? `СОХРАНЕНИЕ...` : `СОХРАНИТЬ СЕТ В АНАЛИТИКУ`
      }), (0, L.jsx)(`button`, {
        type: `button`,
        className: `sw-btn`,
        onClick: () => {
          a(null), l(null), g.current = [], d([]), h(``);
        },
        disabled: !i,
        children: `СБРОСИТЬ`
      })]
    }), m ? (0, L.jsx)(`div`, {
      className: `green setlog-status`,
      children: m
    }) : null]
  });
}
var t_ = () => ({
    A: {
      mode: `track`,
      playing: !1,
      bpm: 145,
      volume: .8,
      trackName: null,
      duration: 0
    },
    B: {
      mode: `track`,
      playing: !1,
      bpm: 140,
      volume: .8,
      trackName: null,
      duration: 0
    }
  }),
  n_ = () => ({
    A: {
      tone: 1,
      low: 0,
      mid: 0,
      high: 0,
      fx: 0,
      route: `main`
    },
    B: {
      tone: 1,
      low: 0,
      mid: 0,
      high: 0,
      fx: 0,
      route: `main`
    }
  });
function Dashboard() {
  let e = useEngine(),
    t = (0, _.useRef)(!1),
    [n, r] = (0, _.useState)(() => presetKey(e.preset)),
    [i, a] = (0, _.useState)(!1),
    [o, s] = (0, _.useState)(0),
    [c, l] = (0, _.useState)(e.masterLevel),
    [u, d] = (0, _.useState)(() => {
      const initial=t_();
      for (const id of ['A','B']) {
        const deck=e.get(id);
        if(deck) initial[id]={mode:deck.mode,playing:deck.playing,bpm:deck.baseBpm,volume:deck.volume,trackName:deck.trackName||null,duration:deck.buffer?.duration||0};
      }
      return initial;
    }),
    [f, p] = (0, _.useState)(n_),
    [m, h] = (0, _.useState)({}),
    [g, v] = (0, _.useState)({
      name: `СТАНДАРТ`,
      transition_seconds: 7,
      target_bpm: 148,
      style: `SMOOTH`
    });
  (0, _.useEffect)(() => {
    let e = !1;
    return (async () => {
      let t = await J.auth.me(),
        n = await J.entities.AutomixSettings.filter({
          created_by_id: t.id,
          is_active: !0
        }, {
          limit: 1
        }),
        r = n.items && n.items[0];
      !e && r && v(r);
    })(), () => {
      e = !0;
    };
  }, []);
  let y = (e, t) => {
      d(n => ({
        ...n,
        [e]: {
          ...n[e],
          ...t
        }
      }));
    },
    x = t => {
      r(t), e.applyPreset(PRESETS[t]);
    },
    S = async t => {
      let n = e.get(t);
      if (n && n.playing) {
        e.pause(t), y(t, {
          playing: !1
        });
        return;
      }
      let r = await e.play(t);
      y(t, {
        playing: r
      });
    },
    C = async (t, n) => {
      await e.setMode(t, n);
      let r = e.get(t);
      y(t, {
        mode: n,
        playing: r ? r.playing : !1
      });
    },
    w = (t, n) => {
      e.setDeckBpm(t, n), y(t, {
        bpm: n
      });
    },
    T = (t, n) => {
      e.setVolume(t, n), y(t, {
        volume: n
      });
    },
    E = async (t, n) => {
      let r = await e.loadFile(t, n);
      if (r) {
        let n = e.get(t);
        y(t, {
          mode: `track`,
          trackName: r.name,
          duration: r.duration,
          playing: n ? n.playing : !1
        });
      }
    },
    F = async (t, rendering, bpm) => {
      const result = await importRenderedTrack(e, t, rendering);
      if (result) {
        const deck = e.get(t);
        e.setDeckBpm(t, bpm);
        y(t, {
          mode: `track`,
          trackName: result.name,
          duration: result.duration,
          bpm,
          playing: deck ? deck.playing : !1
        });
      }
    },
    D = t => {
      e.syncDeck(t);
    },
    O = t => {
      l(t), e.setMaster(t);
    },
    k = (t, n, r) => {
      p(e => ({
        ...e,
        [t]: {
          ...e[t],
          [n]: r
        }
      })), n === `tone` ? e.setDeckTone(t, r) : n === `fx` ? e.setDeckFxSend(t, r) : n === `route` ? e.setDeckRoute(t, r) : e.setDeckEq(t, n, r);
    };
  return (0, L.jsx)(`div`, {
    className: `stripewolf-page`,
    children: (0, L.jsxs)(`div`, {
      className: `dashboard-container`,
      children: [(0, L.jsx)(MasterControls, {
        aiRunning: i,
        mixProgress: o,
        master: c,
        onMaster: O,
        onAutomix: async () => {
          if (i) return;
          e.applyPreset(PRESETS[n]), a(!0), s(0), t.current = !1;
          try {
            const started = await e.triggerAIAutomix(g.target_bpm, g.transition_seconds, n => {
            if (s(Math.round(n * 100)), !t.current) {
              t.current = !0;
              let n = e.get(`A`),
                r = e.get(`B`);
              d(e => ({
                A: {
                  ...e.A,
                  playing: !!n.playing,
                  bpm: g.target_bpm
                },
                B: {
                  ...e.B,
                  playing: !!r.playing,
                  bpm: g.target_bpm
                }
              }));
            }
            n >= 1 && (a(!1), d(e => ({
              A: {
                ...e.A,
                playing: !1
              },
              B: {
                ...e.B,
                playing: !0
              }
            })));
            });
            if (!started) {a(!1);window.alert('Для автомикса загрузите треки в обе деки.');}
          } catch (error) {
            a(!1);
            window.alert(error instanceof Error ? error.message : `Автомикс недоступен`);
          }
        },
        profileLabel: `AUTOMIX: ${g.name} · ${g.transition_seconds}s · ${g.target_bpm} BPM · ${g.style}`
      }), (0, L.jsxs)(`div`, {
        className: `console-grid`,
        children: [(0, L.jsx)(WaveMixer, {
          engine: e,
          automixRunning: i,
          automixProgress: o,
          channelA: (0, L.jsx)(Deck, {
            deckKey: `A`, deck: u.A, onMode: t => C(`A`, t), onPlay: () => S(`A`),
            onBpm: t => w(`A`, t), onVolume: t => T(`A`, t), onFile: t => E(`A`, t),
            onDemo: (rendering, bpm) => F(`A`, rendering, bpm), onSync: () => D(`A`)
          }),
          channelB: (0, L.jsx)(Deck, {
            deckKey: `B`, deck: u.B, onMode: t => C(`B`, t), onPlay: () => S(`B`),
            onBpm: t => w(`B`, t), onVolume: t => T(`B`, t), onFile: t => E(`B`, t),
            onDemo: (rendering, bpm) => F(`B`, rendering, bpm), onSync: () => D(`B`)
          })
        })]
      }), (0, L.jsxs)(`details`, {
        className: `advanced-panel`,
        children: [(0, L.jsx)(`summary`, {children: `EQ · FX · МАРШРУТИЗАЦИЯ`}), (0, L.jsxs)(`div`, {
        className: `sw-grid cols-3 sw-mt`,
        children: [(0, L.jsx)(DeckRouting, {
          deckKey: `A`,
          mix: f.A,
          onChange: (e, t) => k(`A`, e, t)
        }), (0, L.jsx)(DeckRouting, {
          deckKey: `B`,
          mix: f.B,
          onChange: (e, t) => k(`B`, e, t)
        }), (0, L.jsx)(Effects, {
          held: m,
          onEngage: t => {
            e.engageFx(t), h(e => ({
              ...e,
              [t]: !0
            }));
          },
          onRelease: t => {
            e.releaseFx(t), h(e => ({
              ...e,
              [t]: !1
            }));
          }
        })]
      })]
      }), (0, L.jsxs)(`details`, {
        className: `advanced-panel`,
        children: [(0, L.jsx)(`summary`, {children: `СЕТ · ПРЕСЕТЫ · ДАННЫЕ`}), (0, L.jsx)(`div`, {
        className: `sw-mt`,
        children: (0, L.jsx)(SetLog, {
          engine: e,
          decks: u,
          presetKey: n,
          automixProfile: g
        })
      }), (0, L.jsx)(PresetSelector, {
        activeKey: n,
        onSelect: x
      }), (0, L.jsx)(Telemetry, {
        preset: PRESETS[n],
        decks: u
      })]
      })]
    })
  });
}
var i_ = e => [[`FILTER TYPE`, e.filterType.toUpperCase()], [`CUTOFF`, `${e.cutoff} Hz`], [`RESONANCE`, e.resonance], [`DRIVE`, e.drive], [`DELAY TIME`, `${e.delayTime} s`], [`FEEDBACK`, e.feedback]];
function Presets() {
  let e = useEngine(),
    t = Ro(),
    [n, r] = (0, _.useState)(() => presetKey(e.preset)),
    i = n => {
      e.applyPreset(PRESETS[n]), r(n), t(`/dashboard`);
    };
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `PRESET LIBRARY`
      }), (0, L.jsx)(`p`, {
        children: `Полная матрица звуковых профилей: железо, фильтр, драйв и дилей. Загруженный профиль сразу встаёт в мастер-цепь пульта.`
      })]
    }), (0, L.jsx)(`div`, {
      className: `sw-grid cols-3`,
      children: PRESET_KEYS.map(e => {
        let t = PRESETS[e],
          r = n === e;
        return (0, L.jsxs)(`div`, {
          className: `sw-panel`,
          children: [(0, L.jsx)(`h3`, {
            children: t.artist
          }), (0, L.jsx)(`div`, {
            className: `preset-name`,
            children: t.name
          }), (0, L.jsxs)(`div`, {
            className: `preset-gear`,
            children: [`GEAR: `, t.gearUsed]
          }), (0, L.jsx)(`div`, {
            className: `preset-kv`,
            children: i_(t).map(([e, t]) => (0, L.jsxs)(`div`, {
              className: `sw-kv`,
              children: [(0, L.jsx)(`span`, {
                children: e
              }), (0, L.jsx)(`span`, {
                children: t
              })]
            }, e))
          }), (0, L.jsxs)(`div`, {
            className: `preset-badges`,
            children: [(0, L.jsx)(`span`, {
              className: `sw-badge ${t.has303Acid ? `on` : `off`}`,
              children: `TB-303`
            }), (0, L.jsx)(`span`, {
              className: `sw-badge ${t.has909Punch ? `on` : `off`}`,
              children: `TR-909`
            }), (0, L.jsx)(`span`, {
              className: `sw-badge ${t.has808Sub ? `on` : `off`}`,
              children: `TR-808`
            })]
          }), (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn ${r ? `` : `primary`} preset-load`,
            onClick: () => i(e),
            children: r ? `ЗАГРУЖЕН В ПУЛЬТ` : `ЗАГРУЗИТЬ В ПУЛЬТ`
          })]
        }, e);
      })
    })]
  });
}
var o_ = [`SMOOTH`, `TECHNO ROLL`, `HARD CUT`, `ACID BLEND`],
  s_ = () => ({
    name: `НОВЫЙ ПРОФИЛЬ`,
    transition_seconds: 7,
    target_bpm: 148,
    beat_tolerance: 3,
    style: `SMOOTH`,
    bass_swap: !0,
    is_active: !1
  });
function AutomixSettings() {
  let [e, t] = (0, _.useState)([]),
    [n, r] = (0, _.useState)(s_),
    [i, a] = (0, _.useState)(null),
    [o, s] = (0, _.useState)(``);
  (0, _.useEffect)(() => {
    (async () => {
      let e = await J.auth.me(),
        n = await J.entities.AutomixSettings.filter({
          created_by_id: e.id
        }, {
          sort: `-created_date`,
          limit: 30
        });
      t(n.items || []);
    })();
  }, []);
  let c = (e, t) => r(n => ({
      ...n,
      [e]: t
    })),
    l = async () => {
      let e = {
        ...n
      };
      if (i) {
        let n = await J.entities.AutomixSettings.update(i, e);
        t(e => e.map(e => e.id === i ? n : e));
      } else {
        let n = await J.entities.AutomixSettings.create(e);
        t(e => [n, ...e]), a(n.id);
      }
      s(`ПРОФИЛЬ СВОДКИ СОХРАНЁН`);
    },
    u = e => {
      a(e.id), r({
        name: e.name || ``,
        transition_seconds: e.transition_seconds || 7,
        target_bpm: e.target_bpm || 148,
        beat_tolerance: e.beat_tolerance || 3,
        style: e.style || `SMOOTH`,
        bass_swap: e.bass_swap !== !1,
        is_active: !!e.is_active
      }), s(``);
    },
    d = async e => {
      let n = await J.auth.me();
      await J.entities.AutomixSettings.updateMany({
        created_by_id: n.id,
        is_active: !0
      }, {
        $set: {
          is_active: !1
        }
      }), await J.entities.AutomixSettings.update(e.id, {
        is_active: !0
      }), t(t => t.map(t => ({
        ...t,
        is_active: t.id === e.id
      }))), s(`АКТИВНЫЙ ПРОФИЛЬ: ${e.name}`);
    },
    f = async e => {
      await J.entities.AutomixSettings.delete(e.id), t(t => t.filter(t => t.id !== e.id)), i === e.id && (a(null), r(s_()));
    };
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `AUTOMIX SETTINGS`
      }), (0, L.jsx)(`p`, {
        children: `Скорость перехода, целевой темп и допуск бит-мэтчинга берутся пультом в момент нажатия AI AUTOMIX. Активный профиль применяется на странице Dashboard.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-grid cols-2`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: i ? `РЕДАКТИРОВАНИЕ ПРОФИЛЯ` : `НОВЫЙ ПРОФИЛЬ`
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `НАЗВАНИЕ ПРОФИЛЯ`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            value: n.name,
            onChange: e => c(`name`, e.target.value)
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsxs)(`span`, {
            children: [`СКОРОСТЬ ПЕРЕХОДА: `, n.transition_seconds, ` с`]
          }), (0, L.jsx)(`input`, {
            className: `sw-range`,
            type: `range`,
            min: 2,
            max: 15,
            step: 1,
            value: n.transition_seconds,
            onChange: e => c(`transition_seconds`, Number(e.target.value))
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsxs)(`span`, {
            children: [`ЦЕЛЕВОЙ ТЕМП: `, n.target_bpm, ` BPM`]
          }), (0, L.jsx)(`input`, {
            className: `sw-range`,
            type: `range`,
            min: 120,
            max: 160,
            step: 1,
            value: n.target_bpm,
            onChange: e => c(`target_bpm`, Number(e.target.value))
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsxs)(`span`, {
            children: [`ДОПУСК БИТ-МЭТЧИНГА: `, n.beat_tolerance, `%`]
          }), (0, L.jsx)(`input`, {
            className: `sw-range`,
            type: `range`,
            min: 1,
            max: 10,
            step: 1,
            value: n.beat_tolerance,
            onChange: e => c(`beat_tolerance`, Number(e.target.value))
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `КРЕАТИВНЫЙ СТИЛЬ`
          }), (0, L.jsx)(`select`, {
            className: `sw-select`,
            value: n.style,
            onChange: e => c(`style`, e.target.value),
            children: o_.map(e => (0, L.jsx)(`option`, {
              value: e,
              children: e
            }, e))
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-check`,
          children: [(0, L.jsx)(`input`, {
            type: `checkbox`,
            checked: n.bass_swap,
            onChange: e => c(`bass_swap`, e.target.checked)
          }), (0, L.jsx)(`span`, {
            children: `BASS SWAP — менять низ на переходе`
          })]
        }), (0, L.jsxs)(`div`, {
          className: `sw-row sw-mt-small`,
          children: [(0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn primary`,
            onClick: l,
            children: i ? `ОБНОВИТЬ` : `СОХРАНИТЬ`
          }), (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn`,
            onClick: () => {
              a(null), r(s_()), s(``);
            },
            children: `НОВЫЙ ПРОФИЛЬ`
          })]
        }), o ? (0, L.jsx)(`div`, {
          className: `green setlog-status`,
          children: o
        }) : null]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `СОХРАНЁННЫЕ ПРОФИЛИ СВОДКИ`
        }), e.length ? e.map(e => (0, L.jsxs)(`div`, {
          className: `automix-item`,
          children: [(0, L.jsxs)(`div`, {
            className: `automix-head`,
            children: [(0, L.jsx)(`span`, {
              className: e.is_active ? `green` : ``,
              children: e.name
            }), e.is_active ? (0, L.jsx)(`span`, {
              className: `sw-badge on`,
              children: `АКТИВНЫЙ`
            }) : null]
          }), (0, L.jsxs)(`div`, {
            className: `sw-muted`,
            children: [`переход `, e.transition_seconds, ` с · `, e.target_bpm, ` BPM · допуск `, e.beat_tolerance, `% · стиль `, e.style, ` · bass swap `, e.bass_swap ? `ON` : `OFF`]
          }), (0, L.jsxs)(`div`, {
            className: `sw-row sw-mt-small`,
            children: [(0, L.jsx)(`button`, {
              type: `button`,
              className: `sw-btn`,
              onClick: () => u(e),
              children: `РЕДАКТИРОВАТЬ`
            }), (0, L.jsx)(`button`, {
              type: `button`,
              className: `sw-btn`,
              onClick: () => d(e),
              children: `СДЕЛАТЬ АКТИВНЫМ`
            }), (0, L.jsx)(`button`, {
              type: `button`,
              className: `sw-btn danger`,
              onClick: () => f(e),
              children: `УДАЛИТЬ`
            })]
          })]
        }, e.id)) : (0, L.jsxs)(`div`, {
          className: `sw-empty`,
          children: [`Пока нет профилей сводки.`, (0, L.jsx)(`br`, {}), `Создайте первый слева — пульт подхватит его как активный.`]
        })]
      })]
    })]
  });
}
var IK = e => {
    let t = Math.max(0, Math.round(e || 0)),
      n = Math.floor(t / 3600),
      r = Math.floor(t % 3600 / 60);
    return n ? `${n}ч ${r}м` : `${r}м ${t % 60}с`;
  },
  LK = e => {
    if (!e) return `—`;
    let t = new Date(e);
    return `${String(t.getDate()).padStart(2, `0`)}.${String(t.getMonth() + 1).padStart(2, `0`)}`;
  };
function Analytics() {
  let [e, t] = (0, _.useState)([]),
    [n, r] = (0, _.useState)({
      sets: 0,
      seconds: 0,
      accuracy: 0
    }),
    [i, a] = (0, _.useState)(!0);
  (0, _.useEffect)(() => {
    (async () => {
      let e = await J.auth.me(),
        [n, i] = await Promise.all([J.entities.PerformanceSession.filter({
          created_by_id: e.id
        }, {
          sort: `-session_date`,
          limit: 50
        }), J.entities.PerformanceSession.aggregate({
          query: {
            created_by_id: e.id
          },
          sum: [`duration_seconds`],
          avg: [`bpm_accuracy`]
        })]),
        o = n.items || [];
      t(o);
      let s = i.rows && i.rows[0] ? i.rows[0] : null;
      r({
        sets: s ? s.count : o.length,
        seconds: s && s.sum_duration_seconds || 0,
        accuracy: s && s.avg_bpm_accuracy || 0
      }), a(!1);
    })();
  }, []);
  let o = e.slice(0, 12).reverse().map(e => ({
    label: LK(e.session_date),
    minutes: Math.round((e.duration_seconds || 0) / 60 * 10) / 10,
    accuracy: e.bpm_accuracy || 0
  }));
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `PERFORMANCE ANALYTICS`
      }), (0, L.jsx)(`p`, {
        children: `История ваших сетов: длительность, точность бит-мэтчинга и треки, прошедшие через деки. Сет записывается кнопкой на пульте.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-grid cols-3`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-panel stat-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `СЕТОВ ЗАПИСАНО`
        }), (0, L.jsx)(`div`, {
          className: `stat-value`,
          children: i ? `—` : n.sets
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel stat-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `ОБЩЕЕ ВРЕМЯ ЗА ПУЛЬТОМ`
        }), (0, L.jsx)(`div`, {
          className: `stat-value`,
          children: i ? `—` : IK(n.seconds)
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel stat-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `СРЕДНЯЯ ТОЧНОСТЬ БИТ-МЭТЧИНГА`
        }), (0, L.jsx)(`div`, {
          className: `stat-value`,
          children: i ? `—` : `${(n.accuracy || 0).toFixed(1)}%`
        })]
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-panel sw-mt`,
      children: [(0, L.jsx)(`h3`, {
        children: `ДЛИТЕЛЬНОСТЬ СЕТОВ (МИН)`
      }), o.length ? (0, L.jsx)(`div`, {
        className: `chart-box`,
        children: (0, L.jsx)(hT, {
          width: `100%`,
          height: 220,
          children: (0, L.jsxs)(FK, {
            data: o,
            children: [(0, L.jsx)(MW, {
              stroke: `#161616`,
              vertical: !1
            }), (0, L.jsx)(YW, {
              dataKey: `label`,
              stroke: `#666`,
              fontSize: 10
            }), (0, L.jsx)(fG, {
              stroke: `#666`,
              fontSize: 10
            }), (0, L.jsx)(Xw, {
              contentStyle: {
                background: `#070707`,
                border: `1px solid #333`,
                fontSize: 11
              },
              labelStyle: {
                color: `#00ff66`
              }
            }), (0, L.jsx)(OV, {
              dataKey: `minutes`,
              fill: `#00ff66`,
              radius: [2, 2, 0, 0]
            })]
          })
        })
      }) : (0, L.jsx)(`div`, {
        className: `sw-empty`,
        children: `Пока нечего показывать — сохраните первый сет на пульте.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-panel sw-mt`,
      children: [(0, L.jsx)(`h3`, {
        children: `ИСТОРИЯ СЕТОВ`
      }), e.length ? (0, L.jsx)(`div`, {
        className: `sw-scroll-x`,
        children: (0, L.jsxs)(`table`, {
          className: `sw-table`,
          children: [(0, L.jsx)(`thead`, {
            children: (0, L.jsxs)(`tr`, {
              children: [(0, L.jsx)(`th`, {
                children: `ДАТА`
              }), (0, L.jsx)(`th`, {
                children: `СЕТ`
              }), (0, L.jsx)(`th`, {
                children: `ДЛИТЕЛЬНОСТЬ`
              }), (0, L.jsx)(`th`, {
                children: `ТОЧНОСТЬ`
              }), (0, L.jsx)(`th`, {
                children: `ПРЕСЕТ`
              }), (0, L.jsx)(`th`, {
                children: `ТРЕКИ`
              })]
            })
          }), (0, L.jsx)(`tbody`, {
            children: e.map(e => (0, L.jsxs)(`tr`, {
              children: [(0, L.jsx)(`td`, {
                children: e.session_date ? new Date(e.session_date).toLocaleString(`ru-RU`) : `—`
              }), (0, L.jsx)(`td`, {
                children: e.set_name
              }), (0, L.jsx)(`td`, {
                children: IK(e.duration_seconds)
              }), (0, L.jsxs)(`td`, {
                className: `green`,
                children: [(e.bpm_accuracy || 0).toFixed(1), `%`]
              }), (0, L.jsx)(`td`, {
                children: PRESETS[e.preset_key] ? PRESETS[e.preset_key].artist : e.preset_key || `—`
              }), (0, L.jsx)(`td`, {
                children: (e.played_tracks || []).length ? (e.played_tracks || []).join(` · `) : `—`
              })]
            }, e.id))
          })]
        })
      }) : (0, L.jsxs)(`div`, {
        className: `sw-empty`,
        children: [`История пуста.`, (0, L.jsx)(`br`, {}), `Запустите деки на пульте и нажмите «СОХРАНИТЬ СЕТ В АНАЛИТИКУ».`]
      })]
    })]
  });
}
var zK = () => ({
  dj_name: ``,
  city: ``,
  experience_years: 0,
  primary_gear: ``,
  bio: ``,
  favorite_presets: []
});
function Profile() {
  let [e, t] = (0, _.useState)(null),
    [n, r] = (0, _.useState)(``),
    [i, a] = (0, _.useState)(zK),
    [o, s] = (0, _.useState)([]),
    [c, l] = (0, _.useState)(``);
  (0, _.useEffect)(() => {
    (async () => {
      let e = await J.auth.me();
      r(e.email || ``);
      let [n, i] = await Promise.all([J.entities.DjProfile.filter({
          created_by_id: e.id
        }, {
          limit: 1
        }), J.entities.AutomixSettings.filter({
          created_by_id: e.id
        }, {
          sort: `-created_date`,
          limit: 20
        })]),
        o = n.items && n.items[0];
      o ? (t(o.id), a({
        dj_name: o.dj_name || e.full_name || ``,
        city: o.city || ``,
        experience_years: o.experience_years || 0,
        primary_gear: o.primary_gear || ``,
        bio: o.bio || ``,
        favorite_presets: o.favorite_presets || []
      })) : a(t => ({
        ...t,
        dj_name: e.full_name || ``
      })), s(i.items || []);
    })();
  }, []);
  let u = (e, t) => a(n => ({
      ...n,
      [e]: t
    })),
    d = e => {
      a(t => ({
        ...t,
        favorite_presets: t.favorite_presets.includes(e) ? t.favorite_presets.filter(t => t !== e) : [...t.favorite_presets, e]
      }));
    },
    f = async () => {
      if (e) await J.entities.DjProfile.update(e, i);else {
        let e = await J.entities.DjProfile.create(i);
        t(e.id);
      }
      l(`ПРОФИЛЬ СОХРАНЁН`);
    },
    p = async e => {
      let t = await J.auth.me();
      await J.entities.AutomixSettings.updateMany({
        created_by_id: t.id,
        is_active: !0
      }, {
        $set: {
          is_active: !1
        }
      }), await J.entities.AutomixSettings.update(e.id, {
        is_active: !0
      }), s(t => t.map(t => ({
        ...t,
        is_active: t.id === e.id
      })));
    },
    m = async e => {
      await J.entities.AutomixSettings.delete(e.id), s(t => t.filter(t => t.id !== e.id));
    };
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `USER PROFILE`
      }), (0, L.jsx)(`p`, {
        children: `Данные диджея, любимые железные пресеты и сохранённые настройки сведения.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-grid cols-2`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `АККАУНТ`
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `EMAIL (из аккаунта)`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            value: n,
            readOnly: !0
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `DJ NAME`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            value: i.dj_name,
            onChange: e => u(`dj_name`, e.target.value)
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `ГОРОД`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            value: i.city,
            onChange: e => u(`city`, e.target.value)
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `ОПЫТ, ЛЕТ`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            type: `number`,
            min: 0,
            max: 60,
            value: i.experience_years,
            onChange: e => u(`experience_years`, Number(e.target.value))
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `ОСНОВНОЕ ЖЕЛЕЗО`
          }), (0, L.jsx)(`input`, {
            className: `sw-input`,
            value: i.primary_gear,
            placeholder: `напр. 2x CDJ-3000 + DJM-900NXS2`,
            onChange: e => u(`primary_gear`, e.target.value)
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `О СЕБЕ`
          }), (0, L.jsx)(`textarea`, {
            className: `sw-textarea`,
            value: i.bio,
            onChange: e => u(`bio`, e.target.value)
          })]
        }), (0, L.jsx)(`div`, {
          className: `sw-row`,
          children: (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn primary`,
            onClick: f,
            children: `СОХРАНИТЬ ПРОФИЛЬ`
          })
        }), c ? (0, L.jsx)(`div`, {
          className: `green setlog-status`,
          children: c
        }) : null]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `ЛЮБИМЫЕ HARDWARE-ПРЕСЕТЫ`
        }), (0, L.jsx)(`div`, {
          className: `preset-toggle-grid`,
          children: PRESET_KEYS.map(e => {
            let t = i.favorite_presets.includes(e);
            return (0, L.jsx)(`button`, {
              type: `button`,
              className: `preset-toggle ${t ? `active` : ``}`,
              onClick: () => d(e),
              children: PRESETS[e].artist
            }, e);
          })
        }), i.favorite_presets.length ? (0, L.jsx)(`div`, {
          className: `sw-mt-small`,
          children: i.favorite_presets.map(e => {
            let t = PRESETS[e];
            return t ? (0, L.jsxs)(`div`, {
              className: `fav-preset`,
              children: [(0, L.jsx)(`div`, {
                className: `green`,
                children: t.artist
              }), (0, L.jsx)(`div`, {
                className: `sw-muted`,
                children: t.name
              }), (0, L.jsxs)(`div`, {
                className: `sw-muted`,
                children: [`GEAR: `, t.gearUsed]
              }), (0, L.jsxs)(`div`, {
                className: `sw-muted`,
                children: [`cutoff `, t.cutoff, ` Hz · resonance `, t.resonance, ` · drive `, t.drive]
              })]
            }, e) : null;
          })
        }) : (0, L.jsx)(`div`, {
          className: `sw-muted sw-mt-small`,
          children: `Отметьте пресеты выше — они появятся здесь с настройками железа.`
        }), (0, L.jsx)(`h3`, {
          className: `sw-mt`,
          children: `СОХРАНЁННЫЕ НАСТРОЙКИ СВЕДЕНИЯ`
        }), o.length ? o.map(e => (0, L.jsxs)(`div`, {
          className: `automix-item`,
          children: [(0, L.jsxs)(`div`, {
            className: `automix-head`,
            children: [(0, L.jsx)(`span`, {
              className: e.is_active ? `green` : ``,
              children: e.name
            }), e.is_active ? (0, L.jsx)(`span`, {
              className: `sw-badge on`,
              children: `АКТИВНЫЙ`
            }) : null]
          }), (0, L.jsxs)(`div`, {
            className: `sw-muted`,
            children: [e.transition_seconds, ` с · `, e.target_bpm, ` BPM · допуск `, e.beat_tolerance, `% · `, e.style]
          }), (0, L.jsxs)(`div`, {
            className: `sw-row sw-mt-small`,
            children: [(0, L.jsx)(`button`, {
              type: `button`,
              className: `sw-btn`,
              onClick: () => p(e),
              children: `АКТИВИРОВАТЬ`
            }), (0, L.jsx)(`button`, {
              type: `button`,
              className: `sw-btn danger`,
              onClick: () => m(e),
              children: `УДАЛИТЬ`
            })]
          })]
        }, e.id)) : (0, L.jsx)(`div`, {
          className: `sw-muted`,
          children: `Настройки сведения создаются на странице Automix Settings.`
        })]
      })]
    })]
  });
}
var VK = [{
    id: `deckA.volume`,
    label: `КАНАЛ A — LEVEL`
  }, {
    id: `deckA.tone`,
    label: `КАНАЛ A — TONE`
  }, {
    id: `deckA.eqLow`,
    label: `КАНАЛ A — EQ LOW`
  }, {
    id: `deckA.eqMid`,
    label: `КАНАЛ A — EQ MID`
  }, {
    id: `deckA.eqHigh`,
    label: `КАНАЛ A — EQ HIGH`
  }, {
    id: `deckA.fxSend`,
    label: `КАНАЛ A — FX SEND`
  }, {
    id: `deckA.wave`,
    label: `КАНАЛ A — ПОЗИЦИЯ ВОЛНЫ`
  }, {
    id: `deckB.volume`,
    label: `КАНАЛ B — LEVEL`
  }, {
    id: `deckB.tone`,
    label: `КАНАЛ B — TONE`
  }, {
    id: `deckB.eqLow`,
    label: `КАНАЛ B — EQ LOW`
  }, {
    id: `deckB.eqMid`,
    label: `КАНАЛ B — EQ MID`
  }, {
    id: `deckB.eqHigh`,
    label: `КАНАЛ B — EQ HIGH`
  }, {
    id: `deckB.fxSend`,
    label: `КАНАЛ B — FX SEND`
  }, {
    id: `deckB.wave`,
    label: `КАНАЛ B — ПОЗИЦИЯ ВОЛНЫ`
  }, {
    id: `master.volume`,
    label: `MASTER LEVEL`
  }, {
    id: `fx.filter`,
    label: `FX — FILTER SWEEP`
  }, {
    id: `fx.delay`,
    label: `FX — DELAY THROW`
  }, {
    id: `fx.drive`,
    label: `FX — DRIVE BOOST`
  }, {
    id: `fx.brake`,
    label: `FX — BRAKE / STOP`
  }],
  HK = e => {
    let t = VK.find(t => t.id === e);
    return t ? t.label : e;
  };
function UK(e, t, n) {
  let [r, i] = t.split(`.`);
  if (r === `master`) {
    e.setMaster(n);
    return;
  }
  if (r === `deckA` || r === `deckB`) {
    let t = r === `deckA` ? `A` : `B`;
    i === `volume` ? e.setVolume(t, n) : i === `tone` ? e.setDeckTone(t, n) : i === `fxSend` ? e.setDeckFxSend(t, n) : i === `wave` ? e.seekTrack(t, (e.get(t)?.buffer?.duration || 0) * n) : i === `eqLow` ? e.setDeckEq(t, `low`, -26 + n * 32) : i === `eqMid` ? e.setDeckEq(t, `mid`, -26 + n * 32) : i === `eqHigh` && e.setDeckEq(t, `high`, -26 + n * 32);
    return;
  }
  r === `fx` && (n > .5 ? e.engageFx(i) : e.releaseFx(i));
}
function HardwareSetup() {
  let e = useEngine(),
    [t, n] = (0, _.useState)(!0),
    [r, i] = (0, _.useState)(null),
    [a, o] = (0, _.useState)([]),
    [s, c] = (0, _.useState)([]),
    [l, u] = (0, _.useState)(null),
    [d, f] = (0, _.useState)(null),
    [p, m] = (0, _.useState)(``),
    h = (0, _.useRef)(null),
    g = (0, _.useRef)([]);
  (0, _.useEffect)(() => {
    h.current = l;
  }, [l]), (0, _.useEffect)(() => {
    g.current = s;
  }, [s]), (0, _.useEffect)(() => {
    (async () => {
      let e = await J.auth.me(),
        t = await J.entities.HardwareMapping.filter({
          created_by_id: e.id
        }, {
          sort: `-created_date`,
          limit: 100
        });
      c(t.items || []);
    })();
  }, []);
  let v = e => {
      o(Array.from(e.inputs.values()).map(e => ({
        id: e.id,
        name: e.name || `MIDI IN`,
        manufacturer: e.manufacturer || ``
      })));
    },
    y = async () => {
      if (!navigator.requestMIDIAccess) {
        n(!1);
        return;
      }
      try {
        let e = await navigator.requestMIDIAccess();
        i(e), v(e), e.onstatechange = () => v(e), m(`MIDI-ДОСТУП ПОЛУЧЕН`);
      } catch {
        n(!1);
      }
    },
    b = async (e, t, n, r) => {
      let i = await J.entities.HardwareMapping.create({
        controller: e,
        control_label: HK(r),
        target: r,
        channel: t,
        cc_number: n
      });
      c(e => [i, ...e]), u(null), m(`НАЗНАЧЕНО: CC ${n} → ${HK(r)}`);
    };
  (0, _.useEffect)(() => {
    if (!r) return;
    let t = t => {
        let [n, r, i] = t.data;
        if ((n & 240) != 176) return;
        let a = (n & 15) + 1,
          o = i / 127,
          s = t.currentTarget ? t.currentTarget.name : `MIDI IN`;
        if (f({
          controller: s,
          channel: a,
          cc: r,
          value: i
        }), h.current) {
          b(s, a, r, h.current);
          return;
        }
        g.current.filter(e => e.cc_number === r).forEach(t => UK(e, t.target, o));
      },
      n = Array.from(r.inputs.values());
    return n.forEach(e => {
      e.onmidimessage = t;
    }), () => {
      n.forEach(e => {
        e.onmidimessage = null;
      });
    };
  }, [r, e]);
  let x = async e => {
    await J.entities.HardwareMapping.delete(e.id), c(t => t.filter(t => t.id !== e.id));
  };
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `HARDWARE SETUP`
      }), (0, L.jsx)(`p`, {
        children: `Назначьте фейдеры и ручки внешнего контроллера на параметры каналов и позицию волны: включите LEARN и двиньте ручку на железе.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-panel`,
      children: [(0, L.jsx)(`h3`, {
        children: `MIDI-КОНТРОЛЛЕРЫ`
      }), t ? (0, L.jsxs)(L.Fragment, {
        children: [(0, L.jsxs)(`div`, {
          className: `sw-row`,
          children: [(0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn primary`,
            onClick: y,
            children: r ? `ОБНОВИТЬ СПИСОК` : `ПОДКЛЮЧИТЬ MIDI`
          }), d ? (0, L.jsxs)(`span`, {
            className: `sw-muted`,
            children: [`ПОСЛЕДНЕЕ: `, d.controller, ` · CH `, d.channel, ` · CC `, d.cc, ` ·`, ` `, d.value]
          }) : null]
        }), a.length ? (0, L.jsx)(`div`, {
          className: `midi-devices`,
          children: a.map(e => (0, L.jsxs)(`div`, {
            className: `sw-kv`,
            children: [(0, L.jsx)(`span`, {
              children: e.manufacturer || `MIDI`
            }), (0, L.jsx)(`span`, {
              className: `green`,
              children: e.name
            })]
          }, e.id))
        }) : (0, L.jsx)(`div`, {
          className: `sw-empty sw-mt-small`,
          children: r ? `Порты не найдены. Подключите контроллер кабелем и включите его — список обновится сам.` : `Нажмите «ПОДКЛЮЧИТЬ MIDI», чтобы браузер увидел контроллер.`
        })]
      }) : (0, L.jsx)(`div`, {
        className: `sw-empty`,
        children: `Этот браузер не поддерживает Web MIDI. Откройте приложение в Chrome или Edge на компьютере.`
      }), p ? (0, L.jsx)(`div`, {
        className: `green setlog-status`,
        children: p
      }) : null]
    }), (0, L.jsxs)(`div`, {
      className: `sw-grid cols-2 sw-mt`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `ЦЕЛИ ДЛЯ НАЗНАЧЕНИЯ`
        }), (0, L.jsx)(`div`, {
          className: `midi-targets`,
          children: VK.map(e => {
            let t = s.some(t => t.target === e.id),
              n = l === e.id;
            return (0, L.jsxs)(`div`, {
              className: `midi-target`,
              children: [(0, L.jsx)(`span`, {
                className: t ? `green` : ``,
                children: e.label
              }), (0, L.jsx)(`button`, {
                type: `button`,
                className: `sw-btn ${n ? `primary` : ``}`,
                onClick: () => {
                  u(n ? null : e.id), m(n ? `` : `ЖДУ CC ОТ КОНТРОЛЛЕРА ДЛЯ ${e.label}`);
                },
                children: n ? `ОЖИДАНИЕ...` : `LEARN`
              })]
            }, e.id);
          })
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `КАРТА НАЗНАЧЕНИЙ`
        }), s.length ? (0, L.jsx)(`div`, {
          className: `sw-scroll-x`,
          children: (0, L.jsxs)(`table`, {
            className: `sw-table`,
            children: [(0, L.jsx)(`thead`, {
              children: (0, L.jsxs)(`tr`, {
                children: [(0, L.jsx)(`th`, {
                  children: `КОНТРОЛЛЕР`
                }), (0, L.jsx)(`th`, {
                  children: `CC`
                }), (0, L.jsx)(`th`, {
                  children: `КАНАЛ`
                }), (0, L.jsx)(`th`, {
                  children: `ЦЕЛЬ`
                }), (0, L.jsx)(`th`, {})]
              })
            }), (0, L.jsx)(`tbody`, {
              children: s.map(e => (0, L.jsxs)(`tr`, {
                children: [(0, L.jsx)(`td`, {
                  children: e.controller
                }), (0, L.jsx)(`td`, {
                  className: `green`,
                  children: e.cc_number
                }), (0, L.jsx)(`td`, {
                  children: e.channel
                }), (0, L.jsx)(`td`, {
                  children: HK(e.target)
                }), (0, L.jsx)(`td`, {
                  children: (0, L.jsx)(`button`, {
                    type: `button`,
                    className: `sw-btn danger`,
                    onClick: () => x(e),
                    children: `✕`
                  })
                })]
              }, e.id))
            })]
          })
        }) : (0, L.jsxs)(`div`, {
          className: `sw-empty`,
          children: [`Назначений пока нет.`, (0, L.jsx)(`br`, {}), `Включите LEARN напротив параметра и двиньте ручку на контроллере.`]
        })]
      })]
    })]
  });
}
var GK = () => ({
    master_output_device: ``,
    mic_device: ``,
    mic_gain: .6,
    mic_enabled: !1,
    cue_monitor: !1,
    cue_level: .7,
    deck_a_route: `main`,
    deck_b_route: `main`
  }),
  KK = (e, t) => e.label || `УСТРОЙСТВО ${t + 1}`;
function AudioRouting() {
  let e = useEngine(),
    [t, n] = (0, _.useState)(null),
    [r, i] = (0, _.useState)(GK),
    [a, o] = (0, _.useState)([]),
    [s, c] = (0, _.useState)([]),
    [l, u] = (0, _.useState)(!0),
    [d, f] = (0, _.useState)(0),
    [p, m] = (0, _.useState)(``);
  (0, _.useEffect)(() => {
    (async () => {
      let t = await J.auth.me(),
        r = await J.entities.AudioRoutingSettings.filter({
          created_by_id: t.id
        }, {
          limit: 1
        }),
        a = r.items && r.items[0];
      a && (n(a.id), i({
        master_output_device: a.master_output_device || ``,
        mic_device: a.mic_device || ``,
        mic_gain: a.mic_gain === void 0 ? .6 : a.mic_gain,
        mic_enabled: !!a.mic_enabled,
        cue_monitor: !!a.cue_monitor,
        cue_level: a.cue_level === void 0 ? .7 : a.cue_level,
        deck_a_route: a.deck_a_route || `main`,
        deck_b_route: a.deck_b_route || `main`
      }), e.setDeckRoute(`A`, a.deck_a_route || `main`), e.setDeckRoute(`B`, a.deck_b_route || `main`), e.setCueLevel(a.cue_level === void 0 ? .7 : a.cue_level), e.setCueMonitor(!!a.cue_monitor), e.setMicGain(a.mic_gain === void 0 ? .6 : a.mic_gain));
    })();
  }, [e]), (0, _.useEffect)(() => {
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      let e = await navigator.mediaDevices.enumerateDevices();
      o(e.filter(e => e.kind === `audiooutput`)), c(e.filter(e => e.kind === `audioinput`));
    })();
  }, []), (0, _.useEffect)(() => {
    let t = e.init();
    u(!t || typeof t.setSinkId == `function`);
  }, [e]), (0, _.useEffect)(() => {
    if (!r.mic_enabled) {
      f(0);
      return;
    }
    let t = window.setInterval(() => f(e.getMicLevel()), 120);
    return () => window.clearInterval(t);
  }, [r.mic_enabled, e]);
  let h = (e, t) => i(n => ({
      ...n,
      [e]: t
    })),
    g = (t, n) => {
      e.setDeckRoute(t, n), h(t === `A` ? `deck_a_route` : `deck_b_route`, n);
    },
    v = t => {
      e.setCueLevel(t), h(`cue_level`, t);
    },
    y = () => {
      let t = !r.cue_monitor;
      e.setCueMonitor(t), h(`cue_monitor`, t);
    },
    b = t => {
      e.setMicGain(t), h(`mic_gain`, t);
    },
    x = async () => {
      let t = !r.mic_enabled,
        n = await e.setMicEnabled(t, r.mic_device || void 0);
      h(`mic_enabled`, n), m(n ? `МИКРОФОН В МИКСЕ` : t ? `НЕТ ДОСТУПА К МИКРОФОНУ` : `МИКРОФОН ВЫКЛЮЧЕН`);
    },
    S = async t => {
      h(`mic_device`, t), r.mic_enabled && (await e.setMicEnabled(!0, t || void 0));
    },
    C = async t => {
      let n = await e.setOutputDevice(t);
      h(`master_output_device`, t), m(n ? `ВЫХОД ПЕРЕКЛЮЧЁН` : `Браузер не дал переключить выход — играем через системный`);
    };
  return (0, L.jsxs)(`div`, {
    className: `sw-page`,
    children: [(0, L.jsxs)(`div`, {
      className: `sw-page-head`,
      children: [(0, L.jsx)(`h2`, {
        children: `AUDIO ROUTING`
      }), (0, L.jsx)(`p`, {
        children: `Куда идут деки, где слушать CUE и как включить микрофон для живого сета. Настройки применяются сразу к аудио-графу и сохраняются для следующего запуска.`
      })]
    }), (0, L.jsxs)(`div`, {
      className: `sw-grid cols-2`,
      children: [(0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `ВЫХОДЫ ДЕК`
        }), (0, L.jsx)(`div`, {
          className: `route-block`,
          children: [`A`, `B`].map(e => (0, L.jsxs)(`div`, {
            className: `route-row`,
            children: [(0, L.jsxs)(`span`, {
              children: [`КАНАЛ `, e]
            }), (0, L.jsxs)(`div`, {
              className: `mode-switch`,
              children: [(0, L.jsx)(`button`, {
                type: `button`,
                className: `mode-btn ${r[e === `A` ? `deck_a_route` : `deck_b_route`] === `main` ? `active` : ``}`,
                onClick: () => g(e, `main`),
                children: `MAIN`
              }), (0, L.jsx)(`button`, {
                type: `button`,
                className: `mode-btn ${r[e === `A` ? `deck_a_route` : `deck_b_route`] === `cue` ? `active` : ``}`,
                onClick: () => g(e, `cue`),
                children: `CUE`
              })]
            })]
          }, e))
        }), (0, L.jsx)(`h3`, {
          className: `sw-mt`,
          children: `CUE / МОНИТОРИНГ`
        }), (0, L.jsx)(`div`, {
          className: `sw-row`,
          children: (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn ${r.cue_monitor ? `primary` : ``}`,
            onClick: y,
            children: r.cue_monitor ? `CUE ВКЛЮЧЁН` : `CUE ВЫКЛЮЧЕН`
          })
        }), (0, L.jsxs)(`label`, {
          className: `sw-field sw-mt-small`,
          children: [(0, L.jsxs)(`span`, {
            children: [`УРОВЕНЬ CUE: `, Math.round(r.cue_level * 100), `%`]
          }), (0, L.jsx)(`input`, {
            className: `sw-range`,
            type: `range`,
            min: 0,
            max: 1,
            step: .01,
            value: r.cue_level,
            onChange: e => v(Number(e.target.value))
          })]
        }), (0, L.jsx)(`div`, {
          className: `sw-muted`,
          children: `Деки, отправленные в CUE, играют только когда мониторинг включён — так удобно слушать следующий трек, не отдавая его в зал.`
        }), (0, L.jsx)(`h3`, {
          className: `sw-mt`,
          children: `МАСТЕР-ВЫХОД`
        }), l ? (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `АУДИО-УСТРОЙСТВО`
          }), (0, L.jsxs)(`select`, {
            className: `sw-select`,
            value: r.master_output_device,
            onChange: e => C(e.target.value),
            children: [(0, L.jsx)(`option`, {
              value: ``,
              children: `СИСТЕМНОЕ ПО УМОЛЧАНИЮ`
            }), a.map((e, t) => (0, L.jsx)(`option`, {
              value: e.deviceId,
              children: KK(e, t)
            }, e.deviceId || t))]
          })]
        }) : (0, L.jsx)(`div`, {
          className: `sw-empty`,
          children: `Браузер не поддерживает выбор аудио-выхода. Звук идёт на системное устройство.`
        })]
      }), (0, L.jsxs)(`div`, {
        className: `sw-panel`,
        children: [(0, L.jsx)(`h3`, {
          children: `МИКРОФОН ДЛЯ ЖИВОГО СЕТА`
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsx)(`span`, {
            children: `ВХОД`
          }), (0, L.jsxs)(`select`, {
            className: `sw-select`,
            value: r.mic_device,
            onChange: e => S(e.target.value),
            children: [(0, L.jsx)(`option`, {
              value: ``,
              children: `МИКРОФОН ПО УМОЛЧАНИЮ`
            }), s.map((e, t) => (0, L.jsx)(`option`, {
              value: e.deviceId,
              children: KK(e, t)
            }, e.deviceId || t))]
          })]
        }), (0, L.jsxs)(`label`, {
          className: `sw-field`,
          children: [(0, L.jsxs)(`span`, {
            children: [`УРОВЕНЬ МИКРОФОНА: `, Math.round(r.mic_gain * 100), `%`]
          }), (0, L.jsx)(`input`, {
            className: `sw-range`,
            type: `range`,
            min: 0,
            max: 1,
            step: .01,
            value: r.mic_gain,
            onChange: e => b(Number(e.target.value))
          })]
        }), (0, L.jsx)(`div`, {
          className: `sw-row`,
          children: (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn ${r.mic_enabled ? `primary` : ``}`,
            onClick: x,
            children: r.mic_enabled ? `ВЫКЛЮЧИТЬ МИКРОФОН` : `ВКЛЮЧИТЬ МИКРОФОН`
          })
        }), (0, L.jsxs)(`div`, {
          className: `sw-field sw-mt-small`,
          children: [(0, L.jsx)(`span`, {
            children: `УРОВЕНЬ СИГНАЛА`
          }), (0, L.jsx)(`div`, {
            className: `meter`,
            children: (0, L.jsx)(`div`, {
              className: `meter-fill`,
              style: {
                width: `${Math.round(d * 100)}%`
              }
            })
          })]
        }), (0, L.jsx)(`div`, {
          className: `sw-muted`,
          children: `Микрофон подмешивается в мастер-шину поверх деков — для подложки, объявлений или вокала поверх сета.`
        }), (0, L.jsx)(`div`, {
          className: `sw-row sw-mt`,
          children: (0, L.jsx)(`button`, {
            type: `button`,
            className: `sw-btn primary`,
            onClick: async () => {
              if (t) await J.entities.AudioRoutingSettings.update(t, r);else {
                let e = await J.entities.AudioRoutingSettings.create(r);
                n(e.id);
              }
              m(`РОУТИНГ СОХРАНЁН`);
            },
            children: `СОХРАНИТЬ РОУТИНГ`
          })
        }), p ? (0, L.jsx)(`div`, {
          className: `green setlog-status`,
          children: p
        }) : null]
      })]
    })]
  });
}
export {Layout, Dashboard, Presets, AutomixSettings, Analytics, Profile, HardwareSetup, AudioRouting, StripewolfEngine, SynthGroove, PRESETS};

