import {makeTiltRenderer} from './approved-renderer.mjs';
import {makeEarRenderer} from './ear-renderer.mjs';
const $=id=>document.getElementById(id),duration=3.2;
let oldRig,newRig,ready=false,playing=true,time=0,last=null,ear=1,validation;
const angle=t=>-Math.sin(t/duration*Math.PI*2)*6;
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('승인 이미지를 불러오지 못했습니다.'));im.src=src});
function pixels(canvas){const c=document.createElement('canvas');c.width=256;c.height=288;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(canvas,0,0);return cx.getImageData(0,0,256,288).data}
function diff(a,b){let count=0,minY=288,maxY=-1,lower=0;for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3]){count++;const y=Math.floor(i/4/256);minY=Math.min(y,minY);maxY=Math.max(y,maxY);if(y>=85)lower++}}return{count,minY,maxY,faceAndBodyPixelsChanged:lower}}
function validate(){
 const checks=[];
 for(let i=0;i<8;i++){const a=angle(i/8*duration);checks.push(diff(pixels(oldRig.render(a)),pixels(newRig.render(a,1))).count)}
 const ref=pixels(oldRig.render(0));const earLow=diff(ref,pixels(newRig.render(0,.9))),earHigh=diff(ref,pixels(newRig.render(0,1.1)));
 return {baselineExact:checks.every(x=>x===0),baselineDifferingPixels:checks,earLow,earHigh,faceAndBodyUnchanged:earLow.faceAndBodyPixelsChanged===0&&earHigh.faceAndBodyPixelsChanged===0};
}
function paint(id,im){const c=$(id),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(im,0,0,c.width,c.height);ctx.strokeStyle='#ded3e9';ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(0,520.5);ctx.lineTo(c.width,520.5);ctx.stroke();ctx.setLineDash([])}
function frame(){if(!ready)return;const a=angle(time),old=oldRig.render(a),current=newRig.render(a,ear);paint('original',old);paint('candidate',current);
 if($('overlay').checked){const cx=$('over').getContext('2d');cx.clearRect(0,0,512,576);cx.globalAlpha=1;cx.drawImage(old,0,0,512,576);cx.globalAlpha=.5;cx.drawImage(current,0,0,512,576);cx.globalAlpha=1}
 $('timeline').value=time;$('time').value=time.toFixed(2)+'초';
}
function thumbs(){if(!ready)return;[...$('frames').querySelectorAll('canvas')].forEach((c,i)=>{const ctx=c.getContext('2d');ctx.clearRect(0,0,256,288);ctx.drawImage(newRig.render(angle(i/8*duration),ear),0,0)})}
function setEar(v){ear=Number(v)/100;$('ear').value=v;$('earValue').value=v+'%';$('candidateLabel').textContent='귀 끝 높이 '+v+'%'+(ear===1?' · 기본':' · 비교 후보');thumbs();updateStatus();frame()}
function updateStatus(){if(!validation)return;$('status').textContent=!validation.baselineExact?'원본 일치 검증 실패 · 후보 사용 중지':ear===1?'기본 100% · 8개 시점 모두 원본과 픽셀 차이 0':'귀 끝만 '+Math.round(ear*100)+'% · 얼굴과 몸은 원본 유지';}
function tick(now){const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;if(playing)time=(time+dt*Number($('speed').value))%duration;frame();requestAnimationFrame(tick)}
$('ear').oninput=e=>setEar(e.target.value);$('reset').onclick=()=>setEar(100);
$('play').onclick=()=>{playing=!playing;$('play').textContent=playing?'일시정지':'재생'};
$('neutral').onclick=()=>{time=0;playing=false;$('play').textContent='재생';frame()};
$('timeline').oninput=e=>{time=Number(e.target.value);playing=false;$('play').textContent='재생';frame()};
$('overlay').onchange=()=>{$('overlayWrap').style.display=$('overlay').checked?'block':'none';frame()};
async function init(){try{
 const [atlas,cfg]=await Promise.all([load('assets/approved-idle.png'),fetch('approved-source.json').then(r=>r.json())]);
 const f=cfg.frames[0],neutral=document.createElement('canvas');[neutral.width,neutral.height]=cfg.size;
 neutral.getContext('2d').drawImage(atlas,...f.sourceRect,cfg.anchorX-f.origin[0]*cfg.scale,cfg.groundY-f.origin[1]*cfg.scale,f.sourceRect[2]*cfg.scale,f.sourceRect[3]*cfg.scale);
 oldRig=makeTiltRenderer(neutral);newRig=makeEarRenderer(neutral);validation=validate();
 if(!validation.baselineExact||!validation.faceAndBodyUnchanged)throw Error('원본 보존 검사에 실패했습니다: '+JSON.stringify(validation));
 $('proof').textContent='기본 100%: 8개 시점의 차이 픽셀 ['+validation.baselineDifferingPixels.join(', ')+']. 귀 90% / 110%: 정면 얼굴·몸 영역(y≥85)의 차이 픽셀 각각 '+validation.earLow.faceAndBodyPixelsChanged+' / '+validation.earHigh.faceAndBodyPixelsChanged+'.';
 const report=document.createElement('script');report.type='application/json';report.id='validation';report.textContent=JSON.stringify(validation);document.body.append(report);
 for(let i=0;i<8;i++){const b=document.createElement('button'),c=document.createElement('canvas');c.width=256;c.height=288;b.append(c);const text=document.createElement('small');text.textContent=(i+1)+' / 8';b.append(text);b.onclick=()=>{time=i/8*duration;playing=false;$('play').textContent='재생';frame()};$('frames').append(b)}
 ready=true;thumbs();updateStatus();requestAnimationFrame(tick);
 }catch(e){$('status').textContent=e.message;console.error(e)}}
init();
