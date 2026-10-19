// Shared by workshop preview and downloaded offline HTML. No camera-dependent art.
export const VERSION='starlight-parts-v1';
export const defaults=Object.freeze({version:VERSION,ears:'cat',tail:'round',bodyHeight:1,bodyWidth:1,earSize:1});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const number=(v,d,a,b)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):d;
export function normalize(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('설정 파일 형식이 아닙니다.');
 if(input.version&&input.version!==VERSION)throw Error('이 검수판과 다른 버전의 설정입니다.');
 return {version:VERSION,ears:['cat','bunny','round'].includes(input.ears)?input.ears:'cat',tail:['round','curved','none'].includes(input.tail)?input.tail:'round',bodyHeight:number(input.bodyHeight,1,.85,1.18),bodyWidth:number(input.bodyWidth,1,.85,1.18),earSize:number(input.earSize,1,.8,1.2)};
}
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export const durations={idle:3.4,walk:1.2,sit:1.5};
export const GROUND=366;
// Fixed face aspect ratio. No procedural facial paint or atlas swaps during turns.
export function pose(raw,mode,time){
 const c=normalize(raw),t=mode==='sit'?Math.min(1.5,Math.max(0,time)):Math.max(0,time),phase=t/1.2*2*Math.PI;
 const sitting=mode==='sit'?smooth(t/1.1):0;
 const walk=mode==='walk';
 const bob=walk?1.7*(1-Math.cos(phase*2)):0;
 const bodyH=77*c.bodyHeight,bodyW=72*c.bodyWidth;
 const bodyBottom=353+8*sitting-bob;
 const bodyTop=bodyBottom-bodyH*(1-.16*sitting);
 const idle=mode==='idle'?Math.sin(t/3.4*Math.PI*2):0;
 const headBottom=bodyTop+24;
 const head={x:256+idle*1.1,y:headBottom,angle:idle*.065+(walk?.012*Math.sin(phase):0),w:208,h:208*288/382};
 const feet=[0,1].map(i=>{
  const sign=i===0?-1:1,p=phase+i*Math.PI,swing=walk?Math.max(0,Math.sin(p)):0;
  return {x:256+sign*(19+8*sitting),bottom:GROUND-12*swing,h:38-4*sitting,w:34+2*sitting,angle:walk?sign*.10*swing:0,lift:12*swing,pad:sitting};
 });
 const arms=[0,1].map(i=>{
  const sign=i===0?-1:1;
  return {x:256+sign*(bodyW*.40),y:bodyTop+21-14*sitting,w:29,h:49,angle:sign*(-.10+.26*sitting)+(walk?.30*Math.sin(phase+i*Math.PI):idle*.03)};
 });
 return {head,body:{x:256,y:bodyTop,w:bodyW,h:bodyBottom-bodyTop},arms,feet,sitting,tailAngle:.10*Math.sin(t/durations[mode]*Math.PI*2-.5),config:c};
}
export function render(ctx,atlas,parts,raw,mode,time,{ground=true}={}){
 const p=pose(raw,mode,time),c=p.config;
 ctx.clearRect(0,0,512,420);
 if(ground){ctx.strokeStyle='#e7e0f1';ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(36,GROUND);ctx.lineTo(476,GROUND);ctx.stroke();ctx.setLineDash([])}
 function part(name,x,y,w,h,angle=0,anchorX=.5,anchorY=.5,flip=false){
  const r=parts[name];ctx.save();ctx.translate(x,y);ctx.rotate(angle);if(flip)ctx.scale(-1,1);ctx.drawImage(atlas,...r,-w*anchorX,-h*anchorY,w,h);ctx.restore();
 }
 // Tail follows pelvis; lower layers never cover the face.
 if(c.tail==='round')part('tailRound',256+p.body.w*.59,p.body.y+p.body.h*.68,39,39,p.tailAngle);
 if(c.tail==='curved')part('tailCurved',256+p.body.w*.39,p.body.y+p.body.h*.94,69,65,p.tailAngle,0,1);
 // Legs attach under fully painted torso. Sitting soles gradually rotate into view.
 p.feet.forEach((f,i)=>{
  const name=i?'footR':'footL';
  part(name,f.x,f.bottom,f.w,f.h,0,.5,1);
 });
 part('body',p.body.x,p.body.y,p.body.w,p.body.h,0,.5,0);
 p.arms.forEach((a,i)=>part(i?'armR':'armL',a.x,a.y,a.w,a.h,a.angle,.5,.10));
 if(p.sitting>0){p.feet.forEach(f=>{ctx.save();ctx.globalAlpha=p.sitting;part('sole',f.x,f.bottom,34,36,0,.5,1);ctx.restore()})}
 ctx.save();ctx.translate(p.head.x,p.head.y);ctx.rotate(p.head.angle);
 // All ear choices inherit exactly the same rigid head transform.
 const earSpecs={cat:['earCat',50,50*214/276],bunny:['earBunny',33,33*312/170],round:['earRound',43,43*199/216]};
 const [key,ew,eh]=earSpecs[c.ears];
 for(const sign of [-1,1])part(key,sign*65,-p.head.h+29,ew*c.earSize,eh*c.earSize,sign*.12,.5,1,sign===1);
 part('head',0,0,p.head.w,p.head.h,0,.5,1);
 ctx.restore();
 return p;
}
