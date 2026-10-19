(async()=>{try{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const c=$('board'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);
for(let row=0;row<2;row++)for(const [i,angle]of [45,75,90].entries()){
 const im=await load(PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:row?'j':'i',earJoin:'blend',angle:angle*Math.PI/180,size:800,camera:'web',staticPose:true}));
 g.fillStyle='#78558c';g.textAlign='center';g.font='600 21px system-ui';g.fillText((row?'둥근 볼 중심 후보':'현재 수정본')+' · '+angle+'°',i*440+220,row*480+30);g.drawImage(im,i*440,row*480+40,440,440);
}
$('save').href=c.toDataURL();$('status').textContent='같은 렌더러·카메라·조명으로 비교. 몸통·발·꼬리 유지. 코·입 돌출과 이마 아래 꺾임을 줄이고 둥근 볼 중심으로 단순화했습니다. 귀 연결은 유지했습니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();
