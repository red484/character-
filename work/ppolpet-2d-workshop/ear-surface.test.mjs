import assert from 'node:assert/strict';
import {repairEarRoot, cloudEarMask, fitScalpShade} from './ear-surface.mjs';

const pixels = new Uint8ClampedArray(640 * 640 * 4);
const source = pixels.slice();
const curve = new Float32Array(640).fill(200);
const shade = [[240,0,0,0,0,0],[235,0,0,0,0,0],[235,0,0,0,0,0]];
const bunny = {character:'bunny',cx:320,width:300,top:200,neck:440,height:240,
  eyes:[{y:360,h:24},{y:350,h:24}]};
function repair(x,y){
  const i=(y*640+x)*4;
  source.set([150,130,190,255],i);pixels.set(source.slice(i,i+4),i);
  repairEarRoot(pixels,source,i,x,y,bunny,curve,shade);
  return [...pixels.slice(i,i+4)];
}
assert.deepEqual(repair(240,250),[240,235,235,255],'remove lavender ribbon residue from the scalp');
assert.deepEqual(repair(240,350),[150,130,190,255],'preserve the higher eye of a tilted face');
assert.deepEqual(repair(470,250),[150,130,190,255],'do not repaint beyond the scalp');

const tinted = new Uint8ClampedArray(640*640*4);
const white = new Uint8ClampedArray(tinted.length);
for(let i=0;i<tinted.length;i+=4){tinted.set([70,120,95,255],i);white.set([235,235,235,255],i);}
const fit=fitScalpShade(tinted,{...bunny,left:170,right:470},curve,white);
assert.ok(fit.every(row=>row),'recolouring must not discard every scalp sample');
for(const [k,value] of [70,120,95].entries())assert.ok(Math.abs(fit[k][0]-value)<1e-6,'fit the recoloured surface, classify with source pixels');

const dog = {left:150,right:490,cx:320,width:340,top:100,height:300,neck:400};
const raw = new Uint8ClampedArray(640*640*4);
for(let y=240;y<330;y++)for(let x=165;x<210;x++)raw.set([240,220,185,255],(y*640+x)*4);
const mask=cloudEarMask(raw,dog);
assert.equal(mask[280*640+180],1,'cover the cream ear');
assert.ok(mask[280*640+216]>0,'include the neutral shaded ear edge');
assert.ok(mask[334*640+200]>0,'include the lower contour beyond the last coloured row');
assert.equal(mask[280*640+320],0,'leave central facial features outside the ear mask');
assert.equal(mask[450*640+180],0,'leave paws and torso outside the ear mask');
console.log('PASS ear-root residue repair, tilted-eye protection, shaded dog-ear contour and face/body exclusions');
