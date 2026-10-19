from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib,shutil
p=Path(__file__).parent
src=Path('/Users/ashwoodfriends/.codex/generated_images/01a137e9-a8cf-7831-bfb9-fe1fb08c25ef/exec-0472b42d-8e91-4a8d-944e-d53ab18151a8.png')
shutil.copy2(src,p/'assets/sulk-v1.png');shutil.copy2('/Users/ashwoodfriends/Downloads/ppolpet-original-six-sheets/references/bear.png',p/'assets/gesture-reference.png')
im=Image.open(p/'assets/sulk-v1.png').convert('RGBA');a=np.array(im);w,h=im.size;frames=[]
labels=['새침하게 서기','앞발 올리기','가슴 앞에 포개기','고개 돌리기','흥! 잠깐 심술','다시 바라보기','앞발 풀기','편하게 돌아오기'];durations=[.6,.22,.26,.23,.85,.25,.25,.65]
for i in range(8):
 x0=round(i%4*w/4);x1=round((i%4+1)*w/4);y0=round(i//4*h/2);y1=round((i//4+1)*h/2);cell=a[y0:y1,x0:x1];m=cell[:,:,3]>128;yy,xx=np.where(m);bottom=int(yy.max());feet=np.where(m[max(0,bottom-8):bottom+1])[1]
 frames.append(dict(label=labels[i],sourceRect=[x0,y0,x1-x0,y1-y0],origin=[float((feet.min()+feet.max())/2),bottom+1],bbox=[int(xx.min()),int(yy.min()),int(xx.max()),bottom],duration=durations[i]))
frames[-1]={**frames[0],'label':labels[-1],'duration':durations[-1]}
cfg=dict(atlas='assets/sulk-v1.png',atlasSize=[w,h],size=[256,288],scale=220/(frames[0]['bbox'][3]-frames[0]['bbox'][1]+1),groundY=260,frames=frames)
(p/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
base={}
for folder in ['starlight-idle-sway','starlight-rest-motion','starlight-sit','starlight-greet','starlight-look','starlight-walk-timing','starlight-expressions']:
 for f in (p.parent/folder).rglob('*'):
  if f.is_file():base[str(f)]=hashlib.sha256(f.read_bytes()).hexdigest()
(p/'baseline-hashes.json').write_text(json.dumps(base,indent=2))
print(json.dumps(cfg,ensure_ascii=False))
