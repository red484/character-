// Pure playback schedules. All indices refer to unchanged original PNG frames.
export const cycleDuration=steps=>steps.reduce((sum,[,ms])=>sum+ms,0);
export function frameAt(steps,time){let t=Math.max(0,Math.min(time,cycleDuration(steps)-.0001));for(const [frame,ms]of steps){if(t<ms)return frame;t-=ms}return steps.at(-1)[0]}
export const contactTiming=[175,110,110,135,175,110,110,135];
export function sequence(mode,{classic=false,character='angel'}={}){
 const old={idle:[[0,3200]],walk:Array.from({length:8},(_,i)=>[i,140]),sit:[[0,650],[1,220],[2,1400],[1,220],[0,550]],lie:[[0,500],[1,220],[3,300],[4,1800],[3,300],[1,220],[0,500]],greet:[[0,450],[5,240],[6,220],[7,260],[6,220],[7,260],[6,220],[5,240],[0,650]],special:[[8,500],[9,450],[10,950],[9,450],[8,600]],expressions:Array.from({length:6},(_,i)=>[i,1300])};
 if(classic&&old[mode])return old[mode];
 const current={...old,walk:contactTiming.map((ms,i)=>[i,ms]),sit:[[0,400],[1,260],[2,1800]],lie:[[0,350],[1,240],[3,340],[4,2400]],standSit:[[2,350],[1,300],[0,800]],standLie:[[4,350],[3,380],[1,270],[0,800]],greet:[[0,400],[5,260],[6,320],[7,220],[6,320],[7,220],[6,360],[5,260],[0,900]],special:[[8,600],[9,500],[10,1200],[9,500],[8,800]]};
 // Angel's first special pose faces the opposite way; use its compatible two reaching poses.
 if(mode==='special'&&character==='angel')return [[9,650],[10,1200],[9,850]];
 return current[mode];
}
export function advance(time,delta,duration,loop){const next=Math.max(0,time+delta);return next>=duration?{time:loop?next%duration:duration,ended:!loop}:{time:next,ended:false}}
// Position advances through multiple gait loops. Wrap only once the sprite is fully outside the canvas.
export function travelOffset(elapsed){const distance=elapsed*.025;return distance<=320?distance:((distance-320)%640)-320}
