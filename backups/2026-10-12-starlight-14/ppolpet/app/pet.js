let pet = null;

window.ppol.onConfig((cfg) => {
  if (pet) pet.setConfig(cfg);
  else pet = window.PpolPet.createPet(document.getElementById('pet'), cfg);
});
window.ppol.onUpdate(({ state, dir }) => {
  if (!pet) return;
  pet.setState(state);
  pet.setDir(dir);
});

document.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  document.body.setPointerCapture(e.pointerId);
  window.ppol.dragStart();
});
document.addEventListener('pointerup', (e) => { if (e.button === 0) window.ppol.dragEnd(); });
window.addEventListener('blur', () => window.ppol.dragEnd());
document.addEventListener('contextmenu', (e) => { e.preventDefault(); window.ppol.menu(); });

// 캐릭터 파일을 바탕화면 아이 위로 끌어다 놓으면 그 아이가 새로 나옴
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  for (const f of e.dataTransfer.files) window.ppol.dropFile(f);
});
