const pet = window.PpolPet.createPet(document.getElementById('pet'), window.PpolPet.DEFAULT);
pet.setState('idle');
document.querySelectorAll('[data-a]').forEach((b) =>
  b.addEventListener('click', () => window.ppol.welcome(b.dataset.a)));
