// Face edits use the source frame's visible features, never a fixed screen point.
export function faceAnchors(raw,l,character){
 if(!l.eyes.length)return null;
 const eyes=l.eyes,mean={x:eyes.reduce((s,e)=>s+e.x,0)/eyes.length,y:eyes.reduce((s,e)=>s+e.y,0)/eyes.length},w=l.width,h=l.height;
 const side=eyes.length===1?(mean.x<l.cx?-1:1):0;
 const center=side?mean.x+side*w*.18:mean.x;
 const mask=new Set(),components=[];
 for(let y=Math.max(0,Math.floor(mean.y-h*.04));y<Math.min(640,l.neck-h*.04,mean.y+h*.20);y++)for(let x=Math.max(0,Math.floor(center-w*.11));x<Math.min(640,center+w*.11);x++){
 const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2];
 if(raw[i+3]<220||eyes.some(e=>Math.abs(x-e.x)<e.w*.67+3&&Math.abs(y-e.y)<e.h*.66+3))continue;
 const ink=character==='starlight'?(r>155&&g>130&&b<g*.94&&r>b*1.12):character==='apricot'?(r-g>30&&r-b>15):(Math.max(r,g,b)<150&&Math.min(r,g,b)<105);
 if(ink)mask.add(y*640+x);
 }
 while(mask.size){const first=mask.values().next().value,q=[first];mask.delete(first);let x0=640,x1=0,y0=640,y1=0;
 for(let n=0;n<q.length;n++){const j=q[n],x=j%640,y=j/640|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);for(const k of [j-1,j+1,j-640,j+640])if(mask.delete(k))q.push(k)}
 const ww=x1-x0+1,hh=y1-y0+1;
 if(q.length>=3&&ww<w*.19&&hh<h*.17)components.push({x:(x0+x1)/2,y:(y0+y1)/2,w:ww,h:hh,area:q.length});
 }
 components.sort((a,b)=>Math.hypot(a.x-center,(a.y-mean.y-h*.08)*1.4)-Math.hypot(b.x-center,(b.y-mean.y-h*.08)*1.4));
 const feature=components[0];
 // Without a visible central feature, avoid painting an invented face on the back.
 if(!feature)return null;
 const nativeNose=['starlight','apricot','bunny'].includes(character);
 const nose=nativeNose?feature:{x:feature.x,y:feature.y-h*.07,w:w*.035,h:h*.025,added:true};
 const mouth=nativeNose?{x:feature.x,y:feature.y+h*.075,w:w*.07,h:h*.05,added:true}:feature;
 if(side&&mouth.added)mouth.hidden=true;
 return {nose,mouth,tilt:l.tilt||0,eyes,side};
}
export function repairFeature(image,f){
 if(f.added||f.hidden)return;
 const a=image.data,original=a.slice(),rx=f.w*.65+3,ry=f.h*.70+3;
 const x0=Math.max(0,Math.floor(f.x-rx)),x1=Math.min(639,Math.ceil(f.x+rx)),y0=Math.max(0,Math.floor(f.y-ry)),y1=Math.min(639,Math.ceil(f.y+ry));
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
 const i=(y*640+x)*4;if(a[i+3]<220)continue;
 const samples=[];
 for(const [sx,sy,d]of [[x0-2,y,x-x0+2],[x1+2,y,x1-x+2],[x,y0-2,y-y0+2],[x,y1+2,y1-y+2]])if(sx>=0&&sx<640&&sy>=0&&sy<640){const j=(sy*640+sx)*4;if(original[j+3]>240)samples.push({j,weight:1/(d*d)});}
 const sum=samples.reduce((s,p)=>s+p.weight,0);if(sum)for(let k=0;k<3;k++)a[i+k]=samples.reduce((s,p)=>s+original[p.j+k]*p.weight,0)/sum;
 }
}
function heart(ctx,x,y,r){ctx.moveTo(x,y+r*.7);ctx.bezierCurveTo(x-r*1.3,y-r*.1,x-r*.6,y-r*1.2,x,y-r*.35);ctx.bezierCurveTo(x+r*.6,y-r*1.2,x+r*1.3,y-r*.1,x,y+r*.7)}
export function drawFace(ctx,l,p,f){
 if(!f)return;
 for(const key of ['nose','mouth']){const style=p[key];if(['original','none'].includes(style)||f[key].hidden)continue;const a=f[key],r=l.width*(key==='nose'?.022:.038)*p[key+'Size'];ctx.save();ctx.translate(a.x,a.y);ctx.rotate(f.tilt);ctx.fillStyle=p[key+'Color']||(key==='nose'?'#d995b0':'#685878');ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(1.5,l.width*.008);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
 if(style==='triangle'){ctx.moveTo(-r,-r*.5);ctx.lineTo(r,-r*.5);ctx.lineTo(0,r*.75);ctx.closePath();ctx.fill()}
 if(style==='button'){ctx.ellipse(0,0,r,r*.7,0,0,Math.PI*2);ctx.fill()}
 if(style==='heartNose'){heart(ctx,0,0,r);ctx.fill()}
 if(style==='smile'){ctx.moveTo(-r,-r*.2);ctx.quadraticCurveTo(0,r,r,-r*.2);ctx.stroke()}
 if(style==='catMouth'){ctx.moveTo(-r,-r*.18);ctx.bezierCurveTo(-r*.8,r*.7,0,r*.6,0,-r*.18);ctx.bezierCurveTo(0,r*.6,r*.8,r*.7,r,-r*.18);ctx.stroke()}
 if(style==='openMouth'){ctx.ellipse(0,0,r*.48,r*.65,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e8b9cd';ctx.beginPath();ctx.ellipse(0,r*.3,r*.24,r*.15,0,0,Math.PI*2);ctx.fill()}
 if(style==='pout'){ctx.moveTo(-r*.7,r*.3);ctx.lineTo(0,-r*.25);ctx.lineTo(r*.7,r*.3);ctx.stroke()}
 ctx.restore();}
 if(p.cheekMark!=='none')for(let j=0;j<f.eyes.length;j++){const e=f.eyes[j],side=f.eyes.length===1?f.side:j===0?-1:1,x=e.x+side*l.width*.06,y=e.y+l.height*.12,r=l.width*.022*p.cheekSize;ctx.save();ctx.translate(x,y);ctx.rotate(f.tilt);ctx.fillStyle=p.cheekColor||'#ba7b96';ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=Math.max(1.3,r*.22);ctx.lineCap='round';
 if(p.cheekMark==='freckles')for(const [dx,dy]of [[-.8,0],[0,-.35],[.8,.1]]){ctx.beginPath();ctx.arc(dx*r,dy*r,r*.17,0,Math.PI*2);ctx.fill()}
 if(p.cheekMark==='blushLines')for(const dx of [-.75,0,.75]){ctx.beginPath();ctx.moveTo((dx-.15)*r,-r*.35);ctx.lineTo((dx+.15)*r,r*.35);ctx.stroke()}
 if(p.cheekMark==='tinyHearts'){ctx.beginPath();heart(ctx,0,0,r*.65);ctx.fill()}
 ctx.restore();}
}
