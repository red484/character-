// 웹 꾸미기 페이지 만들기: shared/pet-render.js를 끼워 넣어서
//  - docs/index.html  → GitHub Pages에 그대로 올리는 파일
//  - app/pet-render.js → 데스크톱 앱이 쓰는 같은 렌더러
const fs = require('fs');
const path = require('path');

const root = __dirname;
const render = fs.readFileSync(path.join(root, 'shared/pet-render.js'), 'utf8');
const src = fs.readFileSync(path.join(root, 'web/maker.src.html'), 'utf8');
const body = src.replace('/*__PET_RENDER__*/', () => render);

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'web/maker.html'), body);
fs.writeFileSync(
  path.join(root, 'docs/index.html'),
  '<!doctype html><html lang="ko"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>' +
    '</head><body>' + body + '</body></html>'
);
fs.copyFileSync(path.join(root, 'shared/pet-render.js'), path.join(root, 'app/pet-render.js'));
console.log('built docs/index.html, web/maker.html, app/pet-render.js');

const sheetTemplate=fs.readFileSync(path.join(root,'web/sheets.src.html'),'utf8');
const presetBlock=src.slice(src.indexOf('  const PRESETS = ['),src.indexOf("  $('#presets').innerHTML"));
const sheets=sheetTemplate.replace('/*__PET_RENDER__*/',()=>render).replace('/*__PRESETS__*/',()=>presetBlock);
fs.writeFileSync(path.join(root,'docs/sheets.html'),sheets);
