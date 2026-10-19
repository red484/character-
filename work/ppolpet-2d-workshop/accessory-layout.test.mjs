import assert from 'node:assert/strict';
import fs from 'node:fs';
import {accessoryLayout} from './accessory-layout.mjs';
import {normalizeParts} from './parts-schema.mjs';
const report=JSON.parse(fs.readFileSync(new URL('./qa/layer-join-v2/parts-check.json',import.meta.url)));
let checked=0;
for(const row of report.partsReport)for(const sample of row.samples){const l=sample.anchors;
 for(const side of ['left','right'])for(const size of [.7,1,1.3])for(const x of [-.12,0,.12])for(const y of [-.12,0,.12]){
 const before=JSON.stringify(l),p=normalizeParts({ornament:'bow',ornamentSide:side,ornamentSize:size,ornamentX:x,ornamentY:y,neck:'bowtie',back:'wings'}),a=accessoryLayout(l,p,row.character);
 assert.equal(JSON.stringify(l),before);for(const item of Object.values(a))for(const k of ['x','y','width','height','angle'])assert(Number.isFinite(item[k]),`${row.character}/${row.motion}/${k}`);
 assert(a.head.width>0&&a.head.height>0&&a.neck.width>0);assert.equal(a.neck.reuseNative,row.character==='angel');
 assert(Math.abs(a.head.x-l.cx)<=l.width*.401);assert(a.neck.y>=l.neck);checked++;
 }
}
console.log(`PASS ${checked} sampled-pose/accessory-range cases; finite placement, native ribbon reuse, torso anchoring, immutable source landmarks`);

// Same neck and face, different arm/foot silhouettes: collar must not slide.
const walk=report.partsReport.find(r=>r.character==='bunny'&&r.motion==='walk').samples[0].anchors;
const bow=normalizeParts({neck:'bowtie'});
const base=accessoryLayout(walk,bow,'bunny').neck;
for(const bodyX of [walk.cx-70,walk.cx,walk.cx+70])for(const bottom of [560,576,590]){
 const n=accessoryLayout({...walk,bodyX,bottom},bow,'bunny').neck;
 assert.deepEqual(n,base,'arm swing and foot support must not move the collar');
}
const moved=accessoryLayout({...walk,cx:walk.cx+8,neck:walk.neck+12,eyes:walk.eyes.map(e=>({...e,x:e.x+8,y:e.y+12}))},bow,'bunny').neck;
assert(Math.abs(moved.x-base.x-8)<1e-9);
assert(Math.abs(moved.y-base.y-12)<1e-9);
const top=base.y-(Math.cos(base.angle)*base.height+Math.abs(Math.sin(base.angle))*base.width)/2;
assert(top>walk.neck,'the whole collar fits below the head, without a horizontal clipping edge');
console.log('PASS walking collar ignores arm/foot silhouette, follows neck translation, and fits without clipping');
assert.equal(accessoryLayout({...walk,motion:'lie',lying:true,bottom:walk.neck+4},bow,'bunny').neck.opacity,0);
assert.equal(accessoryLayout({...walk,motion:'standLie',lying:true,bottom:walk.neck+walk.width*.35},bow,'bunny').neck.opacity,1);
console.log('PASS rest-pose collar occlusion and upright visibility');
