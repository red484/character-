const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {EventEmitter}=require('node:events');
const P=require('../shared/pet-render.js');
const paired=P.normalize({name:'우유냥',personality:'affectionate',relationship:{kind:'sweethearts',partner:{name:'딸기곰',personality:'playful',relationship:{kind:'friends',partner:{name:'nested'}}}}});
assert.equal(paired.relationship.partner.relationship,null,'pairs must not recursively nest');
assert.deepEqual(P.decode(P.encode(paired)),paired,'pair export/import preserves both characters');
assert.equal(P.normalize({v:1,name:'old'}).personality,'gentle','v1 remains compatible');
assert.equal(P.normalize({personality:'invalid',relationship:{kind:'invalid',partner:{}}}).relationship,null);
for(const personality of Object.keys(P.PERSONALITIES)) {
 const totals={};for(let i=0;i<100;i++){const action=P.chooseAction({personality},(i+.5)/100);totals[action]=(totals[action]||0)+1;}
 assert.deepEqual(['walk','idle','look','hop','wave','sit'].map(x=>totals[x]),P.PERSONALITIES[personality].weights);
}
assert.equal(P.socialAction('friends','gentle','playful'),'hop');
assert.equal(P.socialAction('family','gentle','gentle'),'sit');
assert.equal(P.socialAction('sweethearts','affectionate','affectionate'),'nuzzle');
assert.equal(P.socialAction('sweethearts','shy','affectionate'),'wave');
for(let i=0;i<100;i++){const c=P.randomize();assert.deepEqual(P.decode(P.encode(c)),c);}
let id=0;
class Window extends EventEmitter {
 constructor(){super();this.webContents=new EventEmitter();this.webContents.id=++id;this.webContents.send=()=>{};}
 setAlwaysOnTop(){} loadFile(){} isDestroyed(){return false;} showInactive(){} setPosition(){} setBounds(){} setResizable(){}
}
const app={requestSingleInstanceLock:()=>true,setAsDefaultProtocolClient(){},on(){},whenReady:()=>({then(){}}),getPath:()=>'/unused',quit(){}};
const electron={app,BrowserWindow:Window,screen:{getCursorScreenPoint:()=>({x:0,y:0}),getDisplayNearestPoint:()=>({workArea:{x:0,y:0,width:1280,height:800}})},ipcMain:{on(){}},Menu:{},dialog:{showMessageBox(){}},clipboard:{},shell:{}};
const sandbox={require:n=>n==='electron'?electron:n==='fs'?{writeFileSync(){},readFileSync(){throw Error('empty')}}:n==='./pet-render.js'?P:require(n),__dirname:path.resolve(__dirname,'../app'),process:{argv:['node'],platform:'linux'},setInterval(){},console,Date,Math};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/main.js'),'utf8')+'\nthis.testAPI={addPet,pets,coordinatePairs};',sandbox);
const {addPet,pets,coordinatePairs}=sandbox.testAPI;
addPet(paired,false);
assert.equal(pets.size,2,'import pair opens two pets');
const [a,b]=[...pets.values()];assert.equal(a.pairId,b.pairId);assert.equal(a.relation,'sweethearts');
a.x=100;b.x=700;a.y=b.y=637;a.state=b.state='idle';a.socialCooldown=b.socialCooldown=0;
coordinatePairs();assert.equal(a.state,'walk');assert.equal(a.dir,1);assert.equal(b.dir,-1);
b.x=180;coordinatePairs();assert.equal(a.state,'wave');
a.socialAt=b.socialAt=Date.now()-2500;coordinatePairs();assert.equal(a.state,'nuzzle');
a.socialAt=b.socialAt=Date.now()-8000;coordinatePairs();assert.equal(a.state,'idle');assert(a.socialCooldown>Date.now());
a.socialCooldown=b.socialCooldown=0;a.drag={};coordinatePairs();assert.equal(a.socialAt,0);
pets.clear();addPet(paired,false,'normal','saved-pair',false,'sweethearts');addPet(paired.relationship.partner,false,'normal','saved-pair',false,'sweethearts');assert.equal(pets.size,2,'restoring pairs must not duplicate partners');
const html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8');for(const [,script]of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script);
assert.equal(fs.readFileSync(path.join(__dirname,'../shared/pet-render.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../app/pet-render.js'),'utf8'));
console.log('PASS: v1 compatibility, pair round trip, nonrecursive schema, four personality distributions, relationship behaviors, desktop pair creation/approach/interaction/cooldown/drag/restore, 100 random round trips, bundle syntax, renderer parity');

for(let i=0;i<=720;i++) {
 const phase=i/720*Math.PI*2, a=P.walkFoot(phase,0), b=P.walkFoot(phase,1);
 assert(a[0]===0 || b[0]===0,'at least one foot has ground support');
 assert(a[0]>=0 && a[0]<=0.065001 && Math.abs(a[1])<=0.120001);
}
for(const side of [0,1]) {
 const a=P.walkFoot(0,side),b=P.walkFoot(Math.PI*2,side);
 a.forEach((x,i)=>assert(Math.abs(x-b[i])<1e-9,'gait loop must be seamless'));
}
console.log('PASS: walking support, short stride, continuous loop');
