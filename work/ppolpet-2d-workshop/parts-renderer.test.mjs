import assert from 'node:assert/strict';
import {isCheekPixel} from './parts-renderer.mjs';

// Actual source pixels from Angel's first approved walking frame. Red cheeks
// have almost equal green/blue channels; a purple-only test cut holes in them.
for(const rgb of [[252,196,199],[250,193,198],[242,189,192]])
  assert.equal(isCheekPixel(...rgb,'angel'),true,'preserve the red cheek');
for(const rgb of [[100,67,94],[140,95,130],[237,222,225]])
  assert.equal(isCheekPixel(...rgb,'angel'),false,'do not protect iris or white skin as cheek');
assert.equal(isCheekPixel(252,196,199,'bear'),false,'pink bear fur is not an eye exclusion');
console.log('PASS original Angel cheek pixels, dark iris exclusion and pink-fur distinction');
