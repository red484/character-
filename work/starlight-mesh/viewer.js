import * as THREE from 'three';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/environments/RoomEnvironment.js';
const $=id=>document.getElementById(id);
try{
const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.0;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;$('viewer').appendChild(r.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f2f8');const pmrem=new THREE.PMREMGenerator(r);scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
scene.add(new THREE.HemisphereLight('#ffffff','#d0c4df',.45));const light=new THREE.DirectionalLight('#fff9f2',.85);light.position.set(-3,4,5);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-3;light.shadow.camera.right=3;light.shadow.camera.top=4;light.shadow.camera.bottom=-2;light.shadow.normalBias=.015;light.shadow.bias=-.0002;scene.add(light);
const fill=new THREE.DirectionalLight('#e4ddff',.35);fill.position.set(4,3,-3);scene.add(fill);const frontFill=new THREE.DirectionalLight('#ffffff',.50);frontFill.position.set(1,1,6);scene.add(frontFill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#f5f2f8',roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.008;floor.receiveShadow=true;scene.add(floor);
const camera=new THREE.PerspectiveCamera(27,1,.05,100);camera.position.set(0,1.5,7.5);const controls=new OrbitControls(camera,r.domElement);controls.target.set(0,1.20,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.62;controls.update();
const gltf=await new GLTFLoader().loadAsync('assets/starlight-prototype.glb');const root=gltf.scene;scene.add(root);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material.envMapIntensity=.60;}});
const audit=await fetch('assets/mesh-audit.json').then(x=>x.json());$('audit').textContent=JSON.stringify(audit,null,2);$('status').textContent=`GLB 로드 완료 · ${audit.triangles.toLocaleString()} 삼각형 · ${gltf.animations.length} 애니메이션 · 외형 검수 대기`;
let spin=false,wire=false;const basePos=new THREE.Vector3(0,1.5,7.5);
function resize(){r.setSize($('viewer').clientWidth,$('viewer').clientHeight);camera.aspect=$('viewer').clientWidth/$('viewer').clientHeight;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('viewer'));resize();
function angle(deg){spin=false;controls.enableDamping=false;controls.update();root.rotation.y=deg*Math.PI/180;camera.position.copy(basePos);controls.target.set(0,1.20,0);controls.update();controls.enableDamping=true;}
for(const deg of [0,45,75,90,120,135,180,270,360]){const b=document.createElement('button');b.textContent=deg+'°';b.onclick=()=>angle(deg);$('angles').appendChild(b);}
$('spin').onclick=()=>{spin=!spin;$('spin').textContent=spin?'회전 멈춤':'자동 회전';};$('wire').onclick=()=>{wire=!wire;root.traverse(o=>{if(o.isMesh)o.material.wireframe=wire;});};
function earView(){spin=false;controls.enableDamping=false;controls.update();root.rotation.y=.7;controls.target.set(.55,2.04,0);camera.position.set(1.65,2.55,2.6);controls.update();controls.enableDamping=true;}
$('ear').onclick=earView;$('reset').onclick=()=>angle(0);$('snapshot').onclick=()=>{r.render(scene,camera);const a=document.createElement('a');a.href=r.domElement.toDataURL();a.download='starlight-glb-view.png';a.click();};
let last=performance.now();function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000);last=t;if(spin)root.rotation.y+=dt*.4;controls.update();r.render(scene,camera);}requestAnimationFrame(frame);
// Render inspection captures from the loaded GLB itself, not a second procedural model.
const cap=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});cap.setSize(500,500);cap.outputEncoding=r.outputEncoding;cap.toneMapping=r.toneMapping;cap.toneMappingExposure=r.toneMappingExposure;cap.shadowMap.enabled=true;cap.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.OrthographicCamera(-1.5,1.5,1.5,-1.5,.05,30);cam.position.set(0,1.20,8);cam.lookAt(0,1.20,0);let images={};
const load=async src=>{const im=new Image();im.src=src;await im.decode();return im;};
for(const deg of [0,45,75,90,120,135,180,270,360]){root.rotation.y=deg*Math.PI/180;cap.render(scene,cam);images[deg]=await load(cap.domElement.toDataURL());}
const board=$('views'),ctx=board.getContext('2d');ctx.fillStyle='#f5f2f8';ctx.fillRect(0,0,1600,1000);for(const [i,deg]of [0,45,75,90,120,135,180,270].entries()){const x=i%4*400,y=Math.floor(i/4)*500;ctx.drawImage(images[deg],x,y,400,400);ctx.fillStyle='#665176';ctx.font='22px system-ui';ctx.textAlign='center';ctx.fillText(deg+'°',x+200,y+447);}$('save-views').href=board.toDataURL();
const front=$('front').getContext('2d');front.fillStyle='#f5f2f8';front.fillRect(0,0,1500,600);const ref=await load('assets/starlight-reference.png');front.drawImage(ref,55,247,270,282,57,56,386,404);front.drawImage(images[0],1000,0,500,500);
const old=await load(PpolPet.renderSnapshot(PpolPresets.presetConfig(PpolPresets.PRESETS[2]),{state:'perch',size:500}));front.drawImage(old,500,0,500,500);front.fillStyle='#665176';front.font='24px system-ui';front.textAlign='center';['원본 정면 참고','기존 Three.js · 앉기','새 GLB · 앉기'].forEach((s,i)=>front.fillText(s,i*500+250,555));
const frontLink=document.createElement('a');frontLink.id='save-front';frontLink.textContent='정면 비교 PNG 저장';frontLink.download='starlight-front-comparison.png';frontLink.href=$('front').toDataURL();$('front').after(frontLink);
const eb=$('ear-board').getContext('2d');eb.fillStyle='#f5f2f8';eb.fillRect(0,0,1200,500);for(let i=0;i<2;i++){root.rotation.y=i?Math.PI/2:.7;cam.left=-.55;cam.right=.55;cam.top=.55;cam.bottom=-.55;cam.position.set(i?0:.4,1.98,8);cam.lookAt(i?0:.4,1.98,0);cam.updateProjectionMatrix();cap.render(scene,cam);eb.drawImage(cap.domElement,i*600+50,0,500,500);}const earLink=document.createElement('a');earLink.id='save-ear';earLink.textContent='귀 확대 PNG 저장';earLink.download='starlight-ear.png';earLink.href=$('ear-board').toDataURL();$('ear-board').after(earLink);angle(0);cap.dispose();
$('audit').textContent+='\n'+JSON.stringify({oneLoadedModel:true,closedTurnPixelsIdentical:images[0].src===images[360].src});
window.meshInspection={source:'assets/starlight-prototype.glb',oneLoadedModel:true,angles:[0,45,75,90,120,135,180,270,360],animations:gltf.animations.length,closedTurnPixelsIdentical:images[0].src===images[360].src};
}catch(e){$('error').textContent=e.stack;console.error(e);}
