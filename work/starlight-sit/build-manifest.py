from PIL import Image
import numpy as np,json,hashlib
from pathlib import Path
p=Path(__file__).parent
im=Image.open(p/'assets/sit-v1.png').convert('RGBA'); a=np.array(im);w,h=im.size
labels=['서 있기','무게중심 내리기','무릎 접기','발 앞으로','엉덩이 내려놓기','앉기','자리 잡기','편하게 앉아 있기']
durations=[.5,.14,.14,.16,.18,.18,.2,1.8]
frames=[]
for i in range(8):
 x0=round(i%4*w/4);x1=round((i%4+1)*w/4);y0=round(i//4*h/2);y1=round((i//4+1)*h/2)
 cell=a[y0:y1,x0:x1]; yy,xx=np.where(cell[:,:,3]>128)
 bottom=int(yy.max());feet=np.where((cell[:,:,3]>128)&(np.indices(cell.shape[:2])[0]>bottom-15))[1]
 origin=[float((xx.min()+xx.max())/2),bottom+1]
 frames.append(dict(sourceRect=[x0,y0,x1-x0,y1-y0],origin=origin,bbox=[int(xx.min()),int(yy.min()),int(xx.max()),bottom],duration=durations[i],label=labels[i]))
scale=220/(frames[0]['bbox'][3]-frames[0]['bbox'][1]+1)
cfg=dict(atlas='assets/sit-v1.png',atlasSize=[w,h],size=[256,288],groundY=260,scale=scale,frames=frames)
(p/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
print(json.dumps(cfg,ensure_ascii=False,indent=2))
