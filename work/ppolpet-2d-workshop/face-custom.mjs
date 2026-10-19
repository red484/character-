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
// Find the source cheek pigment instead of layering a second cheek beside it.
export function cheekAnchors(raw,l,character){
 const out=[];for(let j=0;j<l.eyes.length;j++){
 const e=l.eyes[j],side=l.eyes.length===1?(e.x<l.cx?-1:1):j===0?-1:1;
 let points=[];if(character!=='bear')for(let y=Math.max(0,Math.floor(e.y-l.height*.02));y<Math.min(640,e.y+l.height*.26);y++)for(let x=Math.max(0,Math.floor(e.x-l.width*.18));x<Math.min(640,e.x+l.width*.18);x++){
 const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2];if(raw[i+3]>220&&(character==='angel'?(r>210&&g>140&&r-g>18&&r-b>18&&b>g*.96):(r-g>40&&r-b>25&&b>g*1.06)))points.push([x,y]);}
 // Separate paws and the opposite cheek from the cheek beside this eye.
 const remaining=new Set(points.map(([x,y])=>y*640+x)),groups=[];
 while(remaining.size){const first=remaining.values().next().value,q=[first];remaining.delete(first);for(let n=0;n<q.length;n++)for(const delta of [-641,-640,-639,-1,1,639,640,641])if(remaining.delete(q[n]+delta))q.push(q[n]+delta);if(q.length>20)groups.push(q.map(i=>[i%640,i/640|0]));}
 const candidates=groups.filter(g=>{const xs=g.map(p=>p[0]),ys=g.map(p=>p[1]);return Math.max(...xs)-Math.min(...xs)<l.width*.17&&Math.max(...ys)-Math.min(...ys)<l.height*.22;});
 candidates.sort((a,b)=>{const score=g=>{const x=g.reduce((s,p)=>s+p[0],0)/g.length,y=g.reduce((s,p)=>s+p[1],0)/g.length;return Math.hypot(x-e.x,(y-e.y-l.height*.10)*1.5);};return score(a)-score(b);});points=candidates[0]||[];
 if(points.length>20){const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);out.push({x:(left+right)/2,y:(top+bottom)/2,w:right-left+3,h:bottom-top+3,points});}
 else out.push({x:e.x+side*l.width*.075,y:e.y+l.height*.13,w:l.width*.11,h:l.width*.08,points:[]});
 }return out;
}
export function repairCheek(image,cheek,raw){
 if(!cheek.points.length)return;
 const a=image.data,old=a.slice(),rx=cheek.w*.62,ry=cheek.h*.62;
 const healthy=(x,y)=>{if(x<0||x>639||y<0||y>639)return false;const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2];return raw[i+3]>245&&!(r-g>10&&r-b>5)&&!(r>150&&g>120&&b<g*.98)&&Math.max(r,g,b)>155;};
 for(let y=Math.max(0,Math.floor(cheek.y-ry));y<Math.min(640,cheek.y+ry);y++)for(let x=Math.max(0,Math.floor(cheek.x-rx));x<Math.min(640,cheek.x+rx);x++){
 const radius=Math.hypot((x-cheek.x)/rx,(y-cheek.y)/ry),i=(y*640+x)*4;if(radius>=1||raw[i+3]<220)continue;
 const r=raw[i],g=raw[i+1],b=raw[i+2];if(r>130&&g>110&&b<g*.98&&r>b*1.1)continue;
 const samples=[];for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]])for(let d=2;d<90;d++){const sx=x+dx*d,sy=y+dy*d;if(Math.hypot((sx-cheek.x)/rx,(sy-cheek.y)/ry)>1&&healthy(sx,sy)){samples.push({i:(sy*640+sx)*4,w:1/(d*d)});break;}}const sum=samples.reduce((s,p)=>s+p.w,0),weight=Math.min(1,(1-radius)/.14);if(sum)for(let k=0;k<3;k++)a[i+k]=old[i+k]*(1-weight)+samples.reduce((s,p)=>s+old[p.i+k]*p.w,0)/sum*weight;
 }
}
