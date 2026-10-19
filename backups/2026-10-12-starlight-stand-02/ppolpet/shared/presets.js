// Canonical character configurations shared by the workshop and review tools.
(function(root){
  const P=root.PpolPet;
  const PRESETS = [
    ['모찌 천사', '반짝 별눈 · 리본 날개', { eyes:'jewel', mouth:'w', tail:'pom', acc:['halo','backbow','bowtie'], colors:{body:'#fffaf7',accent:'#b6a1df',accent2:'#b6a1df',eye:'#514355'} }],
    ['졸린 곰', '반달 눈 · 통통 젤리', { ears:'bear',tail:'bunny',eyes:'sleepy',whisk:false,mouth:'cat',colors:{body:'#f5a0bb',inner:'#ffd0df'} }],
    ['별빛냥', '동그란 링 눈', { design:'starlight-v1',eyes:'orbit',mouth:'open',tail:'pom',whisk:false,colors:{body:'#8c8ac6',eye:'#efd496'} }],
    ['졸린 토끼', '리본을 단 잠꾸러기', { ears:'bunny',tail:'bunny',eyes:'drowsy',mouth:'open',whisk:false,acc:['ribbon'],colors:{body:'#fffaf7',accent:'#b6a1df'} }],
    ['살구냥', '따뜻한 햇살 한 조각', { eyes:'round',mouth:'open',tail:'pom',colors:{body:'#ffcf91',inner:'#ffc2ce'} }],
    ['구름 멍', '모자 쓴 작은 친구', { ears:'dog',tail:'cloud',eyes:'round',mouth:'w',whisk:false,acc:['beanie'],colors:{body:'#fff7e9',pattern:'#e8bc85',accent:'#b5a4e5'} }],
  ];
  const presetConfig = ([name,, patch]) => P.normalize({...P.DEFAULT,...patch,name,colors:{...P.DEFAULT.colors,...patch.colors}});
  root.PpolPresets = { PRESETS, presetConfig };
})(window);
