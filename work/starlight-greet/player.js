const $=id=>document.getElementById(id);
const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error(src));i.src=src});
try {
const [cfg,oldCfg]=await Promise.all([fetch('motion.json?v=paw3').then(r=>r.json()),fetch('before-paw-fix/motion.json').then(r=>r.json())]);
const [atlas,oldAtlas]=await Promise.all([load(cfg.atlas),load(oldCfg.atlas)]);
function normalize(config,image){return config.frames.map(f=>{const c=document.createElement('canvas');c.width=256;c.height=288;const x=c.getContext('2d');const [sx,sy,sw,sh]=f.sourceRect;const s=config.scale;x.drawImage(image,sx,sy,sw,sh,128-f.origin[0]*s,260-f.origin[1]*s,sw*s,sh*s);return c})}
const frames=normalize(cfg,atlas),oldFrames=normalize(oldCfg,oldAtlas);
const buttons=frames.map((f,i)=>{const b=document.createElement('button');b.append(f);const label=document.createElement('span');label.textContent=`${i+1}. ${cfg.frames[i].label}`;b.append(label);b.onclick=()=>seek(i);$('frames').append(b);return b});
const starts=[];let total=0;for(const f of cfg.frames){starts.push(total);total+=f.duration}
let time=0,playing=true,index=0,previous=performance.now();
function seek(i){index=i;time=starts[i];playing=false;draw()}
function draw(){const before=$('reference').getContext('2d');before.clearRect(0,0,512,576);before.drawImage(oldFrames[index],0,0,512,576);const x=$('stage').getContext('2d');x.clearRect(0,0,512,576);x.drawImage(frames[index],0,0,512,576);if($('ground').checked){x.strokeStyle='#d0bddf';x.setLineDash([4,4]);x.beginPath();x.moveTo(24,520.5);x.lineTo(488,520.5);x.stroke()}$('seek').value=index;$('count').value=`${index+1} / 8`;$('play').textContent=playing?'일시정지':'재생';$('status').textContent=`${cfg.frames[index].label} · ${playing?'재생 중':'정지'} · ${$('speed').value}배`;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',i===index))}
$('play').onclick=()=>{if(!playing&&time>=total)time=0;playing=!playing;draw()};$('restart').onclick=()=>{time=0;index=0;playing=true;draw()};$('last').onclick=()=>seek(3);$('seek').oninput=e=>seek(+e.target.value);$('ground').onchange=draw;$('speed').onchange=draw;
$('export').onclick=()=>{const c=document.createElement('canvas');c.width=1024;c.height=576;const x=c.getContext('2d');frames.forEach((f,i)=>x.drawImage(f,(i%4)*256,Math.floor(i/4)*288));c.toBlob(blob=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='greet-8-frames.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)})};
function tick(now){const dt=Math.min((now-previous)/1000,.1);previous=now;if(playing){time+=dt*+$('speed').value;if(time>=total){if($('loop').checked)time%=total;else{time=total;playing=false}}index=cfg.frames.findIndex((f,i)=>time<starts[i]+f.duration);if(index<0)index=7;draw()}requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);
} catch(error){$('status').textContent='이미지를 불러오지 못했습니다: '+error.message;console.error(error)}
