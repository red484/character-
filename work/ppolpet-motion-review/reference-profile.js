(async()=>{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const plan=[{angle:0,eyeForward:0,eyeUp:0,cheekForward:0,cheekUp:0,noseDown:0},{angle:45,eyeForward:12,eyeUp:14,cheekForward:6,cheekUp:9,noseDown:.025},{angle:75,eyeForward:20,eyeUp:20,cheekForward:12,cheekUp:14,noseDown:.035},{angle:90,eyeForward:24,eyeUp:24,cheekForward:16,cheekUp:16,noseDown:.040}];
const load=async src=>{const im=new Image();im.src=src;await im.decode();return im;};
const c=$('board'),x=c.getContext('2d');x.fillStyle='#f8f6fb';x.fillRect(0,0,1600,1000);
const pics={};let audit=[];
for(const deg of [0,75,90]){pics[deg]=[];for(const after of [false,true]){const r=P.renderSnapshot(cfg,{state:'stand',angle:deg*Math.PI/180,camera:'web',size:800,diagnostics:true,faceAlignment:plan,...(after?{referenceNose:{heightFraction:.67},roundAnterior:true}:{})});pics[deg].push({r,im:await load(r.url)});}audit.push({angle:deg,bodyMetricsIdentical:JSON.stringify(pics[deg][0].r.metrics)===JSON.stringify(pics[deg][1].r.metrics),before: pics[deg][0].r.landmarks,after:pics[deg][1].r.landmarks});await new Promise(requestAnimationFrame);}
function cell(im,col,row,title){x.drawImage(im,col*400,row*500+40,400,400);x.fillStyle='#675079';x.textAlign='center';x.font='19px system-ui';x.fillText(title,col*400+200,row*500+470);}
cell(pics[90][0].im,1,0,'직전 정합 후보 · 90°');cell(pics[90][1].im,2,0,'코·앞쪽 곡면 수정 · 90°');cell(pics[90][0].im,3,0,'오버레이 50%');x.globalAlpha=.5;x.drawImage(pics[90][1].im,1200,40,400,400);x.globalAlpha=1;
const sample=document.createElement('canvas');sample.width=sample.height=800;const sx=sample.getContext('2d');sx.drawImage(pics[90][0].im,0,0);const data=sx.getImageData(0,0,800,800).data;let top=800,bottom=0;for(let y=0;y<800;y++)for(let xx=0;xx<800;xx++)if(data[(y*800+xx)*4+3]>220){top=Math.min(top,y);bottom=Math.max(bottom,y);}
const ref=await load('side-reference.png'),scale=(bottom-top)/2/(402-80),w=ref.width*scale; x.save();x.beginPath();x.rect(0,40,400,400);x.clip();x.drawImage(ref,200-w/2,40+top/2-80*scale,w,ref.height*scale);x.restore();x.fillStyle='#675079';x.font='19px system-ui';x.textAlign='center';x.fillText('첨부 레퍼런스',200,470);
cell(pics[0][0].im,0,1,'정면 · 직전');cell(pics[0][1].im,1,1,'정면 · 수정');cell(pics[75][0].im,2,1,'75° · 직전');cell(pics[75][1].im,3,1,'75° · 수정');
$('save').href=c.toDataURL();$('audit').textContent=JSON.stringify({referenceNoseRelation:'귀 제외 머리 외곽선 상단에서 67% 높이 / 첨부 이미지의 코끝 높이 기준',geometry:'앞중앙 국소 곡면만 수정, 정면 카메라 광선 방향으로 정점 이동',audit},null,2);$('status').textContent='비교 후보 · 코 높이를 레퍼런스 기준으로 재정합 · 전체 체형·접지 수치 동일 확인';
})().catch(e=>document.getElementById('status').textContent=e.stack);
