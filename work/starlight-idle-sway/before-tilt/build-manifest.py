"""Inspect atlas alpha for registration only; keep generated PNG unchanged."""
from PIL import Image
import numpy as np,json
from pathlib import Path
r=Path(__file__).parent;im=np.array(Image.open(r/'assets/idle-sway-v1.png'));h,w=im.shape[:2]
# Selected existing poses, with symmetric return keys. No image warping or face transforms.
order=[0,2,1,2,4,7,3,7]
labels=['가운데','왼쪽으로','왼쪽 기대기','가운데로','가운데','오른쪽으로','오른쪽 기대기','가운데로']
records=[]
for j in range(8):
 x0=round((j%4)*w/4);x1=round((j%4+1)*w/4);y0=round((j//4)*h/2);y1=round((j//4+1)*h/2)
 q=im[y0:y1,x0:x1];mask=q[:,:,3]>128;ys,xs=np.where(mask);bottom=int(ys.max())
 foot=mask & (np.indices(mask.shape)[0]>bottom-14);fy,fx=np.where(foot);origin=[float((fx.min()+fx.max())/2),bottom+1]
 records.append({'sourceRect':[x0,y0,x1-x0,y1-y0],'origin':origin,'bbox':[int(xs.min()),int(ys.min()),int(xs.max()),bottom],'footSpan':int(fx.max()-fx.min())})
scale=220/float(np.median([f['bbox'][3]-f['bbox'][1]+1 for f in records]))
frames=[dict(records[j],sourceCell=j,label=labels[i]) for i,j in enumerate(order)]
cfg={'atlas':'assets/idle-sway-v1.png','atlasSize':[w,h],'size':[256,288],'anchorX':128,'groundY':260,'scale':scale,'duration':2.8,'frames':frames,'allSourceCells':records,'notes':'whole frames, common uniform scale; translated to contact baseline; repeated return keys for gentle loop'}
(r/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2));print(json.dumps({'scale':scale,'footWidthRangePx':[min(f['footSpan'] for f in frames)*scale,max(f['footSpan'] for f in frames)*scale],'sequence':order}))
