from PIL import Image
import numpy as np,json,hashlib
from pathlib import Path
p=Path(__file__).parent
im=Image.open(p/'assets/look-v1.png').convert('RGBA');a=np.array(im);w,h=im.size
labels=['편하게 앉기','눈길 주기','고개 들기','위쪽 바라보기','조금 갸웃','잠깐 더 보기','고개 내리기','편하게 돌아오기']
durations=[.55,.2,.2,.6,.3,.6,.2,.7]
frames=[]
for i in range(8):
 x0=round(i%4*w/4);x1=round((i%4+1)*w/4);y0=round(i//4*h/2);y1=round((i//4+1)*h/2)
 cell=a[y0:y1,x0:x1];mask=cell[:,:,3]>128;yy,xx=np.where(mask);bottom=int(yy.max())
 feet=np.where(mask & (np.indices(mask.shape)[0]>bottom-12))[1]
 frames.append(dict(sourceRect=[x0,y0,x1-x0,y1-y0],origin=[float((feet.min()+feet.max())/2),bottom+1],bbox=[int(xx.min()),int(yy.min()),int(xx.max()),bottom],duration=durations[i],label=labels[i]))
frames[7]={**frames[0],'label':labels[7],'duration':durations[7]}
scale=220/(frames[0]['bbox'][3]-frames[0]['bbox'][1]+1)
cfg=dict(atlas='assets/look-v1.png',atlasSize=[w,h],reference='assets/reference.png',referenceRect=[980,803,204,182],size=[256,288],groundY=260,scale=scale,frames=frames)
(p/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2));print(json.dumps(cfg,ensure_ascii=False))
