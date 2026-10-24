import {useState} from 'react';
import {PRESETS, StripewolfEngine, SynthGroove} from './recovered';
const demos = [
  {key:'kazantip',name:'Kazantip · Retro Coast',bpm:132},
  {key:'legends',name:'Acid · Night Circuit',bpm:142},
  {key:'artbat',name:'Melodic · Orbital Dawn',bpm:124}
] as const;
function wav(buffer: AudioBuffer): ArrayBuffer {
  const channels=buffer.numberOfChannels, length=buffer.length;
  const output=new ArrayBuffer(44+length*channels*2), view=new DataView(output);
  const str=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  str(0,'RIFF');view.setUint32(4,output.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,buffer.sampleRate,true);view.setUint32(28,buffer.sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,length*channels*2,true);
  const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
  for(let i=0;i<length;i++)for(let c=0;c<channels;c++){
    const fade=Math.min(1,i/256,(length-i-1)/256);
    const sample=Math.max(-1,Math.min(1,data[c][i]*fade));
    view.setInt16(44+(i*channels+c)*2,sample<0?sample*32768:sample*32767,true);
  }
  return output;
}
async function renderDemo(index:number):Promise<File> {
  const demo=demos[index], beat=60/demo.bpm, bars=16;
  const context=new OfflineAudioContext(2,Math.ceil(beat*4*bars*44100),44100);
  const engine=new StripewolfEngine();
  Object.assign(engine,{ctx:context});
  engine.buildGraph(context);
  engine.applyPreset(PRESETS[demo.key]);
  const groove=new SynthGroove(engine,'A');
  groove.ensureSub();groove.setPreset(PRESETS[demo.key]);
  for(let step=0;step<bars*16;step++)groove.playStep(step%16,step*beat/4);
  const buffer=await context.startRendering();
  engine.stopLFO();
  return new File([wav(buffer)],`${demo.name} — ${demo.bpm} BPM.wav`,{type:'audio/wav'});
}
export function DemoPicker({busy,onLoad}:{busy:boolean;onLoad:(file:File,bpm:number)=>Promise<void>}) {
  const [rendering,setRendering]=useState(false),[error,setError]=useState('');
  async function select(value:string){
    if(value==='')return;
    setRendering(true);setError('');
    try{const index=Number(value);await onLoad(await renderDemo(index),demos[index].bpm);}
    catch(e){setError(e instanceof Error?e.message:'Не удалось создать демотрек');}
    finally{setRendering(false);}
  }
  return <div className="demo-picker"><select aria-label="Демотреки для сведения" className="sw-select" disabled={busy||rendering} value="" onChange={e=>void select(e.target.value)}><option value="">{rendering?'РЕНДЕР ДЕМО…':'ДЕМОТРЕКИ · LOAD'}</option>{demos.map((d,i)=><option key={d.key} value={i}>{d.name} · {d.bpm} BPM</option>)}</select>{error&&<p role="alert">{error}</p>}<small>Оригинальные синтезированные демо, не записи артистов.</small></div>;
}
