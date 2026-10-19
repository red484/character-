import {defaults,normalize,render,durations,VERSION} from './rig.mjs';
const $=id=>document.getElementById(id),ids=['ears','tail','bodyHeight','bodyWidth','earSize'];
const ctx=$('stage').getContext('2d');ctx.scale(2,2);
let config={...defaults},mode='idle',time=0,playing=true,atlas,parts,ready=false,last=0;
const key='ppolpet-parts-workshop-v1';
const image=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('이미지를 불러오지 못했습니다.'));im.src=src});
function status(s){$('status').textContent=s}
function updateControls(){for(const id of ids){$(id).value=config[id];if($(id+'Text'))$(id+'Text').value=Math.round(config[id]*100)+'%'}drawFrames()}
function updatePlayback(){ $('play').textContent=playing?'일시정지':'재생';$('timeline').max=durations[mode];$('timeline').value=Math.min(time,durations[mode]);$('timeText').value=time.toFixed(2)+'초';}
function setMode(m){mode=m;time=0;playing=true;$('loop').checked=m!=='sit';document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));$('motionLabel').textContent={idle:'갸웃 대기',walk:'걷기',sit:'앉기'}[m];updatePlayback();}
for(const id of ids)$(id).addEventListener('input',()=>{config=normalize({...config,[id]:$(id).type==='range'?Number($(id).value):$(id).value});updateControls();status('커스텀을 현재 모션에 반영했습니다.');});
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>setMode(b.dataset.mode);
$('play').onclick=()=>{playing=!playing;updatePlayback()};$('restart').onclick=()=>{time=0;playing=true;updatePlayback()};
$('timeline').oninput=()=>{time=Number($('timeline').value);playing=false;updatePlayback()};
$('reset').onclick=()=>{config={...defaults};updateControls();status('시제품의 기본 외형으로 돌아왔습니다.')};
$('save').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(config));status('이 브라우저에 커스텀을 저장했습니다.')}catch(e){status('저장할 수 없습니다: '+e.message)}};
$('load').onclick=()=>{try{const saved=localStorage.getItem(key);if(!saved)throw Error('아직 저장한 설정이 없습니다.');config=normalize(JSON.parse(saved));updateControls();status('저장한 커스텀을 불러왔습니다.')}catch(e){status(e.message)}};
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('config').onclick=()=>download('starlight-custom-v1.json',JSON.stringify(config,null,2),'application/json');
$('importButton').onclick=()=>$('importFile').click();
$('importFile').onchange=async()=>{try{const f=$('importFile').files[0];if(!f)return;if(f.size>10000)throw Error('설정 JSON 파일만 선택하세요.');config=normalize(JSON.parse(await f.text()));updateControls();status('설정 파일을 반영했습니다.')}catch(e){status('불러오기 실패: '+e.message)}finally{$('importFile').value=''}};
function drawFrames(){if(!ready)return;const items=[...$('frames').querySelectorAll('canvas')];for(let i=0;i<items.length;i++)render(items[i].getContext('2d'),atlas,parts,config,'walk',i*1.2/8);}
function loop(now){const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(ready){if(playing){time+=dt*Number($('speed').value);if(time>durations[mode]){if($('loop').checked)time%=durations[mode];else{time=durations[mode];playing=false}}}render(ctx,atlas,parts,config,mode,time);updatePlayback()}requestAnimationFrame(loop)}
// Export embeds the exact same rig source, atlas pixels, coordinates and normalized config.
// No remote dependency; output is an offline browser preview, not a desktop installer.
$('download').onclick=async()=>{
 if(!ready)return;
 try{
 status('오프라인 재생 파일을 준비 중입니다.');
 const [rig,blob]=await Promise.all([fetch('./rig.mjs').then(r=>r.text()),fetch('assets/parts-v1.png').then(r=>r.blob())]);
 const dataURL=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob)});
 const source=rig.replace(/^export /gm,'');
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>내 별빛냥 모션</title><style>body{margin:0;text-align:center;background:#f7f5fb;color:#51405f;font:16px system-ui}main{max-width:600px;margin:auto;padding:20px}canvas{max-width:100%;background:white;border-radius:24px}button,select{font:inherit;padding:10px;margin:4px;border:1px solid #ccc0da;border-radius:10px;background:white}p{font-size:13px}</style><main><h2>내 별빛냥</h2><canvas id="pet" width="1024" height="840"></canvas><div><button data-mode="idle">갸웃 대기</button><button data-mode="walk">걷기</button><button data-mode="sit">앉기</button><button id="toggle">일시정지</button><button id="restart">처음부터</button><select id="speed"><option value=".5">0.5배</option><option value="1" selected>1배</option><option value="2">2배</option></select></div><p>커스텀을 포함한 오프라인 브라우저 재생본 · 데스크톱 시메지 앱이 아닙니다.</p></main><script>${source}\nconst config=${JSON.stringify(config)},parts=${JSON.stringify(parts)},atlas=new Image(),ctx=document.getElementById('pet').getContext('2d');ctx.scale(2,2);let mode='idle',time=0,last=0,playing=true;atlas.src=${JSON.stringify(dataURL)};for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;time=0;playing=true;document.getElementById('toggle').textContent='일시정지'};document.getElementById('toggle').onclick=()=>{playing=!playing;document.getElementById('toggle').textContent=playing?'일시정지':'재생'};document.getElementById('restart').onclick=()=>{time=0;playing=true;document.getElementById('toggle').textContent='일시정지'};function tick(now){const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(playing)time+=dt*Number(document.getElementById('speed').value);if(mode==='sit')time=Math.min(time,1.5);else time%=durations[mode];if(atlas.complete&&atlas.naturalWidth)render(ctx,atlas,parts,config,mode,time);requestAnimationFrame(tick)}requestAnimationFrame(tick);<\/script></html>`;
 download('my-starlight-motion.html',html,'text/html');status('현재 커스텀이 담긴 HTML을 다운로드했습니다. 파일을 열면 바로 재생됩니다.');
 }catch(e){status('다운로드 준비 실패: '+e.message)}
};
async function init(){try{
 [atlas,parts]=await Promise.all([image('assets/parts-v1.png'),fetch('parts.json').then(r=>{if(!r.ok)throw Error('파츠 좌표를 불러오지 못했습니다.');return r.json()})]);
 for(let i=0;i<8;i++){const d=document.createElement('div');d.innerHTML=`<canvas width="512" height="420" aria-label="걷기 ${i+1} 프레임"></canvas><small>${i+1} · ${Math.round(i/8*100)}%</small>`;$('frames').append(d)}
 ready=true;updateControls();render($('base').getContext('2d'),atlas,parts,defaults,'idle',0);
 const approved=await image('assets/approved-idle-v1.png');const ac=$('approved').getContext('2d');ac.drawImage(approved,0,0,444,444,111,100,290,290);
 status('귀·꼬리·체형 변경을 모션에 바로 반영할 수 있습니다.');
 }catch(e){status('준비 실패: '+e.message)}}
init();requestAnimationFrame(loop);
