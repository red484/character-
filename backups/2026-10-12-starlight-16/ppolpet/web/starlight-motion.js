(async()=>{try{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const img=src=>new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=src;});
const pixels=im=>{const c=document.createElement('canvas');c.width=c.height=800;const g=c.getContext('2d');g.drawImage(im,0,0);return g.getImageData(0,0,800,800).data;};
const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])n++;return n;};
function bounds(im){const c=document.createElement('canvas');c.width=c.height=800;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,800,800).data;let x0=800,y0=800,x1=0,y1=0;for(let y=0;y<800;y++)for(let x=0;x<800;x++){const k=(y*800+x)*4;if(d[k+3]>240&&d[k+2]-d[k]>7&&d[k+2]-d[k+1]>9){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}return {x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
const cvs=$('cycle'),g=cvs.getContext('2d'),frames=[];
g.fillStyle='#fcfafc';g.fillRect(0,0,1600,1080);g.textAlign='center';
const labels=['오른발 접지','오른발 지지 · 왼발 통과','왼발 접지','왼발 지지 · 오른발 통과'];
for(let row=0;row<2;row++){
 const standing=await img(P.renderSnapshot(cfg,{state:'stand',angle:(row?90:65)*Math.PI/180,size:800,camera:'web',staticPose:true})),b=bounds(standing),sc=350/b.h;
 g.fillStyle='#685079';g.font='600 25px system-ui';g.fillText(row?'구조 검수 · 정확한 90°':'걷기 연출 · 65°',800,row*540+32);
 for(let i=0;i<4;i++){
  const r=P.renderSnapshot(cfg,{state:'walk',phase:i*Math.PI/2,angle:(row?90:65)*Math.PI/180,size:800,camera:'web',staticPose:true,diagnostics:true});
  frames.push({view:row?'side':'front',percent:i*25,...r.metrics});
  const left=i*400+200-(b.x+b.w/2)*sc,top=row*540+440-(b.y+b.h)*sc;
  g.drawImage(await img(r.url),left,top,800*sc,800*sc);
  g.strokeStyle='#ddd2e4';g.setLineDash([4,5]);g.beginPath();g.moveTo(i*400+25,row*540+440);g.lineTo(i*400+375,row*540+440);g.stroke();g.setLineDash([]);
  g.fillStyle='#75578d';g.font='600 23px system-ui';g.fillText(`${i*25}%`,i*400+200,row*540+477);
  g.font='17px system-ui';g.fillText(labels[i],i*400+200,row*540+508);
 }
}
$('cycle-save').href=cvs.toDataURL();
const stand=P.renderSnapshot(cfg,{state:'stand',size:800,camera:'web',staticPose:true,diagnostics:true});
const approved=await img('review-assets/stand-before-15.png');
const snapshot=angle=>P.renderSnapshot(cfg,{state:'stand',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true});
function board(id,images,labels){const c=$(id),g=c.getContext('2d'),cell=c.width/images.length;g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);g.textAlign='center';images.forEach((im,i)=>{g.drawImage(im,i*cell+(cell-400)/2,55,400,400);g.fillStyle='#74548a';g.font='600 23px system-ui';g.fillText(labels[i],i*cell+cell/2,35);});return c.toDataURL();}
const oldSide=await img('review-assets/side-before-15.png'),newSide=await img(snapshot(90));
$('standing-save').href=board('standing',[oldSide,newSide],['디벨롭 14 · 기존 90°','디벨롭 15 · 수정 90°']);
$('angles-save').href=board('angles',await Promise.all([0,45,65,90].map(a=>img(snapshot(a)))),['정면 0°','연결 확인 45°','연출 후보 65°','형상 검사 90°']);
$('front-compare-save').href=board('front-compare',[approved,await img(stand.url)],['승인 정면 · 디벨롭 14','수정 정면 · 디벨롭 15']);
$('front-save').href=stand.url;
const standDiff=diff(pixels(approved),pixels(await img(stand.url)));
const zero=P.renderSnapshot(cfg,{state:'walk',phase:0,size:800,camera:'web',staticPose:true});
const zeroDiff=diff(pixels(await img(stand.url)),pixels(await img(zero)));
const seatedDiff=diff(pixels(await img('review-assets/starlight-approved-seated.png')),pixels(await img(P.renderImage(cfg,'full',800,'perch'))));
const seq=P.auditMotion(cfg,240),range=a=>[Math.min(...a),Math.max(...a)];
let slip=0;for(let i=1;i<seq.length;i++)for(let f=0;f<2;f++)if(seq[i].feet[f].floorY<1e-7&&seq[i-1].feet[f].floorY<1e-7)slip=Math.max(slip,Math.abs(seq[i].feet[f].worldZ-seq[i-1].feet[f].worldZ));
const scalesUnchanged=seq.every(f=>['characterScale','headScale','bodyScale'].every(k=>f[k].every((v,i)=>Math.abs(v-stand.metrics[k][i])<1e-9)));
const loopKeys=['characterScale','headScale','bodyScale'];
const loopScaleMatch=loopKeys.every(k=>seq[0][k].every((v,i)=>Math.abs(v-seq[240][k][i])<1e-8));
const loopFootError=Math.max(...seq[0].feet.flatMap((f,i)=>['floorY','z'].map(k=>Math.abs(f[k]-seq[240].feet[i][k]))));
const report={loopScaleMatch,loopFootError,standChangedPixels:standDiff,gaitContactVsStandPixels:zeroDiff,seatedChangedPixels:seatedDiff,samples:seq.length,scalesUnchanged,supportFloorRange:range(seq.map(f=>Math.min(...f.feet.map(p=>p.floorY)))),maxSupportWorldSlip:slip,maxFootLift:Math.max(...seq.flatMap(f=>f.feet.map(p=>p.floorY))),frames};
$('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
$('status').textContent=`${seq.length}프레임 · 수정 전후 차이 ${standDiff}px · 앉기 차이 ${seatedDiff}px · 체형 ${scalesUnchanged?'고정':'확인 필요'} · 지지발 이동 오차 ${slip.toExponential(1)}`;
$('version').textContent=document.querySelector('[data-renderer-version]').dataset.rendererVersion;
const live=[P.createPet($('front-live'),cfg,{followWalk:true}),P.createPet($('side-live'),cfg,{followWalk:true})];
live.forEach((p,i)=>{p.setAngle((i?90:65)*Math.PI/180);p.setState('walk');});let paused=false;
$('pause').onclick=()=>{paused=!paused;live.forEach(p=>p.setPaused(paused));$('pause').textContent=paused?'재생':'일시 정지';};
$('restart').onclick=()=>live.forEach(p=>{p.setState('stand');p.setState('walk');});
$('stand').onclick=()=>live.forEach(p=>p.setState('stand'));
// Export evenly spaced consecutive frames from the same renderer for motion inspection.
const strip=document.createElement('canvas');strip.width=12*240;strip.height=2*240;const stripG=strip.getContext('2d');
for(let i=0;i<24;i++){const r=P.renderSnapshot(cfg,{state:'walk',phase:i/24*Math.PI*2,angle:65*Math.PI/180,size:240,camera:'web',staticPose:true});stripG.drawImage(await img(r),(i%12)*240,Math.floor(i/12)*240);}
$('animation-save').href=strip.toDataURL();
}catch(e){document.getElementById('error').textContent=e.stack||e.message;}})();
