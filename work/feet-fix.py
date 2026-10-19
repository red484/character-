from pathlib import Path
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
s=s.replace('      const fk = 0.75 + 0.25 * B;\n      const foot = mesh', '''      const fk = 0.75 + 0.25 * B;
      const paw = new THREE.Group(); pv.add(paw); pv.userData.paw = paw;
      const shin = mesh(sphere(24,18),bodyM,pv,[0,0.10,-0.015],[0.073*B,0.14*B,0.075*B]);
      pv.userData.shin = shin;
      const foot = mesh''')
a=s.index('      const foot = mesh',s.index('const paw ='));b=s.index('      legs.push(pv);',a)
s=s[:a]+s[a:b].replace(', pv,', ', paw,').replace(',pv,', ',paw,')+s[b:]
a=s.index('    P.legs.forEach((L, i) => {');b=s.index('    P.arms.forEach',a)
s=s[:a]+'''    // Sitting displays the soles; standing uses small forward-facing paws beneath short legs.
    P.hips.position.y = lerp(P.hips.position.y,(sit ? 0.29 : 0.36)*B,limbK);
    P.body.scale.y = lerp(P.body.scale.y,(sit ? 0.30 : 0.22)*B,limbK);
    P.legs.forEach((L, i) => {
      const b = L.userData.base, paw = L.userData.paw;
      const contact = sit ? b.y : b.y * 0.72;
      paw.scale.x = lerp(paw.scale.x,sit ? 1 : 0.70,limbK);
      paw.scale.y = lerp(paw.scale.y,sit ? 1 : 0.72,limbK);
      paw.scale.z = lerp(paw.scale.z,sit ? 1 : 0.65,limbK);
      L.userData.shin.visible = !sit;
      L.position.x = lerp(L.position.x,b.x*(sit ? 1 : 0.65),limbK);
      L.position.y = lerp(L.position.y,contact+foot[i][0],limbK);
      L.position.z = lerp(L.position.z,(sit ? b.z+0.12 : 0.035*B)+foot[i][1]*B,limbK);
      // Rotate only the seated paw, never present the sole as a walking leg.
      L.rotation.x = lerp(L.rotation.x,0,limbK);
      paw.rotation.x = lerp(paw.rotation.x,sit ? -1.30 : 0,limbK);
    });
'''+s[b:]
p.write_text(s)
