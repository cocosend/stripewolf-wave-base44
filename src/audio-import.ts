export type DeckId = 'A' | 'B';
export interface ImportEngine {
  init(): AudioContext | null;
  get(id: DeckId): { buffer: AudioBuffer | null; mode: string; offset: number; playing: boolean; trackName?: string } | null;
  stopTrack(id: DeckId): void;
  groove(id: DeckId): { stop(): void };
  startTrack(id: DeckId): void;
}
const revisions = new WeakMap<ImportEngine, Map<DeckId, number>>();
export async function importTrack(engine: ImportEngine, deck: DeckId, file: File) {
  if (!file.size) throw new Error('Файл пуст. Выберите загруженный на устройство MP3, WAV или M4A.');
  if (file.size > 100 * 1024 * 1024) throw new Error('Файл больше 100 МБ. Используйте MP3/M4A или более короткий WAV.');
  const context = engine.init();
  if (!context) throw new Error('Этот браузер не поддерживает Web Audio.');
  let versions = revisions.get(engine);
  if (!versions) { versions = new Map(); revisions.set(engine, versions); }
  const revision = (versions.get(deck) ?? 0) + 1;
  versions.set(deck, revision);
  let buffer: AudioBuffer;
  try {
    // Decoding does not require playback permission. Never await resume() here:
    // Safari may leave it pending after the system file picker closes.
    buffer = await context.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error('Не удалось прочитать аудио. Скачайте файл из iCloud на устройство; используйте MP3, WAV или M4A без DRM.');
  }
  if (versions.get(deck) !== revision) return null;
  if (!Number.isFinite(buffer.duration) || buffer.duration <= 0) throw new Error('Аудиофайл не содержит звука.');
  if (buffer.length * buffer.numberOfChannels * 4 > 256 * 1024 * 1024) throw new Error('Трек слишком длинный для безопасной загрузки на телефоне.');
  const state = engine.get(deck);
  if (!state) throw new Error('Аудиодека недоступна. Перезагрузите страницу.');
  engine.stopTrack(deck);
  engine.groove(deck).stop();
  state.buffer = buffer;
  state.mode = 'track';
  state.trackName = file.name;
  state.offset = 0;
  if (state.playing && context.state === 'running') engine.startTrack(deck);
  else state.playing = false;
  return { name: file.name, duration: buffer.duration };
}
export async function resumeAudio(context: AudioContext): Promise<boolean> {
  if (context.state === 'running') return true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([context.resume(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Playback requires a gesture')), 1500);
    })]);
    return (context.state as string) === 'running';
  } catch { return false; }
  finally { clearTimeout(timer); }
}
