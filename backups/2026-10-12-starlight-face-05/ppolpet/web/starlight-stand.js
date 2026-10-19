(async()=>{try{
const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
const image=src=>new Promise((resolve,reject)=>{const i=new Image;i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const crop=(im,x,y,w,h)=>{const c=canvas(w,h);c.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);return c;};
const bear=crop(await image('review-assets/pink-bear-standing-reference.png'),34,9,90,95);
const before=await image('review-assets/stand-before-body-recalc.png');
const result=P.renderSnapshot(cfg,{state:'stand',angle:0,size:800,camera:'web',diagnostics:true,staticPose:true});
const after=await image(result.url);
function silhouette(im,pink=false){
 const c=canvas(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;
 let x0=c.width,y0=c.height,x1=0,y1=0;const rows=[];
 for(let y=0;y<c.height;y++){let lo=c.width,hi=-1;for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,r=d[k],gg=d[k+1],b=d[k+2];const colored=d[k+3]>240&&(pink?r-gg>13&&b-gg>5&&r-b>5:b-r>7&&b-gg>9);if(colored){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);lo=Math.min(lo,x);hi=Math.max(hi,x);}}rows[y]=hi<0?0:hi-lo+1;}
 const width=x1-x0+1,height=y1-y0+1;let chin=y0;
 const widest=rows.indexOf(Math.max(...rows));
 for(let y=widest;y<=y1;y++){if(rows[y]<width*.45)break;chin=y;}
 return {x:x0,y:y0,width,height,chin,headPercent:Math.round((chin-y0+1)/height*1000)/10};
}
const sources=[bear,before,after],bounds=sources.map((im,i)=>silhouette(im,i===0));
const g=$('comparison').getContext('2d');g.fillStyle='#fffcfe';g.fillRect(0,0,1440,640);g.textAlign='center';
const labels=['분홍 곰 · 서기 레퍼런스','별빛냥 · 수정 전','별빛냥 · 수정 후'];
sources.forEach((im,i)=>{
 const b=bounds[i],scale=380/b.height,w=b.width*scale,left=i*480+240-w/2;
 g.fillStyle=i===0?'#b57190':'#77588e';g.font='600 24px system-ui';g.fillText(labels[i],i*480+240,42);
 g.strokeStyle='#ece3ee';g.lineWidth=1;g.setLineDash([5,5]);for(const y of [100,480]){g.beginPath();g.moveTo(i*480+30,y);g.lineTo(i*480+450,y);g.stroke();}g.setLineDash([]);
 g.drawImage(im,b.x,b.y,b.width,b.height,left,100,w,380);
 const chin=100+(b.chin-b.y+1)*scale;g.strokeStyle='#b5a0c3';g.setLineDash([4,5]);g.beginPath();g.moveTo(left-10,chin);g.lineTo(left+w+10,chin);g.stroke();g.setLineDash([]);
 g.fillStyle='#766182';g.font='600 21px system-ui';g.fillText(['몸통 폭·길이 기준','직전 제출본','몸통·어깨 연결 재계산'][i],i*480+240,530);
});
$('comparison-save').href=$('comparison').toDataURL();$('after-save').href=result.url;
const approved=await image('review-assets/starlight-approved-seated.png');
const pixels=im=>{const c=canvas(800,800),g=c.getContext('2d');g.drawImage(im,0,0);return g.getImageData(0,0,800,800).data;};
const count=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])n++;return n;};
const original=pixels(approved),seated=count(original,pixels(await image(P.renderImage(cfg,'full',800,'perch'))));
const restored=count(original,pixels(await image(P.renderSnapshot(cfg,{state:'perch',fromStand:true,staticPose:true,size:800,camera:'web'}))));
const report={referenceCrop:{x:34,y:9,width:90,height:95},alignment:{height:380,baseline:480,uniformScale:true},silhouettes:bounds,seatedChangedPixels:seated,standToSeatedChangedPixels:restored,standMetrics:result.metrics};
$('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
$('status').textContent=`승인된 앉기 차이 ${seated}px · 서기→앉기 복원 차이 ${restored}px · 머리 스케일 ${result.metrics.headScale.join(' / ')} · 양발 접지 ${result.metrics.feet.every(f=>Math.abs(f.floorY)<1e-6)?'확인':'확인 필요'}`;
$('ratio').textContent='비율은 이미지 색상 외곽선에서 머리 폭이 좁아지는 지점을 이용한 근사값입니다. 귀·턱 경계의 작은 오차가 있으며, 최종 판단은 실루엣 비교를 기준으로 합니다.';
$('version').textContent='Renderer SHA-256: '+document.querySelector('[data-renderer-version]').dataset.rendererVersion;
}catch(e){document.getElementById('error').textContent=e.stack||e.message;}})();
