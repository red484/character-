// One renderer source; versioned URLs prevent an old browser cache from mixing builds.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = __dirname;
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const render = read('shared/pet-render.js'), presets = read('shared/presets.js');
const rendererHash = hash(render), presetHash = hash(presets);
const scripts = `<script src="../shared/pet-render.js?v=${rendererHash}" integrity="sha256-${crypto.createHash('sha256').update(render).digest('base64')}" data-renderer-version="${rendererHash}"></script>\n<script src="../shared/presets.js?v=${presetHash}" integrity="sha256-${crypto.createHash('sha256').update(presets).digest('base64')}" data-preset-version="${presetHash}"></script>`;
const body = read('web/maker.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts);
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'web/maker.html'),body);
fs.writeFileSync(path.join(root,'docs/index.html'),'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>');
// Electron's local copy is a generated artifact, never edited independently.
fs.copyFileSync(path.join(root,'shared/pet-render.js'),path.join(root,'app/pet-render.js'));
fs.writeFileSync(path.join(root,'docs/sheets.html'),read('web/sheets.src.html'));
fs.writeFileSync(path.join(root,'docs/starlight-review.html'),read('web/starlight-review.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('geometry02',hash(read('web/starlight-review.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-motion.html'),read('web/starlight-motion.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('motion01',hash(read('web/starlight-motion.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-stand.html'),read('web/starlight-stand.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('stand01',hash(read('web/starlight-stand.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-side.html'),read('web/starlight-side.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('side16',hash(read('web/starlight-side.js'))));
const referenceHashes = Object.fromEntries(['angel','bear','starlight','bunny','apricot','cloud'].map(n=>[n,hash(fs.readFileSync(path.join(root,`references/${n}.png`)))]));
fs.writeFileSync(path.join(root,'docs/build-manifest.json'),JSON.stringify({rendererHash,presetHash,referenceHashes,referencePolicy:'Starlight frozen 2026-10-13: approved profile k, side75 face placement, preserved seated/lie/wave poses and existing gait. Other characters await approval.'},null,2)+'\n');
console.log('Built workshop + starlight review. Renderer SHA-256:',rendererHash);

fs.writeFileSync(path.join(root,"docs/starlight-face.html"),read("web/starlight-face.src.html").replace("/*__SHARED_SCRIPTS__*/",scripts).replace("face17",hash(read("web/starlight-face.js"))));

fs.writeFileSync(path.join(root,"docs/starlight-design.html"),read("web/starlight-design.src.html").replace("/*__SHARED_SCRIPTS__*/",scripts).replace("design17",hash(read("web/starlight-design.js"))));

fs.writeFileSync(path.join(root,"docs/starlight-ear.html"),read("web/starlight-ear.src.html").replace("/*__SHARED_SCRIPTS__*/",scripts).replace("earjoin",hash(read("web/starlight-ear.js"))));

fs.writeFileSync(path.join(root,"docs/starlight-kitten.html"),read("web/starlight-kitten.src.html").replace("/*__SHARED_SCRIPTS__*/",scripts).replace("v=kitten", "v="+hash(read("web/starlight-kitten.js"))));
fs.writeFileSync(path.join(root,'docs/starlight-animal.html'),read('web/starlight-animal.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=animal','v='+hash(read('web/starlight-animal.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-baby.html'),read('web/starlight-baby.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=baby','v='+hash(read('web/starlight-baby.js'))));

fs.writeFileSync(path.join(root,'docs/starlight-profile.html'),read('web/starlight-profile.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=profile','v='+hash(read('web/starlight-profile.js'))));

fs.writeFileSync(path.join(root,'docs/starlight-round.html'),read('web/starlight-round.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=round','v='+hash(read('web/starlight-round.js'))));

fs.writeFileSync(path.join(root,'docs/starlight-nose.html'),read('web/starlight-nose.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=nose','v='+hash(read('web/starlight-nose.js'))));

fs.writeFileSync(path.join(root,'docs/starlight-placement.html'),read('web/starlight-placement.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=placement','v='+hash(read('web/starlight-placement.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-final.html'),read('web/starlight-final.src.html').replace('/*__SHARED_SCRIPTS__*/',scripts).replace('v=finalsheet','v='+hash(read('web/starlight-final.js'))));
fs.writeFileSync(path.join(root,'docs/starlight-layout.html'),read('web/starlight-layout.src.html'));

// Internal side-face tuning board; no changes to the six workshop presets.
fs.writeFileSync(path.join(root,"docs/starlight-profile-fit.html"),read("web/starlight-profile-fit.src.html").replace("/*__SHARED_SCRIPTS__*/",scripts));
