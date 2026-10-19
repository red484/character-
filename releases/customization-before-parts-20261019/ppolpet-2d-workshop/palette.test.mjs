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
assert.equal(config.version,3);assert.deepEqual(unpack(JSON.parse(JSON.stringify(config))),config);
const v2={...config,version:2};delete v2.palette;assert.deepEqual(unpack(v2).palette,paletteDefaults,'Existing settings migrate without changing artwork');
assert.deepEqual(normalizePalette({fur:'url(https://example.com)',pink:'#AaBbCc',gold:17}),{fur:null,gold:null,pink:'#aabbcc'});
console.log('PASS palette isolation, alpha, default identity, cached equality, v3 roundtrip and v2 migration');
