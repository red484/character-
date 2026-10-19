(async()=>{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const plan=[
{angle:0,eyeForward:0,eyeUp:0,cheekForward:0,cheekUp:0,noseDown:0},
{angle:45,eyeForward:12,eyeUp:14,cheekForward:6,cheekUp:9,noseDown:.025},
{angle:75,eyeForward:20,eyeUp:20,cheekForward:12,cheekUp:14,noseDown:.035},
{angle:90,eyeForward:24,eyeUp:24,cheekForward:16,cheekUp:16,noseDown:.040}];
const rows=[],audit=[];const load=async url=>{const im=new Image();im.src=url;await im.decode();return im;};
const xy=ndc=>[(ndc[0]+1)*400,(1-ndc[1])*400];
function paint(row){const {c,b,a,im0,im1,angle}=row,x=c.getContext('2d'),alpha=Number($('opacity').value)/100;x.fillStyle='#faf9fc';x.fillRect(0,0,c.width,c.height);x.drawImage(im0,0,45,400,400);x.drawImage(im1,420,45,400,400);x.drawImage(im0,840,45,400,400);x.globalAlpha=alpha;x.drawImage(im1,840,45,400,400);x.globalAlpha=1;x.textAlign='center';x.fillStyle='#664f78';x.font='18px system-ui';['기존','수정 후보',`오버레이 ${Math.round(alpha*100)}%`].forEach((s,i)=>x.fillText(`${angle}° · ${s}`,i*420+200,27));
// A single fixed floor guide for all views and layers; never auto-align per image.
x.strokeStyle='#c4b8cf';x.setLineDash([4,5]);for(let i=0;i<3;i++){x.beginPath();x.moveTo(i*420+20,410);x.lineTo(i*420+380,410);x.stroke();}x.setLineDash([]);
if($('guides').checked){for(const [key,tag]of [['eye','E'],['nose','N'],['cheek','C']]){const p=xy(b.landmarks[key]),q=xy(a.landmarks[key]);
for(const [col,points,color]of [[0,p,'#008c99'],[1,q,'#d34386'],[2,p,'#008c99'],[2,q,'#d34386']]){const xx=col*420+points[0]/2,yy=45+points[1]/2;x.strokeStyle=color;x.fillStyle=color;x.lineWidth=1.4;x.beginPath();x.arc(xx,yy,3.4,0,Math.PI*2);x.stroke();x.font='12px system-ui';x.fillText(tag,xx+8,yy-7);}
x.strokeStyle='#9b7aa9';x.beginPath();x.moveTo(840+p[0]/2,45+p[1]/2);x.lineTo(840+q[0]/2,45+q[1]/2);x.stroke();}}
}
function redraw(){for(const r of rows)paint(r);$('percent').value=$('opacity').value+'%';const out=document.createElement('canvas');out.width=1240;out.height=rows.length*470;rows.forEach((r,i)=>out.getContext('2d').drawImage(r.c,0,i*470));$('download').href=out.toDataURL();}
for(const angle of [0,45,75,90]){
$('status').textContent=`${angle}° 기존·수정 렌더링 중…`;await new Promise(requestAnimationFrame);
const opts={state:'stand',angle:angle*Math.PI/180,camera:'web',size:800,diagnostics:true};
const b=P.renderSnapshot(cfg,opts),a=P.renderSnapshot(cfg,{...opts,faceAlignment:plan});
const section=document.createElement('section'),c=document.createElement('canvas');c.width=1240;c.height=470;section.appendChild(c);$('boards').appendChild(section);
rows.push({angle,c,b,a,im0:await load(b.url),im1:await load(a.url)});
for(const key of ['eye','nose','cheek']){const old=xy(b.landmarks[key]),now=xy(a.landmarks[key]);const tr=document.createElement('tr');tr.innerHTML=`<td>${angle}° / ${{eye:'눈',nose:'코',cheek:'볼'}[key]}</td><td>${old.map(v=>v.toFixed(1)).join(', ')}</td><td>${now.map(v=>v.toFixed(1)).join(', ')}</td><td>${now.map((v,i)=>(v-old[i]).toFixed(1)).join(' / ')}</td>`;$('coords').appendChild(tr);}
audit.push({angle,frontPixelsIdentical:angle===0?a.url===b.url:undefined,poseMetricsIdentical:JSON.stringify(a.metrics)===JSON.stringify(b.metrics),before:b.landmarks,after:a.landmarks});redraw();
}
$('opacity').oninput=redraw;$('guides').onchange=redraw;$('status').textContent='정면 0° 픽셀 동일 확인 · 네 각도 체형/접지 수치 동일 · 측면 얼굴 위치 후보 검수 대기';$('evidence').textContent=JSON.stringify({referenceSize:800,plan,audit},null,2);
})().catch(e=>document.getElementById('status').textContent=e.stack);
