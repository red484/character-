from pathlib import Path
p=Path('work/ppolpet/app/main.js');s=p.read_text()
s=s.replace("const path = require('path');", "const path = require('path');\nconst { randomUUID } = require('crypto');")
s=s.replace('({ cfg: p.cfg, size: p.sizeKey })','({ cfg: p.cfg, size: p.sizeKey, pairId:p.pairId, relation:p.relation })')
s=s.replace("function addPet(cfgIn, announce, sizeKey = 'normal') {\n  if (pets.size >= MAX_PETS)", "function addPet(cfgIn, announce, sizeKey = 'normal', pairId = null, expand = true, relation = null) {\n  const incoming = P.normalize(cfgIn);\n  const needsPartner = expand && incoming.relationship;\n  if (pets.size + (needsPartner ? 2 : 1) > MAX_PETS)")
s=s.replace('  const cfg = P.normalize(cfgIn);', "  const cfg = incoming;\n  if (needsPartner) { pairId = randomUUID(); relation = cfg.relationship.kind; }")
s=s.replace("const pet = { win, cfg, size,", "const pet = { win, cfg, pairId, relation, socialAt:0, socialCooldown:Date.now()+3000, size,")
s=s.replace("  if (announce && process.platform === 'darwin') app.focus({ steal: false });", "  if (announce && process.platform === 'darwin') app.focus({ steal: false });\n  if (needsPartner) addPet(cfg.relationship.partner, false, sizeKey, pairId, false, relation);")
a=s.index('  const r = Math.random();',s.index('function nextAction'));b=s.index('\n}',a)
s=s[:a]+'''  p.state = P.chooseAction(p.cfg);
  if (p.state === 'walk') p.dir = Math.random() < 0.5 ? -1 : 1;
  p.timer = p.state === 'sit' ? rand(240,600) : p.state === 'hop' ? 55 * Math.ceil(rand(2,4)) : rand(100,280);'''+s[b:]
s=s.replace("p.dir * (1.0 + 0.35 *", "p.dir * P.PERSONALITIES[p.cfg.personality].speed * (1.0 + 0.35 *")
s=s.replace('function tick() {', '''function coordinatePairs() {
  const groups = new Map(), now = Date.now();
  for (const p of pets.values()) if (p.pairId) { const group=groups.get(p.pairId)||[]; group.push(p); groups.set(p.pairId,group); }
  for (const group of groups.values()) {
    if (group.length !== 2) continue;
    const [a,b]=group;
    if ([a,b].some(p=>p.drag || p.state==='fall' || p.win.isDestroyed())) { a.socialAt=b.socialAt=0; a.socialCooldown=b.socialCooldown=now+3000; continue; }
    const da=areaAt(a.x,a.y), db=areaAt(b.x,b.y);
    if (da.x!==db.x || da.y!==db.y || now < Math.max(a.socialCooldown,b.socialCooldown)) continue;
    const dx=(b.x+b.size/2)-(a.x+a.size/2);
    a.dir=dx>=0?1:-1; b.dir=-a.dir;
    if (!a.socialAt && Math.abs(dx) > (a.size+b.size)*0.31) {
      a.state=b.state='walk'; a.timer=b.timer=120; push(a);push(b);continue;
    }
    if (!a.socialAt) a.socialAt=b.socialAt=now;
    const elapsed=now-a.socialAt;
    if(elapsed>6800) { a.socialAt=b.socialAt=0; a.socialCooldown=b.socialCooldown=now+14000; a.state=b.state='idle'; a.timer=b.timer=120; }
    else { a.state=b.state=elapsed<1800?'wave':P.socialAction(a.relation||'friends',a.cfg.personality,b.cfg.personality); a.timer=b.timer=120; }
    push(a);push(b);
  }
}
function tick() {''')
s=s.replace("    push(p);\n  }\n}\n\nfunction resize", "    push(p);\n  }\n  coordinatePairs();\n}\n\nfunction resize")
s=s.replace("addPet(s.cfg, false, s.size)", "addPet(s.cfg, false, s.size, s.pairId || null, false, s.relation || null)")
p.write_text(s)
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
marker='  const PERSONALITIES = {'
insert='''  function renderPairImage(primary, partner, size = 1024) {
    if (!partner) return renderImage(primary,'full',size);
    const THREE = makeCtx();
    if (!shared) renderImage(primary,'full',16);
    const {r,scene}=shared; r.setPixelRatio(1); r.setSize(size,size,false);
    r.shadowMap.enabled=false;
    const pair=[buildCharacter(primary),buildCharacter(partner)];
    pair.forEach((b,i)=>{
      pose(b,{state:'idle',dir:i? -1:1},0,100000);
      b.char.scale.multiplyScalar(0.64); b.char.position.set(i?0.64:-0.64,0.35,0); b.char.rotation.y=0;
      b.shadow.scale.set(0.64,0.64,0.64); b.shadow.position.set(i?0.64:-0.64,0.35,0);
      scene.add(b.char,b.shadow);
    });
    r.render(scene,camFor(THREE,'full')); const url=r.domElement.toDataURL('image/png');
    pair.forEach(b=>{scene.remove(b.char,b.shadow);b.dispose();}); return url;
  }

'''
s=s.replace(marker,insert+marker).replace('const api = { PERSONALITIES,', 'const api = { renderPairImage, PERSONALITIES,')
p.write_text(s)
p=Path('work/ppolpet/web/maker.src.html');s=p.read_text().replace("shot(primary, 'full', 280)", "P.renderPairImage(primary,partner,280)").replace("shot(primary, 'full', 1024)", "P.renderPairImage(primary,partner,1024)")
s=s.replace("<button class=\"btn\" id=\"png\">이미지 저장</button>","<button class=\"btn\" id=\"png\">이미지 저장</button>")
p.write_text(s)
