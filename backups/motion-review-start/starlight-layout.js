(async()=>{
const load=src=>new Promise((ok,no)=>{const im=new Image;im.onload=()=>ok(im);im.onerror=no;im.src=src;});
const old=await load('layout-assets/previous-render-sheet.png');
function tile(x,y,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(old,x,y,w,h,0,0,w,h);return c.toDataURL();}
const panel=(x,y,w,h,dash='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="52" fill="#fffefd" stroke="#e5dced" stroke-width="3" ${dash?'stroke-dasharray="12 7"':''}/>`;
const txt=(t,x,y,n=30,color='#75618d')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${n}" fill="${color}">${t}</text>`;
const im=(src,x,y,w,h)=>`<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
const label=(s,x,y,w=210)=>`<rect x="${x-w/2}" y="${y-35}" width="${w}" height="56" rx="28" fill="#f2f0ef"/>${txt(s,x,y+3,27,'#695389')}`;
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="3200" height="2400" viewBox="0 0 3200 2400"><defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#e8e3ef" stroke-width="1" opacity=".25"/></pattern><linearGradient id="logo" x2="0" y2="1"><stop stop-color="#cbb9e9"/><stop offset="1" stop-color="#8468a9"/></linearGradient></defs><rect width="3200" height="2400" fill="#fffcf8"/>`;
s+=`<text x="1600" y="278" text-anchor="middle" font-family="system-ui" font-size="205" font-weight="900" fill="url(#logo)">별빛냥</text>`+txt('C h a r a c t e r   S h e e t',1600,374,43)+txt('작고 소중한 너와, 더 따뜻한 하루',1600,436,31,'#b19ccb');
s+=`<g transform="rotate(-10 330 190)">${txt('작은 친구들이',330,155,39,'#b8a3d7')}${txt('만드는 더 밝은 내일.',330,216,39,'#b8a3d7')}</g><g transform="rotate(-9 2880 170)">${txt('Little Friends',2880,130,37,'#b8a3d7')}${txt('Make a',2880,185,37,'#b8a3d7')}${txt('Brighter Tomorrow ♡',2820,245,34,'#b8a3d7')}</g>`;
s+=panel(80,485,2470,770)+`<rect x="80" y="485" width="2470" height="770" rx="52" fill="url(#grid)"/>`+panel(2580,485,550,770,'dash');
const mains=[['정면',90],['뒷면',506],['왼쪽 측면',922],['걷는 모습',1754]];
for(let i=0;i<4;i++){s+=im(tile(mains[i][1]+45,508,310,340),100+i*610,515,595,630)+label(mains[i][0],397+i*610,1192,230);}
s+=txt('☆ Detail',2790,565,39);
const cards=[[2610,620,230,230,2680,540,405,405],[2870,620,230,230,2680,1110,405,405],[2610,900,250,270,2680,1700,405,405]];
for(const [x,y,w,h,sx,sy,sw,sh]of cards)s+=panel(x,y,w,h)+im(tile(sx,sy,sw,sh),x+8,y+8,w-16,h-16);
s+=txt('작고 소중한',2970,994,27,'#b4a0ce')+txt('별빛냥의 디테일 ♡',2960,1044,24,'#b4a0ce');
s+=panel(80,1280,3050,475,'dash')+txt('✿  표정 모음',285,1345,36);
for(let i=0;i<6;i++){s+=im(tile(115+i*416,1180,350,310),110+i*505,1348,450,360)+label(['기본','행복','놀람','수줍음','윙크','졸림'][i],335+i*505,1715,190);}
s+=panel(80,1775,3050,535,'dash')+txt('✿  포즈 &amp; 동작',305,1840,36);
for(const [i,index]of [3,2,0,1,4].entries()){s+=im(tile(151+index*495,1800,350,350),95+i*505,1840,475,405)+label(['앉기','엎드리기','서기','걷기','무언가 보기'][i],332+i*505,2261,220);}
s+=`<g transform="rotate(7 2840 2015)"><rect x="2650" y="1800" width="430" height="485" fill="#ece4d9" opacity=".25" transform="translate(8 10)"/><rect x="2650" y="1800" width="430" height="485" fill="#fff9eb" stroke="#eee3d3" stroke-width="2"/><rect x="2680" y="1778" width="35" height="90" rx="5" fill="#f5deb0" opacity=".8" transform="rotate(-12 2690 1810)"/><rect x="3000" y="1778" width="35" height="90" rx="5" fill="#f5deb0" opacity=".8" transform="rotate(12 3010 1810)"/>${txt('오늘도 반짝이는',2865,1935,33,'#b6a2cf')}${txt('하루야 ☆',2865,1993,35,'#b6a2cf')}${im(tile(126+2*495,1780,400,400),2680,2010,370,270)}</g>`;
s+=`<path d="M370 2350H1050M2150 2350H2840" stroke="#d3c1e6" stroke-width="2"/>`+txt('L I T T L E   F R I E N D S   M A K E   A   B R I G H T E R   T O M O R R O W',1600,2357,22,'#b8a5d0')+'</svg>';
const url=URL.createObjectURL(new Blob([s],{type:'image/svg+xml'}));document.querySelector('#result').src=url;
const rendered=await load(url),c=document.createElement('canvas');c.width=3200;c.height=2400;c.getContext('2d').drawImage(rendered,0,0);document.querySelector('#save').href=c.toDataURL();document.querySelector('#svg').href=url;
document.querySelector('#status').textContent='1차 레이아웃 검수용 · 기존 3D 렌더 임시 배치 · 모델 변경 없음';
})();
