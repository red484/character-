const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Accessory anchors share the same source-frame coordinates as the character.
// A neck piece attaches to the torso, while a hair clip follows the head surface.
export function accessoryLayout(l,p,character){
 const w=l.width,h=l.height,bh=Math.max(24,l.bottom-l.neck);
 const tilt=clamp(l.tilt||0,-.28,.28),side=p.ornamentSide==='right'?1:-1;
 const profile=!!l.profile,lying=!!l.lying;
 const faceDirection=l.eyes.length?Math.sign(l.eyes.reduce((n,e)=>n+e.x,0)/l.eyes.length-l.cx)||-1:-1;
 const nativeBunnyBow=character==='bunny'&&side<0&&p.ears==='original';
 const ox=clamp((nativeBunnyBow&&p.ornament!=='bow'?-.08:side*.30)+p.ornamentX,-.40,.40)*w;
 const crown=l.top+h*.56*(1-Math.sqrt(Math.max(0,1-(ox/(w*.5))**2)));
 let oy=crown+w*.055+p.ornamentY*h;
 // Keep the whole clip above the eyes, including the largest allowed clip.
 const size=w*(p.ornament==='bow'?.205:.17)*p.ornamentSize;
 const eyeTop=l.eyes.length?Math.min(...l.eyes.map(e=>e.y-e.h*.5)):l.top+h*.58;
 oy=clamp(oy,crown+w*.025,Math.max(crown+w*.025,eyeTop-size*.56-w*.025));
 // Bunny already has a bow at the left root. Place added ornament above it.
 if(character==='bunny'&&side<0&&p.ears==='original')oy-=w*.035;
 const head={x:l.cx+ox,y:oy+Math.sin(tilt)*ox,width:size,height:size*(p.ornament==='bow'?195/254:p.ornament==='flower'?236/249:230/246),angle:tilt+side*.08,reuseNative:nativeBunnyBow&&p.ornament==='bow'};
 const bodyX=Number.isFinite(l.bodyX)?l.bodyX:l.cx;
 const neckWidth=w*(profile?.16:.21);
 const neck={x:bodyX,y:l.neck+bh*(lying?.23:.15),width:neckWidth,height:neckWidth*157/298,angle:tilt*.35,clipHead:true,reuseNative:character==='angel'};
 // Side/lying wings sit on the visible rear flank, not on the front paws.
 const back={x:bodyX+(profile?-faceDirection*w*.10:0),y:l.neck+bh*(lying?.33:.32),width:w*(profile?.38:.60),height:w*(profile?.38:.60)*166/316,angle:lying?-.12:tilt*.15};
 if(lying){back.x=bodyX+w*.23;back.y=l.neck-w*.13;back.width=w*.48;back.height=back.width*166/316;back.angle=-.22;}
 back.y=Math.min(back.y,l.bottom-back.height*.5-10);
 return {head,neck,back};
}
