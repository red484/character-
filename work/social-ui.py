from pathlib import Path
p=Path('work/ppolpet/web/maker.src.html');s=p.read_text()
s=s.replace('</style>', '''
.friend-switch { display:flex; gap:8px; }
.friend-switch button { flex:1; min-height:40px; }
#companion { display:none; position:absolute; inset:3% 0 0; }
#companion canvas { width:100%; height:100%; display:block; }
.pair-stage #pet { width:62%; inset:3% auto 0 -6%; margin:0; transition:transform 1.4s ease; }
.pair-stage #companion { display:block; width:62%; inset:3% -6% 0 auto; transition:transform 1.4s ease; }
.pair-stage.is-social #pet { transform:translateX(9%); }
.pair-stage.is-social #companion { transform:translateX(-9%); }
.pair-stage .nametag { font-family:var(--f-body); font-size:12px; max-width:90%; overflow:hidden; text-overflow:ellipsis; }
.personality-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.personality-option { border:1px solid var(--line); background:var(--sunk); border-radius:15px; text-align:left; padding:14px; }
.personality-option b { display:block; margin-bottom:5px; font-size:14px; }
.personality-option small { color:var(--muted); font-size:12px; }
.personality-option[aria-pressed="true"] { background:var(--accent-soft); border-color:var(--accent); }
.social-note { padding:12px 14px; border-radius:14px; background:#f7f1ec; font-size:12px; margin:0; color:#80705f; }
@media(prefers-reduced-motion:reduce) { .pair-stage #pet, .pair-stage #companion { transition:none; } }
</style>''',1)
s=s.replace('<div class="tools">','<div id="companion" role="img" aria-label="상대 친구 미리보기"></div>\n        <div class="tools">',1)
s=s.replace('<button class="pill" data-mode="idle" aria-pressed="true">', '<button class="pill" data-mode="auto" aria-pressed="true">알아서 놀기</button>\n        <button class="pill" data-mode="idle" aria-pressed="false">')
s=s.replace('<div class="preview-actions" role="group"', '<button class="pill" id="interact" hidden>둘이 같이 놀기 ♡</button>\n      <p class="hint" id="behavior-note" role="status">성격에 맞춰 자유롭게 놀아요.</p>\n      <div class="preview-actions" role="group"',1)
s=s.replace('<div class="name-row"><label for="pet-name">', '<div class="friend-switch"><button class="pill" id="edit-primary" aria-pressed="true">내 친구 꾸미기</button><button class="pill" id="edit-partner" aria-pressed="false">＋ 상대 만들기</button></div>\n      <div class="name-row"><label for="pet-name">',1)
# Initialize studio from backward-compatible character bundle.
marker='  /* ---------- 색 견본 ---------- */'
insert='''  let primary = P.normalize(cfg, false), partner = cfg.relationship ? P.normalize(cfg.relationship.partner, false) : null;
  let relationshipKind = cfg.relationship ? cfg.relationship.kind : 'friends', editing = 'primary';
  cfg = primary;
  const bundle = () => P.normalize({...primary, relationship:partner ? {kind:relationshipKind,partner} : null});
  const studioSnapshot = () => ({primary,partner,relationshipKind,editing});
  function restoreStudio(saved) {
    primary = P.normalize(saved.primary, false); partner = saved.partner ? P.normalize(saved.partner, false) : null;
    relationshipKind = saved.relationshipKind; editing = saved.editing === 'partner' && partner ? 'partner' : 'primary';
    apply(editing === 'partner' ? partner : primary, true, false);
  }
  function loadStudio(value) {
    snapshot(); const b = P.normalize(value); primary = P.normalize(b,false);
    partner = b.relationship ? P.normalize(b.relationship.partner,false) : null;
    relationshipKind = b.relationship ? b.relationship.kind : 'friends'; editing = 'primary'; apply(primary,true,false);
  }

'''
s=s.replace(marker,insert+marker)
s=s.replace("const CATS = [", "const CATS = [\n    {id:'personality', label:'성격·관계', view:'full'},")
s=s.replace("const pet = P.createPet($('#pet'), cfg);", "const pet = P.createPet($('#pet'), primary);\n  let companionPet = null, socialTimers = [], socialBusy = false;\n  function cancelSocial() { socialTimers.forEach(clearTimeout); socialTimers = []; socialBusy = false; $('.stage').classList.remove('is-social'); }")
s=s.replace("let mode = 'idle'", "let mode = 'auto'")
s=s.replace("pet.setState(mode), 1840", "pet.setState(mode === 'auto' ? P.chooseAction(primary) : mode), 1840")
s=s.replace("clearTimeout(hopTimer); mode = b.dataset.mode; pet.setState(mode);", "clearTimeout(hopTimer); cancelSocial(); mode = b.dataset.mode; pet.setState(mode === 'auto' ? P.chooseAction(primary) : mode); if (companionPet) companionPet.setState(mode === 'auto' ? P.chooseAction(partner) : mode);")
s=s.replace('JSON.stringify(cfg)', 'JSON.stringify(studioSnapshot())')
# Undo/redo now restore both characters and editing selection.
s=s.replace('apply(JSON.parse(prev), true, false)', 'restoreStudio(JSON.parse(prev))').replace('apply(JSON.parse(next), true, false)', 'restoreStudio(JSON.parse(next))')
s=s.replace("pet.setPaused(paused);", "pet.setPaused(paused); if (companionPet) companionPet.setPaused(paused); if (paused) cancelSocial();")
s=s.replace('pet.setAngle(Number(b.dataset.angle));', 'pet.setAngle(Number(b.dataset.angle)); if (companionPet) companionPet.setAngle(Number(b.dataset.angle));')
# Insert personality controls in renderPanel.
s=s.replace("const out = [`<h3 class=\"panel-title\">${esc(c.label)} 고르기</h3>`];", '''const out = [`<h3 class="panel-title">${esc(c.label)} 고르기</h3>`];
    if (c.id === 'personality') {
      out.push(`<div class="personality-grid">${Object.entries(P.PERSONALITIES).map(([id,p]) => `<button class="personality-option" data-personality="${id}" aria-pressed="${cfg.personality===id}"><b>${esc(p.label)}</b><small>${esc(p.description)}</small></button>`).join('')}</div>`);
      out.push('<h3 class="panel-title">우리 사이는</h3><p class="hint">관계를 고르면 상대 친구도 생겨요. 위 버튼으로 각각 꾸밀 수 있어요.</p>');
      out.push(`<div class="moves">${[['friends','친구'],['family','가족'],['sweethearts','짝꿍']].map(([id,label])=>`<button class="pill" data-relation="${id}" aria-pressed="${!!partner && relationshipKind===id}">${label}</button>`).join('')}</div>`);
      if (partner) out.push('<button class="pill" data-remove-partner="1">혼자 보기로 바꾸기</button>');
      out.push('<p class="social-note">친구는 함께 콩콩 · 가족은 나란히 쉬기 · 짝꿍은 볼 부비기<br>수줍이가 있으면 작은 인사부터 시작해요.</p>');
    }''')
