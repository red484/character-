import assert from 'node:assert/strict';
import {partDefaults,normalizeParts,choices,partLimits,originalParts} from './parts-schema.mjs';
import {pack,unpack,defaults} from './custom-schema.mjs';
assert.ok(originalParts(normalizeParts({})));
for(const [key,options] of Object.entries(choices))for(const option of options){const parts=normalizeParts({[key]:option});assert.equal(parts[key],option);const c=pack('starlight','walk',defaults,0,100,true,{},parts);assert.deepEqual(unpack(JSON.parse(JSON.stringify(c))),c)}
for(const [key,[lo,hi]]of Object.entries(partLimits)){assert.equal(normalizeParts({[key]:-Infinity})[key],partDefaults[key]);assert.equal(normalizeParts({[key]:999})[key],hi);assert.equal(normalizeParts({[key]:-999})[key],lo)}
assert.equal(normalizeParts({ears:'url(x)',eyeLeftColor:'red',eyeRightColor:'#AbCdEf'}).ears,'original');
assert.equal(normalizeParts({eyeLeftColor:'red'}).eyeLeftColor,null);
assert.equal(normalizeParts({eyeRightColor:'#AbCdEf'}).eyeRightColor,'#abcdef');
for(const version of [2,3]){const c=pack('bear','sit',defaults,0,100);c.version=version;delete c.parts;assert.deepEqual(unpack(c).parts,partDefaults)}
console.log('PASS all part choices, v4 round trips, invalid-value handling, range clamps, v2/v3 migration');
const expanded=normalizeParts({ornament:'flower',ornamentOther:'star',headColor:'#DDAACC',neck:'starTie',neckColor:'#9988BB',eyeLeft:'sparkle',eyeRight:'wink'});
assert.deepEqual(unpack(JSON.parse(JSON.stringify(pack('starlight','walk',defaults,0,100,true,{},expanded)))).parts,expanded);
assert.equal(expanded.headColor,'#ddaacc');
assert.equal(expanded.neckColor,'#9988bb');
const legacy=pack('bunny','walk',defaults,0,100,true,{}, {ornament:'flower',neck:'bowtie'});
for(const key of ['ornamentOther','headColor','neckColor'])delete legacy.parts[key];
const restored=unpack(legacy).parts;
assert.equal(restored.ornament,'flower');assert.equal(restored.neck,'bowtie');
assert.equal(restored.ornamentOther,'none');assert.equal(restored.headColor,null);assert.equal(restored.neckColor,null);
console.log('PASS independent ornaments/colors and new eyes round-trip; old v4 configurations retain their appearance');
const face=normalizeParts({nose:'heartNose',mouth:'catMouth',cheekMark:'freckles',noseColor:'#CCAA99',mouthSize:1.2,otherSize:.75,otherAngle:.4,otherX:.05,otherHeadColor:'#aabbcc',eyeLeftScale:1.2});
assert.deepEqual(unpack(JSON.parse(JSON.stringify(pack('angel','greet',defaults,0,100,true,{},face)))).parts,face);
const oldBoth=normalizeParts({ornament:'flower',ornamentOther:'star',ornamentX:.03,ornamentY:.05,ornamentSize:1.2});
assert.equal(oldBoth.otherSize,1.2);assert.equal(oldBoth.otherX,-.03);assert.equal(oldBoth.otherY,.05);
const independent=normalizeParts({...oldBoth,ornamentSize:.8,ornamentX:-.1});assert.equal(independent.otherSize,1.2);assert.equal(independent.otherX,-.03);
console.log('PASS face controls persist, old paired ornaments migrate, second ornament stays independent');
const {renderingParts}=await import('./parts-schema.mjs');
const retired=normalizeParts({nose:'heartNose',mouth:'catMouth',cheekMark:'freckles',noseColor:'#f0a0b0',mouthSize:1.2});
assert.ok(originalParts(renderingParts(retired)));
assert.equal(retired.nose,'heartNose');
assert.equal(renderingParts({...retired,ornament:'flower',otherSize:.8}).ornament,'flower');
assert.equal(renderingParts({...retired,eyeLeft:'sparkle'}).eyeLeft,'sparkle');
console.log('PASS retired face settings do not render; recoverable config and other customizations remain');
