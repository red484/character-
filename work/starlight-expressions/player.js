import {makeTiltRenderer} from '../starlight-idle-sway/tilt-renderer.js';
const $=id=>document.getElementById(id);
const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error(src));im.src=src});
try{
 const cfg=await fetch('expressions.json').then(r=>r.json());
 const old=await fetch('../starlight-idle-sway/before-tilt/motion.json').then(r=>r.json());
 const [atlas,oldAtlas,sheet]=await Promise.all([load(cfg.atlas),load('../starlight-idle-sway/'+old.atlas),load('../starlight-look/assets/reference.png')]);
 function normalize(image,f,s){const c=document.createElement('canvas');c.width=256;c.height=288;const [x,y,w,h]=f.sourceRect;c.getContext('2d').drawImage(image,x,y,w,h,128-f.origin[0]*s,260-f.origin[1]*s,w*s,h*s);return c}
 const frames=cfg.frames.map(f=>normalize(atlas,f,cfg.scale)),neutral=normalize(oldAtlas,old.frames[0],old.scale);
 const renderers=frames.map(makeTiltRenderer),baseRenderer=makeTiltRenderer(neutral);
 let selected=0,time=0,playing=true,cycle=false,elapsed=0,previous=performance.now();
 const rects=[[75,620,163,125],[304,620,163,125],[529,620,163,125],[746,620,163,125],[974,620,163,125],[1200,620,163,125]];
 const buttons=frames.map((c,i)=>{const b=document.createElement('button');b.className='choice';b.append(c);const n=document.createElement('strong');n.textContent=cfg.frames[i].name;b.append(n);b.setAttribute('aria-pressed',i===0);b.onclick=()=>{selected=i;elapsed=0;cycle=false;$('cycle').setAttribute('aria-pressed','false');draw()};$('choices').append(b);return b});
 function paint(id,im){const c=$(id),x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height)}
 function draw(){const angle=$('sway').checked?-Math.sin(time/3.2*Math.PI*2)*6:0;paint('baseline',baseRenderer.render(angle));paint('stage',renderers[selected].render(angle));$('selected').textContent='표정 · '+cfg.frames[selected].name;$('refTitle').textContent='원본 시트 · '+cfg.frames[selected].name;const r=$('reference').getContext('2d');r.clearRect(0,0,400,300);r.drawImage(sheet,...rects[selected],4,0,391.2,300);const f=$('face').getContext('2d');f.clearRect(0,0,400,300);f.drawImage(frames[selected],22,37,212,159,0,0,400,300);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',selected===i));$('play').textContent=playing?'일시정지':'재생';$('status').textContent=`${cfg.frames[selected].name} · ${playing?'재생 중':'정지'}${cycle?' · 1.8초마다 표정 전환':''}`}
 $('play').onclick=()=>{playing=!playing;draw()};$('cycle').onclick=()=>{cycle=!cycle;elapsed=0;$('cycle').setAttribute('aria-pressed',cycle);draw()};$('sway').onchange=draw;$('speed').onchange=draw;
 $('download').onclick=()=>frames[selected].toBlob(blob=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=`starlight-expression-${selected+1}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
 function tick(now){const dt=Math.min(.1,(now-previous)/1000)*+$('speed').value;previous=now;if(playing){time+=dt;if(cycle){elapsed+=dt;if(elapsed>=1.8){elapsed%=1.8;selected=(selected+1)%6}}draw()}requestAnimationFrame(tick)}draw();requestAnimationFrame(tick);
}catch(e){$('status').textContent='표정 로드 오류: '+e.message;console.error(e)}
