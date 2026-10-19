import {placementLimits,placementEnabled} from './face-layout.mjs';
export function makePlacementUI(panel,options,getParts,setParts){
 const box=document.createElement('section');box.className='placement-box';
 const title=document.createElement('h3');title.textContent='파츠 배치';
 const select=document.createElement('select');select.setAttribute('aria-label',(panel.id==='facePanel'?'코·입·볼':'눈')+' 배치할 파츠');select.id=panel.id+'-placement';
 for(const [key,name] of options){const option=document.createElement('option');option.value=key;option.textContent=name;select.append(option)}
 const hint=document.createElement('p');hint.className='fine';
 const preview=document.createElement('canvas');preview.width=320;preview.height=320;preview.className='placement-preview';preview.setAttribute('aria-label','배치 조절 실시간 미리보기');
 const controls=document.createElement('div');controls.className='placement-controls';
 const change=(axis,value)=>setParts({...getParts(),[select.value+axis]:Math.round(value*1000)/1000});
 const arrows=document.createElement('div');arrows.className='placement-nudge';
 for(const [label,axis,delta]of [['←','X',-.005],['↑','Y',-.005],['↓','Y',.005],['→','X',.005]]){const b=document.createElement('button');b.textContent=label;b.type='button';b.setAttribute('aria-label',{'←':'왼쪽으로 조금','↑':'위로 조금','↓':'아래로 조금','→':'오른쪽으로 조금'}[label]);b.onclick=()=>change(axis,getParts()[select.value+axis]+delta);arrows.append(b)}
 const fields=[];
 for(const [axis,name]of [['X','좌우'],['Y','위아래'],['Angle','기울기']]){const label=document.createElement('label');label.className='part-range';label.textContent=name;const input=document.createElement('input');input.type='range';input.id=panel.id+'-place-'+axis;input.setAttribute('aria-label','선택한 파츠 '+name);input.step=axis==='Angle'?.01:.005;const output=document.createElement('output');input.oninput=()=>change(axis,+input.value);label.append(input,output);fields.push({axis,input,output});controls.append(label)}
 const reset=document.createElement('button');reset.textContent='이 파츠 배치 초기화';reset.type='button';reset.onclick=()=>{const p={...getParts()};for(const axis of ['X','Y','Angle'])p[select.value+axis]=0;setParts(p)};
 controls.prepend(arrows);controls.append(reset);box.append(title,select,preview,hint,controls);panel.insertBefore(box,panel.querySelector('.part-range'));
 function sync(){const p=getParts(),enabled=placementEnabled(p,select.value);hint.textContent=enabled?'화살표로 조금씩, 슬라이더로 자유롭게 옮겨보세요.':'먼저 새 파츠 모양을 선택해주세요. 원본 그림의 배치는 유지됩니다.';for(const {axis,input,output}of fields){const key=select.value+axis,[min,max]=placementLimits[key];input.min=min;input.max=max;input.value=p[key];output.textContent=axis==='Angle'?Math.round(p[key]*180/Math.PI)+'°':Math.round(p[key]*1000)/10+'%';}for(const el of controls.querySelectorAll('button,input'))el.disabled=!enabled;}
 select.onchange=sync;sync();return sync;
}
