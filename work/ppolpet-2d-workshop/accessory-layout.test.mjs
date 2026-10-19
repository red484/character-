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
