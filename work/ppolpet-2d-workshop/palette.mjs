// Non-destructive color groups for the approved Starlight sprites.
// These are color masks, not interchangeable ear/face artwork layers.
export const paletteDefaults=Object.freeze({fur:null,gold:null,pink:null});
export const groups={fur:'몸 · 귀 · 꼬리',gold:'링 눈 · 코 · 금색 장식',pink:'볼 · 젤리 · 속귀'};
export const swatches={
 fur:[['민트','#a5c9bb'],['하늘','#a3bfdf'],['복숭아','#e6b4a7'],['크림','#e3d1ad'],['로즈','#ce9fbb'],['라일락','#b3a1d2'],['모카','#b9a28f'],['솜사탕','#edcbdc'],['세이지','#b8c7a6'],['아쿠아','#a6cfce']],
 gold:[['버터','#f4dda0'],['아이보리','#f4e8d5'],['살구','#edbd93'],['로즈','#e8b0c9'],['민트','#b8d9c5'],['하늘','#b9d6eb'],['코코아','#9e8275'],['라벤더','#c3b3df']],
 pink:[['딸기','#e8aac2'],['복숭아','#edb8a5'],['장미','#d89bab'],['연보라','#c3aed9'],['살구','#e7c09e'],['크림','#efdbc3'],['라즈베리','#d18fa8'],['연분홍','#f0c6d6']]
};
export function normalizePalette(raw={}){return Object.fromEntries(Object.keys(paletteDefaults).map(k=>[k,typeof raw?.[k]==='string'&&/^#[0-9a-f]{6}$/i.test(raw[k])?raw[k].toLowerCase():null]))}
export function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60}return [h,s,l]}
export function hslToRgb(h,s,l){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const q=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return q.map(v=>Math.round((v+m)*255))}
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)}
export function colorGroup(h,s){
 if(s<.07)return null;
 if(h>=215&&h<=295)return 'fur';
 if(h>=24&&h<=70)return 'gold';
 if(h>=310||h<=20)return 'pink';
 return null;
}
const reference={fur:rgbToHsl(166,151,208),gold:rgbToHsl(244,221,160),pink:rgbToHsl(232,170,194)};
export function paletteTargets(palette){return Object.fromEntries(Object.entries(normalizePalette(palette)).filter(([,v])=>v).map(([k,v])=>[k,rgbToHsl(...v.slice(1).match(/../g).map(n=>parseInt(n,16)))]))}
export const furColors={starlight:'#a697d0',apricot:'#e7d2ab',bear:'#e09eb6',angel:'#e8e2e2',bunny:'#e8e2e2',cloud:'#e8e2e2'};
function shadeColor(hsl,target,ref,neutral=false){
 const [,s,l]=hsl;
 const nl=l<ref[2]?l*target[2]/ref[2]:target[2]+(l-ref[2])*(1-target[2])/(1-ref[2]);
 return hslToRgb(target[0],neutral?target[1]:Math.min(1,s*target[1]/Math.max(.12,ref[1])),nl);
}
// HSL saturation is unstable near white: a tiny RGB difference can classify a
// highlight as pink. Use channel contrast and a continuous material boundary.
function whiteFurPixel(rgb,hsl,targets){
 const chroma=Math.max(...rgb)-Math.min(...rgb),[h,s,l]=hsl;
 const pinkHue=h>=310||h<=20;
 const furWeight=l>.25?1-smooth(pinkHue?16:22,pinkHue?30:44,chroma):0;
 const base=colorGroup(h,s),other=base==='fur'||base==='gold'?'gold':base;
 let decoration=rgb;
 if(targets[other]){
  const mapped=shadeColor(hsl,targets[other],reference[other]);
  const weight=smooth(.07,.16,s);
  decoration=rgb.map((v,k)=>v+(mapped[k]-v)*weight);
 }
 const fur=targets.fur?shadeColor(hsl,targets.fur,rgbToHsl(232,226,226),true):rgb;
 return decoration.map((v,k)=>Math.round(v*(1-furWeight)+fur[k]*furWeight));
}
export function recolorPixels(data,palette,cache,character='starlight',landmark=null){const targets=paletteTargets(palette);if(!Object.keys(targets).length)return data;
 for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const x=(i/4)%640,y=Math.floor(i/2560),white=['angel','bunny','cloud'].includes(character),max=Math.max(data[i],data[i+1],data[i+2]),min=Math.min(data[i],data[i+1],data[i+2]);if(white&&max<165)continue;if(character!=='starlight'&&(!white||(max<210&&max-min>18)||(max-min>65&&min<170))&&landmark?.eyes?.some(e=>Math.abs(x-e.x)<Math.max(e.w*.7,8)&&Math.abs(y-e.y)<Math.max(e.h*.7,8)))continue;const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2],cached=cache?.get(key);if(cached!==undefined){data[i]=cached>>>16;data[i+1]=(cached>>>8)&255;data[i+2]=cached&255;continue}const [h,s,l]=rgbToHsl(data[i],data[i+1],data[i+2]),baseGroup=colorGroup(h,s);
 if(white){const rgb=whiteFurPixel([data[i],data[i+1],data[i+2]],[h,s,l],targets);for(let k=0;k<3;k++)data[i+k]=rgb[k];cache?.set(key,(data[i]<<16)|(data[i+1]<<8)|data[i+2]);continue;}
 let k=baseGroup;if(character==='apricot')k=baseGroup==='gold'?'fur':baseGroup==='fur'?'gold':baseGroup;else if(character==='bear')k=baseGroup==='pink'?'fur':s<.13&&l>.68?'pink':baseGroup==='fur'?'gold':null;const target=targets[k];if(!target){cache?.set(key,key);continue;}
  // Preserve shading and highlights. No positions, alpha, proportions or contours change.
  const ref=k==='fur'&&character!=='starlight'?rgbToHsl(...furColors[character].slice(1).match(/../g).map(v=>parseInt(v,16))):reference[k],nl=l<ref[2]?l*target[2]/ref[2]:target[2]+(l-ref[2])*(1-target[2])/(1-ref[2]);
  const ns=Math.min(1,s*target[1]/Math.max(.12,ref[1])),rgb=hslToRgb(target[0],ns,nl),weight=k==='fur'&&['angel','bunny','cloud'].includes(character)?1:smooth(.07,.16,s);
  for(let j=0;j<3;j++)data[i+j]=Math.round(data[i+j]+(rgb[j]-data[i+j])*weight);
  cache?.set(key,(data[i]<<16)|(data[i+1]<<8)|data[i+2]);
 }
 return data;
}
export function makePaletteRenderer(){const canvas=document.createElement('canvas');canvas.width=canvas.height=640;const ctx=canvas.getContext('2d',{willReadFrequently:true});let last='',cache=new Map();return {render(source,palette,character,landmark=null){if(!Object.values(normalizePalette(palette)).some(Boolean))return source;const signature=character+JSON.stringify(normalizePalette(palette));if(signature!==last||cache.size>180000){cache.clear();last=signature}ctx.clearRect(0,0,640,640);ctx.drawImage(source,0,0);const image=ctx.getImageData(0,0,640,640);recolorPixels(image.data,palette,cache,character,landmark);ctx.putImageData(image,0,0);return canvas}}}
