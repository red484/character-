from pathlib import Path
p=Path('work/ppolpet/web/maker.src.html'); s=p.read_text()
css='''
/* Soft studio: one clear preview, presets first, all categories visible. */
:root { --bg:#faf8f5; --panel:#ffffff; --sunk:#f6f3f7; --ink:#443d50; --muted:#797382; --line:#ede8ef; --accent:#987bc0; --accent-soft:#f0e8f9; --accent-ink:#fff; --stage:#bce6e8; --stage-hi:#def4f1; color-scheme:light; }
body { background:var(--bg); padding:32px 24px; }
.wrap { max-width:1180px; gap:22px; }
header { align-items:center; justify-content:space-between; }
header p { font-size:14px; margin-top:10px; }
h1 { font-size:32px; letter-spacing:-1px; }
.eyebrow { font-size:11px; letter-spacing:3px; color:var(--accent); margin-bottom:10px; font-weight:600; }
.save-state { background:#edf5ee; color:#56785e; padding:8px 12px; border-radius:999px; font-size:12px; }
.main { grid-template-columns:minmax(0, 490px) minmax(0, 1fr); gap:24px; }
.card { border-radius:26px; box-shadow:0 8px 32px #49305805; }
.preview { padding:18px; gap:14px; }
.stage { border-radius:20px; background:radial-gradient(ellipse at 40% 20%,var(--stage-hi),var(--stage)); }
.stage-label { position:absolute; top:18px; left:18px; font-size:11px; letter-spacing:2px; color:#5d8b8e; }
#pet { inset:3% 0 0; }
.nametag { bottom:18px; border:0; padding:5px 18px; background:#ffffffc9; font-size:17px; }
.preview-meta { display:flex; justify-content:space-between; align-items:center; gap:8px; }
.preview-meta .hint { font-size:11px; }
.tool { width:36px; height:36px; background:#ffffffc9; border:0; }
.moves { gap:6px; }
.pill { min-height:36px; padding:6px 12px; background:var(--panel); }
.pill[aria-pressed="true"] { background:var(--accent-soft); color:#735395; border-color:#bba2d3; }
.done { box-shadow:none; font-size:19px; background:#8d71b2; padding:14px; }
.editor { padding:22px; gap:20px; }
.editor-head { display:flex; align-items:center; justify-content:space-between; }
h2 { margin:0; font-size:20px; font-family:var(--f-display); font-weight:400; }
.cats { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:7px; overflow:visible; }
.cat { width:auto; min-height:40px; padding:8px 4px; border-radius:12px; background:var(--sunk); color:#756c80; font-size:13px; }
.cat[aria-selected="true"] { background:var(--accent-soft); color:#725392; box-shadow:inset 0 0 0 1px #bba2d3; }
.panel-title { margin:0; font-size:17px; font-weight:600; }
.swrow { gap:10px; }
.swrow .lbl { color:#635b6c; font-size:13px; margin-bottom:3px; }
.sw { width:34px; height:34px; }
.items { grid-template-columns:repeat(4,minmax(0,1fr)); gap:9px; }
.item { padding-bottom:9px; font-size:12px; min-height:44px; }
.item img { aspect-ratio:1.05; }
.item:hover { background:var(--accent-soft); }
.starters { display:grid; gap:14px; }
.starter-head { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
.starter-head h2 { font-size:18px; }
.presets { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:12px; }
.preset { border:1px solid var(--line); border-radius:20px; background:#fff; padding:0 10px 12px; font-size:13px; color:var(--ink); }
.preset img { width:100%; height:116px; object-fit:contain; display:block; }
.preset:hover, .preset:focus-visible { background:var(--accent-soft); border-color:#bba2d3; }
.preset small { display:block; font-size:11px; color:var(--muted); margin-top:3px; }
.slider { grid-template-columns:6.5em minmax(0,1fr) 3em; }
.slider output { color:var(--muted); font-size:11px; text-align:right; font-variant-numeric:tabular-nums; }
.preview-actions { display:flex; gap:6px; flex-wrap:wrap; }
.preview-actions button { font-size:12px; }
footer { text-align:center; padding:4px 0; }
@media(max-width:820px) {
 body { padding:18px 14px; } .wrap { gap:16px; } .main { grid-template-columns:1fr; gap:16px; }
 .presets { display:flex; overflow-x:auto; gap:8px; padding-bottom:5px; } .preset { flex:0 0 112px; } .preset img { height:92px; }
 .preview { position:static; padding:12px; } .stage { aspect-ratio:auto; height:300px; } #pet { inset:0; width:300px; max-width:100%; margin:auto; }
 .editor { padding:16px; } header p { font-size:12px; } .save-state { font-size:10px; padding:5px 8px; }
 .starter-head .hint { font-size:10px; } .items { grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media(prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; } }
'''
s=s.replace('</style>', css+'\n</style>',1)
# Explicit light product art direction, avoid OS-dependent appearance
s=s.replace('<div class="wrap">','<script>document.documentElement.dataset.theme="light";</script>\n<div class="wrap">',1)
a=s.index('  <header>'); b=s.index('  <div class="main">',a)
s=s[:a]+'''  <header>
    <div><div class="eyebrow">PPOL PPOL · LITTLE FRIENDS</div><h1>나만의 <span>뽈뽈펫</span></h1>
    <p>작고 말랑한 친구를 만들어요. 취향을 한 스푼씩 더해서.</p></div>
    <span class="save-state" id="save-state" role="status">이 브라우저에 자동 저장</span>
  </header>
  <section class="starters" aria-label="추천 친구">
    <div class="starter-head"><h2>어떤 친구로 시작할까요?</h2><p class="hint">고른 다음 자유롭게 바꿔요 · 되돌리기도 가능해요</p></div>
    <div class="presets" id="presets"></div>
  </section>

'''+s[b:]
s=s.replace('<div class="stage">','<div class="stage">\n        <span class="stage-label">MY LITTLE FRIEND</span>',1)
s=s.replace('<button class="tool" id="random"', '<button class="tool" id="redo" title="다시 하기" aria-label="다시 하기" disabled>↪</button>\n          <button class="tool" id="random"',1)
s=s.replace('<div class="moves" role="group"', '''<div class="preview-meta"><span class="hint">친구를 톡 누르면 콩콩!</span><button class="pill" id="pause" aria-pressed="false">잠깐 멈춤</button></div>
      <div class="moves" role="group"''',1)
