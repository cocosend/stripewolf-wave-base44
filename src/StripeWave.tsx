import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';

type Deck={buffer:AudioBuffer|null;mode:string;playing:boolean;offset:number;startedAt:number;source:AudioBufferSourceNode|null;analyser:AnalyserNode;loopBeats:number|null;fade:number};
type Engine={ctx:AudioContext|null;get:(id:string)=>Deck|null;rateFor:(deck:Deck)=>number;trackPosition:(id:string)=>number;seekTrack:(id:string,seconds:number)=>void;setLoop:(id:string,beats:number|null)=>void};
const colors={A:['#0ff2d4','#ffe45c','#ff583e'],B:['#61e7ff','#b46bff','#ff4eaa']};

export function StripeWave({engine,id,controls}:{engine:Engine;id:'A'|'B';controls:ReactNode}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const peaks=useRef<{buffer:AudioBuffer|null;values:Float32Array}>({buffer:null,values:new Float32Array(512)});
 const drag=useRef<number|null>(null),last=useRef(0);
 const [orientation,setOrientation]=useState<'vertical'|'horizontal'>('vertical');
 const [loop,setLoop]=useState<number|null>(engine.get(id)?.loopBeats??null);
 useEffect(()=>{let frame=0;
  const draw=()=>{
   const element=canvas.current,deck=engine.get(id),context=element?.getContext('2d');
   if(!element||!context){frame=requestAnimationFrame(draw);return;}
   const w=element.width,h=element.height,vertical=orientation==='vertical',axis=vertical?h:w,cross=vertical?w:h;
   const buffer=deck?.mode==='track'?deck.buffer:null;
   if(buffer!==peaks.current.buffer){
    const values=new Float32Array(512);
    if(buffer){const data=buffer.getChannelData(0),step=Math.max(1,Math.floor(data.length/512));
     for(let i=0;i<512;i++){let max=0;for(let j=i*step;j<Math.min(data.length,(i+1)*step);j+=Math.max(1,Math.floor(step/32)))max=Math.max(max,Math.abs(data[j]));values[i]=max;}}
    peaks.current={buffer,values};
   }
   context.fillStyle='#080d18';context.fillRect(0,0,w,h);
   context.strokeStyle='#263347';context.lineWidth=1;
   for(let p=0;p<axis;p+=40){context.beginPath();if(vertical){context.moveTo(0,p);context.lineTo(w,p);}else{context.moveTo(p,0);context.lineTo(p,h);}context.stroke();}
   const pos=drag.current??engine.trackPosition(id),center=buffer&&buffer.duration>0?pos/buffer.duration*512:0;
   const live=new Uint8Array(deck?.analyser?.fftSize||1024);
   if(!buffer&&deck?.playing)deck.analyser.getByteTimeDomainData(live);
   for(let p=0;p<axis;p+=2){
    const idx=Math.floor(center+(p-axis/2)*512/axis*.28);
    const amp=buffer?(idx>=0&&idx<512?peaks.current.values[idx]:0):(deck?.playing?Math.abs(live[Math.floor(p/axis*live.length)]-128)/128:0);
    const length=Math.max(1,amp*cross*.46);
    context.fillStyle=colors[id][Math.floor(p/Math.max(1,axis/12))%3];
    if(vertical)context.fillRect(cross/2-length,p,length*2,2);else context.fillRect(p,cross/2-length,2,length*2);
   }
   context.fillStyle='#fff';context.shadowColor='#fff';context.shadowBlur=9;
   if(vertical)context.fillRect(0,h/2,w,2);else context.fillRect(w/2,0,2,h);
   context.shadowBlur=0;frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[engine,id,orientation]);
 const move=(event:PointerEvent<HTMLCanvasElement>)=>{
  const deck=engine.get(id);if(drag.current===null||!deck?.buffer)return;
  const rect=event.currentTarget.getBoundingClientRect(),current=orientation==='vertical'?event.clientY:event.clientX;
  const extent=orientation==='vertical'?rect.height:rect.width;
  drag.current=Math.max(0,Math.min(deck.buffer.duration-.001,drag.current-(current-last.current)/extent*deck.buffer.duration*.3));last.current=current;
 };
 const finish=()=>{const pos=drag.current;drag.current=null;if(pos!==null)engine.seekTrack(id,pos);};
 const changeLoop=(beats:number|null)=>{engine.setLoop(id,beats);setLoop(beats);};
 return <article className={`wave-channel deck-${id.toLowerCase()}`}>
  <div className="wave-title"><strong>DECK {id}</strong><span>{orientation==='vertical'?'VERTICAL WAVE':'STRIPE WAVE'}</span></div>
  <div className="wave-tools" role="group" aria-label={`Вид деки ${id}`}>
   <button type="button" className={orientation==='vertical'?'active':''} aria-pressed={orientation==='vertical'} onClick={()=>setOrientation('vertical')}>ВОЛНА</button>
   <button type="button" className={orientation==='horizontal'?'active':''} aria-pressed={orientation==='horizontal'} onClick={()=>setOrientation('horizontal')}>ЛИНИЯ</button>
  </div>
  <canvas ref={canvas} width={480} height={400} className={orientation} role="img" aria-label={`Волна дорожки ${id}: перемотка перетаскиванием`}
   onPointerDown={event=>{const deck=engine.get(id);if(!deck?.buffer||deck.mode!=='track')return;drag.current=engine.trackPosition(id);last.current=orientation==='vertical'?event.clientY:event.clientX;event.currentTarget.setPointerCapture(event.pointerId);}}
   onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{drag.current=null;}}/>
  <div className="wave-loop" role="group" aria-label={`Петля деки ${id}`}>
   <span>LOOP</span>{([null,1,2,4,8] as const).map(beats=><button key={beats??'full'} type="button" disabled={!engine.get(id)?.buffer||engine.get(id)?.mode!=='track'} aria-pressed={loop===beats} className={loop===beats?'active':''} onClick={()=>changeLoop(beats)}>{beats??'FULL'}</button>)}
  </div>
  {controls}
 </article>;
}
