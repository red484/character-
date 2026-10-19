import assert from 'node:assert/strict';
import {faceAnchors,repairFeature} from './face-custom.mjs';
const raw=new Uint8ClampedArray(640*640*4);for(let i=0;i<raw.length;i+=4){raw.set([170,150,205,255],i)}
// Two gold eyes and a small central nose. Only the nose should be selected.
for(const [cx,cy,r]of [[220,280,12],[420,280,12],[320,310,4]])for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)raw.set([240,215,150,255],(y*640+x)*4);
const l={eyes:[{x:220,y:280,w:25,h:25},{x:420,y:280,w:25,h:25}],cx:320,width:400,height:260,neck:400};
const f=faceAnchors(raw,l,'starlight');assert.equal(f.nose.x,320);assert.equal(f.nose.y,310);assert.ok(f.mouth.added);
const image={data:raw.slice()};repairFeature(image,f.nose);assert.deepEqual([...image.data.slice((310*640+320)*4,(310*640+320)*4+4)],[170,150,205,255]);assert.deepEqual([...image.data.slice((280*640+220)*4,(280*640+220)*4+4)],[240,215,150,255]);
assert.equal(faceAnchors(raw,{...l,eyes:[]},'starlight'),null);
console.log('PASS central feature selection excludes eyes; patch preserves eye pixels and alpha; no face inferred without eyes');
