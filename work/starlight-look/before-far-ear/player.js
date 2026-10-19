import {drawStar} from './star.js';
const $=id=>document.getElementById(id);
const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error(src));i.src=src});
try {
const [cfg,oldCfg]=await Promise.all(['motion.json','before-single-nose-fix/motion.json'].map(url=>fetch(url).then(r=>r.json())));
const [atlas,ref,oldAtlas]=await Promise.all([load(cfg.atlas),load(cfg.reference),load(oldCfg.atlas)]);
function normalize(config,image){return config.frames.map(f=>{const c=document.createElement('canvas');c.width=256;c.height=288;const x=c.getContext('2d');const [sx,sy,sw,sh]=f.sourceRect;const s=config.scale;x.drawImage(image,sx,sy,sw,sh,128-f.origin[0]*s,260-f.origin[1]*s,sw*s,sh*s);return c})}
const frames=normalize(cfg,atlas),oldFrames=normalize(oldCfg,oldAtlas);
const reference=$('reference').getContext('2d');
function drawReference(){reference.clearRect(0,0,512,576);if($('comparison').value==='before'){reference.drawImage(oldFrames[index],0,0,512,576);if($('target').checked)drawStar(reference,time)}else{const [rx,ry,rw,rh]=cfg.referenceRect;const rs=Math.min(410/rw,420/rh);reference.drawImage(ref,rx,ry,rw,rh,256-rw*rs/2,520-rh*rs,rw*rs,rh*rs)}}
const buttons=frames.map((f,i)=>{const b=document.createElement('button');b.append(f);const label=document.createElement('span');label.textContent=`${i+1}. ${cfg.frames[i].label}`;b.append(label);b.onclick=()=>seek(i);$('frames').append(b);return b});
const starts=[];let total=0;for(const f of cfg.frames){starts.push(total);total+=f.duration}
let time=0,playing=true,index=0,previous=performance.now();
function seek(i){index=i;time=starts[i];playing=false;draw()}
function draw(){drawReference();for(const [id,frame] of [['noseBefore',oldFrames[index]],['noseAfter',frames[index]]]){const z=$(id).getContext('2d');z.clearRect(0,0,384,256);z.drawImage(frame,20,115,90,60,0,0,384,256)}const x=$('stage').getContext('2d');x.clearRect(0,0,512,576);x.drawImage(frames[index],0,0,512,576);if($('target').checked)drawStar(x,time);if($('ground').checked){x.strokeStyle='#d0bddf';x.setLineDash([4,4]);x.beginPath();x.moveTo(24,520.5);x.lineTo(488,520.5);x.stroke()}$('seek').value=index;$('count').value=`${index+1} / 8`;$('play').textContent=playing?'일시정지':'재생';$('status').textContent=`${cfg.frames[index].label} · ${playing?'재생 중':'정지'} · ${$('speed').value}배`;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',i===index))}
$('play').onclick=()=>{if(!playing&&time>=total)time=0;playing=!playing;draw()};$('restart').onclick=()=>{time=0;index=0;playing=true;draw()};$('last').onclick=()=>seek(3);$('seek').oninput=e=>seek(+e.target.value);$('ground').onchange=draw;$('target').onchange=draw;$('speed').onchange=draw;$('comparison').onchange=draw;
$('export').onclick=()=>{const c=document.createElement('canvas');c.width=1024;c.height=576;const x=c.getContext('2d');frames.forEach((f,i)=>x.drawImage(f,(i%4)*256,Math.floor(i/4)*288));c.toBlob(blob=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='starlight-look-8-frames.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)})};
function tick(now){const dt=Math.min((now-previous)/1000,.1);previous=now;if(playing){time+=dt*+$('speed').value;if(time>=total){if($('loop').checked)time%=total;else{time=total;playing=false}}index=cfg.frames.findIndex((f,i)=>time<starts[i]+f.duration);if(index<0)index=7;draw()}requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);
} catch(error){$('status').textContent='이미지를 불러오지 못했습니다: '+error.message;console.error(error)}
