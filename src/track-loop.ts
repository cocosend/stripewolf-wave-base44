export function loopBounds(offset:number,duration:number,beats:number,bpm:number){
 const length=Math.min(duration,beats*60/bpm);
 const start=Math.max(0,Math.min(offset,duration-length));
 return {start,end:start+length};
}

export function trackPosition(offset:number,elapsed:number,rate:number,duration:number,start=0,end=0){
 const raw=offset+Math.max(0,elapsed)*rate;
 if(end>start && raw>=end)return start+(raw-end)%(end-start);
 return raw%duration;
}
