// Approved starlight-walk-timing: same atlas, sole scan, .82 scale and .9 ground.
const $=id=>document.getElementById(id),dur=[.16,.12,.12,.12,.16,.12,.12,.12],total=dur.reduce((a,b)=>a+b,0);
let im,data,time=0,last=null,paused=false,ready=false;
function inspect(image){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const a=ctx.getImageData(0,0,image.width,image.height).data,cw=image.width/2,ch=image.height/2,out=[];
 for(let i=0;i<4;i++){const sx=i%2*cw,sy=Math.floor(i/2)*ch;let sole=ch*.95;for(let y=Math.floor(ch)-1;y>ch*.6;y--){let n=0;for(let x=0;x<cw;x++)if(a[(Math.floor(sy+y)*image.width+Math.floor(sx+x))*4+3]>220)n++;if(n>cw*.035){sole=y;break}}out.push({sx,sy,cw,ch,sole})}return out}
function paint(canvas,i,guide=true){const c=canvas.getContext('2d'),w=canvas.width,f=data[i],scale=w*.82/f.cw;c.clearRect(0,0,w,w);c.drawImage(im,f.sx,f.sy,f.cw,f.ch,w*.09,w*.9-f.sole*scale,f.cw*scale,f.ch*scale);if(guide){c.strokeStyle='#c8b9d8';c.setLineDash([5,5]);c.beginPath();c.moveTo(0,w*.9);c.lineTo(w,w*.9);c.stroke();c.setLineDash([])}}
function indexAt(t){let slot=0;while(slot<7&&t>=dur[slot])t-=dur[slot++];return slot}
function render(){if(!ready)return;const slot=indexAt(time),pose=Math.floor(slot/2);paint($('walkOriginal'),pose);paint($('walkCandidate'),pose);$('walkTime').value=time.toFixed(2)+'초 · 자세 '+(pose+1)+'/4';$('walkTimeline').value=time;document.querySelectorAll('[data-walk-pose]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.walkPose)===pose));}
function tick(now){const dt=last===null?0:Math.min(.08,(now-last)/1000);last=now;if(!paused&&!$('walkPanel').hidden)time=(time+dt*Number($('walkSpeed').value))%total;render();requestAnimationFrame(tick)}
$('walkPlay').onclick=()=>{paused=!paused;$('walkPlay').textContent=paused?'재생':'일시정지'};
$('walkRestart').onclick=()=>{time=0;paused=false;$('walkPlay').textContent='일시정지';render()};
$('walkTimeline').oninput=e=>{time=Math.min(total-.000001,Number(e.target.value));paused=true;$('walkPlay').textContent='재생';render()};
function show(mode){$('idlePanel').hidden=mode!=='idle';$('walkPanel').hidden=mode!=='walk';$('showIdle').classList.toggle('primary',mode==='idle');$('showWalk').classList.toggle('primary',mode==='walk');const u=new URL(location.href);u.searchParams.set('motion',mode);history.replaceState(null,'',u);}
$('showIdle').onclick=()=>show('idle');$('showWalk').onclick=()=>show('walk');show(new URL(location.href).searchParams.get('motion')==='idle'?'idle':'walk');
async function init(){try{im=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('승인 걷기 이미지를 불러오지 못했습니다.'));img.src='assets/approved-walk.png'});data=inspect(im);
 const diffs=[];for(let i=0;i<4;i++){const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=a.height=b.width=b.height=480;paint(a,i,false);paint(b,i,false);const x=a.getContext('2d').getImageData(0,0,480,480).data,y=b.getContext('2d').getImageData(0,0,480,480).data;let n=0;for(let j=0;j<x.length;j+=4)if(x[j]!==y[j]||x[j+1]!==y[j+1]||x[j+2]!==y[j+2]||x[j+3]!==y[j+3])n++;diffs.push(n)}
 const labels=['첫 접지','발 통과','반대 접지','반대 발 통과'];for(let i=0;i<4;i++){const b=document.createElement('button'),c=document.createElement('canvas'),s=document.createElement('small');c.width=c.height=240;paint(c,i);s.textContent=(i+1)+' · '+labels[i];b.dataset.walkPose=i;b.append(c,s);b.onclick=()=>{time=dur.slice(0,i*2).reduce((a,b)=>a+b,0);paused=true;$('walkPlay').textContent='재생';render()};$('walkFrames').append(b)}
 $('walkStatus').textContent='승인된 4포즈 · 원래 타이밍 그대로 · 양쪽 같은 프레임으로 재생';
 $('walkProof').textContent=JSON.stringify({source:'starlight-walk-timing/assets/after.png',uniquePoses:4,slots:8,durations:dur,total,soleAnchors:data.map(f=>f.sole),comparisonDifferencePixels:diffs});
 ready=true;requestAnimationFrame(tick);
 }catch(e){$('walkStatus').textContent=e.message;console.error(e)}}init();
