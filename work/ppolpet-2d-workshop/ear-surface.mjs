// Ear replacement follows the measured scalp, independently of eye-expression landmarks.
// The approved source is untouched; only the old ear roots receive a local shading repair.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fade=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t)};
function solve(matrix,rhs){const m=matrix.map((r,i)=>[...r,rhs[i]]);for(let k=0;k<6;k++){let pivot=k;for(let i=k+1;i<6;i++)if(Math.abs(m[i][k])>Math.abs(m[pivot][k]))pivot=i;[m[k],m[pivot]]=[m[pivot],m[k]];if(Math.abs(m[k][k])<1e-9)return null;const div=m[k][k];for(let j=k;j<=6;j++)m[k][j]/=div;for(let i=0;i<6;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=6;j++)m[i][j]-=f*m[k][j]}}return m.map(r=>r[6])}
export function fitScalpShade(pixels,l,curve,raw=pixels){const matrix=Array.from({length:6},()=>Array(6).fill(0)),rhs=Array.from({length:3},()=>Array(6).fill(0));for(let x=Math.ceil(l.left+ l.width*.07);x<l.right-l.width*.07;x+=5){const u=(x-l.cx)/l.width;for(let y=Math.ceil(curve[x]+4);y<Math.min(l.neck,curve[x]+l.width*.30);y+=5){const depth=(y-curve[x])/l.width;if((Math.abs(u)>.18&&depth<.17)||(l.character==='bunny'&&depth<.16))continue;const i=(y*640+x)*4;if(pixels[i+3]<245)continue;if(l.character==='bunny'&&(Math.max(raw[i],raw[i+1],raw[i+2])-Math.min(raw[i],raw[i+1],raw[i+2])>22||Math.min(raw[i],raw[i+1],raw[i+2])<170))continue;const v=(y-l.top)/l.width,b=[1,u,v,u*u,u*v,v*v];for(let j=0;j<6;j++){for(let k=0;k<6;k++)matrix[j][k]+=b[j]*b[k];for(let k=0;k<3;k++)rhs[k][j]+=b[j]*pixels[i+k]}}}return rhs.map(r=>solve(matrix,r))}
export function repairEarRoot(pixels,original,i,x,y,l,curve,shade){if(!shade[0])return;const u=(x-l.cx)/l.width,depth=(y-curve[x])/l.width;const eyeLine=l.eyes?.length?Math.min(...l.eyes.map(e=>e.y-e.h*.6)):l.neck-l.height*.25;const weight=(1-fade(eyeLine-14,eyeLine-3,y))*(l.character==='bunny'?1:fade(.04,.12,Math.abs(u)))*(1-fade(l.character==='bunny'?.23:.07,l.character==='bunny'?.34:.17,depth));if(weight<=0||depth<0||Math.abs(u)>.48)return;const v=(y-l.top)/l.width,b=[1,u,v,u*u,u*v,v*v];for(let k=0;k<3;k++){const value=clamp(shade[k].reduce((s,c,j)=>s+c*b[j],0),0,255);pixels[i+k]=original[i+k]*(1-weight)+value*weight}}
export function earAttachment(l,curve,side,parts,aspect){const width=l.width*(parts.ears==='bunny'?.16:parts.ears==='floppy'?.24:.25)*parts.earSize,height=width/aspect;const x=l.cx+side*l.width*(.30+parts.earSpread),ix=clamp(Math.round(x),2,637);const slope=(curve[ix+2]-curve[ix-2])/4;return {x,y:curve[ix]+height*.31,width,height,angle:Math.atan(slope)*.28};}

// Fit the unobscured white cheek surface to continue it under the removed dog ear.
export function fitCloudSkin(raw,painted,l){
 const matrix=Array.from({length:6},()=>Array(6).fill(0)),rhs=Array.from({length:3},()=>Array(6).fill(0));
 for(let y=Math.ceil(l.top+l.height*.43);y<l.neck;y+=3)for(let x=Math.ceil(l.cx-l.width*.19);x<l.cx+l.width*.29;x+=3){
 const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b);
 if(raw[i+3]<245||min<170||max-min>24)continue;
 const u=(x-l.cx)/l.width,v=(y-l.top)/l.width,basis=[1,u,v,u*u,u*v,v*v];
 for(let j=0;j<6;j++){for(let k=0;k<6;k++)matrix[j][k]+=basis[j]*basis[k];for(let k=0;k<3;k++)rhs[k][j]+=basis[j]*painted[i+k];}
 }
 const coeff=rhs.map(r=>solve(matrix,r));
 return (x,y)=>{const u=(x-l.cx)/l.width,v=(y-l.top)/l.width,b=[1,u,v,u*u,u*v,v*v];return coeff.map(c=>c?clamp(c.reduce((s,a,j)=>s+a*b[j],0),0,255):230)};
}
export function cloudEarMask(raw,l){
 const mask=new Float32Array(640*640),seeds=[];
 for(let y=Math.max(0,Math.floor(l.top+l.height*.28));y<Math.min(640,l.neck+5);y++)for(let x=Math.max(0,Math.floor(l.left));x<Math.min(640,l.right);x++){
 const i=(y*640+x)*4,r=raw[i],g=raw[i+1],b=raw[i+2];
 if(raw[i+3]>20&&r-b>18&&r-g>4&&g-b>6&&Math.abs(x-l.cx)>l.width*.20)seeds.push(y*640+x);
 }
 // Fill each ear's complete outer region, including its neutral shaded outline.
 // A colour-only mask left a second contour and holes at the cream/white seam.
 const spans=new Map();for(const j of seeds){const x=j%640,y=Math.floor(j/640),side=x<l.cx?-1:1,key=y+':'+side;const old=spans.get(key);spans.set(key,old===undefined?x:side<0?Math.max(old,x):Math.min(old,x));}
 const padded=new Map(spans);
 for(const [key,edge]of spans){const [y,side]=key.split(':').map(Number);for(let dy=-10;dy<=10;dy++){const yy=y+dy;if(yy<0||yy>=640)continue;const k=yy+':'+side;if(!padded.has(k))padded.set(k,edge);}}
 for(const [key,edge] of padded){const [y,side]=key.split(':').map(Number);const reach=side<0?24:10;const start=side<0?0:Math.floor(edge-reach),end=side<0?Math.ceil(edge+reach):640;for(let x=Math.max(0,start);x<Math.min(640,end);x++){const inward=side<0?x-edge:edge-x;mask[y*640+x]=1-fade(2,reach,inward);}}
 return mask;
}
