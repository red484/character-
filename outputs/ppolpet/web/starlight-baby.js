(async()=>{try{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const c=$('board'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);
for(let row=0;row<2;row++)for(const [i,angle]of [45,75,90].entries()){
 const im=await load(PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:row?'h':'e',earJoin:'blend',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true}));
 g.fillStyle='#78558c';g.textAlign='center';g.font='600 21px system-ui';g.fillText((row?'1번 미세 수정':'1번 기존')+' · '+angle+'°',i*440+220,row*480+30);g.drawImage(im,i*440,row*480+40,440,440);
}
$('save').href=c.toDataURL();$('status').textContent='같은 렌더러·카메라·조명으로 비교. 귀·꼬리·팔 길이 유지. 코끝 돌출을 늘리지 않고 앞면 곡률과 가슴 윗부분, 발 윗부분 연결만 미세 조정했습니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();