s=s.replace('cfg = P.normalize(next);\n    pet.setConfig(cfg);', '''cfg = P.normalize(next, false);
    if (editing === 'partner' && partner) partner = cfg; else primary = cfg;
    syncStudio();''')
s=s.replace("$('#nametag').textContent = cfg.name; $('#pet-name').value = cfg.name;", "$('#nametag').textContent = partner ? primary.name + ' ♡ ' + partner.name : primary.name; $('#pet-name').value = cfg.name;")
s=s.replace("localStorage.setItem('ppolpet-draft', JSON.stringify(studioSnapshot()))", "localStorage.setItem('ppolpet-draft', JSON.stringify(bundle()))")
s=s.replace("    const it = e.target.closest('[data-val]');", '''    const personality = e.target.closest('[data-personality]');
    if (personality) { apply(with_({personality:personality.dataset.personality})); return; }
    const relation = e.target.closest('[data-relation]');
    if (relation) { snapshot(); relationshipKind = relation.dataset.relation; if (!partner) partner = makePartner(); apply(cfg,true,false); return; }
    if (e.target.closest('[data-remove-partner]')) { snapshot(); partner = null; editing = 'primary'; apply(primary,true,false); return; }
    const it = e.target.closest('[data-val]');''')
s=s.replace('requestAnimationFrame(() => pet.setConfig(cfg))', "requestAnimationFrame(() => (editing === 'partner' && companionPet ? companionPet : pet).setConfig(cfg))")
# snapshot of pre-slider change correctly captures the full studio
# Export complete pair through all existing channels.
s=s.replace('P.encode(cfg)', 'P.encode(bundle())')
s=s.replace("shot(cfg, 'full', 280)", "shot(primary, 'full', 280)")
s=s.replace("$('#name').value = cfg.name;", "$('#name').value = primary.name;")
s=s.replace("cfg = P.normalize(with_({ name: e.target.value || '뽈뽈이' }));", "primary = P.normalize({...primary, name:e.target.value || '뽈뽈이'},false); if (editing === 'primary') cfg = primary;")
s=s.replace("const safeName = () => (cfg.name", "const safeName = () => (primary.name")
s=s.replace("character: cfg", "character: bundle()")
s=s.replace("apply(P.decode($('#load-input').value))", "loadStudio(P.decode($('#load-input').value))")
s=s.replace("shot(cfg, 'full', 1024)", "shot(primary, 'full', 1024)")
# Pair coordination and character switching. Everything is saved with the same code/file.
marker='  const PRESETS = ['
insert='''  function makePartner() { return P.normalize({...P.DEFAULT,name:'복숭이',ears:'bear',tail:'bunny',whisk:false,personality:'affectionate',colors:{...P.DEFAULT.colors,body:'#f5a0bb'}},false); }
  function syncStudio() {
    cancelSocial(); pet.setConfig(primary);
    $('.stage').classList.toggle('pair-stage', !!partner);
    if (partner) {
      if (companionPet) companionPet.setConfig(partner); else companionPet = P.createPet($('#companion'),partner);
      companionPet.setPaused(paused); companionPet.setDir(-1);
    } else if (companionPet) { companionPet.destroy(); companionPet = null; }
    $('#interact').hidden = !partner;
    $('#edit-primary').setAttribute('aria-pressed',String(editing==='primary'));
    $('#edit-partner').setAttribute('aria-pressed',String(editing==='partner'));
    $('#edit-partner').textContent = partner ? '상대 친구 꾸미기' : '＋ 상대 만들기';
    $('#behavior-note').textContent = partner ? '둘의 성격과 관계에 맞춰 함께 놀아요.' : P.PERSONALITIES[primary.personality].description;
  }
  $('#edit-primary').addEventListener('click', () => { editing='primary'; apply(primary,true,false); });
  $('#edit-partner').addEventListener('click', () => {
    if (!partner) { snapshot(); partner=makePartner(); }
    editing='partner'; cat='personality'; renderCats(); apply(partner,true,false);
  });
  function interact() {
    if (!companionPet || paused || socialBusy) return;
    cancelSocial(); socialBusy=true; pet.setAngle(null); companionPet.setAngle(null);
    pet.setDir(1); companionPet.setDir(-1); pet.setState('walk'); companionPet.setState('walk'); $('.stage').classList.add('is-social');
    $('#behavior-note').textContent='종종종… 서로에게 다가가요.';
    socialTimers.push(setTimeout(()=>{ pet.setState('wave'); companionPet.setState('wave'); $('#behavior-note').textContent='반가워! 작은 인사를 나눠요.'; },1400));
    socialTimers.push(setTimeout(()=>{ const action=P.socialAction(relationshipKind,primary.personality,partner.personality); pet.setState(action); companionPet.setState(action); $('#behavior-note').textContent=action==='nuzzle'?'좋아해, 볼을 부비부비 ♡':action==='sit'?'네 옆에서 잠깐 쉬어갈래.':action==='hop'?'하나, 둘! 같이 콩콩!':'쑥스럽지만… 만나서 좋아!'; },3200));
    socialTimers.push(setTimeout(()=>{ cancelSocial(); pet.setState('idle'); if(companionPet)companionPet.setState('idle'); $('#behavior-note').textContent='함께 노는 중 · 각자 꾸미기도 가능해요.'; },7600));
  }
  $('#interact').addEventListener('click', () => { paused=false; updatePause(); interact(); });
  setInterval(()=>{ if (paused || mode!=='auto' || socialBusy) return; if(partner)interact(); else pet.setState(P.chooseAction(primary)); },8500);

'''
s=s.replace(marker,insert+marker)
s=s.replace("let cat = 'body';", "let cat = 'personality';")
p.write_text(s)
