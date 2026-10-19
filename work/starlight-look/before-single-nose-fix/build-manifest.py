from PIL import Image
import numpy as np,json,hashlib
from pathlib import Path
p=Path(__file__).parent
im=Image.open(p/'assets/look-v8-short-arc.png').convert('RGBA');a=np.array(im);w,h=im.size
labels=['앞발 모으기','별 보고 손 들기','반쯤 뻗기','별 쪽으로 뻗기','살짝 닿아볼까','손 거두기','다시 모으기','편하게 돌아오기']
durations=[.6,.18,.18,.45,.35,.18,.18,.9]
frames=[]
for i in range(8):
 x0=round(i%4*w/4);x1=round((i%4+1)*w/4);y0=round(i//4*h/2);y1=round((i//4+1)*h/2)
 cell=a[y0:y1,x0:x1];mask=cell[:,:,3]>128;yy,xx=np.where(mask);bottom=int(yy.max())
 # Anchor the front sole, excluding the low tail from horizontal alignment.
 yygrid,xxgrid=np.indices(mask.shape)
 feet=np.where(mask & (yygrid>bottom-8) & (xxgrid<(x1-x0)*.55))[1]
 frames.append(dict(sourceRect=[x0,y0,x1-x0,y1-y0],origin=[float(feet.min()+(x1-x0)*.158),bottom+1],bbox=[int(xx.min()),int(yy.min()),int(xx.max()),bottom],duration=durations[i],label=labels[i]))
# Reuse the exact outward poses on return to avoid independent silhouette drift.
source_frames=frames
order=[0,1,2,3,3,2,1,0]
frames=[{**source_frames[j],'label':labels[i],'duration':durations[i],'sourcePose':j} for i,j in enumerate(order)]
scale=220/(frames[0]['bbox'][3]-frames[0]['bbox'][1]+1)
cfg=dict(atlas='assets/look-v8-short-arc.png',atlasSize=[w,h],reference='assets/reference.png',referenceRect=[980,803,204,182],size=[256,288],groundY=260,scale=scale,frames=frames)
(p/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2));print(json.dumps(cfg,ensure_ascii=False))
