(async()=>{
'use strict';
const $=id=>document.getElementById(id),P=window.PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]);
const lock=await fetch('model-lock.json').then(r=>r.json());
const key='ppolpet-internal-stand:'+lock['pet-render.js'];
let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
const inventory=[['서기 / 대기','정지 자세 구현 · 대기 미세 움직임 미구현'],['아장아장 걷기','기존 구현 있음 · 다음 단계'],['앉기','기존 자세 있음 · 전환 미검증'],['일어서기','전용 전환 미구현'],['엎드리기 / 잠들기','기존 lie 있음 · 연결 미검증'],['무언가 바라보기','기존 look 있음 · 미검수'],['인사하기','기존 wave 있음 · 미검수']];
$('motions').innerHTML=inventory.map(([name,info],i)=>`<div class="motion ${i?'':'active'}"><strong>${i+1}. ${name}</strong><small>${info}</small><br><small>${i?'검수 대기 · 잠금':'검수 대기'}</small></div>`).join('');
let pet=P.createPet($('live'),cfg);pet.setState('stand');pet.setAngle(0);
let reviewRAF=0;
let running=true,speed=1,time=0,angle=0,last=performance.now(),captureRequest=null,recording=false;
const duration=4;let canvas=$('live').querySelector('canvas');
const buffer=document.createElement('canvas');
function capture(){buffer.width=canvas.width;buffer.height=canvas.height;const ctx=buffer.getContext('2d');ctx.fillStyle='#f4f1f8';ctx.fillRect(0,0,buffer.width,buffer.height);ctx.drawImage(canvas,0,0);return buffer;}
function save(url,name){const a=$('last-export');a.hidden=false;a.href=url;a.download=name;a.textContent=name;const holder=$('export-preview');holder.replaceChildren();if(/\.(png|webm)$/.test(name)){const el=document.createElement(name.endsWith('.png')?'img':'video');el.src=url;el.style.maxWidth='100%';if(el.tagName==='VIDEO'){el.controls=true;el.onloadeddata=()=>{$('export-status').textContent=`영상 생성 확인 · ${el.videoWidth}×${el.videoHeight}`;};}holder.appendChild(el);}a.click();}
function saveBlob(blob,name){const u=URL.createObjectURL(blob);save(u,name);/* Keep preview URL alive until the page closes. */}
function update(){ $('timeline').value=time;$('time').textContent=`${time.toFixed(2)} / 4.00초`;$('play').textContent=running?'일시정지':'재생';pet.setPaused(!running); }
// The approved stand pose is time invariant. This clock deliberately does not
// manufacture breathing or use the legacy idle pose with a different body.
function tick(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(running){time+=dt*speed;if(time>=duration){if($('loop').checked)time%=duration;else{time=duration;running=false;}}}update();if(captureRequest){captureRequest(capture());captureRequest=null;}if(recording)capture();reviewRAF=requestAnimationFrame(tick);}
reviewRAF=requestAnimationFrame(tick);
function captureNext(){return new Promise(resolve=>{captureRequest=c=>resolve(c.toDataURL('image/png'));});}
$('play').onclick=()=>{if(time>=duration)time=0;running=!running;update();};
$('restart').onclick=()=>{time=0;running=true;update();};
$('speed').onchange=e=>speed=Number(e.target.value);
$('timeline').oninput=e=>{time=Number(e.target.value);running=false;update();};
let boardImage;
async function frames(){
 const snapshot=P.renderSnapshot(cfg,{state:'stand',angle:angle*Math.PI/180,camera:'web',size:500});
 boardImage=new Image();boardImage.src=snapshot;await boardImage.decode();
 $('frames').innerHTML=[0,25,50,75].map((p,i)=>`<button data-time="${i}"><img src="${snapshot}" alt="${angle}도 서기 ${p}%"><span>${p}% · ${i}.00초<br>양발 접지 · 정지 자세</span></button>`).join('');
 $('frames').querySelectorAll('button').forEach(b=>b.onclick=()=>{time=Number(b.dataset.time);running=false;update();});
}
$('angles').onclick=async e=>{const b=e.target.closest('[data-angle]');if(!b||recording)return;angle=Number(b.dataset.angle);cancelAnimationFrame(reviewRAF);pet.destroy();pet=P.createPet($('live'),cfg);pet.setState('stand');pet.setAngle(angle*Math.PI/180);canvas=$('live').querySelector('canvas');reviewRAF=requestAnimationFrame(tick);$('view-label').textContent=`${angle}°`;$('angles').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));await frames();};
$('save-image').onclick=async()=>{save(await captureNext(),`starlight-stand-${angle}deg-${time.toFixed(2)}s.png`);$('export-status').textContent='현재 3D 화면 PNG 저장';};
$('save-board').onclick=()=>{if(!boardImage)return;const c=document.createElement('canvas');c.width=2000;c.height=560;const x=c.getContext('2d');x.fillStyle='#f4f1f8';x.fillRect(0,0,c.width,c.height);for(let i=0;i<4;i++){x.drawImage(boardImage,i*500,0,500,500);x.fillStyle='#574265';x.font='20px sans-serif';x.textAlign='center';x.fillText(`${i*25}% · ${angle}° · 양발 접지 (정지)`,i*500+250,535);}save(c.toDataURL(),`starlight-stand-${angle}deg-frames.png`);};
const mime=window.MediaRecorder&&['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
if(!mime||!buffer.captureStream){$('record').disabled=true;$('record').textContent='이 브라우저는 영상 저장 미지원';}
$('record').onclick=async()=>{
 if(recording)return;const old={running,time};time=0;running=true;await captureNext();
 const stream=buffer.captureStream(30),chunks=[];let recorder;
 try{recorder=new MediaRecorder(stream,{mimeType:mime});}catch(e){stream.getTracks().forEach(t=>t.stop());$('error').textContent=e.message;return;}
 recording=true;$('record').disabled=true;$('export-status').textContent='4초 기록 중 · 현재 서기는 정지 영상입니다.';
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{recording=false;stream.getTracks().forEach(t=>t.stop());saveBlob(new Blob(chunks,{type:mime}),`starlight-stand-${angle}deg.webm`);$('record').disabled=false;$('export-status').textContent='4초 WebM 저장 완료 · 정지 서기';running=old.running;time=old.time;update();};
 recorder.start();setTimeout(()=>recorder.stop(),4000);
};
$('review-state').value=saved.status||'검수 대기';$('notes').value=saved.notes||'';
const checks=[...document.querySelectorAll('.checks input')];checks.forEach((x,i)=>x.checked=!!saved.checks?.[i]);
function report(){return {model:lock,motion:'stand',implementation:'static pose; idle micro-motion unimplemented',status:$('review-state').value,notes:$('notes').value,checks:checks.map(x=>x.checked),updatedAt:new Date().toISOString()};}
function persist(){try{localStorage.setItem(key,JSON.stringify(report()));$('saved').textContent='현재 모델 버전의 검수 기록을 이 브라우저에 저장했습니다.';$('motions').firstElementChild.lastElementChild.textContent=$('review-state').value;}catch{$('saved').textContent='저장소 사용 불가: JSON으로 기록을 내려받으세요.';}}
$('review-state').onchange=persist;$('notes').oninput=persist;checks.forEach(x=>x.onchange=persist);
$('save-report').onclick=()=>saveBlob(new Blob([JSON.stringify(report(),null,2)],{type:'application/json'}),'starlight-stand-review.json');
const actual={};for(const file of Object.keys(lock)){const buf=await fetch('../ppolpet/shared/'+file,{cache:'no-store'}).then(r=>r.arrayBuffer());actual[file]=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buf))].map(n=>n.toString(16).padStart(2,'0')).join('');}
const preserved=Object.keys(lock).every(f=>actual[f]===lock[f]);
if(!preserved)throw Error('고정된 모델 해시와 현재 소스가 다릅니다. 검수를 중단하고 버전을 확인하세요.');
const diagnostic=P.renderSnapshot(cfg,{state:'stand',angle:0,camera:'web',size:200,diagnostics:true});
window.reviewEvidence={preserved,actual,stand:diagnostic.metrics,implementation:'static stand; time-invariant',inventory};
$('verification').textContent=JSON.stringify(window.reviewEvidence,null,2);
await frames();
window.addEventListener('pagehide',()=>pet.destroy(),{once:true});
})().catch(e=>{document.getElementById('error').textContent='검수 도구 오류: '+e.message;console.error(e);});
