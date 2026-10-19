(async()=>{try{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const c=$('board'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);
for(let row=0;row<2;row++)for(const [i,angle]of [45,75,90].entries()){
 const im=await load(PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:row?'i':'h',earJoin:'blend',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true}));
 g.fillStyle='#78558c';g.textAlign='center';g.font='600 21px system-ui';g.fillText((row?'얼굴 옆선 수정':'현재 아기 볼형')+' · '+angle+'°',i*440+220,row*480+30);g.drawImage(im,i*440,row*480+40,440,440);
}
$('save').href=c.toDataURL();$('status').textContent='같은 렌더러·카메라·조명으로 비교. 몸통·발·꼬리 유지. 이마 아래 굴곡과 짧은 코·입, 턱 아래 곡면 및 귀 뿌리만 조정했습니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();
