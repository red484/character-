import assert from 'node:assert/strict';
import {paletteDefaults,normalizePalette,recolorPixels} from './palette.mjs';
import {pack,unpack,defaults} from './custom-schema.mjs';
const pixels=new Uint8ClampedArray([166,151,208,255,244,221,160,230,232,170,194,200,255,255,255,255,20,20,20,255,110,90,160,0]);
assert.deepEqual(recolorPixels(pixels.slice(),{}),pixels,'No palette is exact original pixels');
const fur=recolorPixels(pixels.slice(),{fur:'#a5c9bb'});
assert.notDeepEqual(fur.slice(0,3),pixels.slice(0,3));
assert.deepEqual(fur.slice(4),pixels.slice(4),'Fur editing leaves eyes, cheeks, grayscale and invisible pixels unchanged');
for(const [key,offset] of [['gold',4],['pink',8]]){const out=recolorPixels(pixels.slice(),{[key]:'#a5c9bb'});for(let i=0;i<pixels.length;i++)if(i<offset||i>=offset+3)assert.equal(out[i],pixels[i],`${key} changed an unrelated channel`)}
const palette={fur:'#a5c9bb',gold:'#f4e8d5',pink:'#edb8a5'};
const mixed=recolorPixels(pixels.slice(),palette),cached=recolorPixels(pixels.slice(),palette,new Map());
assert.deepEqual(mixed,cached);for(let i=3;i<pixels.length;i+=4)assert.equal(mixed[i],pixels[i],'Alpha preserved');
const config=pack('starlight','walk',defaults,0,100,true,palette);
assert.equal(config.version,4);assert.deepEqual(unpack(JSON.parse(JSON.stringify(config))),config);
const v2={...config,version:2};delete v2.palette;assert.deepEqual(unpack(v2).palette,paletteDefaults,'Existing settings migrate without changing artwork');
assert.deepEqual(normalizePalette({fur:'url(https://example.com)',pink:'#AaBbCc',gold:17}),{fur:null,gold:null,pink:'#aabbcc'});
console.log('PASS palette isolation, alpha, default identity, cached equality, v4 roundtrip and v2 migration');

const whites=new Uint8ClampedArray([250,245,247,253,232,226,226,255,190,190,190,210,85,62,80,255,252,196,199,253]);
for(const character of ['angel','bunny','cloud']){
 const result=recolorPixels(whites.slice(),{fur:'#a5c9bb'},null,character);
 for(const i of [0,4,8])assert.ok(result[i+1]>result[i]+2,'tint highlights, neutral fur and shadows consistently');
 assert.deepEqual(result.slice(12),whites.slice(12),'preserve dark facial details and pink cheek');
 for(let i=3;i<result.length;i+=4)assert.equal(result[i],whites[i],'preserve alpha on white sprites');
 const withCache=recolorPixels(whites.slice(),{fur:'#a5c9bb'},new Map(),character);
 assert.deepEqual(withCache,result);
 const nearEye=recolorPixels(whites.slice(),{fur:'#a5c9bb'},null,character,{eyes:[{x:1,y:0,w:40,h:20}]});
 assert.deepEqual(nearEye.slice(0,12),result.slice(0,12),'do not leave uncoloured rectangular skin patches around eyes');
}
console.log('PASS white-character highlights, neutral shadows, face details, cheek isolation and eye-surround recolouring');
