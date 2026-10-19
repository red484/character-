// Trace the underside of the foreground arm separately in each approved walk pose.
// The old tail is behind that contour; the arm and torso remain from the source sprite.
const outlines=[
 p=>{p.moveTo(185,450);p.lineTo(224,450);p.lineTo(224,475);p.bezierCurveTo(222,489,231,500,246,502);p.bezierCurveTo(260,504,274,493,283,488);p.lineTo(280,532);p.lineTo(260,557);p.lineTo(185,558);},
 p=>{p.moveTo(185,450);p.lineTo(279,450);p.bezierCurveTo(267,465,263,482,264,502);p.bezierCurveTo(265,518,275,527,286,529);p.lineTo(286,554);p.lineTo(185,558);},
 p=>{p.moveTo(185,450);p.lineTo(235,450);p.bezierCurveTo(228,465,231,485,245,494);p.bezierCurveTo(255,501,270,496,282,486);p.lineTo(281,535);p.lineTo(258,559);p.lineTo(185,558);},
 p=>{p.moveTo(185,449);p.lineTo(292,449);p.bezierCurveTo(281,468,277,486,279,502);p.bezierCurveTo(279,517,288,526,299,529);p.lineTo(295,554);p.lineTo(185,558);}
];
export function makeWalkTailMask(){
 const c=document.createElement('canvas');c.width=c.height=640;
 const x=c.getContext('2d',{willReadFrequently:true});
 return (image,l)=>{
  x.clearRect(0,0,640,640);x.save();x.translate(l.cx,l.neck);
  x.scale(l.width/348,(l.bottom-l.neck)/132);x.translate(-338,-444);
  x.beginPath();outlines[Math.floor((l.frame||0)/2)%4](x);x.closePath();x.fill();x.restore();
  const m=x.getImageData(0,0,640,640).data;
  const pose=Math.floor((l.frame||0)/2)%4;
  for(let i=3;i<m.length;i+=4){const y=Math.floor(i/4/640),px=(i>>2)%640,bodyH=l.bottom-l.neck;const lowerTail=pose<2&&px<l.cx-l.width*(pose===0?.23:.19)&&y<l.neck+bodyH*.86;if(m[i]&&y>=l.neck+20&&(y<=l.neck+bodyH*.72||lowerTail))image.data[i]*=1-m[i]/255;}
 };
}
