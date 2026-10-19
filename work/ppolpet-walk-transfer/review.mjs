import {starlightSteps,starlightPeriod,poseStarts} from '../ppolpet-cast-review/starlight-walk.mjs';
import {frameAt} from '../ppolpet-cast-review/motion-timing.mjs';
const $=s=>document.querySelector(s),load=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src});
const manifest=await fetch('../ppolpet-cast-review/manifest.json?v=starlight-transfer1').then(r=>r.json());
const source=await load('../starlight-walk-timing/assets/after.png');
const scratch=document.createElement('canvas');scratch.width=source.width;scratch.height=source.height;const g=scratch.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0);const rgba=g.getImageData(0,0,source.width,source.height).data,cw=source.width/2,ch=source.height/2;
const frames=Array.from({length:4},(_,i)=>{const x=i%2*cw,y=Math.floor(i/2)*ch;let sole=ch-1;for(;sole>ch*.6;sole--){let n=0;for(let px=0;px<cw;px++)if(rgba[((y+sole)*source.width+x+px)*4+3]>220)n++;if(n>cw*.035)break}return {rect:[x,y,cw,ch],origin:[cw/2,sole]}});
const entries=[{id:'starlight',name:'별빛냥 · 기준',image:source,atlas:{frames,scale:320*.82/cw}}];
for(const id of ['apricot','bunny','angel','bear','cloud']){const c=manifest.characters.find(c=>c.id===id);entries.push({id,name:c.name,image:await load('../ppolpet-cast-review/'+c.atlases.walkTransfer.src),atlas:c.atlases.walkTransfer})}
for(const e of entries){const article=document.createElement('article'),h=document.createElement('h2'),cv=document.createElement('canvas'),a=document.createElement('a');h.textContent=e.name;cv.width=cv.height=640;cv.setAttribute('aria-label',e.name+' 걷기');a.href='../ppolpet/docs/maker-2d.html?character='+e.id+'&motion=walk';a.textContent='공방에서 보기';article.append(h,cv,a);$('#cast').append(article);e.ctx=cv.getContext('2d');e.ctx.scale(2,2)}
let time=0,playing=true,last=performance.now(),loops=0;const visited=new Set();
const labels=['1 · 발 앞으로 / 팔 뒤','2 · 발 통과 / 팔 아래','3 · 반대발 / 팔 앞으로','4 · 반대발 통과'];
for(let i=0;i<4;i++){const b=document.createElement('button');b.textContent=labels[i];b.onclick=()=>{playing=false;time=poseStarts[i];$('#play').textContent='재생';render()};$('#poses').append(b)}
function render(){const i=frameAt(starlightSteps,time);visited.add(i);for(const e of entries){const f=e.atlas.frames[i],[x,y,w,h]=f.rect,s=e.atlas.scale,c=e.ctx;c.clearRect(0,0,320,320);c.setLineDash([3,3]);c.strokeStyle='#d6c7e8';c.beginPath();c.moveTo(20,287);c.lineTo(300,287);c.stroke();c.drawImage(e.image,x,y,w,h,160-f.origin[0]*s,286-f.origin[1]*s,w*s,h*s)}$('#seek').value=time;$('#status').textContent=`${playing?'반복 재생':'정지'} · 자세 ${i+1}/4 · ${(time/1000).toFixed(2)} / 1.04초`;[...$('#poses').children].forEach((b,j)=>b.setAttribute('aria-pressed',i===j))}
$('#play').onclick=()=>{playing=!playing;$('#play').textContent=playing?'일시정지':'재생'};$('#restart').onclick=()=>{time=0;playing=true;$('#play').textContent='일시정지';render()};$('#seek').oninput=()=>{playing=false;time=+$('#seek').value;$('#play').textContent='재생';render()};
function tick(now){if(playing){const next=time+Math.min(now-last,80)*+$('#speed').value;if(next>=starlightPeriod)loops++;time=next%starlightPeriod}last=now;render();requestAnimationFrame(tick)}requestAnimationFrame(tick);
window.walkTransferReview=()=>({playing,time,loops,visited:[...visited],characters:entries.map(e=>e.id),period:starlightPeriod});
