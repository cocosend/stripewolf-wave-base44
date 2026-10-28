import {test} from 'node:test';
import assert from 'node:assert/strict';
import {importTrack,type ImportEngine} from '../src/audio-import';
function fixture(decode:(bytes:ArrayBuffer)=>Promise<AudioBuffer>){
 const state={buffer:null as AudioBuffer|null,mode:'synth',offset:22,playing:false,loopBeats:4 as number|null,loopStart:2,loopEnd:4};let stopped=0;
 const context={state:'suspended',decodeAudioData:decode,resume(){throw new Error('Import must not resume audio');}} as unknown as AudioContext;
 const engine:ImportEngine={init:()=>context,get:()=>state,stopTrack:()=>{stopped++},groove:()=>({stop:()=>{}}),startTrack:()=>{throw new Error('Must not autoplay suspended context');}};
 return {engine,state,stopped:()=>stopped};
}
const buffer={duration:12,length:529200,numberOfChannels:2} as AudioBuffer;
const file=(name='test.wav')=>new File([new Uint8Array([1,2,3])],name,{type:'audio/wav'});
test('imports while Safari context remains suspended without awaiting resume',async()=>{const f=fixture(async()=>buffer);const result=await importTrack(f.engine,'A',file());assert.equal(result?.duration,12);assert.equal(f.state.buffer,buffer);assert.equal(f.state.mode,'track');assert.equal(f.state.offset,0);assert.equal(f.state.loopBeats,null);assert.equal(f.state.loopStart,0);assert.equal(f.state.loopEnd,0);assert.equal(f.stopped(),1);});
test('failed decode preserves current track and reports an actionable error',async()=>{const f=fixture(async()=>{throw new Error('EncodingError')});f.state.buffer=buffer;await assert.rejects(importTrack(f.engine,'A',file()),/MP3, WAV/);assert.equal(f.state.buffer,buffer);assert.equal(f.stopped(),0);});
test('latest selection wins when earlier decoding finishes later',async()=>{let first!:(b:AudioBuffer)=>void;let calls=0;const f=fixture(()=>++calls===1?new Promise(resolve=>{first=resolve}):Promise.resolve(buffer));const old=importTrack(f.engine,'A',file('old.wav'));await new Promise(resolve=>setTimeout(resolve,0));const latest=await importTrack(f.engine,'A',file('new.wav'));first(buffer);assert.equal(await old,null);assert.equal(latest?.name,'new.wav');assert.equal(f.stopped(),1);});
test('rejects empty files before graph mutation',async()=>{const f=fixture(async()=>buffer);await assert.rejects(importTrack(f.engine,'B',new File([],'empty.wav')),/пуст/);assert.equal(f.stopped(),0);});
