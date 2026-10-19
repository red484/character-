const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
// Shares the player's clock: pausing, seeking and speed changes affect both.
export function starState(time){
  const enter=clamp((time-.34)/.42),exit=smooth((time-1.8)/.4);
  const pop=1+2.70158*Math.pow(enter-1,3)+1.70158*Math.pow(enter-1,2);
  return {alpha:smooth((time-.34)/.14)*(1-exit),scale:Math.max(0,pop)*(1-exit*.3),
    x:64+Math.sin((time-.75)*2.4)*3,y:166-12*smooth(enter)+Math.sin((time-.75)*3)*5,
    rotation:Math.sin((time-.75)*2.2)*.13};
}
function shape(x,r,inner){
  x.beginPath();
  for(let j=0;j<10;j++){const a=-Math.PI/2+j*Math.PI/5,s=j%2?inner:r;
    const px=Math.cos(a)*s,py=Math.sin(a)*s;j?x.lineTo(px,py):x.moveTo(px,py)}
  x.closePath();
}
export function drawStar(x,time){
  const s=starState(time);if(s.alpha<=0)return;
  x.save();x.globalAlpha=s.alpha;x.translate(s.x,s.y);x.rotate(s.rotation);x.scale(s.scale,s.scale);
  const g=x.createLinearGradient(-10,-22,12,22);g.addColorStop(0,'#fff2bb');g.addColorStop(1,'#f3c66a');
  x.fillStyle=g;x.strokeStyle='#f5cf7d';x.lineWidth=4;x.lineJoin='round';shape(x,22,11);x.stroke();x.fill();x.restore();
  for(const [dx,dy,phase] of [[-25,27,0],[30,-25,1.7]]){
    const r=2.5+1.8*(.5+.5*Math.sin(time*4+phase));
    x.save();x.globalAlpha=s.alpha*.7;x.translate(s.x+dx,s.y+dy);x.fillStyle='#f6d588';
    x.beginPath();x.moveTo(0,-r*1.7);x.quadraticCurveTo(r*.3,-r*.3,r,0);x.quadraticCurveTo(r*.3,r*.3,0,r*1.7);x.quadraticCurveTo(-r*.3,r*.3,-r,0);x.quadraticCurveTo(-r*.3,-r*.3,0,-r*1.7);x.fill();x.restore();
  }
}
