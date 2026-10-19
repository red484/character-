from pathlib import Path
p=Path('work/ppolpet/shared/pet-render.js');s=p.read_text()
s=s.replace("    v: 1, name: '뽈뽈이',", "    v: 2, name: '뽈뽈이', personality: 'gentle', relationship: null,")
s=s.replace('function normalize(raw) {','function normalize(raw, allowRelationship = true) {')
s=s.replace('      v: 1,', '''      v: 2,
      personality: ['gentle','playful','shy','affectionate'].includes(r.personality) ? r.personality : 'gentle',
      relationship: allowRelationship && r.relationship && r.relationship.partner && ['friends','family','sweethearts'].includes(r.relationship.kind)
        ? {kind:r.relationship.kind, partner:normalize(r.relationship.partner, false)} : null,''',1)
# Marshmallow form: broaden lower cheeks, soft bottom and a little wider bean body.
s=s.replace('(1 + 0.06 * cheek)', '(1 + 0.115 * cheek)').replace('0.28 * B, 0.25 * B, 0.25 * B','0.30 * B, 0.25 * B, 0.27 * B')
s=s.replace("blush: '#ffacc6'", "blush: '#ffa5c3'")
s=s.replace('PX(0.13 * T.blushSize)', 'PX(0.15 * T.blushSize)')
s=s.replace('grd.addColorStop(0.7, C.blush + \'ee\')', "grd.addColorStop(0.75, C.blush + 'ee')")
s=s.replace('const s = st.state;', '''const temperament = built.cfg.personality;
    const tempo = {gentle:0.86, playful:1.16, shy:0.9, affectionate:0.98}[temperament];
    const s = st.state;
    const motion = {gentle:0.8, playful:1.2, shy:0.7, affectionate:1.0}[temperament];''')
s=s.replace('dt * 0.0105', 'dt * 0.0105 * tempo')
s=s.replace('roll = w * 0.075;', 'roll = w * 0.095 * motion;')
s=s.replace('stretch = (Math.abs(c) - 0.5) * 0.07;', 'stretch = (Math.abs(c) - 0.5) * 0.11 * motion;')
s=s.replace('earWig = Math.sin(2 * p - 1.2) * 0.09;', 'earWig = Math.sin(2 * p - 1.2) * 0.13;')
s=s.replace("} else if (s === 'wave') {", "} else if (s === 'nuzzle') {\n      yaw = st.dir * 0.23; roll = -st.dir * 0.055; headRoll = -st.dir * 0.13; eyes = 'happy';\n      stretch = Math.sin(t * 0.0035) * 0.025; armZ = [-0.6, 0.6]; earWig = Math.sin(t * 0.006) * 0.05;\n    } else if (s === 'wave') {")
s=s.replace("s === 'hop' || s === 'wave'", "s === 'hop' || s === 'wave' || s === 'nuzzle'")
s=s.replace('const squash = Math.sin(sq * Math.PI) * 0.18 - stretch;', '''const squash = Math.sin(sq * Math.PI) * 0.18 - stretch;
    if (s === 'idle' && temperament === 'shy') { headRoll -= 0.045; nod += 0.035; }
    if (s === 'idle' && temperament === 'affectionate') tail *= 1.7;''')
# Pure shared behavior rules used by both workshop and desktop.
marker='  const api = {'
helpers='''  const PERSONALITIES = {
    gentle: {label:'느긋이', description:'천천히 걷고, 자주 꾸벅 졸아요.', speed:0.72, weights:[24,30,10,6,10,20]},
    playful: {label:'장난꾸러기', description:'종종 달려가고, 신나게 콩콩 뛰어요.', speed:1.2, weights:[42,10,8,27,10,3]},
    shy: {label:'수줍이', description:'조심조심 다가가 작게 인사해요.', speed:0.8, weights:[20,30,25,5,15,5]},
    affectionate: {label:'애교쟁이', description:'인사를 좋아하고, 곁에 꼭 붙어 있어요.', speed:0.95, weights:[22,15,8,15,35,5]},
  };
  function chooseAction(cfg, r = Math.random()) {
    const weights = PERSONALITIES[cfg.personality || 'gentle'].weights;
    const actions = ['walk','idle','look','hop','wave','sit'];
    let value = Math.max(0,Math.min(0.999999,r)) * 100;
    for (let i=0;i<weights.length;i++) { value -= weights[i]; if (value < 0) return actions[i]; }
    return 'idle';
  }
  function socialAction(kind, a, b) {
    if (a === 'shy' || b === 'shy') return 'wave';
    return kind === 'sweethearts' ? 'nuzzle' : kind === 'family' ? 'sit' : 'hop';
  }

'''
s=s.replace(marker,helpers+marker).replace('const api = { OPTIONS,', 'const api = { PERSONALITIES, chooseAction, socialAction, OPTIONS,')
p.write_text(s)
