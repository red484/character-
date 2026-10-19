(async()=>{try{
 const P=PpolPet,cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id);
 const image=src=>new Promise((ok,no)=>{const i=new Image;i.onload=()=>ok(i);i.onerror=no;i.src=src;});
 const snap=(angle,sideReview,surface)=>P.renderSnapshot(cfg,{state:'stand',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true,sideReview,surface});
 const variants=[{depth:0,refined:false},{depth:.05,refined:false},{depth:.10,refined:false},{depth:.15,refined:false},{depth:.10,refined:true}];
 function board(id,ims,labels){const c=$(id),g=c.getContext('2d'),cell=c.width/ims.length;g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);g.textAlign='center';ims.forEach((im,i)=>{g.fillStyle='#77548d';g.font='600 21px system-ui';g.fillText(labels[i],i*cell+cell/2,34);g.drawImage(im,i*cell+(cell-440)/2,30,440,440);g.strokeStyle='#e6deeb';g.setLineDash([4,5]);g.beginPath();g.moveTo(i*cell+10,431);g.lineTo((i+1)*cell-10,431);g.stroke();g.setLineDash([]);});return c.toDataURL();}
 const candidates=await Promise.all(variants.map(v=>image(snap(90,v))));
 $('side-before-save').href=snap(90,variants[0]);$('side-after-save').href=snap(90,variants[4]);
 $('candidates-save').href=board('candidates',candidates,['디벨롭 15 · 기존','깊이 +5%','깊이 +10%','깊이 +15%','선택 +10% · 연결 개선']);
 $('angles-save').href=board('angles',await Promise.all([0,45,65,90].map(a=>image(snap(a,variants[4])))),['정면 0°','45°','65°','정확한 90°']);
 $('structure-save').href=board('structure',await Promise.all([image(snap(90,variants[0],'clay')),image(snap(90,variants[4],'clay')),image(snap(90,variants[4],'wire'))]),['기존 · 단색','선택 후보 · 단색','선택 후보 · 와이어프레임']);
 const old=await image('review-assets/stand-before-16.png'),url=snap(0,variants[4]),now=await image(url);$('front-save').href=url;
 $('front-compare-save').href=board('front',[old,now],['승인 정면 · 디벨롭 15','측면 수정 후 정면']);
 function pixels(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);return g.getImageData(0,0,c.width,c.height).data;}
 function difference(a,b){let count=0,max=0,sum=0;for(let k=0;k<a.length;k+=4){let delta=0;for(let j=0;j<4;j++){const d=Math.abs(a[k+j]-b[k+j]);delta=Math.max(delta,d);sum+=d;max=Math.max(max,d);}if(delta)count++;}return {pixels:count,maxChannel:max,meanChannel:sum/a.length};}
 const front=difference(pixels(old),pixels(now));
 const seated=difference(pixels(await image('review-assets/starlight-approved-seated.png')),pixels(await image(P.renderImage(cfg,'full',800,'perch'))));
 const restore=difference(pixels(await image('review-assets/starlight-approved-seated.png')),pixels(await image(P.renderSnapshot(cfg,{state:'perch',fromStand:true,size:800,camera:'web',staticPose:true}))));
 const strip=document.createElement("canvas");strip.width=2880;strip.height=480;const sg=strip.getContext("2d");
 for(let i=0;i<24;i++){const f=await image(P.renderSnapshot(cfg,{state:"walk",phase:i/24*Math.PI*2,angle:65*Math.PI/180,size:240,camera:"web",staticPose:true}));sg.drawImage(f,(i%12)*240,Math.floor(i/12)*240);}
 const walking=difference(pixels(await image("review-assets/walk-before-16.png")),pixels(await image(strip.toDataURL())));
 const report={walking,geometry:P.auditSide(cfg),front,seated,restore,variants,camera:'same perspective full camera, 800px, fixed scale',gait:'frozen dev15',renderer:document.querySelector('[data-renderer-version]').dataset.rendererVersion};
 $('metrics').textContent=JSON.stringify(report,null,2);$('metrics-save').href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
 $('status').textContent=`정면 차이 ${front.pixels.toLocaleString()}px / 640,000 · 걷기 24프레임 ${walking.pixels}px · 앉기 ${seated.pixels}px · 서기→앉기 복원 ${restore.pixels}px`;
}catch(e){document.getElementById('error').textContent=e.stack||e.message;}})();
