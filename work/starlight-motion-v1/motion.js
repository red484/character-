/* Pure gait sampler + controller. No mesh, UV, material, or scale edits. */
(function(root){
const S=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(10+x*(-15+6*x))};
const A=.09, PERIOD=1.5;
function gait(c){
 const phase=((c%1)+1)%1;
 const feet=[0,1].map(i=>{const q=(phase+i*.5)%1;if(q<.5)return {z:A-4*A*q,y:0,support:true};const u=(q-.5)*2;return {z:-A+4*A*S(u)-2*A*u,y:.062*Math.sin(Math.PI*u)**2,support:false};});
 return {phase,feet,travel:4*A*c};
}
class Controller{
 constructor(){this.state='idle';this.time=0;this.c=0;this.root=0;this.base=0;this.paused=false;this.speed=1;this.loop=true;this.idleTime=0;this.pendingStop=false;}
 command(s){if(s==='walk'&&this.state==='idle'){this.state='start';this.time=0;this.base=this.root;}else if(s==='stop'||s==='idle'){if(this.state==='start')this.pendingStop=true;else if(this.state==='walk'){this.state='stop';this.time=0;this.from=this.c;this.end=(Math.floor(this.c*2)+1)/2;this.duration=2*(this.end-this.c)*PERIOD;}}}
 seek(p){this.state='walk';this.c=p;this.base=0;this.root=4*A*p;this.paused=true;}
 update(dt){if(!this.paused){dt*=this.speed;this.time+=dt;this.idleTime+=dt;
 if(this.state==='start'&&this.time>=.5){this.state='walk';this.time=0;this.c=0;this.base+=A;if(this.pendingStop){this.pendingStop=false;this.command('stop');}}
 else if(this.state==='walk'){this.c+=dt/PERIOD;if(!this.loop&&this.c>=1)this.command('stop');}
 else if(this.state==='stop'){const u=Math.min(1,this.time/this.duration);this.c=this.from+(this.end-this.from)*(u+Math.sin(Math.PI*u)/Math.PI);if(u===1){this.state='settle';this.time=0;}}
 else if(this.state==='settle'&&this.time>=.5){this.root=this.base+4*A*this.c+A;this.state='idle';this.time=0;}
 }
 let g=gait(this.c),feet=g.feet,travel=this.base+g.travel;
 if(this.state==='idle'){feet=[0,1].map(()=>({z:0,y:0,support:true}));travel=this.root;}
 if(this.state==='start'){const u=Math.min(1,this.time/.5),s=S(u);travel=this.base+A*s;feet=[{z:A*s,y:.062*Math.sin(Math.PI*u)**2,support:false},{z:-A*s,y:0,support:true}];}
 if(this.state==='settle'){const u=Math.min(1,this.time/.5),s=S(u);travel+=A*s;feet=feet.map(f=>f.z>0?{z:A-A*s,y:0,support:true}:{z:-A+A*s,y:.062*Math.sin(Math.PI*u)**2,support:false});}
 this.root=travel;return {state:this.state,phase:g.phase,feet,travel,idleTime:this.idleTime};
 }
}
root.StarlightMotion={Controller,gait,A,PERIOD};if(typeof module!=='undefined')module.exports=root.StarlightMotion;
})(typeof window==='undefined'?globalThis:window);
