/* 뽈뽈펫 초SD 피규어 캐릭터 렌더러 — 웹 공방과 데스크톱 앱이 같이 씀 (three.js r149 필요: window.THREE) */
(function (root) {
  'use strict';

  /* ================= 설정 (THREE 없이도 동작: 앱 메인 프로세스에서 씀) ================= */
  const OPTIONS = {
    ears: [['cat', '고양이'], ['dog', '강아지'], ['bunny', '토끼'], ['bear', '곰'], ['fox', '여우'], ['mouse', '쥐'], ['none', '없음']],
    tail: [['pom', '동그란 꼬리'], ['cloud', '구름 꼬리'], ['cat', '고양이'], ['fox', '여우'], ['bunny', '토끼'], ['dog', '강아지'], ['none', '없음']],
    eyes: [['jewel', '반짝 별눈'], ['drowsy', '나른한 눈'], ['round', '콩'], ['dot', '점'], ['sparkle', 'の'], ['cat', '세로선'], ['serious', '일자'], ['happy', '웃음'], ['sleepy', '졸음'], ['swirl', '빙글'], ['orbit', '동글 링']],
    mouth: [['w', 'ω'], ['cat', 'ㅅ'], ['o', 'o'], ['mo', 'も'], ['open', '▽'], ['grin', '활짝'], ['flat', '一']],
    pattern: [['none', '없음'], ['tabby', '이마 줄무늬'], ['patch', '눈 얼룩'], ['muzzle', '입가 하양'], ['spot', '이마 점']],
    acc: [['ribbon', '리본'], ['crown', '왕관'], ['glasses', '안경'], ['beanie', '비니'], ['flower', '꽃'], ['star', '별핀'], ['bell', '방울'],
      ['sprout', '새싹'], ['halo', '천사링'], ['horns', '뿔'], ['headphones', '헤드폰'], ['scarf', '목도리'], ['bowtie', '나비넥타이'], ['backbow', '커다란 등 리본']],
  };
  // 슬라이더로 조절하는 비율·위치 [기본, 최소, 최대, 라벨, 단계]
  const TUNE = {
    head:    [1, 0.8, 1.25, '머리 크기', 0.01],
    wide:    [1, 0.85, 1.2, '머리 가로', 0.01],
    ear:     [1, 0.6, 1.5, '귀 크기', 0.01],
    earTilt: [0, -0.3, 0.4, '귀 벌어짐', 0.01],
    eyeSize: [1, 0.6, 1.7, '눈 크기', 0.01],
    eyeGap:  [1, 0.7, 1.4, '눈 사이', 0.01],
    eyeY:    [0, -0.15, 0.15, '눈 높이', 0.005],
    mouthY:  [0, -0.1, 0.12, '입 높이', 0.005],
    blushSize: [1, 0.6, 1.6, '볼터치 크기', 0.01],
    body:    [1, 0.75, 1.35, '몸 크기', 0.01],
  };
  const COLOR_LABELS = { body: '몸', inner: '귀 안쪽 · 젤리', belly: '배 · 하양', pattern: '무늬', eye: '눈', blush: '볼터치', accent: '소품', accent2: '소품 2', line: '외곽선' };
  const DEFAULT = {
    v: 2, name: '뽈뽈이', personality: 'gentle', relationship: null,
    ears: 'cat', tail: 'cat', eyes: 'sparkle', mouth: 'mo', pattern: 'none',
    nose: false, whisk: true, belly: false, socks: false, blush: true, outline: false, acc: [],
    colors: { body: '#fffaf7', inner: '#ffc0d2', belly: '#ffffff', pattern: '#d7a64a', eye: '#1c171c', blush: '#ffa5c3', accent: '#7f87c9', accent2: '#ffd36e', line: '#2a2228' },
    tune: Object.fromEntries(Object.entries(TUNE).map(([k, v]) => [k, v[0]])),
  };
  const HEX = /^#[0-9a-f]{6}$/i;
  const pick = (list, v, d) => (list.some(([k]) => k === v) ? v : d);

  function normalize(raw, allowRelationship = true) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const c = r.colors && typeof r.colors === 'object' ? r.colors : {};
    const colors = {};
    for (const k of Object.keys(DEFAULT.colors)) colors[k] = typeof c[k] === 'string' && HEX.test(c[k]) ? c[k].toLowerCase() : DEFAULT.colors[k];
    const accOk = OPTIONS.acc.map(([k]) => k);
    const b = (v, d) => (v === undefined ? d : !!v);
    return {
      v: 2,
      ...(r.design === 'starlight-v1' ? {design:'starlight-v1'} : {}),
      personality: ['gentle','playful','shy','affectionate'].includes(r.personality) ? r.personality : 'gentle',
      relationship: allowRelationship && r.relationship && r.relationship.partner && ['friends','family','sweethearts'].includes(r.relationship.kind)
        ? {kind:r.relationship.kind, partner:normalize(r.relationship.partner, false)} : null,
      name: (typeof r.name === 'string' ? r.name : DEFAULT.name).replace(/[\u0000-\u001f]/g, '').slice(0, 20) || DEFAULT.name,
      ears: pick(OPTIONS.ears, r.ears, DEFAULT.ears), tail: pick(OPTIONS.tail, r.tail, DEFAULT.tail),
      eyes: pick(OPTIONS.eyes, r.eyes, DEFAULT.eyes), mouth: pick(OPTIONS.mouth, r.mouth, DEFAULT.mouth),
      pattern: pick(OPTIONS.pattern, r.pattern, DEFAULT.pattern),
      nose: b(r.nose, DEFAULT.nose), whisk: b(r.whisk, DEFAULT.whisk), belly: b(r.belly, DEFAULT.belly), socks: !!r.socks,
      blush: b(r.blush, DEFAULT.blush), outline: !!r.outline,
      acc: Array.isArray(r.acc) ? [...new Set(r.acc.filter((a) => accOk.includes(a)))] : [],
      colors,
      tune: Object.fromEntries(Object.entries(TUNE).map(([k, [d, lo, hi]]) => {
        const v = r.tune && typeof r.tune[k] === 'number' && isFinite(r.tune[k]) ? r.tune[k] : d;
        return [k, (Math.round(Math.min(hi, Math.max(lo, v)) * 1000) / 1000) || 0];
      })),
    };
  }
  function encode(cfg) {
    const json = JSON.stringify(normalize(cfg));
    const b64 = typeof Buffer !== 'undefined' ? Buffer.from(json, 'utf8').toString('base64') : btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(code) {
    const s = String(code || '').trim().replace(/^.*[?#&]c=/, '').replace(/[^A-Za-z0-9_-]/g, '');
    if (!s) throw new Error('empty');
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof Buffer !== 'undefined' ? Buffer.from(b64, 'base64').toString('utf8') : decodeURIComponent(escape(atob(b64 + '==='.slice((b64.length + 3) % 4))));
    return normalize(JSON.parse(json));
  }
  function randomize() {
    const r = (list) => list[Math.floor(Math.random() * list.length)][0];
    const rr = (a, b) => a + Math.random() * (b - a);
    const palettes = [
      ['#f3c9a0', '#ff9fb4', '#fff6ec', '#c98a5a'], ['#f7f3ef', '#ffb3c4', '#ffffff', '#c9c0b8'],
      ['#b6a5e6', '#ff9fb4', '#e9e6ff', '#3f4377'], ['#f4a2b9', '#ff9fb4', '#ffd9de', '#8e3a4b'],
      ['#f2a15a', '#ffc2b0', '#fff3e6', '#c46a2a'], ['#a9c6ec', '#ffb6cf', '#f2f7ff', '#6d8fc0'],
      ['#cfe3a3', '#ffc0a8', '#f8fde9', '#8aa75a'], ['#f4dc8a', '#ffadad', '#fff9e3', '#c9a43a'],
      ['#c8b2e8', '#ffb7d0', '#f7f2ff', '#8f75b8'], ['#ddd9ef', '#ff9fb4', '#efe9f2', '#2c2832'],
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    const accents = ['#ff6b8b', '#5b8cff', '#ffb547', '#59c49a', '#a374ff', '#ff7a45'];
    return normalize({
      ears: r(OPTIONS.ears.slice(0, 6)), tail: r(OPTIONS.tail), eyes: r(OPTIONS.eyes), mouth: r(OPTIONS.mouth),
      pattern: Math.random() < 0.5 ? 'none' : r(OPTIONS.pattern), nose: Math.random() < 0.25, whisk: Math.random() < 0.6,
      belly: Math.random() < 0.4, socks: Math.random() < 0.3, blush: true, outline: false,
      acc: OPTIONS.acc.map(([k]) => k).filter(() => Math.random() < 0.15).slice(0, 1),
      colors: { body: p[0], inner: p[1], belly: p[2], pattern: p[3], eye: '#2b2230', blush: '#ff8fa8', accent: accents[Math.floor(Math.random() * accents.length)], accent2: accents[Math.floor(Math.random() * accents.length)], line: '#4a3426' },
      tune: { head: rr(0.92, 1.12), wide: rr(0.92, 1.1), ear: rr(0.8, 1.25), earTilt: rr(-0.1, 0.2), eyeSize: rr(0.85, 1.3), eyeGap: rr(0.85, 1.15), eyeY: rr(-0.05, 0.05), body: rr(0.85, 1.15) },
    });
  }

  /* ================= 3D (초SD 비닐 피규어) =================
     비율: 부드러운 볼과 배 모양 몸통, 짧은 팔다리의 소프트 토이.
     얼굴은 기호처럼 단순하게, 머리 아래쪽 가운데에 몰아서. */
  const RX = 0.96, RY = 0.79, RZ = 0.68;  // 머리 반지름 (가로, 세로, 앞뒤)
  const HEAD_Y = 1.13;                   // 머리 중심 높이 → 머리 0.52 ~ 1.96, 전체 키 약 2.0
  const FOOT = 0.113;                    // 창 아래에서 발바닥까지 비율

  function makeCtx() {
    const THREE = root.THREE;
    if (!THREE) throw new Error('THREE not loaded');
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    return THREE;
  }

  // 머리 모양: 구를 옆으로 넓히고, 볼(아래쪽 가운데)을 살짝 부풀린 찹쌀떡
  function headShape(x, y, z, design) {
    if (design === 'starlight-v1') {
      // PNG front landmarks: broad low cheeks, a curved dome and a compressed chin.
      // The quadratic lower latitude mapping changes curvature, not just sphere scale.
      const cheek = Math.exp(-Math.pow((y + .38) / .53, 2));
      const hy = y < 0 ? .80 * y + .20 * y * y : .80 * y + .02 * y * y * y;
      return [x * .96 * (1 + .085 * cheek), hy, z * .68 * (1 + .06 * cheek + .16 * Math.min(0,y) ** 2)];
    }
    // Original mint reference: gently wide cheeks and a softly compressed chin.
    // Keep smooth ellipsoidal contours; avoid a ball or rounded-box silhouette.
    const cheek = Math.exp(-Math.pow((y + 0.28) / 0.62, 2));
    const chin = y < 0 ? 1 - 0.10 * y * y : 1 - 0.02 * y * y;
    return [x * RX * (1 + 0.045 * cheek), y * RY * chin, z * RZ * (1 + 0.025 * cheek)];
  }
  function headPoint(THREE, lon, lat, lift = 0, design) {
    const ux = Math.sin(lon) * Math.cos(lat), uy = Math.sin(lat), uz = Math.cos(lon) * Math.cos(lat);
    const [x, y, z] = headShape(ux, uy, uz, design);
    const n = new THREE.Vector3(x / (RX * RX), y / (RY * RY), z / (RZ * RZ)).normalize();
    return { p: new THREE.Vector3(x, y, z).addScaledVector(n, lift), n };
  }
  function placeOn(THREE, obj, lon, lat, lift) {
    const { p, n } = headPoint(THREE, lon, lat, lift);
    obj.position.copy(p);
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return obj;
  }
  // Sphere UV seams duplicate vertices. Average only coincident normals,
  // retaining UVs, to remove a false hard edge in the 90-degree lighting.
  function smoothSeamNormals(g) {
    g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,groups=new Map();
    for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}
    for(const ids of groups.values()){if(ids.length<2)continue;let x=0,y=0,z=0;for(const i of ids){x+=n.getX(i);y+=n.getY(i);z+=n.getZ(i);}const d=Math.hypot(x,y,z)||1;for(const i of ids)n.setXYZ(i,x/d,y/d,z/d);}
    n.needsUpdate=true;return g;
  }
  function headGeo(THREE, design) {
    const g = new THREE.SphereGeometry(1, 72, 54);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const [x, y, z] = headShape(p.getX(i), p.getY(i), p.getZ(i), design); p.setXYZ(i, x, y, z); }
    g.computeVertexNormals();
    return g;
  }
  // 위로 갈수록 좁아지는 둥근 귀
  function earGeo(THREE, w, h, d, point) {
    const g = new THREE.SphereGeometry(1, 40, 28);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), t = (y + 1) / 2, k = 1 - point * Math.pow(t, 1.4);
      p.setXYZ(i, p.getX(i) * k * w, (y + 1) * 0.5 * h, p.getZ(i) * k * d);
    }
    g.computeVertexNormals();
    return g;
  }

  function starlightEarGeo(THREE) {
    const g = new THREE.SphereGeometry(1, 48, 36), p = g.attributes.position;
    for (let i=0;i<p.count;i++) {
      const y=p.getY(i), t=(y+1)/2, taper=1-.54*t*t*(3-2*t);
      p.setXYZ(i,p.getX(i)*.30*taper,t*.45,p.getZ(i)*.18*taper);
    }
    g.computeVertexNormals(); return g;
  }
  function starlightArmGeo(THREE, side) {
    // Curve the shoulder into the torso; only the small lower paw protrudes.
    // This buries the root instead of leaving a separate ellipsoid beside the body.
    const g=new THREE.SphereGeometry(1,40,32),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const y=p.getY(i),t=(y+1)/2;
      const radius=.079+.041*t;
      p.setXYZ(i,p.getX(i)*radius-side*.09*t*t,
        -.23+.32*t,p.getZ(i)*(.085+.025*t)+.055+.025*(1-t));
    }
    g.computeVertexNormals();return g;
  }
  function starlightBodyGeo(THREE) {
    const g=new THREE.SphereGeometry(1,48,36),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const y=p.getY(i), shoulder=1-.18*Math.max(0,y), belly=1+.06*Math.exp(-Math.pow((y+.3)/.6,2));
      p.setXYZ(i,p.getX(i)*shoulder*belly,y,p.getZ(i)*shoulder);
    }
    g.computeVertexNormals();return g;
  }

  function starlightStandBodyGeo(THREE) {
    const g=new THREE.SphereGeometry(1,48,36),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      // Squat mochi cross-sections: broad middle, tucked shoulder, shallow belly.
      // Raise the middle of the underside so the two legs emerge from the trunk.
      const shoulder=1-.22*Math.max(0,y);
      const sy=Math.sign(y)*Math.pow(Math.abs(y),.90);
      const crotch=.24*Math.pow(Math.max(0,-y),3)*Math.exp(-Math.pow(x/.46,2));
      // Ease only the middle belly; preserve shoulder and lower mochi contour.
      const belly=Math.exp(-Math.pow(y/.45,2));
      // Broad, low-amplitude correction avoids pinching a waist into the mochi trunk.
      const middle=Math.exp(-Math.pow(y/.65,2));
      p.setXYZ(i,x*shoulder*(1-.02*belly)*(1-.04*middle),sy+crotch,
        z*(1-.12*Math.max(0,-y))*(1-.04*belly)*(1-.05*middle)*(z<0?1+.32*Math.pow(-z,1.2):1));
    }
    g.computeVertexNormals();return g;
  }
  function starlightStandArmGeo(THREE,side) {
    const g=new THREE.SphereGeometry(1,40,32),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const t=(p.getY(i)+1)/2;
      // Short curved mitten with its wide root buried in the shoulder.
      const radius=.115+.035*(1-t);
      p.setXYZ(i,p.getX(i)*radius-side*.10*t*t+side*.045*(1-t),
        .065-(.29*1.12)*(1-t),p.getZ(i)*.12+.02);
    }
    g.computeVertexNormals();return g;
  }
  function starlightStandFootGeo(THREE) {
    const g=new THREE.SphereGeometry(1,40,32),p=g.attributes.position;
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      // Short upright bean with a broad soft sole, not a shoe attached to a shin.
      const sy=Math.sign(y)*Math.pow(Math.abs(y),.48);
      const upper=1+.14*Math.max(0,y);
      p.setXYZ(i,x*upper,sy,z*.90);
    }
    g.computeVertexNormals();return g;
  }

  /* ---- 얼굴: 머리 전체 텍스처(경위도)에 기호처럼 그림 ---- */
  const TW = 1024, TH = 512;
  const UX = (lon) => (0.25 + lon / (2 * Math.PI)) * TW;
  const VY = (lat) => (0.5 - lat / Math.PI) * TH;
  const PX = (rad) => (rad / (2 * Math.PI)) * TW;
  const EYE_LON = 0.43, EYE_LAT = -0.22, MOUTH_LAT = -0.36;

  function drawHead(cfg, eyeMode, mouthMode, omitSide = 0) {
    const C = cfg.colors, T = cfg.tune;
    const star = cfg.design === 'starlight-v1';
    const EYE_LON = (star ? .44 : .43) * T.eyeGap, EYE_LAT = -.22 + T.eyeY, MOUTH_LAT = (star ? -.30 : -.36) + T.mouthY;
    const cv = document.createElement('canvas'); cv.width = TW; cv.height = TH;
    const g = cv.getContext('2d');
    g.fillStyle = C.body; g.fillRect(0, 0, TW, TH);
    g.lineCap = 'round'; g.lineJoin = 'round';
    const ell = (x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
    const line = (w, fn, col = C.eye) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); fn(); g.stroke(); };

    // 무늬
    if (cfg.pattern === 'muzzle') ell(UX(0), VY(-0.46), PX(0.42), PX(0.26), C.belly);
    if (cfg.pattern === 'patch') ell(UX(EYE_LON), VY(EYE_LAT + 0.02), PX(0.24), PX(0.22), C.pattern);
    if (cfg.pattern === 'spot') ell(UX(0), VY(0.5), PX(0.09), PX(0.12), C.pattern);
    if (cfg.pattern === 'tabby') { g.fillStyle = C.pattern; for (const l of [-0.18, 0, 0.18]) { g.beginPath(); g.moveTo(UX(l - 0.05), VY(1.3)); g.lineTo(UX(l + 0.05), VY(1.3)); g.lineTo(UX(l), VY(0.5)); g.closePath(); g.fill(); } }

    // 볼터치 (그래픽: 분홍 타원 + 흰 빗금 3개)
    if (cfg.blush) for (const s of [-1, 1]) {
      if(s===omitSide)continue;
      const x = UX(s * (0.68 + (T.eyeGap - 1) * 0.3)), y = VY((star ? -.35 : -.34) + T.eyeY * 0.6), r = PX(0.15 * T.blushSize);
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, C.blush); grd.addColorStop(0.75, C.blush + 'ee'); grd.addColorStop(1, C.blush + '00');
      g.fillStyle = grd; g.beginPath(); g.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2); g.fill();
    }

    const W = PX(star ? .043 : ['sparkle','swirl','orbit','sleepy'].includes(cfg.eyes) ? 0.052 : 0.027);           // 선 두께
    const expressive = ['jewel','sparkle','swirl','orbit','sleepy'].includes(cfg.eyes) ? 2.1 : cfg.eyes === 'happy' ? 1.4 : 1;
    const s = PX(0.112 * T.eyeSize * expressive);            // 눈 크기 단위 (작게, 얼굴은 비워두기)
    for (const side of [-1, 1]) {
      if(side===omitSide)continue;
      const x = UX(side * EYE_LON), y = VY(EYE_LAT);
      if (eyeMode === 'wink' && side === 1) line(W,()=>{g.moveTo(x-s*.8,y);g.quadraticCurveTo(x,y-s*.7,x+s*.8,y);});
      else if (eyeMode === 'happy') line(W, () => { g.moveTo(x - s * 0.85, y + s * 0.2); g.quadraticCurveTo(x, y - s, x + s * 0.85, y + s * 0.2); });
      else if (eyeMode === 'closed') line(W, () => { g.moveTo(x - s, y - s * 0.2); g.quadraticCurveTo(x, y + s * 0.8, x + s, y - s * 0.2); });
      else if (eyeMode === 'blink') line(W, () => { g.moveTo(x - s * 0.8, y); g.lineTo(x + s * 0.8, y); });
      else if (eyeMode === 'squint') line(W, () => { g.moveTo(x + side * s * 0.8, y - s * 0.8); g.lineTo(x - side * s * 0.7, y); g.lineTo(x + side * s * 0.8, y + s * 0.8); });
      else if (eyeMode === 'wide') { line(W * 0.8, () => g.ellipse(x, y, s * 0.9, s, 0, 0, Math.PI * 2)); ell(x, y, s * 0.28, s * 0.32, C.eye); }
      else {
        const T = cfg.eyes;
        if (T === 'jewel') {
          ell(x,y,s*.83,s,C.eye); ell(x-s*.22,y-s*.37,s*.32,s*.36,'#ffffff');
          ell(x+s*.35,y+s*.28,s*.13,s*.16,'#ffffff');
          g.fillStyle='#ffe6a9'; g.beginPath();
          for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=s*(k%2?.14:.31); const px=x+s*.22+Math.cos(a)*r,py=y+s*.50+Math.sin(a)*r;k?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();
        }
        else if (T === 'drowsy') line(W*1.2,()=>{g.moveTo(x-s*.85,y);g.quadraticCurveTo(x,y+s*.55,x+s*.85,y-s*.12);});
        else if (T === 'orbit') { line(W, () => g.ellipse(x,y,s*0.82,s*(star?1.20:1),0,0,Math.PI*2)); line(W,()=>{g.moveTo(x-s*.75,y-s*.1);g.quadraticCurveTo(x,y+s*.4,x+s*.75,y-s*.1);}); }
        else if (T === 'round') ell(x,y,s*.5,s*.68,C.eye);
        else if (T === 'dot') ell(x, y, s * 0.26, s * 0.3, C.eye);
        else if (T === 'sparkle') line(W, () => { // の
          g.moveTo(x + s * 0.05, y - s * 0.85);
          g.bezierCurveTo(x - s * 0.15, y - s * 0.1, x - s * 0.55, y + s * 0.85, x - s * 0.85, y + s * 0.35);
          g.bezierCurveTo(x - s * 1.2, y - s * 0.3, x - s * 0.4, y - s * 1.05, x + s * 0.35, y - s * 0.8);
          g.bezierCurveTo(x + s * 1.15, y - s * 0.45, x + s * 1.0, y + s * 0.75, x + s * 0.2, y + s * 0.95);
        });
        else if (T === 'sleepy') { line(W, () => { g.moveTo(x - s, y - s * 0.1); g.lineTo(x + s, y - s * 0.1); }); g.fillStyle = C.eye; g.beginPath(); g.ellipse(x, y - s * 0.1, s * 0.5, s * 0.45, 0, 0, Math.PI); g.fill(); }
        else if (T === 'happy') line(W, () => { g.moveTo(x - s * 0.8, y + s * 0.3); g.quadraticCurveTo(x, y - s * 0.9, x + s * 0.8, y + s * 0.3); });
        else if (T === 'cat') line(W, () => { g.moveTo(x, y - s * 0.75); g.lineTo(x, y + s * 0.75); });
        else if (T === 'serious') line(W, () => { g.moveTo(x - s * 0.85, y - side * s * 0.12); g.lineTo(x + s * 0.85, y + side * s * 0.12); });
        else if (T === 'swirl') line(W * 0.85, () => {
          for (let a = 0; a <= Math.PI * 3.3; a += 0.15) { const r = s * (0.08 + a * 0.085); const px = x + Math.cos(a) * r * side, py = y + Math.sin(a) * r; a ? g.lineTo(px, py) : g.moveTo(px, py); }
        });
      }
    }
    // 코
    if (cfg.nose) ell(UX(0), VY(-0.32), PX(0.03), PX(0.022), C.inner);
    // 입
    const mx = UX(0), my = VY(MOUTH_LAT), m = PX(cfg.mouth === 'mo' ? 0.13 : 0.085);
    const M = mouthMode === 'o' ? 'o' : cfg.mouth;
    if (M === 'w') line(W * 0.8, () => { g.moveTo(mx - m, my - m * 0.25); g.quadraticCurveTo(mx - m * 0.5, my + m * 0.7, mx, my); g.quadraticCurveTo(mx + m * 0.5, my + m * 0.7, mx + m, my - m * 0.25); });
    else if (M === 'cat') line(W * 0.8, () => { g.moveTo(mx - m * 0.7, my + m * 0.4); g.lineTo(mx, my - m * 0.3); g.lineTo(mx + m * 0.7, my + m * 0.4); });
    else if (M === 'o') line(W * 0.8, () => g.ellipse(mx, my, m * 0.35, m * 0.42, 0, 0, Math.PI * 2));
    else if (M === 'open') { g.fillStyle = C.eye; g.beginPath(); g.moveTo(mx - m * 0.6, my - m * 0.25); g.lineTo(mx + m * 0.6, my - m * 0.25); g.lineTo(mx, my + m * 0.55); g.closePath(); g.fill(); }
    else if (M === 'grin') { g.fillStyle = C.eye; g.beginPath(); g.moveTo(mx - m, my - m * 0.3); g.quadraticCurveTo(mx, my + m * 1.2, mx + m, my - m * 0.3); g.closePath(); g.fill(); }
    else if (M === 'flat') line(W * 0.8, () => { g.moveTo(mx - m * 0.5, my); g.lineTo(mx + m * 0.5, my); });
    else if (M === 'mo') line(W * 0.9, () => { // も (글꼴 없이 직접 그림)
      g.moveTo(mx - m * 0.85, my - m * 0.45); g.lineTo(mx + m * 0.6, my - m * 0.55);
      g.moveTo(mx - m * 0.95, my + m * 0.15); g.lineTo(mx + m * 0.55, my + m * 0.05);
      g.moveTo(mx - m * 0.1, my - m * 1.05); g.quadraticCurveTo(mx - m * 0.45, my + m * 0.5, mx - m * 0.1, my + m * 0.95);
      g.quadraticCurveTo(mx + m * 0.55, my + m * 1.25, mx + m * 0.85, my + m * 0.45);
    });
    return cv;
  }

  function softTex(THREE, base, fn, w = 512, h = 256) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (fn) fn(g, w, h);
    const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    return t;
  }

  function buildCharacter(cfgIn) {
    const THREE = makeCtx();
    const cfg = normalize(cfgIn);
    const C = cfg.colors, T = cfg.tune, B = T.body;
    const star = cfg.design === 'starlight-v1';
    const has = (a) => cfg.acc.includes(a);
    const disposables = [];
    const keep = (x) => { disposables.push(x); return x; };
    // 무광 소프트비닐
    const vinyl = (color, extra) => keep(new THREE.MeshPhysicalMaterial(Object.assign({
      color, roughness: 0.76, envMapIntensity: 0.32, metalness: 0, clearcoat: 0, clearcoatRoughness: 1, sheen: 0.15, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff'),
    }, extra || {})));
    const geo = (g) => keep(g);
    const sphere = (w = 32, h = 24) => geo(new THREE.SphereGeometry(1, w, h));
    const mesh = (g, m, parent, pos, scale, rot) => {
      const x = new THREE.Mesh(g, m);
      if (pos) x.position.set(pos[0], pos[1], pos[2]);
      if (scale) x.scale.set(scale[0], scale[1], scale[2]);
      if (rot) x.rotation.set(rot[0], rot[1], rot[2]);
      if (parent) parent.add(x);
      return x;
    };
    const hullTargets = [];

    const bodyM = vinyl(C.body), pinkM = vinyl(C.inner, { emissive: new THREE.Color(C.inner), emissiveIntensity: 0.05 }), bellyM = vinyl(C.belly), accM = vinyl(C.accent), acc2M = vinyl(C.accent2);
    const darkM = vinyl(C.eye, { roughness: 0.5 });
    const goldM = keep(new THREE.MeshPhysicalMaterial({ color: '#e7b84a', roughness: 0.35, metalness: 0.5 }));

    const char = new THREE.Group();
    const rig = new THREE.Group(); char.add(rig);

    /* ---- 몸: 머리 밑 작은 콩 ---- */
    const bodyTex = keep(softTex(THREE, C.body, (g, w, h) => {
      if (!cfg.belly) return;
      g.fillStyle = C.belly; g.beginPath(); g.ellipse(w * 0.25, h * 0.55, w * 0.07, h * 0.2, 0, 0, Math.PI * 2); g.fill();
    }));
    const hips = new THREE.Group(); hips.position.set(0, 0.29 * B, 0); rig.add(hips);
    const body = mesh(star ? geo(starlightBodyGeo(THREE)) : sphere(40,30), vinyl('#ffffff', {map:bodyTex}), hips, [0,0,0], [.30*B,.30*B,.27*B]);
    hullTargets.push(body);
    if(star){body.userData.seatedGeometry=body.geometry;body.userData.standGeometry=geo(starlightStandBodyGeo(THREE));}

    /* ---- 발: 앞으로 삐죽 나온 돌기 (발바닥에 분홍 젤리 하나) ---- */
    const legs = [], legJoints = [];
    for (const sx of [-1, 1]) {
      const pv = new THREE.Group(); pv.position.set(sx * 0.23 * B, 0.033 + 0.13 * (0.75 + 0.25 * B), 0.13 * B); pv.userData.base = pv.position.clone(); rig.add(pv);
      if (star) {
        const joint=new THREE.Group();joint.name=sx<0?'right-hip':'left-hip';
        rig.add(joint);joint.add(pv);legJoints.push(joint);
      }
      const fk = 0.75 + 0.25 * B;
      const paw = new THREE.Group(); pv.add(paw); pv.userData.paw = paw;
      const shin = mesh(sphere(24,18),bodyM,pv,[0,0.09,-0.015],[0.105*B,0.145*B,0.105*B]);
      pv.userData.shin = shin;
      const foot = mesh(sphere(24, 18), cfg.socks ? bellyM : bodyM, paw, [0, -0.03, 0.04], [0.165 * fk, 0.13 * fk, 0.19 * fk]);
      hullTargets.push(foot);
      if(star){foot.userData.seatedGeometry=foot.geometry;foot.userData.standGeometry=geo(starlightStandFootGeo(THREE));}
      const pad = mesh(star ? sphere(28,20) : sphere(20,14), pinkM, paw, [0, star ? -.154 : -.148, star ? .035 : .045], [star ? .076 : .081, star ? .025 : .014, .077]);
      for (const [tx,tz] of (star ? [[-.065,.108],[0,.15],[.065,.108]] : [[-.075,.10],[0,.145],[.075,.10]])) mesh(star ? sphere(20,14) : sphere(14,10),pinkM,paw,[tx,star ? -.142 : -.136,tz],[.030,star ? .023 : .014,.033]);
      pad.userData.pad = true;
      // Measure the actual paw (including jelly), not an approximate ankle height.
      // This is a local-space bound; the gait keeps paws level on the floor.
      paw.updateWorldMatrix(true,true);
      pv.userData.soleY = new THREE.Box3().setFromObject(paw).min.y - pv.position.y;
      legs.push(pv);
    }

    /* ---- 팔: 몸 옆에 붙은 작은 돌기 ---- */
    const arms = [];
    for (const sx of [-1, 1]) {
      const pv = new THREE.Group(); pv.position.set(sx * 0.19 * B, 0.40 * B, 0.15 * B); pv.userData.base = pv.position.clone(); rig.add(pv);
      hullTargets.push(mesh(star ? geo(starlightArmGeo(THREE,sx)) : sphere(20,14),cfg.socks?bellyM:bodyM,pv,
        star ? [0,0,0] : [0,-.09,.055],star ? [B,B,B] : [.08*B,.17*B,.09*B]));
      if(star){const m=pv.children[0];m.userData.seatedGeometry=m.geometry;m.userData.standGeometry=geo(starlightStandArmGeo(THREE,sx));}
      arms.push(pv);
    }

    /* ---- 꼬리 ---- */
    const tailPivot = new THREE.Group(); tailPivot.position.set(0, 0.26 * B, -0.25 * B); rig.add(tailPivot);
    const tube = (pts, r) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      hullTargets.push(mesh(geo(new THREE.TubeGeometry(curve, 24, r, 12, false)), bodyM, tailPivot));
      mesh(geo(new THREE.SphereGeometry(r, 12, 10)), bodyM, tailPivot, pts[pts.length - 1]);
    };
    if (cfg.tail === 'pom') hullTargets.push(mesh(sphere(),bodyM,tailPivot,[0,.045,-.035],[.145,.15,.14]));
    else if (cfg.tail === 'cloud') {
      for(const [x,y,z,r] of [[0,.08,-.07,.14],[-.10,.06,-.04,.10],[.10,.06,-.04,.10],[0,.17,-.03,.10]]) hullTargets.push(mesh(sphere(),bodyM,tailPivot,[x,y,z],[r,r,r]));
    }
    else if (cfg.tail === 'cat') tube([[0, 0, 0], [0.03, 0.03, -0.1], [0.11, 0.15, -0.14], [0.08, 0.27, -0.1]], 0.07);
    else if (cfg.tail === 'dog') tube([[0, 0, 0], [0, 0.12, -0.1], [0.05, 0.22, -0.06], [0.02, 0.22, 0.04]], 0.05);
    else if (cfg.tail === 'fox') { const f = new THREE.Group(); f.rotation.x = -0.8; tailPivot.add(f); hullTargets.push(mesh(sphere(), bodyM, f, [0, 0.2, 0], [0.13, 0.24, 0.12])); mesh(sphere(), bellyM, f, [0, 0.4, 0], [0.08, 0.08, 0.075]); }
    else if (cfg.tail === 'bunny') hullTargets.push(mesh(sphere(), bellyM, tailPivot, [0, 0.02, 0.02], [0.1, 0.1, 0.1]));

    /* ---- 머리 ---- */
    const neck = new THREE.Group(); neck.position.set(0, 0.44 * B, 0); rig.add(neck);
    // 머리 밑면이 몸 위에 딱 붙게 (목 없음)
    const headY = (star ? .41 : .61) + 0.5 * (B - 1) + 0.68 * T.head;
    const head = new THREE.Group(); head.position.set(0, headY - 0.44 * B, 0); head.scale.set(T.head * T.wide, T.head, T.head); neck.add(head);
    const faceCache = {};
    const headTex = keep(softTex(THREE, C.body, null, 16, 8));
    headTex.image = drawHead(cfg, 'normal', 'normal'); headTex.needsUpdate = true;
    const skull = mesh(geo(headGeo(THREE, cfg.design)), vinyl('#ffffff', { map: headTex }), head);
    hullTargets.push(skull);
    if(star){
      head.userData.approvedScale=head.scale.clone();
      skull.userData.seatedGeometry=skull.geometry;
      const round=geo(skull.geometry.clone()),p=round.attributes.position;
      for(let i=0;i<p.count;i++){
        const y=p.getY(i);
        // Add volume at the crown and underside, leaving the facial band untouched.
        const crown=.045*Math.pow(Math.max(0,(y-.12)/.70),2);
        const chin=.012*Math.pow(Math.max(0,(-y-.38)/.22),2);
        p.setXYZ(i,p.getX(i)*.985,y-.014*Math.pow(Math.max(0,-y)/.6,2)+crown-chin,p.getZ(i));
        // Sculpt rear volume only; retain every front-surface/UV landmark.
        const z=p.getZ(i),rear=Math.max(0,-z/.72);
        p.setZ(i,z-.15*Math.pow(rear,1.5)*Math.exp(-Math.pow((y+.12)/.62,2)));
        p.setY(i,p.getY(i)+.045*rear*rear*Math.exp(-Math.pow((y+.48)/.23,2)));
      }
      smoothSeamNormals(round);round.computeBoundingBox();
      skull.userData.standGeometry=round;
    }
    function setFace(eyeMode, mouthMode) {
      const key = eyeMode + '|' + mouthMode;
      if (setFace.key === key) return;
      setFace.key = key;
      headTex.image = faceCache[key] || (faceCache[key] = drawHead(cfg, eyeMode, mouthMode));
      headTex.needsUpdate = true;
    }

    /* ---- 귀 ---- */
    const ears = [];
    let haloRef = null;
    const E = cfg.ears;
    const earAt = (sx, lon, lat, tilt, build) => {
      const g = new THREE.Group();
      const { p } = headPoint(THREE, sx * lon, lat, -0.07, cfg.design);
      g.position.set(p.x * (star ? 1.445 : 1.18) + (star ? .02 : 0), p.y + (star ? .10 : .13), -0.09); g.rotation.set(-0.08, 0, -sx * (tilt + T.earTilt)); g.scale.setScalar(T.ear); g.userData.rz = g.rotation.z; head.add(g); ears.push(g);
      build(g);
    };
    for (const sx of [-1, 1]) {
      if (E === 'cat' || E === 'fox') {
        const big = E === 'fox';
        const og = star && !big ? geo(starlightEarGeo(THREE)) : geo(earGeo(THREE, big ? 0.31 : 0.28, big ? 0.56 : 0.46, 0.16, big ? 0.86 : 0.79));
        earAt(sx, big ? 0.54 : 0.56, 0.62, big ? 0.26 : 0.28, (g) => {
          const outer=mesh(og, bodyM, g);hullTargets.push(outer);
          if(star&&!big){
            outer.userData.seatedGeometry=og;
            const thick=geo(og.clone()),v=thick.attributes.position;
            for(let j=0;j<v.count;j++){const z=v.getZ(j),y=v.getY(j);if(z<0){v.setZ(j,z*(1.85+.3*Math.sin(Math.PI*y/.45)));v.setY(j,y-.045*(-z/.18)*Math.pow(1-y/.45,2));}}
            smoothSeamNormals(thick);outer.userData.standGeometry=thick;
          }
          mesh(og, pinkM, g, [0, 0.03, 0.1], [0.6, 0.66, 0.5]);
        });
      } else if (E === 'bunny') {
        const og = geo(earGeo(THREE, 0.14, 0.72, 0.1, 0.3));
        earAt(sx, 0.3, 0.7, 0.16, (g) => { hullTargets.push(mesh(og, bodyM, g)); mesh(og, pinkM, g, [0, 0.05, 0.05], [0.55, 0.82, 0.5]); });
      } else if (E === 'bear') {
        earAt(sx, 0.66, 0.58, 0.45, (g) => { hullTargets.push(mesh(sphere(), bodyM, g, [0, 0.12, 0], [0.21, 0.2, 0.13])); mesh(sphere(), pinkM, g, [0, 0.12, 0.08], [0.11, 0.1, 0.06]); });
      } else if (E === 'mouse') {
        earAt(sx, 0.76, 0.5, 0.75, (g) => { hullTargets.push(mesh(sphere(), bodyM, g, [0, 0.2, 0], [0.3, 0.3, 0.07])); mesh(sphere(), pinkM, g, [0, 0.2, 0.04], [0.2, 0.2, 0.05]); });
      } else if (E === 'dog') {
        const g = new THREE.Group(); const { p } = headPoint(THREE, sx * 1.2, 0.3, -0.03); g.position.copy(p); g.rotation.z = sx * (0.25 - T.earTilt); g.scale.setScalar(T.ear); g.userData.rz = g.rotation.z; g.userData.dog = true; head.add(g); ears.push(g);
        hullTargets.push(mesh(sphere(), vinyl(C.pattern), g, [sx * 0.02, -0.2, 0.02], [0.15, 0.3, 0.08]));
      }
    }

    /* ---- 수염: 볼에서 삐죽 ---- */
    if (cfg.whisk) {
      const wg = geo(new THREE.CapsuleGeometry(0.0075, 0.24, 3, 6));
      for (const sx of [-1, 1]) for (const [dl, a] of [[0.045, 0.12], [-0.045, -0.12]]) {
        const { p } = headPoint(THREE, sx * 1.1, -0.28 + dl, -0.03);
        mesh(wg, darkM, head, [p.x + sx * 0.11, p.y, p.z], null, [0, 0, Math.PI / 2 - sx * a]);
      }
    }

    /* ---- 소품 ---- */
    if (has('beanie')) {
      mesh(geo(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.4)), accM, head, [0, 0.03, 0], [RX * 1.04, RY * 1.06, RZ * 1.05]);
      const band = mesh(geo(new THREE.TorusGeometry(1, 0.07, 12, 48)), accM, head, [0, 0.03 + RY * 1.06 * Math.cos(Math.PI * 0.4), 0], [RX * 0.98, RZ * 0.98, 1]);
      band.rotation.x = Math.PI / 2;
      mesh(geo(new THREE.SphereGeometry(0.11, 20, 14)), accM, head, [0, RY + 0.1, 0]);
    }
    if (has('crown')) {
      const g = new THREE.Group(); g.position.set(0.1, RY * 0.96, 0.05); g.rotation.z = -0.15; head.add(g);
      mesh(geo(new THREE.CylinderGeometry(0.16, 0.18, 0.1, 24, 1, true)), goldM, g, [0, 0.05, 0]).material.side = THREE.DoubleSide;
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; mesh(geo(new THREE.SphereGeometry(0.035, 10, 8)), goldM, g, [Math.sin(a) * 0.17, 0.13, Math.cos(a) * 0.17]); }
    }
    if (has('ribbon')) {
      const g = new THREE.Group(); placeOn(THREE, g, -0.62, 0.48, 0.02); head.add(g);
      for (const s of [-1, 1]) mesh(sphere(), accM, g, [s * 0.11, 0, 0.02], [0.12, 0.08, 0.05], [0, 0, s * 0.35]);
      mesh(sphere(), accM, g, [0, 0, 0.04], [0.045, 0.045, 0.04]);
    }
    if (has('flower')) {
      const g = new THREE.Group(); placeOn(THREE, g, 0.62, 0.45, 0.02); head.add(g);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; mesh(sphere(), accM, g, [Math.cos(a) * 0.065, Math.sin(a) * 0.065, 0.01], [0.055, 0.055, 0.025]); }
      mesh(sphere(), vinyl('#ffd84d'), g, [0, 0, 0.03], [0.04, 0.04, 0.025]);
    }
    if (has('star')) {
      const s = new THREE.Shape();
      for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.045 : 0.1, a = Math.PI / 2 + (i * Math.PI) / 5; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      const g = new THREE.Group(); placeOn(THREE, g, -0.55, 0.3, 0); head.add(g);
      mesh(geo(new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3 })), vinyl('#ffd84d'), g, null, null, [0, 0, -0.2]);
    }
    if (has('glasses')) {
      const rim = vinyl('#2f2730', { roughness: 0.4 });
      for (const sx of [-1, 1]) { const g = new THREE.Group(); placeOn(THREE, g, sx * EYE_LON * cfg.tune.eyeGap, EYE_LAT + cfg.tune.eyeY, 0.05); head.add(g); mesh(geo(new THREE.TorusGeometry(0.11 * Math.max(1, cfg.tune.eyeSize), 0.014, 10, 36)), rim, g); }
      const b = new THREE.Group(); placeOn(THREE, b, 0, EYE_LAT + cfg.tune.eyeY + 0.02, 0.06); head.add(b);
      mesh(geo(new THREE.CapsuleGeometry(0.012, 0.3, 4, 8)), rim, b, null, null, [0, 0, Math.PI / 2]);
    }
    if (has('bell')) {
      mesh(geo(new THREE.TorusGeometry(0.27, 0.035, 12, 40)), accM, rig, [0, 0.44 * B, 0.02], [0.85 * B, 0.85 * B, 0.8 * B], [Math.PI / 2 - 0.15, 0, 0]);
      mesh(geo(new THREE.SphereGeometry(0.07, 20, 14)), goldM, rig, [0, 0.38 * B, 0.23 * B]);
    }

    if (has('sprout')) {
      const g = new THREE.Group(); g.position.set(0.04, RY * 0.97, 0); g.rotation.z = -0.15; head.add(g);
      const leafM = vinyl('#86cf72');
      mesh(geo(new THREE.CapsuleGeometry(0.018, 0.12, 4, 10)), leafM, g, [0, 0.07, 0]);
      for (const s2 of [-1, 1]) mesh(sphere(20, 14), leafM, g, [s2 * 0.08, 0.15, 0], [0.09, 0.035, 0.05], [0, 0, s2 * 0.45]);
    }
    if (has('halo')) {
      const halo = mesh(geo(new THREE.TorusGeometry(0.32, 0.035, 14, 48)), vinyl('#ffe58a', { emissive: new THREE.Color('#ffe58a'), emissiveIntensity: 0.6 }), head, [0, RY + 0.3, -0.05], null, [Math.PI / 2 - 0.25, 0, 0]);
      halo.userData.halo = true;
      haloRef = halo;
    }
    if (has('horns')) {
      for (const sx of [-1, 1]) {
        const g = new THREE.Group(); const { p } = headPoint(THREE, sx * 0.32, 0.78, -0.04); g.position.copy(p); g.rotation.set(-0.15, 0, -sx * 0.35); head.add(g);
        mesh(geo(new THREE.ConeGeometry(0.075, 0.24, 20)), acc2M, g, [0, 0.11, 0]);
      }
    }
    if (has('headphones')) {
      const band = mesh(geo(new THREE.TorusGeometry(1, 0.045, 12, 48, Math.PI)), accM, head, [0, 0.02, -0.02], [RX * 1.08, RY * 1.14, 1]);
      band.rotation.y = 0;
      for (const sx of [-1, 1]) {
        const cup = mesh(geo(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 28)), accM, head, [sx * RX * 1.1, 0.02, -0.02], null, [0, 0, Math.PI / 2]);
        mesh(geo(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 28)), acc2M, head, [sx * (RX * 1.1 - 0.07), 0.02, -0.02], null, [0, 0, Math.PI / 2]);
        hullTargets.push(cup);
      }
    }
    if (has('scarf')) {
      mesh(geo(new THREE.TorusGeometry(0.29, 0.075, 14, 40)), accM, rig, [0, 0.45 * B, 0.01], [B, B, 0.9 * B], [Math.PI / 2 - 0.1, 0, 0]);
      const tailS = mesh(geo(new THREE.CapsuleGeometry(0.06, 0.16, 6, 14)), accM, rig, [0.16 * B, 0.33 * B, 0.24 * B], [1, 1, 0.55], [0.25, 0, 0.25]);
      mesh(geo(new THREE.CylinderGeometry(0.063, 0.063, 0.03, 14)), acc2M, tailS, [0, -0.06, 0]);
    }
    if (has('backbow')) {
      const bow = new THREE.Group(); bow.position.set(0,0.40*B,-0.24); bow.scale.setScalar(.65); rig.add(bow);
      for (const side of [-1,1]) {
        mesh(sphere(32,24),accM,bow,[side*.36,0.07,0],[.36,.28,.10],[0,0,side*.28]);
        mesh(geo(new THREE.ConeGeometry(.15,.35,3)),accM,bow,[side*.20,-.20,0],[1,1,.35],[0,0,side*.18]);
      }
      mesh(sphere(24,18),accM,bow,[0,0.06,.02],[.13,.15,.12]);
    }
    if (has('bowtie')) {
      const g = new THREE.Group(); g.position.set(0, 0.40 * B, 0.25 * B); rig.add(g);
      for (const s2 of [-1, 1]) mesh(geo(new THREE.ConeGeometry(0.07, 0.13, 16)), acc2M, g, [s2 * 0.065, 0, 0], [1, 1, 0.5], [0, 0, s2 * Math.PI / 2]);
      mesh(sphere(14, 10), acc2M, g, [0, 0, 0.01], [0.035, 0.035, 0.03]);
    }

    /* ---- zzz ---- */
    const zTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 64;
      const g = cv.getContext('2d'); g.font = '900 52px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 8; g.strokeStyle = '#ffffff'; g.strokeText('z', 32, 34); g.fillStyle = C.eye; g.fillText('z', 32, 34);
      const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return keep(t);
    })();
    const zs = [0, 1].map(() => { const sp = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false }))); sp.visible = false; char.add(sp); return sp; });

    const heartTex = (() => {
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

    /* ---- 바닥: 부드러운 그림자 ---- */
    const ground = new THREE.Group();
    const shTex = (() => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const g = cv.getContext('2d'); const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(60,90,100,0.22)'); grd.addColorStop(1, 'rgba(40,30,50,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128); return keep(new THREE.CanvasTexture(cv));
    })();
    mesh(geo(new THREE.PlaneGeometry(1.6, 1.1)), keep(new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false })), ground, [0, 0.002, 0.05], null, [-Math.PI / 2, 0, 0]);
    const catcher = mesh(geo(new THREE.PlaneGeometry(4, 4)), keep(new THREE.ShadowMaterial({ opacity: 0.035 })), ground, [0, 0.001, 0], null, [-Math.PI / 2, 0, 0]);
    catcher.receiveShadow = false;

    if (cfg.outline) {
      const om = keep(new THREE.MeshBasicMaterial({ color: C.line, side: THREE.BackSide }));
      for (const t of hullTargets) {
        const o = new THREE.Mesh(t.geometry, om);
        o.position.copy(t.position); o.rotation.copy(t.rotation);
        const minS = Math.max(0.04, Math.min(t.scale.x, t.scale.y, t.scale.z));
        o.scale.copy(t.scale).multiplyScalar(1 + Math.min(0.12, 0.018 / minS));
        t.parent.add(o);
      }
    }

    char.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return {
      char, shadow: ground, cfg,
      parts: { design: cfg.design, rig, hips, body, legs, legJoints, arms, tailPivot, neck, head, ears, setFace, zs, hearts, B, halo: haloRef },
      dispose() { disposables.forEach((d) => d.dispose && d.dispose()); },
    };
  }

  /* ---- 스튜디오 조명 ---- */
  function studioEnv(THREE, renderer) {
    const s = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: '#d8d0d4', side: THREE.BackSide }));
    s.add(room);
    const panel = (c, k, pos, scl) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...pos); m.scale.set(...scl); m.lookAt(0, 0, 0); s.add(m);
    };
    panel('#ffffff', 2.2, [0, 5.8, 1], [7, 7, 1]);
    panel('#fff0e4', 2.4, [5.8, 2, 4], [4, 5, 1]);
    panel('#e8eeff', 1.6, [-5.8, 1, 3], [4, 5, 1]);
    panel('#ffffff', 1.2, [0, 2, -5.8], [6, 3, 1]);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.04).texture;
    pm.dispose(); s.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    return tex;
  }
  function makeScene(THREE, renderer) {
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.environment = studioEnv(THREE, renderer);
    scene.add(new THREE.HemisphereLight('#ffffff', '#c8bddb', 0.55));
    const key = new THREE.DirectionalLight('#fff9f5', 1.25);
    key.position.set(-3.5, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: 0.5, far: 15 });
    key.shadow.bias = -0.0008; key.shadow.normalBias = 0.04;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ffffff', 0.5); rim.position.set(-1, 3, -5); scene.add(rim);
    return scene;
  }
  const VIEWS = {
    full: { pos: [0, 1.55, 8.2], at: [0, 1.16, 0], fov: 21 },
    face: { pos: [0, 1.4, 5.7], at: [0, 1.17, 0], fov: 23 },
    bust: { pos: [0, 1.4, 4.4], at: [0, 1.18, 0], fov: 27 },
    ears: { pos: [0, 1.8, 4.6], at: [0, 1.5, 0], fov: 26 },
    tail: { pos: [4.6, 1.7, -5.4], at: [0, 0.8, 0], fov: 22 },
  };
  function camFor(THREE, view, aspect = 1) {
    const v = VIEWS[view] || VIEWS.full;
    const cam = new THREE.PerspectiveCamera(v.fov, aspect, 0.1, 50);
    cam.position.set(...v.pos); cam.lookAt(new THREE.Vector3(...v.at));
    return cam;
  }

  // 60% stance / 40% swing: overlapping support prevents airborne walking.
  function walkFoot(phase, side, amount = 1) {
    const q = ((phase / (Math.PI * 2) + side * 0.5) % 1 + 1) % 1;
    if (q < 0.6) return [0, (0.5 - q / 0.6) * 0.24 * amount];
    const u = (q - 0.6) / 0.4, smooth = u*u*(3-2*u);
    return [Math.sin(Math.PI*u) ** 2 * 0.065 * amount, (-0.5 + smooth) * 0.24 * amount];
  }

  // Standing uses anatomical hip -> ankle -> paw groups. The same approved
  // character owns both torso profiles; seated geometry/transforms are restored on exit.
  function restoreStand(P) {
    P.head.children[0].geometry=P.head.children[0].userData.seatedGeometry;
    P.head.scale.copy(P.head.userData.approvedScale);
    P.ears.forEach(e=>e.children.forEach(m=>{if(m.userData.seatedGeometry)m.geometry=m.userData.seatedGeometry;}));
    P.legJoints.forEach(j=>j.position.set(0,0,0));
    P.body.geometry=P.body.userData.seatedGeometry;P.body.receiveShadow=true;
    P.body.scale.set(.30*P.B,.30*P.B,.27*P.B);
    P.legs.forEach(L=>{
      L.userData.shin.visible=true;
      const foot=L.userData.paw.children[0],fk=.75+.25*P.B;
      foot.receiveShadow=true;foot.geometry=foot.userData.seatedGeometry;foot.position.set(0,-.03,.04);foot.scale.set(.165*fk,.13*fk,.19*fk);
      L.userData.paw.children.forEach(m=>m.visible=true);
      L.userData.shin.position.set(0,.09,-.015);
      L.userData.shin.scale.set(.105*P.B,.145*P.B,.105*P.B);
      L.userData.paw.children.forEach(m=>{if(m.userData.seatedY!==undefined)m.position.y=m.userData.seatedY;});
    });
    P.arms.forEach(A=>A.children.forEach(m=>{if(m.userData.seatedGeometry)m.geometry=m.userData.seatedGeometry;m.position.set(0,0,0);m.scale.setScalar(P.B);m.receiveShadow=true;}));
    P.tailPivot.position.y=.26*P.B;
  }
  function applyStand(built) {
    const P=built.parts,B=P.B,THREE=makeCtx();
    built.char.rotation.set(0,0,0);built.char.scale.set(1,1,1);
    P.rig.position.set(0,0,0);P.rig.rotation.set(0,0,0);
    // Measured front reference (small PNG, approx. +/-2 px):
    // head width 76px, core torso width 27px, chin-to-floor 28px.
    // Derive the torso from the APPROVED skull width, not a target head-height %.
    const skull=P.head.children[0].userData.seatedGeometry;
    if(!skull.boundingBox)skull.computeBoundingBox();
    const unit=(skull.boundingBox.max.x-skull.boundingBox.min.x)*P.head.userData.approvedScale.x/76;
    const chinY=24.5*unit*B, torsoBottom=4.5*unit*B, torsoTop=chinY+3.5*unit*B;
    // Keep the accepted body dimensions fixed. Refine only the standing head:
    // 2% overall reduction, another 1.5% in width, and a gently rounded chin.
    P.head.children[0].geometry=P.head.children[0].userData.standGeometry;
    P.head.scale.copy(P.head.userData.approvedScale).multiplyScalar(.98);
    const headBottom=P.head.position.y+P.head.children[0].geometry.boundingBox.min.y*P.head.scale.y;
    // Bear-reference proportion: compact trunk + two tiny continuous leg/foot beans.
    // The seated head is preserved; the small standing refinement is reversible.
    P.hips.position.set(0,(torsoTop+torsoBottom)/2+.012*B,0);P.body.rotation.set(0,0,0);
    P.body.geometry=P.body.userData.standGeometry;
    // Keep the original material and lights; avoid a hard shadow-map band that
    // visually divides the tiny torso into a separate belly piece.
    P.body.receiveShadow=false;
    P.body.scale.set(14.4*unit*B,(torsoTop-torsoBottom)/2,8.6*unit*B);
    P.neck.position.set(0,chinY-headBottom+.012*B,0);P.neck.rotation.set(0,0,0);
    P.legs.forEach((L,i)=>{
      const side=i?1:-1,paw=L.userData.paw,foot=paw.children[0];
      P.legJoints[i].position.set(side*.155*B,.22*B,0);
      L.rotation.set(0,0,0);paw.rotation.set(0,0,0);paw.scale.set(1,1,1);
      foot.geometry=foot.userData.standGeometry;foot.position.set(0,0,.008*B);foot.scale.set(.155*B,.145*B,.155*B);
      foot.receiveShadow=false;
      // Standing soles face the floor. Seated pads are restored unchanged on exit.
      paw.children.forEach((m,j)=>{if(j>0)m.visible=false;});
      L.userData.shin.visible=false;
      L.position.set(0,0,0);built.char.updateMatrixWorld(true);
      L.position.y=-new THREE.Box3().setFromObject(foot).min.y;
    });
    P.arms.forEach((A,i)=>{
      A.position.set((i?1:-1)*.315*B,.627*B,.005*B);
      A.rotation.set(0,0,0);
      A.children.forEach(m=>{if(m.userData.standGeometry)m.geometry=m.userData.standGeometry;m.position.set(0,0,0);m.scale.setScalar(B);m.receiveShadow=false;});
    });
    P.tailPivot.position.set(0,.27*B,-.23*B);P.tailPivot.rotation.set(0,0,0);
    P.ears.forEach(e=>{e.rotation.z=e.userData.rz;e.children.forEach(m=>{if(m.userData.standGeometry)m.geometry=m.userData.standGeometry;});});
    P.setFace('normal','normal');P.zs.forEach(z=>z.visible=false);P.hearts.forEach(h=>h.visible=false);
    built.shadow.visible=true;built.shadow.scale.set(1,1,1);
  }

  // Starlight walks with exactly the approved stand meshes and transforms.
  // A half-cycle is one short step. Phase zero is the two-foot standing start.
  function applyStarlightWalk(built,phase) {
    applyStand(built);
    const P=built.parts,B=P.B,THREE=makeCtx();
    const step=1+Math.max(0,phase)/(Math.PI),n=Math.floor(step),u=step-n;
    const ease=u*u*u*(10+u*(-15+6*u));
    const stride=.20*B, swing=n%2, support=1-swing;
    const travel=(n===0?0:(n-.5)*stride)+(n===0?.5:1)*stride*ease;
    const world=[0,0];world[support]=n*stride;
    world[swing]=((n===0?0:n-1)+(n===0?1:2)*ease)*stride;
    const lift=.080*B*Math.pow(Math.sin(Math.PI*u),2);
    const bounce=.005*B*Math.pow(Math.sin(Math.PI*u),2);
    const sway=(swing===0?1:-1)*.006*B*Math.pow(Math.sin(Math.PI*u),2);
    P.rig.position.set(sway,bounce,0);
    P.legs.forEach((L,i)=>{
      L.position.x=-sway;
      L.position.z=world[i]-travel;
      L.position.y+=(i===swing?lift:0)-bounce;
      // Only the airborne foot nods at the toe; correct its true sole height.
      const paw=L.userData.paw;
      paw.rotation.x=i===swing?.07*Math.sin(2*Math.PI*u)*Math.sin(Math.PI*u):0;
      built.char.updateMatrixWorld(true);
      const minY=new THREE.Box3().setFromObject(paw.children[0]).min.y;
      L.position.y+=(i===swing?lift:0)-minY;
      // Positive arm pitch sends that hand backward as the same-side foot advances.
      P.arms[i].rotation.x=(world[i]-travel)/stride*.18;
    });
    built.motionTravel=travel;
    built.motionSupport=support;
  }

  /* ---- 포즈: 머리가 무거워서 뒤뚱뒤뚱 ---- */
  function pose(built, st, t, dt) {
    const P = built.parts, B = P.B;
    if (P.design==='starlight-v1' && (st.state==='stand'||st.state==='walk')) {
      if(st.state==='walk'){
        const tempo={gentle:.86,playful:1.16,shy:.9,affectionate:.98}[built.cfg.personality];
        st.phase=(st.phase||0)+dt*.0045*tempo;
        applyStarlightWalk(built,st.phase);
      }else{applyStand(built);built.motionTravel=0;}
      st.wasStand=true;return;
    }
    if(st.wasStand){restoreStand(P);st.wasStand=false;}
    const lerp = (a, b, k) => a + (b - a) * k;
    const k = 1 - Math.pow(0.0015, dt / 1000);
    const limbK = 1 - Math.exp(-dt / 65);
    const temperament = built.cfg.personality;
    const tempo = {gentle:0.86, playful:1.16, shy:0.9, affectionate:0.98}[temperament];
    const s = st.state;
    const motion = {gentle:0.8, playful:1.2, shy:0.7, affectionate:1.0}[temperament];
    let yaw = 0, roll = 0, nod = 0, headRoll = 0, rigY = 0, stretch = 0;
    let foot = [[0, 0], [0, 0]];                 // [위, 앞뒤]
    let armZ = [-0.32, 0.32], armX = [-0.15, -0.15];
    let tail = Math.sin(t * 0.003) * 0.3, earWig = 0;
    let eyes = 'normal', mouth = 'normal', zzz = false, shadowOn = true, sit = false, snap = false;

    if (s === 'walk') {
      st.phase = (st.phase || 0) + dt * 0.0085 * tempo;
      const p = st.phase, w = Math.sin(p);
      yaw = st.dir * 0.90;
      foot = [walkFoot(p, 0), walkFoot(p, 1)];
      // Feet own the gait; no whole-character bounce or squash while walking.
      rigY = 0; stretch = 0; roll = 0;
      headRoll = -Math.sin(p - 0.45) * 0.045 * motion;
      nod = Math.sin(2 * p - 0.4) * 0.012;
      armX = foot.map(f => -0.12 + f[1] * 3.2);
      armZ = [-0.28, 0.28];
      tail = Math.sin(p - 0.6) * 0.18;
      earWig = Math.sin(2 * p - 1.1) * 0.055;
    } else if (s === 'idle') {
      yaw = st.dir * 0.035; headRoll = Math.sin(t * 0.0013) * 0.035;
      stretch = Math.sin(t * 0.0025) * 0.012;
      armZ = [-0.32 + Math.sin(t * 0.0025) * 0.025, 0.32 - Math.sin(t * 0.0025) * 0.025];
      earWig = Math.sin(t * 0.002) * 0.03;
    } else if (s === 'look') {
      // 두리번두리번
      const q = Math.sin(t * 0.0016);
      yaw = Math.sign(q) * Math.min(1, Math.abs(q) * 2.2) * 0.85;
      headRoll = Math.sin(t * 0.0032) * 0.09; nod = -0.05;
      earWig = Math.sin(t * 0.004) * 0.06;
    } else if (s === 'hop') {
      // 제자리 콩콩
      const h = ((t - (st.enteredAt || 0)) % 920) / 920;
      const air = h > 0.18 && h < 0.72 ? Math.sin((h - 0.18) / 0.54 * Math.PI) : 0;
      const crouch = h <= 0.18 ? Math.sin(h / 0.18 * Math.PI) : h >= 0.72 ? Math.sin((h - 0.72) / 0.28 * Math.PI) : 0;
      eyes = air > 0.1 ? 'happy' : 'normal'; headRoll = Math.sin(h * Math.PI * 2) * 0.16;
      rigY = air * 0.23; stretch = air * 0.055 - crouch * 0.09;
      foot = [[air * 0.05, 0], [air * 0.05, 0]];
      armZ = [-0.15 - air * 1.2, 0.15 + air * 1.2];
      earWig = -air * 0.25; tail = air * 0.8; snap = true;
      shadowOn = true;
    } else if (s === 'nuzzle') {
      yaw = st.dir * 0.23; roll = -st.dir * 0.055; headRoll = -st.dir * 0.13; eyes = 'happy';
      stretch = Math.sin(t * 0.0035) * 0.025; armZ = [-0.6, 0.6]; earWig = Math.sin(t * 0.006) * 0.05;
    } else if (s === 'wave') {
      // 한 손 들고 흔들기
      yaw = 0; headRoll = 0.12 + Math.sin(t * 0.004) * 0.065; nod = Math.sin(t * 0.004) * 0.045; eyes = 'happy';
      armZ = [-0.15, 2.5 + Math.sin(t * 0.010) * 0.24];
      earWig = Math.sin(t * 0.009) * 0.05;
    } else if (s === 'lie') {
      sit=true; eyes='closed'; zzz=true; nod=.12; headRoll=.09;
      armX=[-1.1,-1.1]; armZ=[.15,-.15]; tail=.1;
    } else if (s === 'perch') {
      sit = true; rigY = 0; headRoll = Math.sin(t*0.0018)*0.06;
      armZ = [0.25,-0.25]; armX = [-0.35,-0.35]; tail = Math.sin(t*.002)*.2;
    } else if (s === 'sit') {
      sit = true; rigY = 0; nod = 0.18 + Math.sin(t * 0.0015) * 0.06; eyes = 'closed'; zzz = true; tail = 1.1;
    } else if (s === 'drag') {
      const d = Math.sin(t * 0.014);
      foot = [[Math.max(0, d) * 0.08, 0], [Math.max(0, -d) * 0.08, 0]];
      armZ = [1.6 + Math.sin(t * 0.016) * 0.4, -1.6 - Math.sin(t * 0.016) * 0.4];
      roll = Math.sin(t * 0.006) * 0.14; eyes = 'squint'; mouth = 'o'; shadowOn = false;
      tail = Math.sin(t * 0.01) * 0.6; earWig = Math.sin(t * 0.012) * 0.15;
    } else if (s === 'fall') {
      armZ = [1.9, -1.9]; foot = [[0.05, 0], [0.05, 0]]; eyes = 'wide'; mouth = 'o'; shadowOn = false; earWig = -0.2;
    }

    // 착지하면 찌그러졌다 펴짐
    if (st.prev === 'fall' && s !== 'fall') st.squashAt = t;
    st.prev = s;
    const sq = st.squashAt ? Math.max(0, 1 - (t - st.squashAt) / 320) : 0;
    const rigidStarlight = P.design === 'starlight-v1' && (s === 'idle' || s === 'walk');
    const squash = rigidStarlight ? 0 : Math.sin(sq * Math.PI) * 0.18 - stretch;
    if (s === 'idle' && temperament === 'shy') { headRoll -= 0.045; nod += 0.035; }
    if (s === 'idle' && temperament === 'affectionate') tail *= 1.7;

    const ch = built.char;
    ch.rotation.y = lerp(ch.rotation.y, yaw, s === 'look' ? 0.25 : k);
    ch.scale.set(1 + squash * 0.6, 1 - squash, 1 + squash * 0.6);
    P.rig.position.y = lerp(P.rig.position.y, rigY, snap ? 1 : k);
    P.rig.rotation.z = lerp(P.rig.rotation.z, roll, snap ? 0.4 : k);
    // Sitting displays the soles; standing uses small forward-facing paws beneath short legs.
    // Ease the pelvis down before presenting the soles; keep ground contact.
    st.seated = lerp(st.seated || 0, sit ? 1 : 0, 1-Math.exp(-dt/180));
    const seat = st.seated;
    st.lying = lerp(st.lying || 0,s === 'lie' ? 1 : 0,1-Math.exp(-dt/240));
    const lying=st.lying;
    P.hips.position.y = (0.40-0.11*seat)*B;
    P.neck.position.y = (0.55-0.135*seat)*B - .55*lying;
    P.neck.position.z = .20*lying;
    P.hips.position.z = -.80*lying;
    P.body.rotation.x = -Math.PI/2*lying;
    P.body.scale.y = lerp(P.body.scale.y,.30*B,limbK);
    P.legs.forEach((L, i) => {
      const b = L.userData.base, paw = L.userData.paw;
      const contact = b.y * (0.72 + 0.45*seat);
      paw.scale.x = lerp(paw.scale.x,0.80+0.32*seat,limbK);
      paw.scale.y = lerp(paw.scale.y,0.72+0.28*seat,limbK);
      paw.scale.z = lerp(paw.scale.z,0.75+0.25*seat,limbK);
      L.userData.shin.scale.y = .145*B*(1-seat*.65);
      L.position.x = lerp(L.position.x,b.x*(0.90+0.20*seat),limbK);
      L.position.y = lerp(L.position.y,contact+foot[i][0],limbK);
      L.position.z = lerp(L.position.z,(0.035+0.29*seat-1.1*lying)*B+foot[i][1]*B,limbK);
      // Rotate only the seated paw, never present the sole as a walking leg.
      L.rotation.x = lerp(L.rotation.x,0,limbK);
      paw.rotation.x = lerp(paw.rotation.x,-1.45*seat,limbK);
    });
    P.arms.forEach((A, i) => { const ab = A.userData.base; A.position.x = lerp(A.position.x, ab.x * (s === 'wave' && i === 1 ? 1.6 : 1.35-seat*.53), k); A.position.y = lerp(A.position.y, ab.y + (.10-.125*seat)*B + (s === 'wave' && i === 1 ? 0.08 : 0), k); A.position.z = .045*B + .14*B*seat - .45*lying; A.rotation.z = lerp(A.rotation.z, armZ[i], Math.min(1, k * 1.4)); A.rotation.x = lerp(A.rotation.x, armX[i], snap ? 0.5 : k); });
    if (P.design === 'starlight-v1' && seat > 0) {
      // Seated reference only; standing/gait timing is deliberately not redesigned here.
      P.legs.forEach((L,i)=>{L.position.x=lerp(L.position.x,(i?1:-1)*.225*B,seat);});
      P.arms.forEach((A,i)=>{A.position.x=lerp(A.position.x,(i?1:-1)*.225*B,seat);A.position.y=lerp(A.position.y,.40*B,seat);A.position.z=lerp(A.position.z,.03*B,seat);A.rotation.z=lerp(A.rotation.z,(i?-1:1)*.10,seat);A.rotation.x=lerp(A.rotation.x,0,seat);});
    }
    if (rigidStarlight) {
      // One approved body and head: standing raises both by the same .07B.
      // No neck extension, geometry morph, or gait-dependent body scaling.
      P.hips.position.y = (.36-.07*seat)*B;
      P.neck.position.y = (.485-.07*seat)*B;
      const upright = 1-seat;
      P.legs.forEach((L,i)=>{
        const paw=L.userData.paw;
        paw.scale.set(.80+.32*seat,.72+.28*seat,.75+.25*seat);
        const ground=-L.userData.soleY*.72;
        L.position.x=lerp((i?1:-1)*.205*B,L.position.x,seat);
        L.position.y=lerp(ground+foot[i][0]*1.45,L.position.y,seat);
        L.position.z=lerp(.025*B+foot[i][1]*.85*B,L.position.z,seat);
        // Analytic level contact avoids lag from smoothing a planted foot.
        paw.rotation.x=-1.45*seat;
      });
      P.arms.forEach((A,i)=>{
        A.position.set((i?1:-1)*.225*B,(.47-.07*seat)*B,.03*B);
        A.rotation.z=(i?-1:1)*.10;
        // A forward foot has +Z; +X shoulder rotation moves its hand back.
        A.rotation.x=(s==='walk' ? foot[i][1]*2.7 : 0)*upright;
      });
      headRoll = s==='walk' ? -Math.sin(st.phase-.45)*.018 : Math.sin(t*.0013)*.018;
      nod = s==='walk' ? Math.sin(2*st.phase-.4)*.006 : 0;
    }
    P.neck.rotation.x = lerp(P.neck.rotation.x, nod, snap ? 0.3 : k);
    P.neck.rotation.z = lerp(P.neck.rotation.z, headRoll, snap ? 0.3 : k);
    P.ears.forEach((e, i) => { const side = e.position.x < 0 ? -1 : 1; e.rotation.z = lerp(e.rotation.z, e.userData.rz + side * earWig, 0.4); });
    P.tailPivot.position.z = -.22*B-.85*lying;
    P.tailPivot.rotation.z = lerp(P.tailPivot.rotation.z, sit ? 0 : tail * 0.6, snap ? 0.5 : k);
    P.tailPivot.rotation.x = lerp(P.tailPivot.rotation.x, sit ? tail : 0, k);
    if (P.halo) P.halo.position.y = RY + 0.3 + Math.sin(t * 0.003) * 0.03;

    let blink = false;
    if (eyes === 'normal') {
      if (!st.nextBlink) st.nextBlink = t + 1500 + Math.random() * 2500;
      if (t > st.nextBlink) { st.blinkUntil = t + 130; st.nextBlink = t + 2600 + Math.random() * 3800; }
      blink = t < (st.blinkUntil || 0);
    }
    P.setFace(blink ? 'blink' : eyes, mouth);
    built.shadow.visible = shadowOn;
    if (shadowOn) { const f = 1 - Math.min(0.5, P.rig.position.y * 1.6); built.shadow.scale.set(f, 1, f); }
    P.hearts.forEach((heart, i) => {
      const active = s === 'hop' || s === 'wave' || s === 'nuzzle'; heart.visible = active;
      if (active) {
        const ph = (((t - (st.enteredAt || 0)) / 1500) + i * 0.45) % 1;
        heart.position.set(heart.userData.side * (0.86 + ph * 0.12), 1.5 + ph * 0.58, 0.45);
        heart.scale.setScalar(0.13 + Math.sin(ph * Math.PI) * 0.06);
        heart.material.opacity = Math.sin(ph * Math.PI) * 0.85;
      }
    });
    P.zs.forEach((z, i) => {
      z.visible = zzz;
      if (zzz) {
        const ph = ((t / 2200) + i * 0.5) % 1;
        z.position.set(0.75 + ph * 0.3, 1.6 + ph * 0.45, 0.5);
        const sc = (0.32 - i * 0.08) * (0.7 + ph * 0.5);
        z.scale.set(sc, sc, sc);
        z.material.opacity = Math.sin(ph * Math.PI);
      }
    });
  }

  /* ---- 화면에 띄우기 ---- */
  function createPet(container, cfgIn, opts = {}) {
    const THREE = makeCtx();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const el = renderer.domElement;
    el.style.width = '100%'; el.style.height = '100%'; el.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(el);
    const scene = makeScene(THREE, renderer);
    const camera = camFor(THREE, opts.view || 'full');
    let built = null;
    const st = { state: 'idle', dir: 1 };

    function setConfig(c) {
      if (built) { scene.remove(built.char, built.shadow); built.dispose(); }
      built = buildCharacter(c);
      scene.add(built.char, built.shadow);
    }
    function resize() {
      const w = container.clientWidth || 1, h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const baseFov = (VIEWS[opts.view || 'full'] || VIEWS.full).fov;
      camera.fov = 2 * Math.atan(Math.tan(baseFov * Math.PI / 360) / Math.min(1, camera.aspect)) * 180 / Math.PI;
      camera.updateProjectionMatrix();
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container);
    resize();
    setConfig(cfgIn);

    let raf = 0, last = performance.now(), alive = true;
    function frame(t) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0, Math.min(100, t - last)); last = t;
      if (!st.paused) pose(built, st, t, dt);
      if (st.angle != null) built.char.rotation.y = st.angle;
      if(opts.followWalk){
        const travel=st.state==='walk'?(built.motionTravel||0):0,a=built.char.rotation.y;
        const x=Math.sin(a)*travel,z=Math.cos(a)*travel;
        built.char.position.set(x,0,z);built.shadow.position.x=x;built.shadow.position.z=z;
        camera.position.x+=x-(st.cameraX||0);camera.position.z+=z-(st.cameraZ||0);st.cameraX=x;st.cameraZ=z;
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return {
      setConfig,
      setState(s) { if (st.state !== s) { st.enteredAt = performance.now(); st.phase = 0; } st.state = s; },
      setAngle(a) { st.angle = a; },
      setPaused(p) { st.paused = !!p; },
      setDir(d) { st.dir = d < 0 ? -1 : 1; },
      get config() { return built.cfg; },
      destroy() { alive = false; cancelAnimationFrame(raf); if (ro) ro.disconnect(); built.dispose(); scene.environment.dispose(); renderer.dispose(); container.innerHTML = ''; },
    };
  }

  /* ---- 썸네일 / PNG ---- */
  let shared = null;
  function renderImage(cfg, view = 'full', size = 160, state = 'perch') {
    const THREE = makeCtx();
    if (!shared) {
      const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      r.setClearColor(0x000000, 0);
      shared = { r, scene: makeScene(THREE, r) };
    }
    const { r, scene } = shared;
    r.setPixelRatio(1);
    r.setSize(size, size, false);
    r.shadowMap.enabled = size > 256;
    r.shadowMap.needsUpdate = true;
    const b = buildCharacter(cfg);
    if (view === 'face' || view === 'ears' || view === 'bust') b.shadow.visible = false;
    scene.add(b.char, b.shadow);
    pose(b, { state, dir: 1 }, 0, 100000);
    b.parts.setFace(state === 'sit' ? 'closed' : state === 'drag' ? 'squint' : state === 'fall' ? 'wide' : 'normal', state === 'drag' || state === 'fall' ? 'o' : 'normal');
    b.char.rotation.y = 0;
    r.render(scene, camFor(THREE, view));
    const url = r.domElement.toDataURL('image/png');
    scene.remove(b.char, b.shadow);
    b.dispose();
    return url;
  }

  function poseMetrics(b) {
    const THREE=makeCtx(), P=b.parts;
    b.char.updateMatrixWorld(true);
    const bounds=o=>{const box=new THREE.Box3();o.traverseVisible(m=>{if(m.isMesh){m.geometry.computeBoundingBox();box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld));}});return box.min.y;};
    return {
      travel:b.motionTravel||0, support:b.motionSupport,
      characterScale:b.char.scale.toArray(), headScale:P.head.scale.toArray(), bodyScale:P.body.scale.toArray(),
      neckToHip:P.neck.position.y-P.hips.position.y,
      feet:P.legs.map(L=>({floorY:bounds(L.userData.paw),z:L.position.z,worldZ:L.position.z+(b.motionTravel||0),scale:L.userData.paw.scale.toArray()})),
      arms:P.arms.map(A=>({rotationX:A.rotation.x,position:A.position.toArray()}))
    };
  }
  function auditMotion(cfg, samples=240) {
    const b=buildCharacter(cfg),st={state:'walk',dir:1,nextBlink:Infinity};
    const tempo={gentle:.86,playful:1.16,shy:.9,affectionate:.98}[b.cfg.personality];
    const speed=b.parts.design==='starlight-v1'?.0045:.0085;
    const dt=Math.PI*2/(samples*speed*tempo),frames=[];
    pose(b,st,0,0);frames.push(poseMetrics(b));
    for(let i=1;i<=samples*2;i++){pose(b,st,i*dt,dt);frames.push(poseMetrics(b));}
    b.dispose();return frames;
  }
  function uvSurface(THREE,g,u,v) {
    const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal,ix=g.index.array;
    for(let j=0;j<ix.length;j+=3){
      const a=ix[j],b=ix[j+1],c=ix[j+2],ax=uv.getX(a),ay=uv.getY(a),bx=uv.getX(b),by=uv.getY(b),cx=uv.getX(c),cy=uv.getY(c);
      const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(det)<1e-10)continue;
      const wa=((by-cy)*(u-cx)+(cx-bx)*(v-cy))/det,wb=((cy-ay)*(u-cx)+(ax-cx)*(v-cy))/det,wc=1-wa-wb;
      if(Math.min(wa,wb,wc)<-1e-7)continue;
      return {point:new THREE.Vector3(p.getX(a)*wa+p.getX(b)*wb+p.getX(c)*wc,p.getY(a)*wa+p.getY(b)*wb+p.getY(c)*wc,p.getZ(a)*wa+p.getZ(b)*wb+p.getZ(c)*wc),normal:new THREE.Vector3(n.getX(a)*wa+n.getX(b)*wb+n.getX(c)*wc,n.getY(a)*wa+n.getY(b)*wb+n.getY(c)*wc,n.getZ(a)*wa+n.getZ(b)*wb+n.getZ(c)*wc).normalize()};
    }
  }
  // Review-only view-aware expression: draw one eye and blush in the viewing
  // plane, then back-project them into the existing head UV triangles. There
  // is no floating decal, extra eye mesh, or geometry/normal change.
  function sideExpression(THREE,b,camera,angle,design) {
    const amount=Math.max(0,Math.min(1,(Math.abs(angle)-Math.PI/6)/(Math.PI/3)));
    if(!amount)return;
    const t=amount*amount*(3-2*amount),side=angle>0?-1:1,skull=b.parts.head.children[0],g=skull.geometry;
    const cv=drawHead(b.cfg,'normal','normal',side),ctx=cv.getContext('2d'),data=ctx.getImageData(0,0,TW,TH);
    const nm=new THREE.Matrix3().getNormalMatrix(skull.matrixWorld),project=q=>q.applyMatrix4(skull.matrixWorld).project(camera);
    const lon=side*(.44+(design?{a:.60,b:.56,c:.66,d:.60}[design]:.40)*t),lat=-.22+b.cfg.tune.eyeY;
    const eye=project(uvSurface(THREE,g,.25+lon/(2*Math.PI),.5+lat/Math.PI).point);
    const cheekLon=lon+side*(.24-.13*t),cheekLat=-.35+b.cfg.tune.eyeY*.6;
    const cheek=project(uvSurface(THREE,g,.25+cheekLon/(2*Math.PI),.5+cheekLat/Math.PI).point);
    // Projected radii are derived from surface landmarks; side expression is
    // deliberately narrower than the front ring, not a front-facing billboard.
    const rad=.112*b.cfg.tune.eyeSize*2.1;
    const sample=(l,a)=>project(uvSurface(THREE,g,.25+l/(2*Math.PI),.5+a/Math.PI).point);
    const top=sample(lon,lat+rad*1.2),bottom=sample(lon,lat-rad*1.2);
    const ry=Math.abs(top.y-bottom.y)/2,rx=ry*(.79-.12*t);
    const rim=.10;
    // Canvas uses sRGB byte colors, unlike Three's linear Color components.
    const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
    const ec=hex(b.cfg.colors.eye),bc=hex(b.cfg.colors.blush);
    const uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal,ix=g.index.array;
    for(let j=0;j<ix.length;j+=3){
      const ids=[ix[j],ix[j+1],ix[j+2]],us=ids.map(k=>uv.getX(k)*TW),vs=ids.map(k=>(1-uv.getY(k))*TH);
      const x0=Math.max(0,Math.floor(Math.min(...us))),x1=Math.min(TW-1,Math.ceil(Math.max(...us))),y0=Math.max(0,Math.floor(Math.min(...vs))),y1=Math.min(TH-1,Math.ceil(Math.max(...vs)));
      if(y1<TH*.48||y0>TH*.76||side<0&&x0>TW*.25||side>0&&x1<TW*.25)continue;
      const det=(vs[1]-vs[2])*(us[0]-us[2])+(us[2]-us[1])*(vs[0]-vs[2]);if(Math.abs(det)<1e-8)continue;
      const points=ids.map(k=>new THREE.Vector3().fromBufferAttribute(p,k)),normals=ids.map(k=>new THREE.Vector3().fromBufferAttribute(n,k));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const a=((vs[1]-vs[2])*(x+.5-us[2])+(us[2]-us[1])*(y+.5-vs[2]))/det,bw=((vs[2]-vs[0])*(x+.5-us[2])+(us[0]-us[2])*(y+.5-vs[2]))/det,c=1-a-bw;if(Math.min(a,bw,c)<0)continue;
        const pos=points[0].clone().multiplyScalar(a).addScaledVector(points[1],bw).addScaledVector(points[2],c).applyMatrix4(skull.matrixWorld);
        const normal=normals[0].clone().multiplyScalar(a).addScaledVector(normals[1],bw).addScaledVector(normals[2],c).applyMatrix3(nm).normalize();
        if(normal.dot(camera.position.clone().sub(pos).normalize())<.04)continue;
        const q=pos.project(camera),ex=(q.x-eye.x)/rx,ey=(q.y-eye.y)/ry,d=Math.sqrt(ex*ex+ey*ey);
        const stroke=Math.max(0,Math.min(1,(rim-Math.abs(d-1))/.035));
        const lid=Math.abs(ex)<.93?Math.max(0,Math.min(1,(.09-Math.abs(ey-(-.15+.28*ex*ex)))/.035)):0;
        const cheekR=ry*.68,cd=((q.x-cheek.x)/cheekR)**2+((q.y-cheek.y)/(cheekR*.72))**2;
        const blush=b.cfg.blush?Math.max(0,Math.min(1,(1-cd)*4))*.90:0,offset=(y*TW+x)*4;
        for(let k=0;k<3;k++){data.data[offset+k]=data.data[offset+k]*(1-blush)+bc[k]*blush;const alpha=Math.max(stroke,lid);data.data[offset+k]=data.data[offset+k]*(1-alpha)+ec[k]*alpha;}
      }
    }
    // Fade only during the first 15 degrees of the transition, before the
    // side landmark moves appreciably. This avoids a texture-switch pop.
    const f=Math.min(1,amount*4),fade=f*f*(3-2*f);
    if(fade<1){const base=drawHead(b.cfg,'normal','normal').getContext('2d').getImageData(0,0,TW,TH).data;for(let k=0;k<data.data.length;k++)data.data[k]=base[k]*(1-fade)+data.data[k]*fade;}
    ctx.putImageData(data,0,0);skull.material.map.image=cv;skull.material.map.needsUpdate=true;
  }

  // Proposal-only section lofts. Each latitude ring preserves the approved front projection,
  // while its front/back section is rebuilt from authored profiles.
  // The live character, seated pose and gait do not use these candidates.
  function sculptSideProposal(THREE,b,key,allocated,earJoin = true) {
    const designs={
      a:{front:[0,.36,.68,.85,.86,.70,.39,0],back:[0,.34,.65,.84,.85,.71,.41,0],ear:.42,lean:.34,backBody:.025},
      d:{front:[0,.40,.78,.93,.82,.65,.35,0],back:[0,.32,.61,.79,.88,.79,.48,0],ear:.42,lean:.34,backBody:.025},
      b:{front:[0,.31,.58,.75,.77,.65,.36,0],back:[0,.32,.67,.90,.97,.84,.48,0],ear:.36,lean:.44,backBody:.055},
      c:{front:[0,.44,.82,.93,.84,.64,.33,0],back:[0,.32,.62,.76,.78,.65,.36,0],ear:.48,lean:.27,backBody:.015}
    },d=designs[key];if(!d)return;
    const interp=(values,t)=>{const q=Math.max(0,Math.min(.999999,t))*7,i=Math.floor(q),u=q-i;
      const p0=values[Math.max(0,i-1)],p1=values[i],p2=values[i+1],p3=values[Math.min(7,i+2)];
      return Math.max(0,.5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u));};
    const skull=b.parts.head.children[0],g=skull.geometry.clone(),v=g.attributes.position,uv=g.attributes.uv,rings={};
    // Preserve the approved front projection, including facial landmarks,
    // while rebuilding depth. Move along its original front-camera ray.
    const savedYaw=b.char.rotation.y;b.char.rotation.y=0;b.char.updateMatrixWorld(true);
    const localCamera=camFor(THREE,'full').position.clone().applyMatrix4(skull.matrixWorld.clone().invert());
    b.char.rotation.y=savedYaw;
    for(let i=0;i<v.count;i++){const row=Math.round(uv.getY(i)*54),r=rings[row]||(rings[row]={front:0,back:0});r[v.getZ(i)>=0?'front':'back']=Math.max(r[v.getZ(i)>=0?'front':'back'],Math.abs(v.getZ(i)));}
    for(let i=0;i<v.count;i++){const z=v.getZ(i),t=uv.getY(i),row=Math.round(t*54),side=z>=0?'front':'back',radius=rings[row][side];
      // Ring shape is an ellipse, not a global scale or local Gaussian bulge.
      const nz=radius>1e-6?Math.sign(z)*interp(d[side],t)*Math.abs(z)/radius:0;
      const rayScale=(nz-localCamera.z)/(z-localCamera.z);
      v.setXYZ(i,localCamera.x+(v.getX(i)-localCamera.x)*rayScale,localCamera.y+(v.getY(i)-localCamera.y)*rayScale,nz);
    }
    smoothSeamNormals(g);skull.geometry=g;allocated.push(g);
    b.parts.ears.forEach((e,index)=>{const sx=index?1:-1,outer=e.children[0],inner=e.children[1];
      const eg=outer.userData.seatedGeometry.clone(),p=eg.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=Math.max(0,Math.min(1,y/.45));
        // Broad base, rounded upper cross-section, and an outward-facing cup.
        p.setZ(i,z*(z<0?d.ear/.18:1)-sx*d.lean*x);
        if(z<0)p.setY(i,y-.105*(1-t)*(Math.abs(z)/.18));
      }
      smoothSeamNormals(eg);outer.geometry=eg;allocated.push(eg);
      const ig=inner.geometry.clone(),q=ig.attributes.position;
      for(let i=0;i<q.count;i++)q.setZ(i,q.getZ(i)-sx*d.lean*1.2*q.getX(i));
      smoothSeamNormals(ig);inner.geometry=ig;allocated.push(ig);
    });
    if((key==='a'||key==='d') && earJoin){
      // Sink the lower ear into the actual sculpted head surface. The tip,
      // ear spacing and head geometry stay fixed; there is no added collar.
      const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),surface=new THREE.Mesh(g,material),ray=new THREE.Raycaster();surface.updateMatrixWorld(true);
      b.parts.ears.forEach(e=>{e.updateMatrix();e.children.slice(0,2).forEach(m=>{
        m.updateMatrix();const toHead=e.matrix.clone().multiply(m.matrix),fromHead=toHead.clone().invert(),p=m.geometry.attributes.position;
        for(let i=0;i<p.count;i++){
          const local=new THREE.Vector3().fromBufferAttribute(p,i),inEar=local.clone().applyMatrix4(m.matrix);
          const t=Math.max(0,Math.min(1,inEar.y/.45)),weight=Math.pow(Math.max(0,1-t/.62),1.5);
          if(!weight)continue;
          // Broaden only the root footprint; retain the upper ear and front spacing.
          if(earJoin==='blend'){
            local.x*=1+.13*weight;
            local.z*=1+.25*weight;
            local.z-=.025*weight;
          }
          const q=local.applyMatrix4(toHead),direction=q.clone().normalize();ray.set(direction.clone().multiplyScalar(3),direction.clone().negate());
          const hit=ray.intersectObject(surface)[0];if(!hit)continue;
          const target=hit.point.clone().addScaledVector(direction,earJoin==='blend'?-.075:-.045);
          q.lerp(target,weight).applyMatrix4(fromHead);p.setXYZ(i,q.x,q.y,q.z);
        }
        smoothSeamNormals(m.geometry);
        if(earJoin==='blend'){
          // Match the root's shading tangent to the head surface, fading out
          // above the attachment. Geometry remains independently poseable.
          const normals=m.geometry.attributes.normal;
          const normalBack=new THREE.Matrix3().getNormalMatrix(fromHead);
          for(let i=0;i<p.count;i++){
            const q=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(toHead),dir=q.clone().normalize();
            ray.set(dir.clone().multiplyScalar(3),dir.clone().negate());
            const hit=ray.intersectObject(surface)[0];if(!hit)continue;
            const distance=q.distanceTo(hit.point),w=Math.max(0,1-distance/.14);
            if(!w)continue;
            const n=hit.face.normal.clone().applyMatrix3(normalBack).normalize();
            const current=new THREE.Vector3().fromBufferAttribute(normals,i);
            current.lerp(n,w*w*(3-2*w)).normalize();normals.setXYZ(i,current.x,current.y,current.z);
          }
          normals.needsUpdate=true;
        }
      });});material.dispose();
    }
    const body=b.parts.body,bg=body.geometry.clone(),p=bg.attributes.position;
    for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z<0)p.setZ(i,z-d.backBody*Math.pow(-z,2));}
    smoothSeamNormals(bg);body.geometry=bg;allocated.push(bg);
    // Keep limb sizes and XY roots. Recess the shoulder slightly into the
    // thorax; a rear offset separates hand and tail naturally in the profile.
    b.parts.arms.forEach(a=>a.position.z-=key==='b'?.025:.012);
  }

  function renderSnapshot(cfg, options = {}) {
    const THREE = makeCtx();
    if (!shared) renderImage(cfg,'full',16);
    const {r,scene}=shared, size=options.size || 400;
    r.setPixelRatio(1); r.setSize(size,size,false); r.shadowMap.enabled=options.camera==='web';r.shadowMap.needsUpdate=true;
    const b=buildCharacter(cfg), state=options.state || 'perch';
    const st={state,dir:1,enteredAt:0,nextBlink:Infinity};
    // Optional transition regression uses the same instance, not a new model.
    if(options.fromStand){st.state='stand';pose(b,st,0,16);st.state=state;}
    // Establish the pose, then sample the desired point of the gait cycle.
    if(options.staticPose) pose(b,st,0,100000);
    else for(let i=0;i<90;i++) pose(b,st,i*16,16);
    if(state==='walk') {
      st.phase=options.phase || 0;
      if(b.parts.design==='starlight-v1')pose(b,st,1200,0);
      else for(let i=0;i<40;i++) {st.phase=(options.phase || 0)-16*.0085*({gentle:.86,playful:1.16,shy:.9,affectionate:.98}[b.cfg.personality]);pose(b,st,1200,16);}
    }
    if(options.expression) b.parts.setFace(options.expression,options.expression==='wide'?'o':'normal');
    b.char.rotation.y=options.angle || 0;
    if (b.parts.design !== 'starlight-v1') b.char.scale.set(1,1,1);
    b.parts.zs.forEach(z=>z.visible=false); b.parts.hearts.forEach(h=>h.visible=false);
    let half=1.48, centerY=1.28, centerX=0;
    if(options.headOnly) {
      b.parts.rig.children.forEach(c=>{if(c!==b.parts.neck)c.visible=false;});
      b.shadow.visible=false; half=1.10; centerY=b.parts.neck.position.y+b.parts.head.position.y;
    }
    if(options.detail==='ear') {half=.47;centerX=-.64;centerY=1.96;b.shadow.visible=false;}
    if(options.detail==='paw') {half=.28;centerX=-.25;centerY=.19;b.shadow.visible=false;}
    if(options.detail==='tail') {half=.48;centerY=.34;b.char.rotation.y=Math.PI;b.shadow.visible=false;}
    const camera=options.camera==='web'?camFor(THREE,'full'):new THREE.OrthographicCamera(-half,half,half,-half,.1,50);
    if(options.camera!=='web'){camera.position.set(centerX,centerY,8);camera.lookAt(centerX,centerY,0);}
    const reviewGeometries=[];
    if(options.sideExpression && !options.sideDesign && state==='stand' && b.parts.design==='starlight-v1'){
      b.parts.ears.forEach(e=>{const m=e.children[0],geo=m.geometry.clone(),v=geo.attributes.position;
        for(let i=0;i<v.count;i++){const z=v.getZ(i),y=v.getY(i);if(z<0){const weight=Math.min(1,-z/.12);v.setZ(i,z*1.35);v.setY(i,y-.05*weight*Math.pow(Math.max(0,y/.45),2)-.07*weight*Math.pow(Math.max(0,1-y/.45),2));}}
        smoothSeamNormals(geo);m.geometry=geo;reviewGeometries.push(geo);
      });
    }
    if(options.sideDesign && state==='stand' && b.parts.design==='starlight-v1')sculptSideProposal(THREE,b,options.sideDesign,reviewGeometries,options.earJoin===undefined?true:options.earJoin);
    b.char.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    if((options.sideExpression||options.sideDesign) && state==='stand' && b.parts.design==='starlight-v1')sideExpression(THREE,b,camera,options.angle||0,options.sideDesign);
    let faceAudit=null;
    if(options.faceAudit && b.parts.design==='starlight-v1'){
      b.char.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      const skull=b.parts.head.children[0],g=skull.geometry,uv=g.attributes.uv,p=g.attributes.position,n=g.attributes.normal;
      const ray=new THREE.Raycaster(),nm=new THREE.Matrix3().getNormalMatrix(skull.matrixWorld);
      const sweep=[];
      for(const degree of (options.sweep?Array.from({length:91},(_,i)=>i):[(options.angle||0)*180/Math.PI])){
      b.char.rotation.y=degree*Math.PI/180;b.char.updateMatrixWorld(true);nm.getNormalMatrix(skull.matrixWorld);
      faceAudit={};
      for(const [name,lon,lat] of [['leftEye',-.44,-.22],['rightEye',.44,-.22],['leftBlush',-.68,-.35],['rightBlush',.68,-.35]]){
        const u=.25+lon/(2*Math.PI),v=.5+lat/Math.PI,sample=uvSurface(THREE,g,u,v);
        const point=sample.point.applyMatrix4(skull.matrixWorld),dir=point.clone().sub(camera.position).normalize();
        ray.set(camera.position,dir);const hits=ray.intersectObject(skull);
        const normal=sample.normal.applyMatrix3(nm).normalize();
        faceAudit[name]={normalToCamera:normal.dot(dir.clone().negate()),visible:!!hits.length&&Math.abs(hits[0].distance-camera.position.distanceTo(point))<.015,uv:[u,v]};
      }
      sweep.push({angle:degree,...faceAudit});
      }
      b.char.rotation.y=options.angle||0;b.char.updateMatrixWorld(true);
      if(options.sweep){
        const section=[];for(let k=0;k<p.count;k++)if(Math.abs(p.getX(k))<.00001)section.push([p.getY(k),p.getZ(k)]);
        faceAudit={sweep,section,vertices:p.count,triangles:g.index.count/3};
      }
    }
    if(options.textureOnly){const texture=b.parts.head.children[0].material.map.image.toDataURL();b.dispose();return texture;}
    let silhouetteMaterial=null;
    if(options.silhouette){silhouetteMaterial=new THREE.MeshBasicMaterial({color:0x20172a});b.char.traverse(o=>{if(o.isMesh)o.material=silhouetteMaterial;});b.shadow.visible=false;}
    scene.add(b.char,b.shadow);r.render(scene,camera);
    const url=r.domElement.toDataURL('image/png');const project=o=>{const v=new THREE.Vector3();o.getWorldPosition(v);v.project(camera);return [(v.x+1)*size/2,(1-v.y)*size/2];};
    const joints=options.debug?{
      torso:project(b.parts.hips),head:project(b.parts.neck),
      shoulders:b.parts.arms.map(project),hips:b.parts.legJoints.map(project),ankles:b.parts.legs.map(project)
    }:undefined;
    const result=options.diagnostics?{url,metrics:poseMetrics(b),joints,faceAudit}:url;scene.remove(b.char,b.shadow);b.dispose();reviewGeometries.forEach(g=>g.dispose());if(silhouetteMaterial)silhouetteMaterial.dispose();return result;
  }

  function renderPairImage(primary, partner, size = 1024) {
    if (!partner) return renderImage(primary,'full',size);
    const THREE = makeCtx();
    if (!shared) renderImage(primary,'full',16);
    const {r,scene}=shared; r.setPixelRatio(1); r.setSize(size,size,false);
    r.shadowMap.enabled=false;
    const pair=[buildCharacter(primary),buildCharacter(partner)];
    pair.forEach((b,i)=>{
      pose(b,{state:'perch',dir:i? -1:1},0,100000);
      b.char.scale.multiplyScalar(0.64); b.char.position.set(i?0.64:-0.64,0.35,0); b.char.rotation.y=0;
      b.shadow.scale.set(0.64,0.64,0.64); b.shadow.position.set(i?0.64:-0.64,0.35,0);
      scene.add(b.char,b.shadow);
    });
    r.render(scene,camFor(THREE,'full')); const url=r.domElement.toDataURL('image/png');
    pair.forEach(b=>{scene.remove(b.char,b.shadow);b.dispose();}); return url;
  }

  const PERSONALITIES = {
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

  const api = { auditMotion, renderSnapshot, walkFoot, renderPairImage, PERSONALITIES, chooseAction, socialAction, OPTIONS, TUNE, COLOR_LABELS, DEFAULT, FOOT, normalize, encode, decode, randomize, createPet, renderImage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PpolPet = api;
})(typeof window !== 'undefined' ? window : globalThis);
