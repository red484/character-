// Approved Starlight schedule: eight timing slots, four actual key poses.
export const starlightSlots = [160,120,120,120,160,120,120,120];
export const starlightSteps = starlightSlots.map((ms,i)=>[Math.floor(i/2),ms]);
export const starlightPeriod = starlightSlots.reduce((a,b)=>a+b,0);
export const poseStarts = [0,280,520,800];
