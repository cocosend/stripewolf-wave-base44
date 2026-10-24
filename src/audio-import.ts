export type DeckId = 'A' | 'B';

export interface ImportEngine {
  init(): AudioContext | null;
  get(id: DeckId): {
    buffer: AudioBuffer | null;
    mode: string;
    offset: number;
    playing: boolean;
    trackName?: string;
  } | null;
  stopTrack(id: DeckId): void;
  groove(id: DeckId): { stop(): void };
  startTrack(id: DeckId): void;
}

export interface RenderedTrack {
  buffer: AudioBuffer;
  name: string;
}

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_DECODED_BYTES = 256 * 1024 * 1024;
const revisions = new WeakMap<ImportEngine, Map<DeckId, number>>();

function nextRevision(engine: ImportEngine, deck: DeckId): number {
  let versions = revisions.get(engine);
  if (!versions) {
    versions = new Map();
    revisions.set(engine, versions);
  }
  const revision = (versions.get(deck) ?? 0) + 1;
  versions.set(deck, revision);
  return revision;
}

function isCurrent(engine: ImportEngine, deck: DeckId, revision: number): boolean {
  return revisions.get(engine)?.get(deck) === revision;
}

function installBuffer(engine: ImportEngine, deck: DeckId, rendered: RenderedTrack, revision: number) {
  if (!isCurrent(engine, deck, revision)) return null;

  const { buffer, name } = rendered;
  if (!Number.isFinite(buffer.duration) || buffer.duration <= 0 || buffer.numberOfChannels < 1) {
    throw new Error('Аудиофайл не содержит воспроизводимого звука.');
  }
  if (buffer.length * buffer.numberOfChannels * 4 > MAX_DECODED_BYTES) {
    throw new Error('Трек слишком длинный для памяти телефона. Используйте MP3/M4A или более короткую запись.');
  }
  const context = engine.init();
  if (!context) throw new Error('Этот браузер не поддерживает Web Audio.');
  const state = engine.get(deck);
  if (!state) throw new Error('Аудиодека недоступна. Перезагрузите страницу.');

  // Mutate the active deck only after the new audio is fully decoded.
  // An invalid selection never destroys a previously loaded track.
  const wasPlaying = state.playing;
  engine.stopTrack(deck);
  engine.groove(deck).stop();
  state.buffer = buffer;
  state.mode = 'track';
  state.trackName = name;
  state.offset = 0;
  state.playing = false;
  if (wasPlaying && context.state === 'running') {
    state.playing = true;
    engine.startTrack(deck);
  }
  return { name, duration: buffer.duration };
}

export async function importTrack(engine: ImportEngine, deck: DeckId, file: File) {
  if (!file.size) throw new Error('Файл пуст. Выберите загруженный на устройство MP3, WAV или M4A.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Файл больше 100 МБ. Используйте MP3/M4A или более короткий WAV.');

  // Reserve the deck synchronously, before any iCloud read or Safari decode.
  const revision = nextRevision(engine, deck);
  const context = engine.init();
  if (!context) throw new Error('Этот браузер не поддерживает Web Audio.');

  let buffer: AudioBuffer;
  try {
    const bytes = await file.arrayBuffer();
    if (!isCurrent(engine, deck, revision)) return null;
    // Safari's resume() may never settle when the native file picker closes.
    // Decode first; playback activation must happen inside a later tap.
    buffer = await context.decodeAudioData(bytes);
  } catch {
    if (!isCurrent(engine, deck, revision)) return null;
    throw new Error('Не удалось прочитать аудио. Скачайте файл из iCloud на устройство; используйте MP3, WAV или M4A без DRM.');
  }
  return installBuffer(engine, deck, { buffer, name: file.name }, revision);
}

export async function importRenderedTrack(
  engine: ImportEngine,
  deck: DeckId,
  rendering: Promise<RenderedTrack>
) {
  // Reserve before offline rendering starts, so a newer file picker selection wins.
  const revision = nextRevision(engine, deck);
  const rendered = await rendering;
  return installBuffer(engine, deck, rendered, revision);
}

export async function resumeAudio(context: AudioContext): Promise<boolean> {
  if (context.state === 'running') return true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      context.resume(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Playback requires a gesture')), 4500);
      })
    ]);
    return (context.state as string) === 'running';
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
