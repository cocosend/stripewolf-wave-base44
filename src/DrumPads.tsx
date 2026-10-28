import {useState} from 'react';
type Engine={ctx:AudioContext|null;masterInput:GainNode|null;ensureRunning:()=>Promise<boolean>};
type Sound='kick'|'snare'|'clap'|'hat';
export function DrumPads({engine}:{engine:Engine}){
 const [active,setActive]=useState<Sound|null>(null);
 async function hit(kind:Sound){
  if(!await engine.ensureRunning()||!engine.ctx||!engine.masterInput)return;
  const ctx=engine.ctx,output=engine.masterInput,now=ctx.currentTime;
  const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(kind==='kick'?.65:.28,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+(kind==='kick'?.45:.16));gain.connect(output);
  if(kind==='kick'){
   const osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(150,now);osc.frequency.exponentialRampToValueAtTime(48,now+.16);osc.connect(gain);osc.start(now);osc.stop(now+.47);
  }else{
   const duration=.22,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),samples=buffer.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(kind==='hat'?.6:1);
   const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter();filter.type=kind==='hat'?'highpass':'bandpass';filter.frequency.value=kind==='hat'?7000:kind==='clap'?1800:1200;noise.buffer=buffer;noise.connect(filter);filter.connect(gain);noise.start(now);noise.stop(now+duration);
  }
  setActive(kind);window.setTimeout(()=>setActive(current=>current===kind?null:current),100);
 }
 return <section className="drum-pads" aria-label="Драм-пэды"><div className="drum-heading">DRUM PADS <small>LIVE · В МИКС И ЗАПИСЬ</small></div><div className="drum-grid">{(['kick','snare','clap','hat'] as const).map(kind=><button key={kind} type="button" className={active===kind?'active':''} onPointerDown={event=>{event.preventDefault();void hit(kind)}} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();void hit(kind)}}}>{kind.toUpperCase()}</button>)}</div></section>
}
