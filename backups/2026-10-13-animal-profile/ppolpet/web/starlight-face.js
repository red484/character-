(async()=>{try{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const img=src=>new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=src;});
const snap=(angle,extra={})=>P.renderSnapshot(cfg,{state:'stand',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true,...extra});
function board(id,images,labels){const c=$(id),g=c.getContext('2d'),w=c.width/images.length,sz=Math.min(w,460);g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);images.forEach((im,i)=>{g.fillStyle='#77548d';g.font='600 20px system-ui';g.textAlign='center';g.fillText(labels[i],w*(i+.5),30);g.drawImage(im,w*i+(w-sz)/2,45,sz,sz);});return c.toDataURL();}
function pixels(i){const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);return g.getImageData(0,0,c.width,c.height).data;}
function diff(a,b){let n=0;for(let i=0;i<a.length;i+=4)if(a.slice(i,i+4).some((v,k)=>v!==b[i+k]))n++;return n;}
const degrees=[0,15,30,45,60,75,90],frames=[],audit=[];
for(const angle of degrees){const r=snap(angle,{diagnostics:true,faceAudit:true});frames.push(await img(r.url));audit.push({angle,...r.faceAudit});}
$('restored-save').href=board('restored',frames,degrees.map(a=>a+'°'));
$('texture').src=snap(0,{textureOnly:true});
const selected=[0,30,45,60,75,90],proposed=[];
for(const a of selected)proposed.push(await img(snap(a,{sideExpression:true})));
$('candidate-save').href=board('candidate',proposed,selected.map(a=>a+'°'));
$('side-save').href=board('side',[frames[6],proposed[5]],['디벨롭 15 복원 · 90°','표면 투영 표정 후보 · 90°']);
$('candidate-note').textContent='머리 메시·UV·깊이는 디벨롭 15 그대로입니다. 30° 이후 가까운 눈의 측면 윤곽과 볼을 다시 그려, 실제 머리의 UV 삼각형에 역투영합니다. 별도 눈 메시나 평면 스티커를 추가하지 않습니다. 귀는 앞면을 유지하고 뒤쪽 단면만 넓혀 둥근 뿌리를 보완했습니다. 시점에 따라 달라지는 스타일화 후보이며, 고정된 물리적 얼굴 배치와는 다릅니다.';
const old=await img('review-assets/stand-before-16.png');
$('front-save').href=board('front',[old,proposed[0]],['승인 정면 · 디벨롭 15','복원 및 후보 정면']);
const faceBodyDiff=diff(pixels(old).slice(245*800*4),pixels(proposed[0]).slice(245*800*4));
const restoredDiff=diff(pixels(old),pixels(frames[0])),candidateDiff=diff(pixels(old),pixels(proposed[0]));
const seatedDiff=diff(pixels(await img('review-assets/starlight-approved-seated.png')),pixels(await img(P.renderImage(cfg,'full',800,'perch'))));
const strip=document.createElement('canvas');strip.width=2880;strip.height=480;const sg=strip.getContext('2d');
for(let i=0;i<24;i++)sg.drawImage(await img(P.renderSnapshot(cfg,{state:'walk',phase:i/24*Math.PI*2,angle:65*Math.PI/180,size:240,camera:'web',staticPose:true})),i%12*240,Math.floor(i/12)*240);
const walkDiff=diff(pixels(await img('review-assets/walk-before-16.png')),pixels(await img(strip.toDataURL())));
$('candidate-front-save').href=proposed[0].src;
$('status').textContent=`승인 정면→복원 ${restoredDiff}px · 승인 정면→후보 ${candidateDiff}px (귀 영역) · 귀 아래 얼굴·몸통 ${faceBodyDiff}px · 앉기 ${seatedDiff}px · 걷기 24프레임 ${walkDiff}px`;
const full=snap(0,{diagnostics:true,faceAudit:true,sweep:true}).faceAudit;
const farEye=full.sweep.find(x=>!x.rightEye.visible)?.angle,farBlush=full.sweep.find(x=>!x.rightBlush.visible)?.angle;
$('metrics').textContent=JSON.stringify({faceBodyDiff,restoredDiff,candidateDiff,seatedDiff,walkDiff,farEyeFirstHidden:farEye,farBlushFirstHidden:farBlush,nearEyeHiddenAngles:full.sweep.filter(x=>!x.leftEye.visible).map(x=>x.angle),...full},null,2);
const sec=$('section'),sc=sec.getContext('2d');sc.fillStyle='#fcfafc';sc.fillRect(0,0,800,420);sc.strokeStyle='#9c80b9';sc.lineWidth=1;sc.beginPath();sc.moveTo(400,25);sc.lineTo(400,395);sc.moveTo(90,220);sc.lineTo(710,220);sc.stroke();sc.fillStyle='#755891';for(const [y,z] of full.section){sc.beginPath();sc.arc(400+z*220,220-y*220,2.5,0,Math.PI*2);sc.fill();}sc.font='17px system-ui';sc.fillText('뒤통수 (−Z)',100,400);sc.fillText('얼굴 전면 (+Z)',540,400);sc.fillText('X=0 메시 정점 단면 · 형상 변경 없음',220,25);
$('angles-audit').textContent=`1° 간격 검사: 먼 눈 중심은 ${farEye}°부터, 먼 볼 중심은 ${farBlush}°부터 가려집니다. 가까운 눈 중심은 0~90° 모두 보입니다. 90°에서 가까운 눈 표면 법선·시선 내적은 ${full.sweep[90].leftEye.normalToCamera.toFixed(3)}으로, 눈이 거의 옆으로 눕듯 보입니다. 이는 눈 전체의 소실 각도가 아닌 중심점의 가림 검사입니다.`;
$('rotate').oninput=()=>{$('rotation-value').textContent=$('rotate').value+'°';$('rotation').src=snap(Number($('rotate').value),{sideExpression:true});};$('rotate').oninput();

$('analysis').textContent='복원본은 전체 머리 Canvas 텍스처를 SphereGeometry의 경위도 UV에 적용합니다. UV 이음매는 경도 −90°의 옆면(u=0/1)에 있지만 눈·볼 영역은 이음매를 가로지르지 않습니다. 눈은 경도 ±0.44rad, 볼은 ±0.68rad에 있습니다. 눈 중심의 표면 법선이 카메라와 비스듬해질수록 가로 폭이 압축됩니다. 디벨롭 16은 UV를 그대로 두고 Z 정점을 변경해 앞볼 표면이 눈을 가렸습니다. UV 좌표 고정만으로 화면상의 얼굴 위치와 가시성을 보장할 수 없었습니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();