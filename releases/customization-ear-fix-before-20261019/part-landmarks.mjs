// Measure the visible sprite itself, so attachments follow every frame and idle tilt.
// No camera-specific image substitution and no independent animation clock.
export function createAnalyzer(){const small=document.createElement('canvas');small.width=small.height=160;const ctx=small.getContext('2d',{willReadFrequently:true});return function analyze(source,character,motion){ctx.clearRect(0,0,160,160);ctx.drawImage(source,0,0,160,160);const data=ctx.getImageData(0,0,160,160).data,seen=new Uint8Array(25600);let best=[];
 for(let start=0;start<25600;start++){if(seen[start]||data[start*4+3]<110)continue;const q=[start];seen[start]=1;for(let n=0;n<q.length;n++){const i=q[n],x=i%160;for(const j of [x?i-1:-1,x<159?i+1:-1,i-160,i+160])if(j>=0&&j<25600&&!seen[j]&&data[j*4+3]>=110){seen[j]=1;q.push(j)}}if(q.length>best.length)best=q}
 if(best.length<50)return null;const rows=Array.from({length:160},()=>[160,0]);let top=160,bottom=0;for(const i of best){const x=i%160,y=(i/160)|0;top=Math.min(top,y);bottom=Math.max(bottom,y);rows[y][0]=Math.min(rows[y][0],x);rows[y][1]=Math.max(rows[y][1],x)}let peak=top,max=0;for(let y=top;y<top+(bottom-top)*.82;y++){const w=rows[y][1]-rows[y][0];if(w>max){max=w;peak=y}}const left=rows[peak][0],right=rows[peak][1],cx=(left+right)/2;let headTop=top;for(let y=top;y<=peak;y++)if(data[(y*160+Math.round(cx))*4+3]>110){headTop=y;break}let neck=bottom-(bottom-top)*.24;for(let y=peak+1;y<bottom;y++)if(rows[y][1]-rows[y][0]<max*.64){neck=y;break}let hh=neck-headTop;if(hh<max*.4){headTop=neck-max*.65;hh=neck-headTop}
 headTop=Math.max(headTop,neck-max*.72);hh=neck-headTop;
 // Eye components: color/contrast plus a protected face region, excluding the nose/mouth.
 const candidates=[],eyeSeen=new Uint8Array(25600),eyeMask=new Uint8Array(25600);
 const y0=Math.max(headTop+hh*.36,top),y1=neck-hh*.03;
 for(let y=Math.ceil(y0);y<y1;y++)for(let x=Math.max(0,left);x<=Math.min(159,right);x++){const i=y*160+x,r=data[i*4],g=data[i*4+1],b=data[i*4+2];if(data[i*4+3]<160)continue;const gold=r>130&&g>110&&b<g*.94&&r>b*1.13;const dark=Math.max(r,g,b)<145&&Math.min(r,g,b)<100;if(character==='starlight'?gold:dark)eyeMask[i]=1}
 for(let start=0;start<25600;start++){if(!eyeMask[start]||eyeSeen[start])continue;const q=[start];eyeSeen[start]=1;let l=160,r=0,t=160,b=0;for(let n=0;n<q.length;n++){const i=q[n],x=i%160,y=(i/160)|0;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);for(const j of [x?i-1:-1,x<159?i+1:-1,i-160,i+160])if(j>=0&&j<25600&&eyeMask[j]&&!eyeSeen[j]){eyeSeen[j]=1;q.push(j)}}if(q.length>=2&&r-l>=0)candidates.push({x:(l+r)/2,y:(t+b)/2,w:r-l+1,h:b-t+1,area:q.length})}
 candidates.sort((a,b)=>b.area-a.area);let eyes=[];for(const e of candidates){if(e.w>max*.3||e.h>hh*.38)continue;if(eyes.some(q=>Math.abs(e.x-q.x)<max*.14))continue;eyes.push(e);if(eyes.length===2)break}eyes.sort((a,b)=>a.x-b.x);
 // A side view legitimately has one visible eye. Do not invent a second eye on the rear head.
 const profile=motion==='special'||(eyes.length===1&&Math.abs(eyes[0].x-cx)>max*.18);
 if(eyes.length===2&&Math.abs(eyes[1].x-eyes[0].x)<max*.22)eyes=[eyes.sort((a,b)=>b.area-a.area)[0]];
 const out={left:left*4,right:right*4,cx:cx*4,top:headTop*4,neck:neck*4,width:max*4,height:hh*4,bottom:bottom*4,profile,eyes:eyes.map(e=>Object.fromEntries(Object.entries(e).map(([k,v])=>[k,k==='area'?v:v*4]))),tailSide:motion==='walk'?-1:1,character,motion};
 if(out.eyes.length===2)out.tilt=Math.atan2(out.eyes[1].y-out.eyes[0].y,out.eyes[1].x-out.eyes[0].x);else out.tilt=0;
 return out;
 }}
