import {useEffect,useRef,useState,type PointerEvent,type ReactNode} from 'react';

type Channel = {buffer:AudioBuffer|null;mode:string;playing:boolean;analyser:AnalyserNode;loopBeats:number|null;trackName?:string};
type Engine = {get:(id:string)=>Channel|null;trackPosition:(id:string)=>number;seekTrack:(id:string,seconds:number)=>void;setLoop:(id:string,beats:number|null)=>void};
type View = 'stripe'|'vertical'|'deck';
const palette = {A:['#08f1d0','#76ffea','#f8db54'],B:['#ff4f9a','#a46fff','#6ee7ff']} as const;

export function StripeWave({engine,id,controls,onQuickDemo}:{engine:Engine;id:'A'|'B';controls:ReactNode;onQuickDemo:()=>Promise<void>}) {
 const canvas=useRef<HTMLCanvasElement>(null);
 const peaks=useRef<{buffer:AudioBuffer|null;values:Float32Array}>({buffer:null,values:new Float32Array(1024)});
 const analyserData=useRef(new Uint8Array(1024));
 const drag=useRef<number|null>(null),last=useRef(0);
 const [view,setView]=useState<View>('deck');
 const [loop,setLoop]=useState<number|null>(engine.get(id)?.loopBeats??null);
 const [loading,setLoading]=useState(false),[loadError,setLoadError]=useState('');
 const buffer=engine.get(id)?.buffer;
 useEffect(()=>{setLoop(engine.get(id)?.loopBeats??null)},[buffer,engine,id]);

 useEffect(()=>{
  const element=canvas.current;
  if(!element)return;
  const context=element.getContext('2d',{alpha:false});
  if(!context)return;
  let frame=0,width=0,height=0;
  const resize=()=>{
   const rect=element.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
   const nextWidth=Math.max(1,Math.round(rect.width*ratio)),nextHeight=Math.max(1,Math.round(rect.height*ratio));
   if(element.width!==nextWidth||element.height!==nextHeight){element.width=nextWidth;element.height=nextHeight}
   width=rect.width;height=rect.height;context.setTransform(ratio,0,0,ratio,0,0);
  };
  resize();
  const observer=new ResizeObserver(resize);observer.observe(element);
  const draw=()=>{
   const channel=engine.get(id),audio=channel?.mode==='track'?channel.buffer:null;
   if(audio!==peaks.current.buffer){
    const values=new Float32Array(1024);
    if(audio){const data=audio.getChannelData(0),step=Math.max(1,Math.floor(data.length/values.length));
     for(let index=0;index<values.length;index++){let maximum=0;const end=Math.min(data.length,(index+1)*step);
      for(let sample=index*step;sample<end;sample+=Math.max(1,Math.floor(step/48)))maximum=Math.max(maximum,Math.abs(data[sample]));
      values[index]=maximum;
     }}
    peaks.current={buffer:audio,values};
   }
   const w=width,h=height,colors=palette[id],active=!!audio&&audio.duration>0;
   context.fillStyle='#07101c';context.fillRect(0,0,w,h);
   const glow=context.createLinearGradient(0,0,w,h);
   glow.addColorStop(0,id==='A'?'#06483f':'#542246');glow.addColorStop(1,'#0a1222');
   context.globalAlpha=.42;context.fillStyle=glow;context.fillRect(0,0,w,h);context.globalAlpha=1;
   if(view==='deck'){
    const overview=Math.min(72,Math.max(48,h*.24)),cx=w/2,cy=overview+(h-overview)/2,r=Math.max(20,Math.min(w*.38,(h-overview)*.42)),position=active?(drag.current??engine.trackPosition(id))/audio.duration:0;
    context.fillStyle='#0a1623';context.fillRect(0,0,w,overview);
    context.strokeStyle='#395065';context.lineWidth=1;
    for(let p=0;p<w;p+=24){context.beginPath();context.moveTo(p,0);context.lineTo(p,overview);context.stroke()}
    if(active){for(let p=0;p<w;p+=2){const index=Math.min(1023,Math.floor(p/w*1024)),length=Math.max(1,peaks.current.values[index]*overview*.45);context.fillStyle=colors[Math.floor(p/Math.max(1,w/8))%3];context.fillRect(p,overview/2-length,2,length*2)}
     context.fillStyle='#fff';context.shadowColor=colors[0];context.shadowBlur=10;context.fillRect(position*w,0,2,overview);context.shadowBlur=0}
    context.fillStyle='#526577';context.fillRect(0,overview-1,w,1);
    for(let ring=0;ring<4;ring++){context.beginPath();context.arc(cx,cy,r-ring*10,0,Math.PI*2);context.strokeStyle=ring===0?colors[0]:'#41546c';context.lineWidth=ring===0?3:1;context.stroke()}
    for(let tick=0;tick<48;tick++){const angle=tick*Math.PI/24-Math.PI/2;context.beginPath();context.moveTo(cx+Math.cos(angle)*(r-3),cy+Math.sin(angle)*(r-3));context.lineTo(cx+Math.cos(angle)*(r+4),cy+Math.sin(angle)*(r+4));context.strokeStyle=tick%4===0?colors[1]:'#456078';context.lineWidth=tick%4===0?2:1;context.stroke()}
    context.beginPath();context.arc(cx,cy,r-6,-Math.PI/2,-Math.PI/2+position*Math.PI*2);context.strokeStyle=colors[2];context.lineWidth=4;context.stroke();
    const angle=position*Math.PI*2-Math.PI/2;context.beginPath();context.arc(cx+Math.cos(angle)*(r-20),cy+Math.sin(angle)*(r-20),4,0,Math.PI*2);context.fillStyle=colors[0];context.fill();
    context.fillStyle='#e9f7ff';context.font='700 12px system-ui';context.textAlign='center';context.fillText(active?(channel?.playing?'PLAY':'CUE'):'LOAD',cx,cy+4);
   } else {
    const vertical=view==='vertical',axis=vertical?h:w,cross=vertical?w:h;
    context.strokeStyle='#244158';context.lineWidth=1;
    for(let line=0;line<axis;line+=28){context.beginPath();if(vertical){context.moveTo(0,line);context.lineTo(w,line)}else{context.moveTo(line,0);context.lineTo(line,h)}context.stroke()}
    const position=active?(drag.current??engine.trackPosition(id))/audio.duration:0,center=position*1024;
    if(!active&&channel?.playing){if(analyserData.current.length!==channel.analyser.fftSize)analyserData.current=new Uint8Array(channel.analyser.fftSize);channel.analyser.getByteTimeDomainData(analyserData.current)}
    for(let p=0;p<axis;p+=2){
     const index=Math.floor(center+(p-axis/2)*1024/axis*.42);
     const amplitude=active?(index>=0&&index<1024?peaks.current.values[index]:0):(channel?.playing?Math.abs(analyserData.current[Math.floor(p/axis*analyserData.current.length)]-128)/128:0);
     if(amplitude<.008)continue;
     const length=Math.max(1,amplitude*cross*.46);
     context.fillStyle=colors[Math.floor(p/Math.max(1,axis/9))%3];
     if(vertical)context.fillRect(cross/2-length,p,length*2,2);else context.fillRect(p,cross/2-length,2,length*2);
    }
    context.fillStyle='#f8fdff';context.shadowColor=colors[0];context.shadowBlur=12;
    if(vertical)context.fillRect(0,h/2,w,2);else context.fillRect(w/2,0,2,h);
    context.shadowBlur=0;
    if(!active&&!channel?.playing){context.fillStyle='#a9c0d2';context.font='600 11px system-ui';context.textAlign='center';context.fillText('ЗАГРУЗИ ТРЕК ИЛИ ДЕМО',w/2,h/2-16)}
   }
   frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect()};
 },[engine,id,view]);

 const coordinate=(event:PointerEvent<HTMLCanvasElement>)=>{
  const rect=event.currentTarget.getBoundingClientRect();
  return view==='vertical'?event.clientY-rect.top:view==='deck'?Math.atan2(event.clientY-rect.top-(Math.min(72,Math.max(48,rect.height*.24))+(rect.height-Math.min(72,Math.max(48,rect.height*.24)))/2),event.clientX-rect.left-rect.width/2):event.clientX-rect.left;
 };
 const move=(event:PointerEvent<HTMLCanvasElement>)=>{
  const channel=engine.get(id);
  if(drag.current===null||!channel?.buffer)return;
  const current=coordinate(event),extent=view==='vertical'?event.currentTarget.clientHeight:event.currentTarget.clientWidth;
  const delta=view==='deck'?Math.atan2(Math.sin(current-last.current),Math.cos(current-last.current))/(Math.PI*2):-(current-last.current)/extent*.3;
  drag.current=Math.max(0,Math.min(channel.buffer.duration-.001,drag.current+delta*channel.buffer.duration));last.current=current;
 };
 const finish=()=>{const position=drag.current;drag.current=null;if(position!==null)engine.seekTrack(id,position)};
 const changeLoop=(beats:number|null)=>{engine.setLoop(id,beats);setLoop(engine.get(id)?.loopBeats??null)};
 const loadDemo=async()=>{if(loading)return;setLoading(true);setLoadError('');try{await onQuickDemo()}catch(error){setLoadError(error instanceof Error?error.message:'Не удалось загрузить демо')}finally{setLoading(false)}};
 return <article className={`wave-channel deck-${id.toLowerCase()}`}>
  <div className="wave-title"><strong>{id}</strong><span>{engine.get(id)?.trackName||'ЗАГРУЗИ ТРЕК'}</span></div>
  <div className="wave-tools" role="group" aria-label={`Вид канала ${id}`}>
   {([['stripe','ЛИНИЯ'],['vertical','ВОЛНА'],['deck','ДЕКА']] as const).map(([mode,label])=><button key={mode} type="button" className={view===mode?'active':''} aria-pressed={view===mode} onClick={()=>setView(mode)}>{label}</button>)}
  </div>
  <div className="wave-stage"><canvas ref={canvas} className={view} role="img" aria-label={`Позиция трека ${id}: перетаскивание для перемотки`}
   onPointerDown={event=>{const channel=engine.get(id);if(!channel?.buffer||channel.mode!=='track')return;drag.current=engine.trackPosition(id);last.current=coordinate(event);event.currentTarget.setPointerCapture(event.pointerId)}}
   onPointerMove={move} onPointerUp={finish} onPointerCancel={()=>{drag.current=null}}/>
   {!buffer&&<button type="button" className="wave-quick-demo" disabled={loading} onClick={()=>void loadDemo()}>{loading?'ЗАГРУЗКА…':'▶ ДЕМО'}</button>}
  </div>
  {loadError&&<span role="alert" className="wave-load-error">{loadError}</span>}
  {controls}
  <div className="wave-loop" role="group" aria-label={`Петля канала ${id}`}>
   <span>LOOP</span>{([null,1,2,4,8] as const).map(beats=><button key={beats??'full'} type="button" disabled={!buffer} aria-pressed={loop===beats} className={loop===beats?'active':''} onClick={()=>changeLoop(beats)}>{beats??'FULL'}</button>)}
  </div>
 </article>;
}
