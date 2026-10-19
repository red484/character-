(async()=>{try{
const $=id=>document.getElementById(id),P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]);
const canvas=$('sheet'),g=canvas.getContext('2d'),W=3200,H=2400;canvas.width=W;canvas.height=H;
const load=src=>new Promise((resolve,reject)=>{const im=new Image;im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});
const text=(s,x,y,size=32,color='#79618e')=>{g.fillStyle=color;g.font=`${size>60?800:500} ${size}px system-ui`;g.textAlign='center';g.fillText(s,x,y);};
const panel=(x,y,w,h)=>{g.fillStyle='#fffefd';g.strokeStyle='#e4daed';g.lineWidth=3;g.beginPath();g.roundRect(x,y,w,h,45);g.fill();g.stroke();};
function paw(x,y,r=20){g.fillStyle='#d6c5e7';g.beginPath();g.ellipse(x,y+r*.6,r,r*.8,0,0,7);g.fill();for(const [a,b]of [[-1,-.45],[-.4,-1],[.4,-1],[1,-.45]]){g.beginPath();g.ellipse(x+a*r,y+b*r,r*.33,r*.42,a*.3,0,7);g.fill();}}
g.fillStyle='#fffcf7';g.fillRect(0,0,W,H);text('별빛냥',1600,170,116,'#9276b5');text('C H A R A C T E R   S H E E T',1600,239,32);text('작고 소중한 너와, 더 따뜻한 하루',1600,298,29,'#b2a0c7');paw(1260,145,34);paw(1930,145,34);text('작은 친구들이',380,140,34,'#b3a0cd');text('만드는 더 밝은 내일 ♡',380,190,30,'#b3a0cd');text('Little friends,',2810,145,32,'#b3a0cd');text('brighter days ✧',2810,190,32,'#b3a0cd');
panel(65,360,2530,650);panel(2630,360,505,1910);panel(65,1050,2530,545);panel(65,1635,2530,635);
text('기본 시점',230,418,32);text('표정 모음',230,1110,32);text('포즈 & 동작',260,1698,32);text('✧ Detail',2880,425,37);
let count=0;async function shot(label,x,y,size,opt={}){ $('status').textContent=`3D 렌더링 ${++count} / 20 · ${label}`;const im=await load(P.renderSnapshot(cfg,{state:'stand',size:700,camera:'web',staticPose:true,...opt}));g.drawImage(im,x,y,size,size);text(label,x+size/2,y+size+30,29);return im;}
const views=[['정면',{}],['후면',{angle:Math.PI}],['좌측면',{angle:Math.PI/2}],['우측면',{angle:-Math.PI/2}],['걷기',{state:'walk',phase:Math.PI/2,angle:Math.PI*.36}],['앉기',{state:'perch'}]];
for(let i=0;i<views.length;i++)await shot(views[i][0],90+i*416,478,400,views[i][1]);
for(const [i,[name,expression]]of [['기본','normal'],['행복','happy'],['놀람','wide'],['새침','blink'],['윙크','wink'],['졸림','closed']].entries())await shot(name,100+i*416,1160,380,{headOnly:true,expression,camera:'ortho'});
for(const [i,[name,state,angle]]of [['서기','stand',0],['아장아장 걷기','walk',Math.PI*.36],['엎드리기','lie',.35],['앉기','perch',0],['인사하기','wave',0]].entries())await shot(name,126+i*495,1780,400,{state,angle,phase:Math.PI/2});
await shot('귀',2680,540,405,{detail:'ear',camera:'ortho'});await shot('발바닥',2680,1110,405,{state:'perch',detail:'paw',camera:'ortho'});await shot('꼬리',2680,1700,405,{detail:'tail',detailAngle:Math.PI/2,camera:'ortho'});
for(const x of [120,790,2440,3080])paw(x,2320,15);text('L I T T L E   F R I E N D S   M A K E   A   B R I G H T E R   T O M O R R O W',1600,2338,24,'#b6a3ca');
$('save').href=canvas.toDataURL('image/png');$('status').textContent='완료 · 3200 × 2400 PNG';
const report={renderer:document.querySelector('[data-renderer-version]').dataset.rendererVersion,config:cfg,checks:{},notes:['모든 컷은 공통 Three.js 렌더러 출력. 원본 PNG 크롭 없음.','승인된 앉기/엎드리기/인사 포즈 구조를 보존. 서기/걷기는 고정된 최신 형상을 공유.']};
for(const angle of [0,45,75,90]){const o={state:'stand',size:400,camera:'web',staticPose:true,angle:angle*Math.PI/180};report.checks['approvedStand'+angle]=P.renderSnapshot(cfg,o)===P.renderSnapshot(cfg,{...o,sideDesign:'k',earJoin:'blend',facePlacement:'side75'});}
for(const state of ['perch','lie','wave']){const o={state,size:400,camera:'web',staticPose:true};report.checks[state+'Preserved']=P.renderSnapshot(cfg,o)===P.renderSnapshot(cfg,{...o,frozen:false});}
report.checks.seatedAfterStand=P.renderSnapshot(cfg,{state:'perch',size:400,camera:'web',staticPose:true,fromStand:true})===P.renderSnapshot(cfg,{state:'perch',size:400,camera:'web',staticPose:true});
$('audit').textContent=JSON.stringify(report,null,2);$('report').href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
}catch(e){document.getElementById('status').textContent='오류: '+e.stack;}})();
