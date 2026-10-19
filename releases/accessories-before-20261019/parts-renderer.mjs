import {makeWalkTailMask} from './walk-tail-mask.mjs?v=4';
import {fitScalpShade,repairEarRoot,earAttachment} from './ear-surface.mjs?v=3';
import {normalizeParts,originalParts} from './parts-schema.mjs';
import {recolorPixels,furColors,rgbToHsl} from './palette.mjs';
const canvas=(w=640,h=w)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function smooth(a,b,v){const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)}
export async function makePartsRenderer(){const atlas=await fetch(new URL('./assets/parts-atlas.json',import.meta.url)).then(r=>r.json()),im=new Image();im.src=new URL(atlas.src,import.meta.url);await im.decode();const joined=new Image();joined.src=new URL('./assets/joined-parts-v2.png',import.meta.url);await joined.decode();const joinedRects={roundNear:[113,97,487,484],roundFar:[859,113,439,469],tailJoined:[1463,104,644,504]};const removeWalkTail=makeWalkTailMask();const out=canvas(),work=canvas(),wx=work.getContext('2d',{willReadFrequently:true}),ctx=out.getContext('2d'),cache=new Map(),frameCache=new Map();
 function partAsset(name,character,palette){const isFur=['cat','roundEar','roundNear','roundFar','tailJoined','bunny','floppy','roundTail','curved','cloudTail'].includes(name),color=isFur?(palette.fur||furColors[character]):(palette.gold||'#b5a2d8');const key=name+'/'+color+'/'+(palette.pink||'');if(cache.has(key))return cache.get(key);const c=canvas(),x=c.getContext('2d',{willReadFrequently:true}),r=joinedRects[name]||atlas.rects[name],scale=Math.min(600/r[2],600/r[3]);const dw=r[2]*scale,dh=r[3]*scale;x.drawImage(joinedRects[name]?joined:im,...r,(640-dw)/2,(640-dh)/2,dw,dh);const image=x.getImageData(0,0,640,640);recolorPixels(image.data,{fur:color,pink:palette.pink,gold:palette.gold});if(name==='roundNear'||name==='roundFar'){const start=(640-dh)/2;for(let yy=0;yy<640;yy++)for(let xx=0;xx<640;xx++){const k=(yy*640+xx)*4+3;image.data[k]*=1-smooth(.66,.98,(yy-start)/dh);}}x.putImageData(image,0,0);const result={canvas:c,rect:[(640-dw)/2,(640-dh)/2,dw,dh]};cache.set(key,result);if(cache.size>24)cache.delete(cache.keys().next().value);return result}
 function stamp(name,x,y,w,h,angle,character,palette,flip=false,ay=.5){const a=partAsset(name,character,palette);ctx.save();ctx.translate(x,y);ctx.rotate(angle||0);if(flip)ctx.scale(-1,1);ctx.drawImage(a.canvas,...a.rect,-w/2,-h*ay,w,h);ctx.restore()}
 function fillEye(image,e,l,character,rawSource){
 const p=image.data,raw=rawSource||p,mask=new Uint8Array(640*640),original=p.slice();
 const rx=Math.max(e.w*.78,l.width*(character==='angel'?.095:.02)),ry=Math.max(e.h*.78,l.height*(character==='angel'?.12:.02));
 const x0=Math.max(0,Math.floor(e.x-rx-2)),x1=Math.min(639,Math.ceil(e.x+rx+2)),y0=Math.max(0,Math.floor(e.y-ry-2)),y1=Math.min(639,Math.ceil(e.y+ry+2));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*640+x)*4;const r=raw[i],g=raw[i+1],b=raw[i+2];const cheek=character!=='bear'&&r-g>35&&r-b>24&&b>g*1.03; if(!cheek&&((x-e.x)/rx)**2+((y-e.y)/ry)**2<1)mask[y*640+x]=1;}
 const healthy=(x,y)=>{if(x<0||x>=640||y<0||y>=640||mask[y*640+x]||original[(y*640+x)*4+3]<=240)return false;const i=(y*640+x)*4,[hu,sa]=rgbToHsl(raw[i],raw[i+1],raw[i+2]);return !(character!=='bear'&&sa>.12&&(hu>295||hu<20)&&raw[i+2]>raw[i+1]*1.02)};
 for(let y=Math.max(0,y0-7);y<=Math.min(639,y1+7);y++)for(let x=Math.max(0,x0-7);x<=Math.min(639,x1+7);x++)if(mask[y*640+x]){const samples=[];for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])for(let d=1;d<100;d++){const sx=x+dx*d,sy=y+dy*d;if(healthy(sx,sy)){samples.push({i:(sy*640+sx)*4,weight:1/(d*d)});break}}let total=samples.reduce((v,s)=>v+s.weight,0);if(total)for(let k=0;k<3;k++)p[(y*640+x)*4+k]=samples.reduce((v,s)=>v+original[s.i+k]*s.weight,0)/total;}
 // Diffuse the repaired patch inside its mask so scan-line samples cannot leave seams.
 const bx=Math.max(0,x0-8),by=Math.max(0,y0-8),bw=Math.min(640,x1+9)-bx,bh=Math.min(640,y1+9)-by;let prev=new Float32Array(bw*bh*3),next=new Float32Array(prev.length);
 for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++)for(let k=0;k<3;k++)prev[(yy*bw+xx)*3+k]=p[((by+yy)*640+bx+xx)*4+k];
 for(let iter=0;iter<32;iter++){next.set(prev);for(let yy=1;yy<bh-1;yy++)for(let xx=1;xx<bw-1;xx++)if(mask[(by+yy)*640+bx+xx]){const j=(yy*bw+xx)*3;for(let k=0;k<3;k++)next[j+k]=(prev[j-3+k]+prev[j+3+k]+prev[j-bw*3+k]+prev[j+bw*3+k])*.25;}const swap=prev;prev=next;next=swap;}
 for(let yy=0;yy<bh;yy++)for(let xx=0;xx<bw;xx++)if(mask[(by+yy)*640+bx+xx])for(let k=0;k<3;k++)p[((by+yy)*640+bx+xx)*4+k]=prev[(yy*bw+xx)*3+k];

 }
 function restoreExposedCheek(raw,painted,e,l){
 // The original ring overlaps the cheek. When that ring is removed, complete the
 // visible cheek underneath it rather than leaving the ring-shaped bite behind.
 const pts=[];
 for(let y=Math.max(0,Math.floor(e.y));y<Math.min(640,e.y+e.h*.95);y++)for(let x=Math.max(0,Math.floor(e.x-e.w));x<Math.min(640,e.x+e.w);x++){
  const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2];
  if(raw[i+3]>240&&r-g>40&&r-b>25&&b>g*1.06)pts.push([x,y,i]);
 }
 if(pts.length<40)return;
 const xs=pts.map(q=>q[0]),ys=pts.map(q=>q[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),radius=(bottom-top+2)/2;
 if(right-left<radius*1.4)return; // Keep a genuinely occluded far cheek clipped by the head.
 const cx=left+radius,cy=(top+bottom)/2;
 const sample=pts.filter(q=>q[0]<cx&&Math.abs(q[1]-cy)<radius*.6);
 const color=[0,1,2].map(k=>Math.round(sample.reduce((sum,q)=>sum+painted[q[2]+k],0)/sample.length));
 if(!sample.length)return;
 const g=wx.createLinearGradient(0,cy-radius,0,cy+radius);
 g.addColorStop(0,`rgb(${color.map(v=>Math.min(255,v+5)).join(',')})`);g.addColorStop(1,`rgb(${color.map(v=>Math.max(0,v-5)).join(',')})`);
 wx.fillStyle=g;wx.beginPath();wx.ellipse(cx,cy,radius,radius,0,0,Math.PI*2);wx.fill();
 }
 function drawEye(e,style,color,l,p,side){const tilt=l.tilt||0,x=e.x+l.width*p.eyeX*(side===0?-1:1),y=e.y+l.height*p.eyeY,w=l.width*(style==='dot'?.058:.115)*p.eyeSize,h=w*(style==='ring'?1.15:1);wx.save();wx.translate(x,y);wx.rotate(tilt);const gradient=wx.createLinearGradient(0,-h/2,0,h/2);gradient.addColorStop(0,color);gradient.addColorStop(1,color);wx.strokeStyle=gradient;wx.fillStyle=gradient;wx.lineWidth=Math.max(2,l.width*.012*p.eyeSize);wx.lineCap='round';wx.lineJoin='round';wx.beginPath();if(style==='ring'){wx.ellipse(0,0,w*.5,h*.5,0,0,Math.PI*2);wx.stroke();wx.beginPath();wx.moveTo(-w*.45,-h*.04);wx.quadraticCurveTo(0,h*.20,w*.45,-h*.04);wx.stroke()}else if(style==='dot'){wx.ellipse(0,0,w*.46,h*.6,0,0,Math.PI*2);wx.fill();wx.fillStyle='#fff';wx.globalAlpha=.8;wx.beginPath();wx.ellipse(-w*.13,-h*.2,w*.12,h*.12,0,0,Math.PI*2);wx.fill()}else if(style==='heart'){wx.moveTo(0,h*.43);wx.bezierCurveTo(-w,-h*.1,-w*.35,-h*.8,0,-h*.25);wx.bezierCurveTo(w*.35,-h*.8,w,-h*.1,0,h*.43);wx.fill()}else {const s=style==='happy'?-1:1;wx.moveTo(-w*.48,0);wx.quadraticCurveTo(0,s*h*.58,w*.48,0);wx.stroke()}wx.restore()}
 return {atlas,thumbnail(name){const a=partAsset(name,'starlight',{});return a.canvas.toDataURL()},render(source,l,raw,palette={},character='starlight',rawSource=null){
 const p=normalizeParts(raw);if(originalParts(p)||!l)return source;wx.clearRect(0,0,640,640);wx.drawImage(source,0,0);const image=wx.getImageData(0,0,640,640);let hash=2166136261;const words=new Uint32Array(image.data.buffer);for(let i=0;i<words.length;i++)hash=Math.imul(hash^words[i],16777619);const frameKey=character+'/'+l.motion+'/'+(hash>>>0)+'/'+JSON.stringify(p)+'/'+JSON.stringify(palette);if(frameCache.has(frameKey))return frameCache.get(frameKey);const a=image.data,originalPixels=image.data.slice(),rawPixels=rawSource?rawSource.getContext('2d').getImageData(0,0,640,640).data:originalPixels,w=l.width,h=l.height,bodyH=Math.max(28,l.bottom-l.neck),tilt=clamp(l.tilt||0,-.18,.18),bodyX=l.cx;
 // Use a stable crown instead of fitting to the old ears (which left pose-specific stumps).
 const headCurve=new Float32Array(640);
 if(p.ears!=='original'&&character!=='cloud')for(let x=0;x<640;x++){const u=clamp((x-l.cx)/(w*.5),-1,1);headCurve[x]=(l.profile?l.neck-w*.65:l.top)+h*.56*(1-Math.sqrt(1-u*u))+(l.motion==='walk'?0:Math.sin(tilt)*(x-l.cx));}
 const scalpShade=p.ears!=='original'&&character!=='cloud'?fitScalpShade(originalPixels,l,headCurve):null;
 if(p.ears!=='original'||p.tail!=='original')for(let y=0;y<640;y++)for(let x=0;x<640;x++){const i=(y*640+x)*4;if(!a[i+3])continue;let erase=false;if(p.ears!=='original'){if(character==='cloud'){const [hu,sa,li]=rgbToHsl(rawPixels[i],rawPixels[i+1],rawPixels[i+2]);const oldEar=y>l.top+h*.28&&y<l.neck&&Math.abs(x-l.cx)>w*.23&&hu>25&&hu<65&&sa>.12;const fy=(y-(l.top+h*.68))/(h*.43),edge=w*.40*Math.sqrt(Math.max(0,1-fy*fy));if(oldEar){if(Math.abs(x-l.cx)>edge)erase=true;else{const si=(Math.round(l.top+h*.56)*640+Math.round(l.cx))*4;for(let k=0;k<3;k++)a[i+k]=originalPixels[si+k];}}if(y>l.top+h*.42&&y<l.neck&&Math.abs(x-l.cx)>edge&&!(hu>240&&hu<300&&sa>.10))erase=true}else{erase=y<headCurve[x];if(character==='angel'&&a[i]>150&&a[i+1]>130&&a[i+2]<a[i+1]*.93)erase=false}}
 if(!['original','curved'].includes(p.tail)&&y>l.neck+bodyH*.20&&y<l.neck+bodyH*.82&&(x-bodyX)*l.tailSide>w*.18){const by=(y-(l.neck+bodyH*.40))/(bodyH*.62),edge=w*.245*Math.sqrt(Math.max(0,1-by*by));if((x-bodyX)*l.tailSide>edge)erase=true;}
 
 if(erase)a[i+3]=0;else if(scalpShade&&y>=headCurve[x]&&y<headCurve[x]+1)a[i+3]*=clamp(y-headCurve[x],0,1);
 if(scalpShade&&a[i+3])repairEarRoot(a,originalPixels,i,x,y,l,headCurve,scalpShade);

 }
 if(p.tail!=='original'&&character==='starlight'&&l.motion==='walk')removeWalkTail(image,l);
 const edits=[];for(let j=0;j<l.eyes.length;j++){const e=l.eyes[j],side=l.eyes.length===1?(e.x<l.cx?0:1):j,style=p[side?'eyeRight':'eyeLeft'],color=p[side?'eyeRightColor':'eyeLeftColor'];if(style!=='original'){fillEye(image,e,l,character,rawPixels);edits.push({e,side,style,color:color||(style==='ring'?'#f4dda0':style==='heart'?'#d89bab':character==='starlight'?'#685878':'#625364')})}else if(color){const rgb=color.slice(1).match(/../g).map(n=>parseInt(n,16));for(let y=Math.max(0,Math.floor(e.y-e.h*.6));y<Math.min(640,e.y+e.h*.6+1);y++)for(let x=Math.max(0,Math.floor(e.x-e.w*.6));x<Math.min(640,e.x+e.w*.6+1);x++){const i=(y*640+x)*4,[hu,s,li]=rgbToHsl(rawPixels[i],rawPixels[i+1],rawPixels[i+2]);if(character==='starlight'?(hu>23&&hu<75&&s>.15):li<.5){const light=character==='starlight'?li/.78:li/.25;for(let k=0;k<3;k++)a[i+k]=clamp(rgb[k]*light,0,255)}}}}
 wx.putImageData(image,0,0);if(character==='starlight'&&l.motion==='walk')for(const edit of edits)restoreExposedCheek(rawPixels,originalPixels,edit.e,l);for(const e of edits)drawEye(e.e,e.style,e.color,l,p,e.side);ctx.clearRect(0,0,640,640);
 const earPalette=p.earColor?{...palette,fur:p.earColor}:palette,tailPalette=p.tailColor?{...palette,fur:p.tailColor}:palette,accessoryPalette=p.accessoryColor?{...palette,gold:p.accessoryColor,pink:p.accessoryColor}:palette;
 if(p.back==='wings')stamp('wings',bodyX,l.neck+bodyH*.35,w*.56,bodyH*.66,0,character,accessoryPalette);
 if(p.tail!=='original'){
 const joinedTail=character==='starlight'&&l.motion==='walk'&&p.tail==='curved';
 if(joinedTail){const tw=w*.34*p.tailSize;stamp('tailJoined',bodyX-w*.31,l.neck+bodyH*.29,tw,tw*504/644,0,character,tailPalette);}
 else{const key={round:'roundTail',curved:'curved',cloud:'cloudTail'}[p.tail],tw=w*(p.tail==='curved'?.29:.21)*p.tailSize,th=tw*(p.tail==='curved'?.84:.94);stamp(key,bodyX+l.tailSide*w*(p.tail==='curved'?.37:.25),l.neck+bodyH*.43,tw,th,l.tailSide*.15,character,tailPalette,l.tailSide<0)}}
 if(p.ears!=='original'&&p.ears!=='round'){const key={cat:'cat',round:'roundEar',bunny:'bunny',floppy:'floppy'}[p.ears],r=atlas.rects[key];for(const side of [-1,1]){const anchor=earAttachment(l,character==='cloud'?new Float32Array(640).fill(l.top+h*.15):headCurve,side,p,r[2]/r[3]);stamp(key,anchor.x,anchor.y,anchor.width,anchor.height,anchor.angle,character,earPalette,side>0,.86)}}
 // Far ear is behind the head; the near ear has a feathered root over the scalp.
 const joinedEar=(side)=>{const ew=w*(side<0?.27:.23)*p.earSize,eh=ew*(side<0?484/487:469/439),ex=l.cx+side*w*(.30+p.earSpread),ey=headCurve[clamp(Math.round(ex),0,639)]+w*.08;stamp(side<0?'roundNear':'roundFar',ex,ey,ew,eh,tilt,character,earPalette,false,.82);};
 if(p.ears==='round'&&character!=='cloud')joinedEar(1);
 ctx.drawImage(work,0,0);
 if(p.ears==='round'){if(character==='cloud'){for(const side of [-1,1])stamp(side<0?'roundNear':'roundFar',l.cx+side*w*.32,l.top+h*.18,w*.23,w*.24,tilt,character,earPalette,false,.82);}else joinedEar(-1);}

 if(p.neck==='bowtie')stamp('bowtie',l.cx,l.neck+bodyH*.10,w*.23,w*.12,tilt*.3,character,accessoryPalette);
 if(p.ornament!=='none'){const side=p.ornamentSide==='left'?-1:1,ow=w*.19*p.ornamentSize;stamp(p.ornament,l.cx+side*w*.30+p.ornamentX*w,l.top+h*.21+p.ornamentY*h,ow,ow*.87,tilt+side*.10,character,accessoryPalette)}
 const cachedFrame=canvas();cachedFrame.getContext('2d').drawImage(out,0,0);frameCache.set(frameKey,cachedFrame);if(frameCache.size>8)frameCache.delete(frameCache.keys().next().value);return cachedFrame;
 }}
}
