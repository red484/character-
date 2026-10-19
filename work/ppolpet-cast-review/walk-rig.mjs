// Small continuous 2D articulation of the existing texture. Never changes the head.
export const rigs={angel:{frame:2,split:153,hip:251,armY:233},apricot:{frame:1,split:149,hip:253,armY:231},bear:{frame:1,split:154,hip:252,armY:232},bunny:{frame:1,split:157,hip:253,armY:236},cloud:{frame:7,split:166,hip:251,armY:235}};
export const period=1280;
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)};
export function footPhase(phase){const t=((phase%1)+1)%1;if(t<.5)return {x:7-28*t,lift:0,stance:true};const q=(t-.5)*2;return {x:-7*Math.cos(Math.PI*q),lift:5*Math.sin(Math.PI*q)**2,stance:false}}
export function walkPoint(x,y,time,rig){
 const phase=time/period,a=footPhase(phase),b=footPhase(phase+.5),weight=smooth(rig.hip,278,y),side=smooth(rig.split-15,rig.split+15,x);
 let dx=weight*(a.x*(1-side)+b.x*side),dy=-weight*(a.lift*(1-side)+b.lift*side);
 // Arms counter-swing locally; falloff is zero above the jaw and at the hips.
 const s=-Math.cos(phase*Math.PI*2),arms=smooth(216,226,y)*(1-smooth(243,rig.hip,y));
 const left=1-smooth(10,24,Math.abs(x-(rig.split-27))),right=1-smooth(10,24,Math.abs(x-(rig.split+35)));
 dx+=s*3*arms*(left-right);dy+=s*1.2*arms*(left-right);
 return [x+dx,y+dy];
}
export function makeWalk(source,id){const rig=rigs[id],out=document.createElement('canvas');out.width=out.height=320;const gl=out.getContext('webgl',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false});if(!gl)throw Error('walk WebGL unavailable');
 const program=gl.createProgram();for(const [type,code]of [[gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 uv;varying vec2 tex;void main(){tex=uv;gl_Position=vec4(p.x/160.-1.,1.-p.y/160.,0.,1.);}'],[gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 tex;uniform sampler2D sprite;void main(){gl_FragColor=texture2D(sprite,tex);}']]){const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(program,sh)}gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const n=80,verts=new Float32Array((n+1)**2*2),uv=new Float32Array(verts.length),ids=[];for(let y=0;y<=n;y++)for(let x=0;x<=n;x++){const i=(y*(n+1)+x)*2;uv[i]=x/n;uv[i+1]=y/n}for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*(n+1)+x;ids.push(i,i+1,i+n+1,i+1,i+n+2,i+n+1)}
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.DYNAMIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,uv,gl.STATIC_DRAW);const u=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(u);gl.vertexAttribPointer(u,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(ids),gl.STATIC_DRAW);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
 return {render(time){for(let y=0;y<=n;y++)for(let x=0;x<=n;x++){const i=(y*(n+1)+x)*2,q=walkPoint(x*4,y*4,time,rig);verts[i]=q[0];verts[i+1]=q[1]}gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,verts);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawElements(gl.TRIANGLES,ids.length,gl.UNSIGNED_SHORT,0);return out}};
}
