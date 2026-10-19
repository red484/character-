from pathlib import Path
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
s=s.replace('p.y + 0.04, -0.06','p.y + 0.13, -0.06')
s=s.replace("if (eyeMode === 'closed')", "if (eyeMode === 'happy') line(W, () => { g.moveTo(x - s * 0.85, y + s * 0.2); g.quadraticCurveTo(x, y - s, x + s * 0.85, y + s * 0.2); });\n      else if (eyeMode === 'closed')",1)
s=s.replace("yaw = 0; headRoll = 0.08;", "yaw = 0; headRoll = 0.06 + Math.sin(t * 0.004) * 0.035; nod = Math.sin(t * 0.004) * 0.045; eyes = 'happy';")
s=s.replace('rigY = air * 0.28;', "eyes = air > 0.1 ? 'happy' : 'normal';\n      rigY = air * 0.23;")
s=s.replace('catcher.receiveShadow = true;', 'catcher.receiveShadow = false;')
# Shared 3D heart sprites appear for greetings and hopping in web and desktop.
marker='    /* ---- 바닥: 부드러운 그림자 ---- */'
insert='''    const heartTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const g = cv.getContext('2d');
      g.fillStyle = '#f4a3bd'; g.beginPath(); g.moveTo(64, 108);
      g.bezierCurveTo(12, 73, 9, 52, 22, 32); g.bezierCurveTo(35, 14, 57, 24, 64, 39);
      g.bezierCurveTo(74, 22, 96, 16, 109, 34); g.bezierCurveTo(125, 59, 102, 82, 64, 108); g.fill();
      const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; return keep(tex);
    })();
    const hearts = [-1, 1].map(side => {
      const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({map:heartTex, transparent:true, depthWrite:false})));
      sp.userData.side = side; sp.visible = false; char.add(sp); return sp;
    });

'''
s=s.replace(marker,insert+marker).replace('setFace, zs, B, halo:', 'setFace, zs, hearts, B, halo:')
s=s.replace('    P.zs.forEach((z, i) => {', '''    P.hearts.forEach((heart, i) => {
      const active = s === 'hop' || s === 'wave'; heart.visible = active;
      if (active) {
        const ph = (((t - (st.enteredAt || 0)) / 1500) + i * 0.45) % 1;
        heart.position.set(heart.userData.side * (0.86 + ph * 0.12), 1.5 + ph * 0.58, 0.45);
        heart.scale.setScalar(0.13 + Math.sin(ph * Math.PI) * 0.06);
        heart.material.opacity = Math.sin(ph * Math.PI) * 0.85;
      }
    });
    P.zs.forEach((z, i) => {''')
p.write_text(s)
p=Path('work/ppolpet/app/main.js');s=p.read_text().replace('p.timer = 41 *', 'p.timer = 55 *').replace('p.x += p.dir * 1.6;', 'p.x += p.dir * (1.0 + 0.35 * Math.abs(Math.sin(p.timer * 0.175)));');p.write_text(s)
p=Path('work/ppolpet/web/maker.src.html');s=p.read_text()
s=s.replace('<div id="pet" role="img" aria-label="꾸민 캐릭터"', '<div id="pet" role="button" tabindex="0" aria-label="친구를 톡 눌러 콩콩 뛰게 하기"')
s=s.replace("$('#pet').addEventListener('click', () => { pet.setState('hop'); clearTimeout(hopTimer); hopTimer = setTimeout(() => pet.setState(mode), 1400); });", "$('#pet').addEventListener('click', () => { if (paused) return; pet.setState('hop'); clearTimeout(hopTimer); hopTimer = setTimeout(() => pet.setState(mode), 1840); });\n  $('#pet').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#pet').click(); } });")
s=s.replace("mode = b.dataset.mode;", "clearTimeout(hopTimer); mode = b.dataset.mode;")
# Keep category keyboard focus stable during edits. Category art no longer depends on cfg.
s=s.replace('renderPanel(); renderCats();', 'renderPanel();')
s=s.replace("if (d.tune) renderCats();", "")
s=s.replace("body: ['#ffffff',", "body: ['#fffaf7', '#f5a0bb', '#b4a0e5', '#ffcf91', '#ffffff',")
# Surface name editing in main flow and importing without digging into completion.
s=s.replace('<div class="editor-head"><h2>', '<div class="name-row"><label for="pet-name">친구 이름</label><input id="pet-name" maxlength="20" autocomplete="off" placeholder="이름을 지어 주세요"></div>\n      <div class="editor-head"><h2>',1)
s=s.replace('<footer>뽈뽈펫', '<footer><button class="pill" id="import-main">저장한 코드 불러오기</button><br><br>뽈뽈펫',1)
s=s.replace("$('#nametag').textContent = cfg.name;", "$('#nametag').textContent = cfg.name; $('#pet-name').value = cfg.name;",1)
s=s.replace("  $('#name').addEventListener('input',", "  $('#pet-name').addEventListener('change', e => apply(with_({name:e.target.value})));\n  $('#import-main').addEventListener('click', () => $('#load-code').click());\n  $('#name').addEventListener('input',")
s=s.replace("$('#nametag').textContent = cfg.name;\n    const code", "$('#nametag').textContent = cfg.name; $('#pet-name').value = cfg.name;\n    const code")
p.write_text(s)
