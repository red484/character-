// Raster parts share the character sheet's lighting and matte material.
export async function makeFaceTextures(){
 const atlas=await fetch(new URL('./assets/face-parts-soft-v1.json',import.meta.url)).then(r=>r.json());
 const image=new Image();image.src=new URL(atlas.src,import.meta.url);await image.decode();
 const cache=new Map();
 function part(name,color){const key=name+'/'+(color||'');if(cache.has(key))return cache.get(key);const r=atlas.rects[name];const c=document.createElement('canvas');c.width=r[2];c.height=r[3];const x=c.getContext('2d');x.drawImage(image,...r,0,0,c.width,c.height);
 if(color){const target=color.slice(1).match(/../g).map(v=>parseInt(v,16)),pixels=x.getImageData(0,0,c.width,c.height),a=pixels.data;let weight=0,mean=[0,0,0];for(let i=0;i<a.length;i+=4){const alpha=a[i+3]/255;weight+=alpha;for(let k=0;k<3;k++)mean[k]+=a[i+k]*alpha;}mean=mean.map(v=>v/Math.max(1,weight));for(let i=0;i<a.length;i+=4)if(a[i+3])for(let k=0;k<3;k++)a[i+k]=Math.max(0,Math.min(255,target[k]+a[i+k]-mean[k]));x.putImageData(pixels,0,0);}
 cache.set(key,c);if(cache.size>48)cache.delete(cache.keys().next().value);return c;}
 function stamp(ctx,name,x,y,width,tilt,color,opacity=1,compression=1,height){const c=part(name,color);height??=width*c.height/c.width;ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.globalAlpha*=opacity;ctx.drawImage(c,-width*compression/2,-height/2,width*compression,height);ctx.restore();}
 return {thumbnail(name){return part(name).toDataURL()},draw(ctx,l,p,f,palette){if(!f)return;
 for(const key of ['nose','mouth']){const style=p[key],anchor=f[key];if(['original','none'].includes(style)||anchor.hidden)continue;
 const width=l.width*(key==='nose'?.037:style==='openMouth'?.047:.072)*p[key+'Size'];
 stamp(ctx,style,anchor.x,anchor.y,width,f.tilt,p[key+'Color']||(key==='nose'?(style==='triangle'?palette.gold:palette.pink):null),1,f.side?.70:1);}
 if(p.cheekMark!=='none')for(const cheek of f.cheeks||[]){stamp(ctx,p.cheekMark,cheek.x,cheek.y,cheek.w*p.cheekSize,f.tilt,p.cheekColor||palette.pink,1,cheek.compression||1,cheek.h*p.cheekSize);}
 }};
}
