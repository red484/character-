import assert from 'node:assert/strict';
import {sequence,frameAt,cycleDuration,advance,travelOffset} from './motion-timing.mjs';
const walk=sequence('walk'),half=cycleDuration(walk)/2;
assert.equal(frameAt(walk,0),0);assert.equal(frameAt(walk,half),4);
for(const t of [0,20,174,175,280,399,529])assert.equal(frameAt(walk,t+half),(frameAt(walk,t)+4)%8);
for(const [name,last]of [['sit',2],['lie',4],['standSit',0],['standLie',0]]){const steps=sequence(name),d=cycleDuration(steps),r=advance(0,d+500,d,false);assert.equal(r.ended,true);assert.equal(r.time,d);assert.equal(frameAt(steps,r.time),last)}
const d=cycleDuration(walk);assert.equal(advance(d-10,25,d,true).time,15);
assert.ok(Math.abs(travelOffset(d+1)-travelOffset(d-1))<.1);
assert.ok(Math.abs(travelOffset(12800))>=320);assert.ok(Math.abs(travelOffset(12800.001))>319);
for(const c of ['angel','apricot','bear','bunny','cloud'])for(const mode of ['idle','walk','sit','lie','standSit','standLie','greet','special','expressions'])for(const classic of [true,false]){const steps=sequence(mode,{classic,character:c});assert.ok(steps.length);for(const [frame,ms]of steps){assert.ok(Number.isInteger(frame)&&frame>=0&&frame<12);assert.ok(ms>0)}}
console.log('PASS: mirrored timing halves, settled pose holds, stand-up endpoints, loop wrap, continuous travel, all schedules');
