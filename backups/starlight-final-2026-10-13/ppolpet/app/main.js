const { app, BrowserWindow, screen, ipcMain, Menu, dialog, clipboard, shell } = require('electron');
const path = require('path');
const { randomUUID } = require('crypto');
const fs = require('fs');
const P = require('./pet-render.js');

// 웹 꾸미기 주소 (GitHub Pages 올린 뒤 바꾸기)
const MAKER_URL = 'https://YOUR-ID.github.io/ppolpet/';
const PROTOCOL = 'ppolpet';
const MAX_PETS = 12;
const SIZES = { small: 130, normal: 180, big: 250 };

/* ---------- 한 번만 켜지게 + 링크/파일로 열기 ---------- */
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const pending = [];
let ready = false;
function handleInput(arg) {
  if (!arg || typeof arg !== 'string') return;
  if (arg.startsWith(PROTOCOL + '://')) {
    try { const cfg = P.decode(arg); ready ? addPet(cfg, true) : pending.push(cfg); }
    catch { if (ready) warn('링크에서 캐릭터를 읽지 못했어요.'); }
  } else if (arg.toLowerCase().endsWith('.ppol')) {
    const cfg = readPpol(arg);
    if (cfg) ready ? addPet(cfg, true) : pending.push(cfg);
  }
}
app.on('open-url', (e, url) => { e.preventDefault(); handleInput(url); });
app.on('open-file', (e, file) => { e.preventDefault(); handleInput(file); });
app.on('second-instance', (_e, argv) => {
  const hit = argv.find((a) => a.startsWith(PROTOCOL + '://') || a.toLowerCase().endsWith('.ppol'));
  if (hit) handleInput(hit);
  else if (pets.size === 0) openWelcome();
});
process.argv.slice(1).forEach(handleInput);

function readPpol(file) {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    return P.normalize(raw.character || raw);
  } catch {
    if (ready) warn('캐릭터 파일을 읽지 못했어요.');
    return null;
  }
}
function warn(msg) { dialog.showMessageBox({ type: 'info', message: msg, buttons: ['확인'] }); }

/* ---------- 저장 (꺼내놓은 아이들 기억하기) ---------- */
const storeFile = () => path.join(app.getPath('userData'), 'pets.json');
function loadStore() {
  try {
    const s = JSON.parse(fs.readFileSync(storeFile(), 'utf8'));
    return Array.isArray(s.pets) ? s.pets : [];
  } catch { return []; }
}
function saveStore() {
  const list = [...pets.values()].map((p) => ({ cfg: p.cfg, size: p.sizeKey, pairId:p.pairId, relation:p.relation }));
  try { fs.writeFileSync(storeFile(), JSON.stringify({ pets: list }, null, 2)); } catch {}
}

/* ---------- 펫 ---------- */
const pets = new Map(); // webContents.id -> pet
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const areaAt = (x, y) => screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) }).workArea;

function addPet(cfgIn, announce, sizeKey = 'normal', pairId = null, expand = true, relation = null) {
  const incoming = P.normalize(cfgIn);
  const needsPartner = expand && incoming.relationship;
  if (pets.size + (needsPartner ? 2 : 1) > MAX_PETS) { warn(`한 번에 ${MAX_PETS}마리까지 꺼낼 수 있어요.`); return; }
  const cfg = incoming;
  if (needsPartner) { pairId = randomUUID(); relation = cfg.relationship.kind; }
  const size = SIZES[sizeKey] || SIZES.normal;
  const d = screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).workArea;
  const x = rand(d.x, d.x + d.width - size);
  const y = d.y;

  const win = new BrowserWindow({
    width: size, height: size, x: Math.round(x), y: Math.round(y),
    transparent: true, frame: false, resizable: false, maximizable: false, fullscreenable: false,
    alwaysOnTop: true, skipTaskbar: true, hasShadow: false, focusable: true,
    show: false, acceptFirstMouse: true, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  if (process.platform === 'darwin') win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'pet.html'));

  const pet = { win, cfg, pairId, relation, socialAt:0, socialCooldown:Date.now()+3000, size, sizeKey, x, y, vx: 0, vy: 0, state: 'fall', dir: 1, timer: 0, drag: null, sent: '' };
  const id = win.webContents.id;
  pets.set(id, pet);
  closeWelcome();
  win.webContents.on('did-finish-load', () => { win.webContents.send('config', cfg); push(pet, true); });
  win.once('ready-to-show', () => win.showInactive());
  win.on('closed', () => {
    pets.delete(id);
    if (!quitting) saveStore();
    if (pets.size === 0 && !quitting) openWelcome();
  });
  saveStore();
  if (announce && process.platform === 'darwin') app.focus({ steal: false });
  if (needsPartner) addPet(cfg.relationship.partner, false, sizeKey, pairId, false, relation);
}

