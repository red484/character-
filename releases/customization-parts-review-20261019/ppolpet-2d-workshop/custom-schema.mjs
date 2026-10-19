import {normalizeParts} from './parts-schema.mjs';
import {normalizePalette} from './palette.mjs';
export const VERSION=4;
export const limits={earLength:[.85,1.2],earWidth:[.9,1.1],tailLength:[.8,1.2],tailLift:[-8,8],bodyHeight:[.9,1.1],bodyWidth:[.9,1.1]};
export const defaults=Object.freeze({earLength:1,earWidth:1,tailLength:1,tailLift:0,bodyHeight:1,bodyWidth:1});
export function normalize(input={}){const c={};for(const [k,[lo,hi]] of Object.entries(limits)){const v=input[k];c[k]=typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):defaults[k]}return c}
export const isDefault=c=>Object.keys(defaults).every(k=>c[k]===defaults[k]);
export function pack(character,motion,shape,tone=0,size=100,walkRepair=true,palette={},parts={}){if(!['starlight','angel','apricot','bear','bunny','cloud'].includes(character))throw Error('알 수 없는 캐릭터');return {format:'ppolpet-sprite-custom',version:VERSION,character,motion,walkRepair:walkRepair!==false,shape:normalize(shape),palette:normalizePalette(palette),parts:normalizeParts(parts),tone:[-12,0,12].includes(+tone)?+tone:0,size:[90,100,105].includes(+size)?+size:100}}
export function unpack(raw){if(!raw||raw.format!=='ppolpet-sprite-custom'||![2,3,VERSION].includes(raw.version))throw Error('2D 공방 v2~v4 설정 파일을 선택해주세요. 기존 3D .ppol 파일은 그대로 보존됩니다.');return pack(raw.character,raw.motion,raw.shape,raw.tone,raw.size,raw.walkRepair,raw.palette,raw.parts)}
const clamp=t=>Math.max(0,Math.min(1,t));
export function smooth(a,b,v){const t=clamp((v-a)/(b-a));return t*t*(3-2*t)}
// Piecewise rigid head + continuous attachment fields. All coordinates are sprite pixels.
export function deformPoint(x,y,l,c){const p=[x,y],{left,top,width:w,height:h,neck,ground,cx,lying,earType,tailSide}=l;
 const bodyWeight=smooth(neck,Math.min(ground,neck+h*.16),y);
 if(!lying){p[1]+=(ground-neck)*(1-c.bodyHeight)*(1-smooth(neck,ground,y));p[0]+=(x-cx)*(c.bodyWidth-1)*bodyWeight}
 else {const rear=smooth(left+w*.72,left+w*.9,x);p[0]+=(x-left-w*.72)*(c.bodyWidth-1)*rear;p[1]+=(y-ground)*(c.bodyHeight-1)*rear}
 const roots=earType==='bunny'?[.39,.62]:earType==='side'?[.3,.52]:[.25,.75];
 const earH=(earType==='bunny'?.35:earType==='bear'?.17:.22)*h;
 const rootY=top+earH;
 for(const f of roots){const ex=left+w*f,rad=w*(earType==='bunny'?.13:.16);let weight=(1-smooth(rad*.55,rad,Math.abs(x-ex)))*(1-smooth(rootY-earH*.35,rootY,y));if(l.hasHalo)weight*=smooth(top-4,top+h*.09,y);if(earType==='dog'){const ex2=left+w*(f<.5?.08:.91),ry=top+h*.32;weight=(1-smooth(w*.07,w*.14,Math.abs(x-ex2)))*(1-smooth(h*.12,h*.24,Math.abs(y-(ry+h*.07))));p[1]+=(y-ry)*(c.earLength-1)*weight;p[0]+=(x-ex2)*(c.earWidth-1)*weight}else{p[1]+=(y-rootY)*(c.earLength-1)*weight;p[0]+=(x-ex)*(c.earWidth-1)*weight}}
 const rootX=lying?left+w*.82:cx+tailSide*w*.18,tailW=w*(lying?.18:.29);
 const outward=(x-rootX)*tailSide;
 const tw=smooth(0,tailW*.7,outward)*smooth(lying?top+h*.53:neck,lying?top+h*.73:neck+h*.13,y)*(1-smooth(ground-h*.08,ground,y));
 p[0]+=tailSide*outward*(c.tailLength-1)*tw;p[1]-=c.tailLift*tw;
 return p;
}
