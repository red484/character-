from pathlib import Path
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
s=s.replace("['swirl', '빙글']", "['swirl', '빙글'], ['orbit', '동글 링']")
s=s.replace("['bowtie', '나비넥타이']", "['bowtie', '나비넥타이'], ['backbow', '커다란 등 리본']")
s=s.replace("eyes: 'round', mouth: 'w'", "eyes: 'sparkle', mouth: 'mo'",1)
s=s.replace('const RX = 0.96, RY = 0.76, RZ = 0.72;', 'const RX = 0.87, RY = 0.76, RZ = 0.64;')
a=s.index('    const cheek = ',s.index('function headShape'));b=s.index('\n  }',a)
s=s[:a]+'''    // Rounded superellipsoid: broad forehead, soft square cheeks, a flat little chin.
    const power = 3.35;
    const radius = Math.pow(Math.pow(Math.abs(x),power)+Math.pow(Math.abs(y),power)+Math.pow(Math.abs(z),power),1/power) || 1;
    const cheek = 1 + 0.025 * Math.exp(-Math.pow((y+0.3)/0.5,2));
    return [x/radius*RX*cheek, y/radius*RY, z/radius*RZ];'''+s[b:]
s=s.replace('const s = PX(0.112 * T.eyeSize);', "const expressive = ['sparkle','swirl','orbit','sleepy'].includes(cfg.eyes) ? 2.1 : cfg.eyes === 'happy' ? 1.4 : 1;\n    const s = PX(0.112 * T.eyeSize * expressive);")
s=s.replace('const W = PX(0.027);', "const W = PX(['sparkle','swirl','orbit','sleepy'].includes(cfg.eyes) ? 0.040 : 0.027);")
s=s.replace("if (T === 'round')", "if (T === 'orbit') { line(W, () => g.ellipse(x,y,s*0.82,s,0,0,Math.PI*2)); line(W,()=>{g.moveTo(x-s*.75,y-s*.1);g.quadraticCurveTo(x,y+s*.4,x+s*.75,y-s*.1);}); }\n        else if (T === 'round')")
s=s.replace("const mx = UX(0), my = VY(MOUTH_LAT), m = PX(0.085);", "const mx = UX(0), my = VY(MOUTH_LAT), m = PX(cfg.mouth === 'mo' ? 0.13 : 0.085);")
s=s.replace('0.45 + 0.5 * (B - 1) + 0.68 * T.head', '0.49 + 0.5 * (B - 1) + 0.68 * T.head')
s=s.replace('sx * 0.14 * B, 0.13, 0.1 * B', 'sx * 0.23 * B, 0.15, 0.13 * B')
s=s.replace('[0.12 * fk, 0.1 * fk, 0.14 * fk]', '[0.145 * fk, 0.12 * fk, 0.17 * fk]')
s=s.replace("const pad = mesh(sphere(16, 10), pinkM, pv, [0, -0.115, 0.05], [0.06, 0.012, 0.07]);", """const pad = mesh(sphere(20, 14), pinkM, pv, [0, -0.137, 0.045], [0.073, 0.014, 0.069]);
      for (const [tx,tz] of [[-0.075,0.10],[0,0.145],[0.075,0.10]]) mesh(sphere(14,10),pinkM,pv,[tx,-0.119,tz],[0.028,0.014,0.032]);""")
s=s.replace("} else if (s === 'sit') {", "} else if (s === 'perch') {\n      sit = true; rigY = -0.025; headRoll = Math.sin(t*0.0018)*0.06;\n      armZ = [0.25,-0.25]; armX = [-0.35,-0.35]; tail = Math.sin(t*.002)*.2;\n    } else if (s === 'sit') {")
s=s.replace('sit ? -1.2 : -foot[i][1] * 1.5', 'sit ? -1.30 : -foot[i][1] * 1.5')
s=s.replace("const og = geo(earGeo(THREE, big ? 0.34 : 0.32, big ? 0.5 : 0.42, 0.2, big ? 0.82 : 0.72));", "const og = geo(earGeo(THREE, big ? 0.31 : 0.28, big ? 0.56 : 0.46, 0.16, big ? 0.86 : 0.79));")
s=s.replace('g.position.set(p.x * 1.18, p.y + 0.13, -0.06)', 'g.position.set(p.x * 1.04, p.y + 0.015, -0.09)')
# Fuller draped bow behind the head, with pendant ribbon tails.
marker="    if (has('bowtie')) {"
insert="""    if (has('backbow')) {
      const bow = new THREE.Group(); bow.position.set(0,0.50*B,-0.24); rig.add(bow);
      for (const side of [-1,1]) {
        mesh(sphere(32,24),accM,bow,[side*.32,0.07,0],[.32,.27,.10],[0,0,side*.28]);
        mesh(geo(new THREE.ConeGeometry(.16,.55,3)),accM,bow,[side*.18,-.30,0],[1,1,.35],[0,0,side*.18]);
      }
      mesh(sphere(24,18),accM,bow,[0,0.06,.02],[.13,.15,.12]);
    }
"""
s=s.replace(marker,insert+marker)
s=s.replace("roughness: 0.83, envMapIntensity: 0.45", "roughness: 0.76, envMapIntensity: 0.32")
s=s.replace("'#d5d5ec', 0.75", "'#c8bddb', 0.55").replace("'#fff9f5', 1.5", "'#fff9f5', 1.25")
s=s.replace('renderer.toneMappingExposure = 1.08', 'renderer.toneMappingExposure = 1.0')
s=s.replace("state = 'idle')", "state = 'perch')")
s=s.replace("pose(b,{state:'idle',dir:i? -1:1}", "pose(b,{state:'perch',dir:i? -1:1}")
p.write_text(s)
p=Path('work/ppolpet/web/maker.src.html');s=p.read_text()
s=s.replace('<button class="pill" data-mode="sit"', '<button class="pill" data-mode="perch" aria-pressed="false">젤리 앉기</button>\n        <button class="pill" data-mode="sit"',1)
s=s.replace("['우유냥', '폭신한 기본 친구', { colors:{ body:'#fffaf7' } }]", "['모찌 천사', '커다란 눈 · 등 리본', { eyes:'sparkle', mouth:'mo', acc:['halo','backbow'], colors:{ body:'#fffaf7',accent:'#9a8bc9' } }]")
s=s.replace("['복숭곰', '분홍빛 말랑 곰', { ears:'bear', tail:'bunny', whisk:false, mouth:'cat'", "['졸린 곰', '반달 눈 · 통통 젤리', { ears:'bear', tail:'bunny', eyes:'sleepy', whisk:false, mouth:'cat'")
s=s.replace("['라일락냥', '차분한 보랏빛', { eyes:'cat', whisk:false, colors:{body:'#b4a0e5'} }]", "['별빛냥', '동그란 링 눈', { eyes:'orbit', mouth:'open', whisk:false, colors:{body:'#8c8ac6',eye:'#efd496'} }]")
s=s.replace("['살구냥', '따뜻한 햇살 한 조각', { colors:", "['살구냥', '따뜻한 햇살 한 조각', { eyes:'round',mouth:'w', colors:")
s=s.replace("personality:'affectionate',colors:", "personality:'affectionate',eyes:'sleepy',mouth:'cat',colors:")
p.write_text(s)