function push(p, force) {
  const key = p.state + '|' + p.dir;
  if (!force && key === p.sent) return;
  p.sent = key;
  if (!p.win.isDestroyed()) p.win.webContents.send('pet', { state: p.state, dir: p.dir });
}

function nextAction(p) {
  p.state = P.chooseAction(p.cfg);
  if (p.state === 'walk') p.dir = Math.random() < 0.5 ? -1 : 1;
  p.timer = p.state === 'sit' ? rand(240,600) : p.state === 'hop' ? 55 * Math.ceil(rand(2,4)) : rand(100,280);
}

function coordinatePairs() {
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
function tick() {
  for (const p of pets.values()) {
    if (p.win.isDestroyed()) continue;
    const a = areaAt(p.x + p.size / 2, p.y + p.size / 2);
    const floor = a.y + a.height - p.size + Math.round(p.size * P.FOOT);
    const left = a.x, right = a.x + a.width - p.size;

    if (p.drag) {
      const c = screen.getCursorScreenPoint();
      const nx = c.x - p.drag.ox, ny = c.y - p.drag.oy;
      if (Math.abs(c.x - p.drag.sx) + Math.abs(c.y - p.drag.sy) > 4) p.drag.moved = true;
      if (p.drag.moved) {
        p.vx = nx - p.x; p.vy = ny - p.y; p.x = nx; p.y = ny; p.state = 'drag';
        if (p.vx > 1) p.dir = 1; else if (p.vx < -1) p.dir = -1;
      }
    } else if (p.y < floor - 0.5 || p.vy < 0) {
      p.state = 'fall';
      p.vy = Math.min(p.vy + 0.9, 30);
      p.x += p.vx; p.y += p.vy; p.vx *= 0.99;
      if (p.x < left) { p.x = left; p.vx = -p.vx * 0.5; }
      if (p.x > right) { p.x = right; p.vx = -p.vx * 0.5; }
      if (p.vx > 1) p.dir = 1; else if (p.vx < -1) p.dir = -1;
      if (p.y >= floor) { p.y = floor; p.vy = 0; p.vx = 0; p.state = 'idle'; p.timer = rand(40, 120); }
    } else {
      p.y = floor;
      if (p.state === 'walk') {
        p.x += p.dir * P.PERSONALITIES[p.cfg.personality].speed * 0.42;
        if (p.x <= left) { p.x = left; p.dir = 1; }
        if (p.x >= right) { p.x = right; p.dir = -1; }
      }
      if (--p.timer <= 0) nextAction(p);
    }
    p.win.setPosition(Math.round(p.x), Math.round(p.y));
    push(p);
  }
  coordinatePairs();
}

function resize(p, key) {
  const s = SIZES[key];
  p.y += p.size - s;
  p.size = s; p.sizeKey = key;
  p.win.setResizable(true);
  p.win.setBounds({ x: Math.round(p.x), y: Math.round(p.y), width: s, height: s });
  p.win.setResizable(false);
  saveStore();
}

async function importFile(parent) {
  const r = await dialog.showOpenDialog(parent, { filters: [{ name: '뽈뽈펫 캐릭터', extensions: ['ppol', 'json'] }], properties: ['openFile', 'multiSelections'] });
  if (!r.canceled) r.filePaths.forEach((f) => { const c = readPpol(f); if (c) addPet(c, true); });
}
function importClipboard() {
  try { addPet(P.decode(clipboard.readText()), true); }
  catch { warn('복사한 내용에서 캐릭터 코드를 찾지 못했어요. 공방에서 [캐릭터 코드 복사]를 다시 눌러 주세요.'); }
}

/* ---------- 화면에서 오는 신호 ---------- */
ipcMain.on('drag-start', (e) => {
  const p = pets.get(e.sender.id); if (!p) return;
  const c = screen.getCursorScreenPoint();
  p.drag = { ox: c.x - p.x, oy: c.y - p.y, sx: c.x, sy: c.y, moved: false };
});
ipcMain.on('drag-end', (e) => {
  const p = pets.get(e.sender.id); if (!p || !p.drag) return;
  const moved = p.drag.moved; p.drag = null;
  if (!moved) { p.vx = 0; p.vy = -11; p.state = 'fall'; }
  else { p.vx = clamp(p.vx, -25, 25); p.vy = clamp(p.vy, -25, 25); }
});
ipcMain.on('drop-file', (_e, file) => handleInput(file));
ipcMain.on('menu', (e) => {
  const p = pets.get(e.sender.id); if (!p) return;
  Menu.buildFromTemplate([
    { label: `${p.cfg.name}`, enabled: false },
    { label: '이 아이 하나 더 꺼내기', click: () => addPet(p.cfg, false, p.sizeKey) },
    { type: 'separator' },
    { label: '복사한 코드로 데려오기', click: importClipboard },
    { label: '캐릭터 파일 불러오기…', click: () => importFile(p.win) },
    { label: '꾸미러 가기 (공방 열기)', click: () => shell.openExternal(MAKER_URL) },
    { type: 'separator' },
    { label: '발바닥 젤리 보여주기', click: () => { p.state='perch'; p.timer=420; p.socialCooldown=Date.now()+7000; push(p); } },
    { label: '크기', submenu: [['작게', 'small'], ['보통', 'normal'], ['크게', 'big']].map(([label, k]) => ({ label, type: 'radio', checked: p.sizeKey === k, click: () => resize(p, k) })) },
    { label: '컴퓨터 켤 때 같이 켜기', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin, click: (i) => app.setLoginItemSettings({ openAtLogin: i.checked }) },
    { type: 'separator' },
    { label: '얘만 집에 보내기', click: () => p.win.close() },
    { label: '전부 종료', click: () => app.quit() },
  ]).popup({ window: p.win });
});
ipcMain.on('welcome', (_e, action) => {
  if (action === 'maker') shell.openExternal(MAKER_URL);
  else if (action === 'paste') importClipboard();
  else if (action === 'file') importFile(welcome);
  else if (action === 'default') addPet(P.DEFAULT, false);
  else if (action === 'random') addPet(P.randomize(), false);
});

/* ---------- 처음 화면 (꺼낸 아이가 없을 때) ---------- */
let welcome = null;
function openWelcome() {
  if (welcome && !welcome.isDestroyed()) { welcome.show(); welcome.focus(); return; }
  welcome = new BrowserWindow({
    width: 420, height: 470, resizable: false, maximizable: false, title: '뽈뽈펫',
    backgroundColor: '#fffdf9', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  welcome.loadFile(path.join(__dirname, 'welcome.html'));
  welcome.on('closed', () => { welcome = null; if (pets.size === 0 && !quitting) app.quit(); });
}
function closeWelcome() {
  if (welcome && !welcome.isDestroyed()) { const w = welcome; welcome = null; w.destroy(); }
}

let quitting = false;
app.on('before-quit', () => { saveStore(); quitting = true; });
app.on('window-all-closed', () => { if (!welcome) app.quit(); });

app.whenReady().then(() => {
  ready = true;
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  Menu.setApplicationMenu(null);
  loadStore().forEach((s) => addPet(s.cfg, false, s.size, s.pairId || null, false, s.relation || null));
  pending.splice(0).forEach((c) => addPet(c, true));
  if (pets.size === 0) openWelcome();
  setInterval(tick, 16);
});
