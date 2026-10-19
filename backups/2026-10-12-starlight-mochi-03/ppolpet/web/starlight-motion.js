(async()=>{try{
const P=window.PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const img=src=>new Promise((resolve,reject)=>{const i=new Image;i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
const live=[P.createPet($('front-live'),cfg),P.createPet($('side-live'),cfg)];
live.forEach((p,i)=>{p.setAngle(i*Math.PI/2);p.setState('walk');});
let paused=false;
for(const [id,state] of [['walk','walk'],['stand','idle']]) $(id).onclick=()=>{live.forEach(p=>p.setState(state));$('walk').setAttribute('aria-pressed',id==='walk');$('stand').setAttribute('aria-pressed',id==='stand');};
$('pause').onclick=()=>{paused=!paused;live.forEach(p=>p.setPaused(paused));$('pause').textContent=paused?'다시 재생':'일시 정지';$('pause').setAttribute('aria-pressed',paused);};
const canvas=$('cycle'),ctx=canvas.getContext('2d'),frames=[];
ctx.fillStyle='#fcfafc';ctx.fillRect(0,0,1440,920);
for(let row=0;row<2;row++)for(let i=0;i<4;i++){
 const result=P.renderSnapshot(cfg,{state:'walk',phase:i*Math.PI/2,angle:row*Math.PI/2,size:600,diagnostics:true});
 frames.push({view:row?'side':'front',percent:i*25,...result.metrics});
 ctx.drawImage(await img(result.url),i*360,row*460+25,360,360);
 ctx.textAlign='center';ctx.fillStyle='#665078';ctx.font='600 22px system-ui';ctx.fillText(`${i*25}% · ${row?'측면':'정면'}`,i*360+180,row*460+32);
 ctx.font='18px system-ui';const contact=i===0?'두 발 접지 · 오른발 앞':i===1?'오른발 지지 · 왼발 들기':i===2?'두 발 접지 · 왼발 앞':'왼발 지지 · 오른발 들기';ctx.fillText(contact,i*360+180,row*460+410);
}
$('cycle-save').href=canvas.toDataURL();
const st=$('standing').getContext('2d');st.fillStyle='#fcfafc';st.fillRect(0,0,1440,440);st.textAlign='center';st.fillStyle='#68547e';st.font='600 20px system-ui';
for(let i=0;i<4;i++){
 const side=i>=2,before=i%2===0;
 const url=before?`review-assets/motion-before-idle${side?'side':'front'}.png`:P.renderSnapshot(cfg,{state:'idle',angle:side?Math.PI/2:0,size:500});
 st.drawImage(await img(url),i*360,35,360,360);st.fillText(`${side?'측면':'정면'} · ${before?'변경 전':'변경 후'}`,i*360+180,28);
}
$('standing-save').href=$('standing').toDataURL();
const wg=$('walking').getContext('2d');wg.fillStyle='#fcfafc';wg.fillRect(0,0,1440,440);wg.textAlign='center';wg.fillStyle='#68547e';wg.font='600 20px system-ui';
for(let i=0;i<4;i++){
 const side=i>=2,before=i%2===0;
 const url=before?`review-assets/motion-before-walk${side?'side':'front'}.png`:P.renderSnapshot(cfg,{state:'walk',phase:Math.PI/2,angle:side?Math.PI/2:0,size:500});
 wg.drawImage(await img(url),i*360,35,360,360);wg.fillText(`${side?'측면':'정면'} · ${before?'변경 전':'변경 후'}`,i*360+180,28);
}
$('walking-save').href=$('walking').toDataURL();
const approved=await img('review-assets/starlight-approved-seated.png');const seated=P.renderImage(cfg,'full',800,'perch');const current=await img(seated);
const pixels=i=>{const c=document.createElement('canvas');c.width=c.height=800;const g=c.getContext('2d');g.drawImage(i,0,0);return g.getImageData(0,0,800,800).data;};
const a=pixels(approved),b=pixels(current);let changed=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])changed++;
$('seated-check').textContent=`승인 PNG와 현재 렌더 비교: 변경 픽셀 ${changed.toLocaleString()} / 640,000`;
$('seated-preview').src=seated;$('seated-save').href=seated;
const continuous=P.auditMotion(cfg),range=arr=>[Math.min(...arr),Math.max(...arr)];
const report={samples:continuous.length,seatedChangedPixels:changed,characterScaleRanges:[0,1,2].map(i=>range(continuous.map(f=>f.characterScale[i]))),headScaleRanges:[0,1,2].map(i=>range(continuous.map(f=>f.headScale[i]))),bodyScaleRanges:[0,1,2].map(i=>range(continuous.map(f=>f.bodyScale[i]))),neckToHip:range(continuous.map(f=>f.neckToHip)),supportFloorY:range(continuous.map(f=>Math.min(...f.feet.map(p=>p.floorY)))),maximumFootLift:Math.max(...continuous.flatMap(f=>f.feet.map(p=>p.floorY))),frames};
$('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
const invariant=report.characterScaleRanges.every(([lo,hi])=>lo===1&&hi===1)&&report.headScaleRanges.concat(report.bodyScaleRanges).every(([lo,hi])=>hi-lo<1e-8);
const contact=report.supportFloorY.every(v=>Math.abs(v)<1e-5);
$('status').textContent=`${continuous.length}프레임 검증 · 머리/몸통 비율 ${invariant?'고정':'확인 필요'} · 지지발 접지 ${contact?'확인':'확인 필요'} · 승인 앉기 ${changed===0?'픽셀 일치':'차이 확인 필요'}`;
$('version').textContent='Renderer SHA-256: '+document.querySelector('[data-renderer-version]').dataset.rendererVersion;
}catch(e){document.getElementById('error').textContent=e.stack||e.message;}})();