s=s.replace('>걷기</button>', '>종종걸음</button>').replace('>가만히</button>', '>숨 쉬기</button>')
s=s.replace('<button class="done" id="done">완성!</button>', '''<div class="preview-actions" role="group" aria-label="보는 방향"><button class="pill" data-angle="0" aria-pressed="true">앞모습</button><button class="pill" data-angle="0.65" aria-pressed="false">옆모습</button><button class="pill" data-angle="3.14" aria-pressed="false">뒷모습</button></div>
      <button class="done" id="done">이 친구로 완성하기 ♡</button>''')
s=s.replace('<div class="cats" role="tablist" id="cats"></div>', '<div class="editor-head"><h2>취향 한 스푼</h2><span class="hint">눌러서 바로 입혀봐요</span></div>\n      <div class="cats" role="tablist" aria-label="꾸미기 종류" id="cats"></div>')
s=s.replace('<div id="panel" class="editor"', '<div id="panel" role="tabpanel" class="editor"')
s=s.replace('let cat = \'ears\';', "let cat = 'body';")
s=s.replace('const history = [];', 'const history = [], future = [];')
s=s.replace('history.push(JSON.stringify(cfg));', "future.length = 0; $('#redo').disabled = true;\n    history.push(JSON.stringify(cfg));",1)
s=s.replace('if (prev) apply(JSON.parse(prev), true, false);', "if (prev) { future.push(JSON.stringify(cfg)); apply(JSON.parse(prev), true, false); $('#redo').disabled = false; }")
s=s.replace('  /* ---------- 그리기 ---------- */', '''  $('#redo').addEventListener('click', () => {
    const next = future.pop();
    if (next) { history.push(JSON.stringify(cfg)); apply(JSON.parse(next), true, false); $('#undo').disabled = false; }
    $('#redo').disabled = future.length === 0;
  });
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updatePause() { pet.setPaused(paused); $('#pause').setAttribute('aria-pressed', String(paused)); $('#pause').textContent = paused ? '다시 움직이기' : '잠깐 멈춤'; }
  updatePause();
  $('#pause').addEventListener('click', () => { paused = !paused; updatePause(); });
  document.querySelectorAll('[data-angle]').forEach(b => b.addEventListener('click', () => {
    pet.setAngle(Number(b.dataset.angle));
    document.querySelectorAll('[data-angle]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));
  /* ---------- 그리기 ---------- */''')
