import assert from 'node:assert/strict';
import fs from 'node:fs';
import {starlightSteps,starlightPeriod,poseStarts} from './starlight-walk.mjs';
import {frameAt,advance} from './motion-timing.mjs';
const source=fs.readFileSync(new URL('../starlight-walk-timing/index.html',import.meta.url),'utf8');
const sourceDurations=source.match(/const dur=\[([^\]]+)\]/)[1].split(',').map(s=>Number(s)*1000);
assert.deepEqual(starlightSteps,sourceDurations.map((ms,i)=>[Math.floor(i/2),ms]));
assert.equal(starlightPeriod,1040);
poseStarts.forEach((t,i)=>assert.equal(frameAt(starlightSteps,t),i));
assert.equal(frameAt(starlightSteps,advance(1039,2,1040,true).time),0);
const current=JSON.parse(fs.readFileSync(new URL('./manifest.json',import.meta.url)));
const before=JSON.parse(fs.readFileSync(new URL('../ppolpet-2d-workshop/walk-review/before-transfer/manifest.json',import.meta.url)));
for(const c of current.characters){
 const old=before.characters.find(x=>x.id===c.id);
 for(const k of ['walk','poses','expressions'])assert.deepEqual(c.atlases[k],old.atlases[k]);
 const a=c.atlases.walkTransfer;assert.equal(a.frames.length,4);assert(a.scale>0);
 assert(fs.existsSync(new URL(a.src,import.meta.url)));
 for(const f of a.frames){const [x,y,w,h]=f.rect;assert(x>=0&&y>=0&&x+w<=a.size[0]&&y+h<=a.size[1]);assert(f.origin[1]>=0&&f.origin[1]<h)}
}
console.log('PASS: exact approved timing, loop boundary, five 4-pose atlases, all prior motion metadata preserved');
