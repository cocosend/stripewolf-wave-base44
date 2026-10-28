import {useState} from 'react';
import {PRESETS, StripewolfEngine, SynthGroove} from './recovered';
import type {RenderedTrack} from './audio-import';

const demos = [
  {key: 'kazantip', name: 'Kazantip · Retro Coast', bpm: 132},
  {key: 'kazantip', name: 'Kazantip · Sunrise 303', bpm: 138},
  {key: 'legends', name: 'Acid · Night Circuit', bpm: 142},
  {key: 'legends', name: '303 · Black Sea Warehouse', bpm: 146},
  {key: 'modern', name: 'Industrial · Midnight Pulse', bpm: 150},
  {key: 'maddix', name: 'Peak Time · Rumble 909', bpm: 148},
  {key: 'artbat', name: 'Melodic · Orbital Dawn', bpm: 124},
  {key: 'brejcha', name: 'Minimal · Rubber Bass', bpm: 128},
  {key: 'guetta', name: 'Future Rave · Neon Drive', bpm: 130}
] as const;

async function renderDemo(index: number): Promise<RenderedTrack> {
  const demo = demos[index];
  if (!demo) throw new Error('Демотрек не найден.');
  if (typeof OfflineAudioContext === 'undefined') {
    throw new Error('Оффлайн-синтез не поддерживается этим браузером.');
  }

  const sampleRate = 44100;
  const beat = 60 / demo.bpm;
  const bars = 8;
  const context = new OfflineAudioContext(2, Math.ceil(beat * 4 * bars * sampleRate), sampleRate);
  const engine = new StripewolfEngine();
  Object.assign(engine, {ctx: context});
  engine.buildGraph(context);
  engine.applyPreset(PRESETS[demo.key]);

  const groove = new SynthGroove(engine, 'A');
  groove.ensureSub();
  groove.setPreset(PRESETS[demo.key]);
  for (let step = 0; step < bars * 16; step++) {
    groove.playStep(step % 16, step * beat / 4);
  }

  // Keep audio directly in AudioBuffer form: no second WAV allocation
  // and no redundant decodeAudioData call (important on iOS Safari).
  const buffer: AudioBuffer = await context.startRendering();
  engine.stopLFO();

  // Peak-safe, click-reduced loop boundaries without adding gain to quiet material.
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < samples.length; i++) {
      peak = Math.max(peak, Math.abs(samples[i]));
    }
  }
  const scale = peak > 0.95 ? 0.95 / peak : 1;
  const fadeLength = Math.min(256, Math.floor(buffer.length / 8));
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel);
    for (let i = 0; i < samples.length; i++) {
      const fade = Math.min(1, i / fadeLength, (samples.length - i - 1) / fadeLength);
      samples[i] *= scale * fade;
    }
  }

  return {buffer, name: `${demo.name} · ${demo.bpm} BPM`};
}

export function quickDemo(): {rendering: Promise<RenderedTrack>; bpm: number} {
  return {rendering: renderDemo(0), bpm: demos[0].bpm};
}

export function DemoPicker({
  busy,
  onLoad
}: {
  busy: boolean;
  onLoad: (rendering: Promise<RenderedTrack>, bpm: number) => Promise<void>;
}) {
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');

  async function select(value: string) {
    if (value === '' || rendering || busy) return;
    const index = Number(value);
    const demo = demos[index];
    if (!demo) return;
    setRendering(true);
    setError('');
    try {
      // Pass the pending render to the deck immediately: the import revision is
      // reserved before the browser finishes synthesizing the audio.
      await onLoad(renderDemo(index), demo.bpm);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать демотрек');
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="demo-picker">
      <select
        aria-label="Демотреки для сведения"
        className="sw-select"
        disabled={busy || rendering}
        value=""
        onChange={(event) => void select(event.target.value)}
      >
        <option value="">{rendering ? 'СОЗДАНИЕ ДЕМО…' : 'ДЕМОТРЕКИ · LOAD'}</option>
        {demos.map((demo, index) => (
          <option key={index} value={index}>
            {demo.name} · {demo.bpm} BPM
          </option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
      <small>9 оригинальных синтезированных лупов, без записей сторонних артистов.</small>
    </div>
  );
}