s=s.replace('mode = b.dataset.mode; pet.setState(mode); pet.setDir(1);', "mode = b.dataset.mode; pet.setState(mode); pet.setDir(1); pet.setAngle(null); paused = false; updatePause();\n    document.querySelectorAll('[data-angle]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.angle === '0')));")
s=s.replace('<span class="ic"><img alt="" src="${shot(cfg, c.view, 96)}"></span>', '')
s=s.replace('data-cat="${c.id}" aria-selected=', 'data-cat="${c.id}" id="cat-${c.id}" aria-controls="panel" tabindex="${c.id === cat ? 0 : -1}" aria-selected=')
s=s.replace('const out = [];', 'const out = [`<h3 class="panel-title">${esc(c.label)} 고르기</h3>`];',1)
s=s.replace("$('#panel').innerHTML = out.join('');", "$('#panel').innerHTML = out.join('');\n    $('#panel').setAttribute('aria-labelledby', 'cat-' + cat);")
s=s.replace('value="${cfg.tune[k]}"></label>', 'value="${cfg.tune[k]}"><output for="t-${k}">${cfg.tune[k].toFixed(2)}</output></label>')
s=s.replace("else cfg = P.normalize(with_({ tune: Object.assign({}, cfg.tune, { [d.tune]: parseFloat(e.target.value) }) }));", "else { cfg = P.normalize(with_({ tune: Object.assign({}, cfg.tune, { [d.tune]: parseFloat(e.target.value) }) })); e.target.nextElementSibling.value = Number(e.target.value).toFixed(2); }")
s=s.replace("if (liveStart) { history.push(liveStart);", "if (liveStart) { future.length = 0; $('#redo').disabled = true; history.push(liveStart);")
s=s.replace("catch (e) { /* 저장 못 해도 괜찮음 */ }", "catch (e) { $('#save-state').textContent = '자동 저장 불가 · 완성 후 파일로 저장해요'; }")
s=s.replace("    renderPanel();\n  });\n\n  $('#panel')", "    renderPanel();\n    document.querySelectorAll('.cat').forEach(x => x.tabIndex = x === b ? 0 : -1);\n  });\n  $('#cats').addEventListener('keydown', e => {\n    if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;\n    e.preventDefault();\n    const buttons = [...document.querySelectorAll('.cat')], i = buttons.indexOf(document.activeElement);\n    const n = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;\n    buttons[n].click(); buttons[n].focus();\n  });\n\n  $('#panel')",1)
# Curated starting points, rendered once rather than rebuilding previews per edit
marker='  /* ---------- 완성 / 내보내기 ---------- */'
insert='''  const PRESETS = [
    ['우유냥', '폭신한 기본 친구', { colors:{ body:'#fffaf7' } }],
    ['복숭곰', '분홍빛 말랑 곰', { ears:'bear', tail:'bunny', whisk:false, mouth:'cat', colors:{body:'#f5a0bb', inner:'#ffd0df'} }],
    ['라일락냥', '차분한 보랏빛', { eyes:'cat', whisk:false, colors:{body:'#b4a0e5'} }],
    ['졸린 토끼', '리본을 단 잠꾸러기', { ears:'bunny', tail:'bunny', eyes:'serious', mouth:'o', whisk:false, acc:['ribbon'], colors:{body:'#fffaf7',accent:'#b6a1df'} }],
    ['살구냥', '따뜻한 햇살 한 조각', { colors:{body:'#ffcf91',inner:'#ffc2ce'} }],
    ['구름 멍', '모자 쓴 작은 친구', { ears:'dog', tail:'dog', eyes:'happy', mouth:'open', whisk:false, acc:['beanie','bell'], colors:{body:'#fff7e9',pattern:'#e8bc85',accent:'#b5a4e5'} }],
  ];
  const presetConfig = ([name,, patch]) => P.normalize({...P.DEFAULT,...patch,name,colors:{...P.DEFAULT.colors,...patch.colors}});
  $('#presets').innerHTML = PRESETS.map((p,i) => `<button class="preset" data-preset="${i}"><img alt="" src="${shot(presetConfig(p),'full',180)}">${esc(p[0])}<small>${esc(p[1])}</small></button>`).join('');
  $('#presets').addEventListener('click', e => { const b = e.target.closest('[data-preset]'); if (b) apply(presetConfig(PRESETS[Number(b.dataset.preset)])); });

'''
s=s.replace(marker,insert+marker)
p.write_text(s)
