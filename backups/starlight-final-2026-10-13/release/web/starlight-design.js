(async()=>{try{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),img=src=>new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=src;});
const snap=(a,sideDesign,extra={})=>P.renderSnapshot(cfg,{state:'stand',earJoin:false,angle:a*Math.PI/180,sideDesign,size:800,camera:'web',staticPose:true,...extra});
function board(id,ims,labels){const c=$(id),g=c.getContext('2d'),w=c.width/ims.length,sz=400;g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);ims.forEach((im,i)=>{g.fillStyle='#765487';g.font='600 20px system-ui';g.textAlign='center';g.fillText(labels[i],(i+.5)*w,30);g.drawImage(im,i*w+(w-sz)/2,40,sz,sz);g.strokeStyle='#e7ddea';g.setLineDash([4,5]);g.beginPath();g.moveTo(i*w+12,405);g.lineTo((i+1)*w-12,405);g.stroke();});return c.toDataURL();}
function pixels(i){const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);return g.getImageData(0,0,c.width,c.height).data;}
function diff(a,b){let count=0,sum=0;for(let k=0;k<a.length;k+=4){let d=0;for(let j=0;j<4;j++){const e=Math.abs(a[k+j]-b[k+j]);d=Math.max(d,e);sum+=e;}if(d)count++;}return {pixels:count,meanChannel:sum/a.length};}
const restored=await img(snap(0)),old=await img('review-assets/stand-before-16.png'),front=[old],sides=[await img(snap(90))],report={restored:diff(pixels(old),pixels(restored)),candidates:{}};
const geometry=[];
for(const key of ['a','b','c']){
 const pictures=[];for(const angle of [0,45,75,90])pictures.push(await img(snap(angle,key)));
 pictures.push(await img(snap(90,key,{silhouette:true})));
 $(key+'-save').href=board(key,pictures,['정면 0°','45°','75°','정확한 90°','90° 실제 실루엣']);
 front.push(pictures[0]);sides.push(pictures[3]);report.candidates[key]=diff(pixels(old),pixels(pictures[0]));
 geometry.push(snap(0,key,{diagnostics:true,faceAudit:true,sweep:true}).faceAudit.section);
}
$('overview-save').href=board('overview',sides,['디벨롭 15 복원본','A · 둥근 볼형','B · 포근한 뒤통수형','C · 아기 볼형']);
$('front-save').href=board('front',front,['승인 정면','A · 정면','B · 정면','C · 정면']);
const seated=await img(P.renderImage(cfg,'full',800,'perch'));report.seated=diff(pixels(await img('review-assets/starlight-approved-seated.png')),pixels(seated));
const strip=document.createElement('canvas');strip.width=2880;strip.height=480;const sg=strip.getContext('2d');for(let i=0;i<24;i++)sg.drawImage(await img(P.renderSnapshot(cfg,{state:'walk',phase:i/24*Math.PI*2,angle:65*Math.PI/180,size:240,camera:'web',staticPose:true})),i%12*240,Math.floor(i/12)*240);
report.walk=diff(pixels(await img('review-assets/walk-before-16.png')),pixels(await img(strip.toDataURL())));
$('status').textContent=`기본 모델 정면 ${report.restored.pixels}px · 앉기 ${report.seated.pixels}px · 걷기 24프레임 ${report.walk.pixels}px 차이. 후보 정면 픽셀 차이: A ${report.candidates.a.pixels.toLocaleString()} / B ${report.candidates.b.pixels.toLocaleString()} / C ${report.candidates.c.pixels.toLocaleString()}.`;
$('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json,'+encodeURIComponent(JSON.stringify(report,null,2));
const c=$('sections'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);geometry.forEach((points,i)=>{g.fillStyle='#77548d';g.font='600 20px system-ui';g.fillText(['A 균형 단면','B 뒤통수 단면','C 볼·턱 단면'][i],i*400+100,30);g.strokeStyle='#e5ddea';g.beginPath();g.moveTo(i*400+200,50);g.lineTo(i*400+200,370);g.stroke();for(const [y,z]of points){g.fillStyle=z>0?'#d995b2':'#907db0';g.beginPath();g.arc(i*400+200+z*180,205-y*180,2.3,0,Math.PI*2);g.fill();}g.font='14px system-ui';g.fillText('뒤통수 ←   → 얼굴',i*400+140,390);});
}catch(e){document.getElementById('error').textContent=e.stack;}})();