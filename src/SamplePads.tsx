import {useEffect,useRef,useState} from 'react';
type Engine={ctx:AudioContext|null;masterInput:GainNode|null;masterGain:GainNode|null;ensureRunning:()=>Promise<boolean>};
type Capture={recorder:MediaRecorder;destination:MediaStreamAudioDestinationNode;timer:number};
export function SamplePads({engine}:{engine:Engine}){
 const [selected,setSelected]=useState(0),[recording,setRecording]=useState(false),[loaded,setLoaded]=useState<boolean[]>([false,false,false,false]),[error,setError]=useState('');
 const slots=useRef<(AudioBuffer|null)[]>([null,null,null,null]),capture=useRef<Capture|null>(null),selectedRef=useRef(selected);
 selectedRef.current=selected;
 useEffect(()=>()=>{const current=capture.current;if(current){clearTimeout(current.timer);if(current.recorder.state==='recording')current.recorder.stop();engine.masterGain?.disconnect(current.destination)}},[engine]);
 async function toggle(){if(capture.current){capture.current.recorder.stop();return}setError('');try{
  if(!window.MediaRecorder||!await engine.ensureRunning()||!engine.ctx||!engine.masterGain)throw Error('Запись недоступна в этом браузере');
  const destination=engine.ctx.createMediaStreamDestination();engine.masterGain.connect(destination);
  const type=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(value=>MediaRecorder.isTypeSupported(value));
  const recorder=new MediaRecorder(destination.stream,type?{mimeType:type}:undefined),chunks:BlobPart[]=[],slot=selectedRef.current;
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  recorder.onstop=async()=>{const current=capture.current;capture.current=null;setRecording(false);if(current){clearTimeout(current.timer);engine.masterGain?.disconnect(current.destination)}try{const blob=new Blob(chunks,{type:recorder.mimeType});if(!blob.size)throw Error('Запись пуста');const bytes=await blob.arrayBuffer();const decoded=await engine.ctx!.decodeAudioData(bytes);slots.current[slot]=decoded;setLoaded(previous=>previous.map((value,index)=>index===slot?true:value))}catch{setError('Не удалось декодировать сэмпл')}};
  recorder.onerror=()=>{setError('Ошибка записи сэмпла');setRecording(false)};
  recorder.start(500);capture.current={recorder,destination,timer:window.setTimeout(()=>recorder.state==='recording'&&recorder.stop(),15000)};setRecording(true);
 }catch(e){setError(e instanceof Error?e.message:'Ошибка записи')}}
 async function play(index:number){const buffer=slots.current[index];if(!buffer||!await engine.ensureRunning()||!engine.ctx||!engine.masterInput)return;const source=engine.ctx.createBufferSource();source.buffer=buffer;source.connect(engine.masterInput);source.start()}
 return <section className="sample-pads" aria-label="Сэмплер"><div className="drum-heading">SAMPLE PADS <small>ЗАПИСЬ ДО 15 СЕКУНД</small></div><div className="sample-grid">{slots.current.map((_,index)=><div key={index}><button type="button" className={selected===index?'selected':''} onClick={()=>setSelected(index)}>S{index+1} {loaded[index]?'●':''}</button><button type="button" disabled={!loaded[index]} onClick={()=>void play(index)}>▶</button></div>)}</div><button type="button" className="sample-record" onClick={()=>void toggle()}>{recording?`■ СОХРАНИТЬ S${selected+1}`:`● ЗАПИСАТЬ В S${selected+1}`}</button>{error&&<span role="alert">{error}</span>}</section>
}
