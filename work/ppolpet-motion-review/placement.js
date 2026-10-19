(async()=>{
const cfg=PpolPresets.presetConfig(PpolPresets.PRESETS[2]),c=document.getElementById('board'),x=c.getContext('2d');x.fillStyle='#f8f6fb';x.fillRect(0,0,c.width,c.height);const results=[];
for(const [col,angle]of [0,45,75,90].entries()){
const pair=[];
for(const [row,P]of [BeforePet,PpolPet].entries()){
const url=P.renderSnapshot(cfg,{state:'stand',angle:angle*Math.PI/180,camera:'web',size:500});pair.push(url);const im=new Image();im.src=url;await im.decode();x.drawImage(im,col*400,row*520+25,400,400);x.fillStyle='#674d7b';x.textAlign='center';x.font='22px system-ui';x.fillText(`${row?'수정':'기존'} · ${angle}°`,col*400+200,row*520+488);
}results.push({angle,pixelsIdentical:pair[0]===pair[1]});await new Promise(requestAnimationFrame);
}
document.getElementById('save').href=c.toDataURL();document.getElementById('status').textContent=`정면 0° 픽셀 동일: ${results[0].pixelsIdentical?'확인':'실패'} / 45° 픽셀 동일: ${results[1].pixelsIdentical?'확인':'실패'}\n75°·90° 얼굴 위치만 변경 · 현재 후보 검수 대기`;
window.placementEvidence=results;
})().catch(e=>document.getElementById('status').textContent=e.stack);
