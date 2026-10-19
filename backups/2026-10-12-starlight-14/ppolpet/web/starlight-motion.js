(async()=>{try{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const img=src=>new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=src;});
const pixels=im=>{const c=document.createElement('canvas');c.width=c.height=800;const g=c.getContext('2d');g.drawImage(im,0,0);return g.getImageData(0,0,800,800).data;};
const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])n++;return n;};
const cvs=$('cycle'),g=cvs.getContext('2d'),frames=[];
g.fillStyle='#fcfafc';g.fillRect(0,0,1600,1080);g.textAlign='center';
const labels=['양발 접지 · 출발','왼발 지지 / 오른발 들기','오른발 전진 착지 · 양발 접지','오른발 지지 / 왼발 들기'];
for(let row=0;row<2;row++){
 g.fillStyle='#685079';g.font='600 25px system-ui';g.fillText(row?'측면 · 정확한 90°':'정면 · 0°',800,row*540+32);
 for(let i=0;i<4;i++){
  const r=P.renderSnapshot(cfg,{state:'walk',phase:i*Math.PI/2,angle:row*Math.PI/2,size:800,camera:'web',staticPose:true,diagnostics:true});
  frames.push({view:row?'side':'front',percent:i*25,...r.metrics});
  g.drawImage(await img(r.url),i*400,row*540+55,400,400);
  g.fillStyle='#75578d';g.font='600 23px system-ui';g.fillText(`${i*25}%`,i*400+200,row*540+477);
  g.font='17px system-ui';g.fillText(labels[i],i*400+200,row*540+508);
 }
}
$('cycle-save').href=cvs.toDataURL();
const stand=P.renderSnapshot(cfg,{state:'stand',size:800,camera:'web',staticPose:true,diagnostics:true});
const approved=await img('review-assets/stand-before-12.png');
const standDiff=diff(pixels(approved),pixels(await img(stand.url)));
const zero=P.renderSnapshot(cfg,{state:'walk',phase:0,size:800,camera:'web',staticPose:true});
const zeroDiff=diff(pixels(await img(stand.url)),pixels(await img(zero)));
const seatedDiff=diff(pixels(await img('review-assets/starlight-approved-seated.png')),pixels(await img(P.renderImage(cfg,'full',800,'perch'))));
const seq=P.auditMotion(cfg,240),range=a=>[Math.min(...a),Math.max(...a)];
let slip=0;for(let i=1;i<seq.length;i++)for(let f=0;f<2;f++)if(seq[i].feet[f].floorY<1e-7&&seq[i-1].feet[f].floorY<1e-7)slip=Math.max(slip,Math.abs(seq[i].feet[f].worldZ-seq[i-1].feet[f].worldZ));
const scalesUnchanged=seq.every(f=>['characterScale','headScale','bodyScale'].every(k=>f[k].every((v,i)=>Math.abs(v-stand.metrics[k][i])<1e-9)));
const report={standChangedPixels:standDiff,zeroPhaseVsStandPixels:zeroDiff,seatedChangedPixels:seatedDiff,samples:seq.length,scalesUnchanged,supportFloorRange:range(seq.map(f=>Math.min(...f.feet.map(p=>p.floorY)))),maxSupportWorldSlip:slip,maxFootLift:Math.max(...seq.flatMap(f=>f.feet.map(p=>p.floorY))),frames};
$('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
$('status').textContent=`${seq.length}프레임 · 서기 차이 ${standDiff}px · 출발 프레임 차이 ${zeroDiff}px · 앉기 차이 ${seatedDiff}px · 체형 ${scalesUnchanged?'고정':'확인 필요'} · 지지발 이동 오차 ${slip.toExponential(1)}`;
$('version').textContent=document.querySelector('[data-renderer-version]').dataset.rendererVersion;
const live=[P.createPet($('front-live'),cfg,{followWalk:true}),P.createPet($('side-live'),cfg,{followWalk:true})];
live.forEach((p,i)=>{p.setAngle(i*Math.PI/2);p.setState('walk');});let paused=false;
$('pause').onclick=()=>{paused=!paused;live.forEach(p=>p.setPaused(paused));$('pause').textContent=paused?'재생':'일시 정지';};
$('restart').onclick=()=>live.forEach(p=>{p.setState('stand');p.setState('walk');});
$('stand').onclick=()=>live.forEach(p=>p.setState('stand'));
}catch(e){document.getElementById('error').textContent=e.stack||e.message;}})();
