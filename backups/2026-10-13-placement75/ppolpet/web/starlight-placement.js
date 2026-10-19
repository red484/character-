(async()=>{try{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const c=$('board'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);
for(let row=0;row<2;row++)for(const [i,angle]of [0,45,75,90].entries()){
 const im=await load(PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:'k',facePlacement:!!row,earJoin:'blend',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true}));
 g.fillStyle='#78558c';g.textAlign='center';g.font='600 21px system-ui';g.fillText((row?'얼굴 위치 보정':'수정 전')+' · '+angle+'°',i*360+180,row*480+30);g.drawImage(im,i*360,row*480+40,360,360);
}
$('save').href=c.toDataURL();
const base=PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:'k',earJoin:'blend',angle:0,size:800,camera:'web',staticPose:true});
const after=PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:'k',earJoin:'blend',facePlacement:true,angle:0,size:800,camera:'web',staticPose:true});
document.getElementById('audit').textContent='정면 0° 렌더 이미지 동일: '+(base===after?'PASS (완전 일치)':'FAIL');
$('status').textContent='같은 렌더러·카메라·조명으로 비교. 몸통·발·꼬리 유지. 형상은 동일합니다. 측면 코 표시를 조금 낮추고 눈을 미세하게 위·안쪽으로 보정했습니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();
