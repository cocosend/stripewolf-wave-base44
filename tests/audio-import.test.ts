import {test} from 'node:test';
import assert from 'node:assert/strict';
import {importTrack,importRenderedTrack,type ImportEngine} from '../src/audio-import';
function fixture(decode:(bytes:ArrayBuffer)=>Promise<AudioBuffer>){
 const state={buffer:null as AudioBuffer|null,mode:'synth',offset:22,playing:false};let stopped=0;
 const context={state:'suspended',decodeAudioData:decode,resume(){throw new Error('Import must not resume audio');}} as unknown as AudioContext;
 const engine:ImportEngine={init:()=>context,get:()=>state,stopTrack:()=>{stopped++},groove:()=>({stop:()=>{}}),startTrack:()=>{throw new Error('Must not autoplay suspended context');}};
 return {engine,state,stopped:()=>stopped};
}
const buffer={duration:12,length:529200,numberOfChannels:2} as AudioBuffer;
const file=(name='test.wav')=>new File([new Uint8Array([1,2,3])],name,{type:'audio/wav'});
test('imports while Safari context remains suspended without awaiting resume',async()=>{const f=fixture(async()=>buffer);const result=await importTrack(f.engine,'A',file());assert.equal(result?.duration,12);assert.equal(f.state.buffer,buffer);assert.equal(f.state.mode,'track');assert.equal(f.state.offset,0);assert.equal(f.stopped(),1);});
test('failed decode preserves current track and reports an actionable error',async()=>{const f=fixture(async()=>{throw new Error('EncodingError')});f.state.buffer=buffer;await assert.rejects(importTrack(f.engine,'A',file()),/MP3, WAV/);assert.equal(f.state.buffer,buffer);assert.equal(f.stopped(),0);});
test('latest selection wins when earlier decoding finishes later',async()=>{let first!:(b:AudioBuffer)=>void;let calls=0;const f=fixture(()=>++calls===1?new Promise(resolve=>{first=resolve}):Promise.resolve(buffer));const old=importTrack(f.engine,'A',file('old.wav'));await new Promise(resolve=>setTimeout(resolve,0));const latest=await importTrack(f.engine,'A',file('new.wav'));first(buffer);assert.equal(await old,null);assert.equal(latest?.name,'new.wav');assert.equal(f.stopped(),1);});
test('rejects empty files before graph mutation',async()=>{const f=fixture(async()=>buffer);await assert.rejects(importTrack(f.engine,'B',new File([],'empty.wav')),/пуст/);assert.equal(f.stopped(),0);});

test('rendered audio is installed directly without WAV encoding or a second decode', async () => {
  const f = fixture(async () => { throw new Error('decode should not run'); });
  const loaded = await importRenderedTrack(f.engine, 'B', Promise.resolve({buffer, name: 'Kazantip · Sunrise 303'}));
  assert.equal(loaded?.name, 'Kazantip · Sunrise 303');
  assert.equal(f.state.mode, 'track');
  assert.equal(f.state.buffer, buffer);
  assert.equal(f.stopped(), 1);
});

test('rejected offline demo leaves the previous song intact', async () => {
  const f = fixture(async () => buffer);
  f.state.buffer = buffer;
  f.state.mode = 'track';
  await assert.rejects(importRenderedTrack(f.engine, 'A', Promise.reject(new Error('renderer failed'))), /renderer failed/);
  assert.equal(f.state.buffer, buffer);
  assert.equal(f.stopped(), 0);
});

test('a newer user file selection wins over an older demo rendering', async () => {
  const f = fixture(async () => buffer);
  let resolveDemo!: (rendered: {buffer: AudioBuffer; name: string}) => void;
  const pending = new Promise<{buffer: AudioBuffer; name: string}>(resolve => { resolveDemo = resolve; });
  const demo = importRenderedTrack(f.engine, 'A', pending);
  const fileResult = await importTrack(f.engine, 'A', file('my-track.wav'));
  resolveDemo({buffer, name: 'outdated demo'});
  assert.equal(await demo, null);
  assert.equal(fileResult?.name, 'my-track.wav');
  assert.equal(f.state.mode, 'track');
  assert.equal(f.stopped(), 1);
});

test('invalid decoded audio preserves the active track', async () => {
  const f = fixture(async () => ({duration: 0, length: 0, numberOfChannels: 2} as AudioBuffer));
  f.state.buffer = buffer;
  await assert.rejects(importTrack(f.engine, 'B', file()), /не содержит воспроизводимого/);
  assert.equal(f.state.buffer, buffer);
  assert.equal(f.stopped(), 0);
});
