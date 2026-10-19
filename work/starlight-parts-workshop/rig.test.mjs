import assert from 'node:assert/strict';
import {defaults,normalize,pose,GROUND,durations} from './rig.mjs';
const versions=[];
for(const ears of ['cat','bunny','round'])for(const tail of ['round','curved','none'])for(const bodyHeight of [.85,1,1.18])for(const bodyWidth of [.85,1,1.18])for(const earSize of [.8,1.2])versions.push({...defaults,ears,tail,bodyHeight,bodyWidth,earSize});
let samples=0;
for(const c of versions){
 assert.deepEqual(normalize(JSON.parse(JSON.stringify(c))),c);
 for(const mode of ['idle','walk','sit'])for(let i=0;i<=120;i++){
  const p=pose(c,mode,i*durations[mode]/120);samples++;
  assert.equal(p.arms.length,2);assert.equal(p.feet.length,2);
  assert.ok(Math.abs(p.head.w/p.head.h-382/288)<1e-12);
  assert.ok(p.feet.every(f=>f.bottom<=GROUND));
  assert.ok(p.feet.some(f=>Math.abs(f.bottom-GROUND)<1e-9));
  assert.ok(p.arms.every(a=>a.h===49));
  assert.ok(p.head.y>p.body.y); // painted neck covered by head
 }
 const p=pose(c,'walk',.3),q=pose(c,'walk',.9);
 assert.ok(Math.abs(p.feet[0].lift-q.feet[1].lift)<1e-8);
 assert.ok(Math.abs(p.feet[1].lift-q.feet[0].lift)<1e-8);
 assert.deepEqual(pose(c,'sit',1.5),pose(c,'sit',9));
}
assert.equal(normalize({bodyHeight:999}).bodyHeight,1.18);
assert.equal(normalize({earSize:NaN}).earSize,1);
assert.throws(()=>normalize({version:'bad'}));assert.throws(()=>normalize(null));
console.log(JSON.stringify({pass:true,configurations:versions.length,poseSamples:samples,checks:['JSON roundtrip','two arms / two legs','rigid face ratio','at least one grounded foot','no foot penetration','constant arm length','neck overlap','left/right half-cycle symmetry','sitting holds','input limits']}));
