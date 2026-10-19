from pathlib import Path
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
marker='  /* ---- 포즈: 머리가 무거워서 뒤뚱뒤뚱 ---- */'
helper='''  // 60% stance / 40% swing: overlapping support prevents airborne walking.
  function walkFoot(phase, side, amount = 1) {
    const q = ((phase / (Math.PI * 2) + side * 0.5) % 1 + 1) % 1;
    if (q < 0.6) return [0, (0.5 - q / 0.6) * 0.16 * amount];
    const u = (q - 0.6) / 0.4, smooth = u*u*(3-2*u);
    return [Math.sin(Math.PI*u) ** 2 * 0.045 * amount, (-0.5 + smooth) * 0.16 * amount];
  }

'''
s=s.replace(marker,helper+marker)
a=s.index('      // 머리가 무거운 아기 걸음:');b=s.index("    } else if (s === 'idle')",a)
s=s[:a]+'''      st.phase = (st.phase || 0) + dt * 0.0085 * tempo;
      const p = st.phase, w = Math.sin(p);
      yaw = st.dir * 0.90;
      foot = [walkFoot(p, 0), walkFoot(p, 1)];
      // Feet own the gait; no whole-character bounce or squash while walking.
      rigY = 0; stretch = 0; roll = 0;
      headRoll = -Math.sin(p - 0.45) * 0.025 * motion;
      nod = Math.sin(2 * p - 0.4) * 0.012;
      armX = [-0.12 - w * 0.16, -0.12 + w * 0.16];
      armZ = [-0.08, 0.08];
      tail = Math.sin(p - 0.6) * 0.18;
      earWig = Math.sin(2 * p - 1.1) * 0.025;
'''+s[b:]
s=s.replace('sx * 0.23 * B, 0.15, 0.13 * B', 'sx * 0.23 * B, 0.033 + 0.13 * (0.75 + 0.25 * B), 0.13 * B')
s=s.replace("const k = 1 - Math.pow(0.0015, dt / 1000);", "const k = 1 - Math.pow(0.0015, dt / 1000);\n    const limbK = 1 - Math.exp(-dt / 65);")
s=s.replace('snap ? 1 : k);\n      L.position.z', "s === 'walk' ? limbK : snap ? 1 : k);\n      L.position.z")
s=s.replace('foot[i][1] * B, snap ? 1 : k)', "foot[i][1] * B, s === 'walk' ? limbK : snap ? 1 : k)")
s=s.replace('sit ? -1.30 : -foot[i][1] * 1.5, snap ? 1 : k', "sit ? -1.30 : s === 'walk' ? 0 : -foot[i][1] * 1.5, s === 'walk' ? limbK : snap ? 1 : k")
s=s.replace('const api = { renderPairImage,', 'const api = { walkFoot, renderPairImage,')
p.write_text(s)
p=Path('work/ppolpet/app/main.js');s=p.read_text().replace('(1.0 + 0.35 * Math.abs(Math.sin(p.timer * 0.175)))', '0.42');p.write_text(s)
p=Path('work/ppolpet/tests/behavior.test.js');s=p.read_text();s+='''
for(let i=0;i<=720;i++) {
 const phase=i/720*Math.PI*2, a=P.walkFoot(phase,0), b=P.walkFoot(phase,1);
 assert(a[0]===0 || b[0]===0,'at least one foot has ground support');
 assert(a[0]>=0 && a[0]<=0.045001 && Math.abs(a[1])<=0.080001);
}
for(const side of [0,1]) {
 const a=P.walkFoot(0,side),b=P.walkFoot(Math.PI*2,side);
 a.forEach((x,i)=>assert(Math.abs(x-b[i])<1e-9,'gait loop must be seamless'));
}
console.log('PASS: walking support, short stride, continuous loop');
''';p.write_text(s)
p=Path('work/ppolpet/README.md');s=p.read_text();s+='''

### 걷기 수정
걷는 동안 몸 전체가 뜨거나 늘어나는 효과를 제거했습니다. 한 발을 지지하는 시간이 보행 주기의 60%가 되도록 짧은 보폭을 만들고, 팔·머리·귀의 흔들림을 줄였습니다. 앉은 자세에서 발이 즉시 꺾이지 않도록 전환을 완화하고, 데스크톱 이동 속도도 줄였습니다.
''';p.write_text(s)
