(async()=>{try{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),$=id=>document.getElementById(id),load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const c=$('board'),g=c.getContext('2d');g.fillStyle='#fcfafc';g.fillRect(0,0,c.width,c.height);
const variants=[['e','1 · 아기 볼형'],['f','2 · 짧은 코·입형'],['g','3 · 포근한 턱형']];
for(let row=0;row<3;row++)for(const [i,angle]of [0,45,75,90].entries()){
 const im=await load(PpolPet.renderSnapshot(cfg,{state:'stand',sideDesign:variants[row][0],earJoin:'blend',angle:angle*Math.PI/180,size:700,camera:'web',staticPose:true}));
 g.fillStyle='#78558c';g.textAlign='center';g.font='600 19px system-ui';g.fillText(variants[row][1]+' / '+angle+'°',i*360+180,row*400+28);g.drawImage(im,i*360,row*400+32,360,360);
}
$('save').href=c.toDataURL();$('status').textContent='같은 공통 3D 렌더러·카메라·조명으로 비교했습니다. 검수 후보이며 기존 A와 기본 웹 모델은 그대로 보존됩니다.';
}catch(e){document.getElementById('error').textContent=e.stack;}})();
