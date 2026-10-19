import assert from 'node:assert/strict';
import {rigs,walkPoint,footPhase,period} from './walk-rig.mjs';
let minArea=Infinity;
for(const rig of Object.values(rigs))for(let t=0;t<=period;t+=20){
 for(const [x,y]of [[100,100],[160,180],[220,200]])assert.deepEqual(walkPoint(x,y,t,rig),[x,y]);
 for(let y=210;y<320;y+=4)for(let x=60;x<260;x+=4){const a=walkPoint(x,y,t,rig),b=walkPoint(x+4,y,t,rig),c=walkPoint(x,y+4,t,rig);const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);assert(area>0,'folded mesh');minArea=Math.min(minArea,area)}
 assert.deepEqual(walkPoint(130,283,0,rig),walkPoint(130,283,period,rig));
}
for(let p=0;p<.5;p+=.01){const a=footPhase(p);assert.equal(a.lift,0);assert(Math.abs(a.x+28*p-7)<1e-8,'stance world x must be fixed at matched travel speed');assert(footPhase(p+.5).lift>=0)}
assert.equal(footPhase(0).x,-footPhase(.5).x);assert.equal(footPhase(.25).lift,0);assert.equal(footPhase(.75).lift,5);
console.log({characters:5,period,minArea,headUnchanged:true,loopContinuous:true,oppositeHalfCycle:true,stanceSpeed:28/period});
