// A connected 2D textured mesh: rigid head, smooth neck transition, stationary feet.
// No separate head crop or visible layer boundary.
export function makeTiltRenderer(source){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=288;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false});
 if(!gl)throw new Error('WebGL 2D sprite deformation unavailable');
 const vs=`attribute vec2 p; varying vec2 uv; uniform float angle;
 void main(){ uv=p/vec2(256.,288.); float w=1.-smoothstep(196.,232.,p.y);
 vec2 d=p-vec2(128.,198.); float a=angle*w; vec2 q=vec2(cos(a)*d.x-sin(a)*d.y,sin(a)*d.x+cos(a)*d.y)+vec2(128.,198.);
 gl_Position=vec4(q.x/128.-1.,1.-q.y/144.,0.,1.); }`;
 const fs=`precision mediump float; varying vec2 uv; uniform sampler2D sprite; void main(){gl_FragColor=texture2D(sprite,uv);}`;
 function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const vertices=[],indices=[],cols=64,rows=72;
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)vertices.push(x*4,y*4);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=a+cols+1,d=c+1;indices.push(a,b,c,b,d,c)}
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
 gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
 const angle=gl.getUniformLocation(program,'angle');gl.viewport(0,0,256,288);
 return {canvas,render(degrees){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(angle,degrees*Math.PI/180);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);return canvas}};
}
