import assert from 'node:assert/strict';
import fs from 'node:fs';
import {defaults,limits,normalize,pack,unpack,deformPoint} from './custom-schema.mjs';
const cases=JSON.parse(fs.readFileSync(new URL('./verification.json',import.meta.url))).report;
assert.equal(cases.length,53);assert.equal(unpack(pack('apricot','walk',defaults,0,100,false)).walkRepair,false);
assert.deepEqual(unpack(JSON.parse(JSON.stringify(pack('starlight','walk',{earLength:1.2,tailLength:.8,bodyWidth:1.1})))) ,pack('starlight','walk',{earLength:1.2,tailLength:.8,bodyWidth:1.1}));
assert.throws(()=>unpack({ppolpet:1}));assert.throws(()=>pack('unknown','walk',{}));assert.deepEqual(normalize({earLength:NaN,bodyWidth:'oops'}),defaults);
let triangles=0,minArea=Infinity,faceError=0,groundError=0;
for(const entry of cases){const l=entry.landmarks;if(!l)continue;l.hasHalo=entry.character==='angel';if(l.hasHalo){const c={...defaults,earLength:1.2,earWidth:1.1};for(let x=l.left;x<l.left+l.width;x+=10)assert.deepEqual(deformPoint(x,l.top-8,l,c),[x,l.top-8],'halo must not bend with ears')}const keys=Object.keys(limits);for(let mask=0;mask<64;mask++){const c=normalize(Object.fromEntries(keys.map((k,i)=>[k,limits[k][(mask>>i)&1]])));
 for(let y=0;y<640;y+=10)for(let x=0;x<640;x+=10){const a=deformPoint(x,y,l,c),b=deformPoint(x+10,y,l,c),d=deformPoint(x,y+10,l,c);const area=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);assert(area>0,`${entry.character}/${entry.motion} folded mesh ${x},${y}`);minArea=Math.min(minArea,area);triangles++}
 for(let x=100;x<540;x+=20){const p=deformPoint(x,576,l,c);groundError=Math.max(groundError,Math.abs(p[1]-576))}
 // Protected middle face, below all ear roots and above the neck.
 const y=l.top+l.height*.48,span=l.width*.12,x=l.lying?l.left+l.width*.4:l.cx;
 const y2=l.lying?y+l.height*.12:Math.min(l.neck-4,y+l.height*.12);const v1=deformPoint(x,y,l,c),v2=deformPoint(x,y2,l,c);faceError=Math.max(faceError,Math.abs((v2[1]-v1[1])-(y2-y)));const a=deformPoint(x-span,y,l,c),b=deformPoint(x+span,y,l,c);faceError=Math.max(faceError,Math.abs((b[0]-a[0])-2*span),Math.abs(b[1]-a[1]));
 }}
assert(groundError<1e-8,'sole must remain on ground');assert(faceError<1e-8,`face compressed ${faceError}`);
const result={cases:cases.length,configurationsPerCase:64,triangles,minSignedArea:minArea,protectedFaceError:faceError,groundError};
fs.writeFileSync(new URL('./geometry-verification.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
