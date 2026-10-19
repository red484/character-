from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
root=Path(__file__).resolve().parent.parent
cast=root/'ppolpet-cast-review'
m=json.loads((cast/'manifest.json').read_text())
items=json.loads((root/'ppolpet-2d-workshop/walk-review/transfer-prompts.json').read_text())['assets']
def measure(im):
 a=np.array(im.getchannel('A'))>220
 h,w=a.shape
 rows=[]
 for y in range(int(h*.7)):
  xs=np.where(a[y])[0]
  if len(xs)>w*.08:rows.append((xs[-1]-xs[0]+1,(xs[0]+xs[-1])/2,y))
 widest=max(rows)
 # Fixed head anchor derived from broad head rows, not swinging limbs.
 centers=[x for width,x,y in rows if width>widest[0]*.95]
 sole=next(y for y in range(h-1,int(h*.6),-1) if a[y].sum()>w*.035)
 ys,xs=np.where(a)
 return {'width':int(widest[0]),'cx':float(np.median(centers)),'sole':int(sole),'bounds':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)]}
report=[]
for item in items:
 c=next(c for c in m['characters'] if c['id']==item['id'])
 dest=cast/'assets'/c['id']/'walk-starlight-v1.png'
 im=Image.open(dest).convert('RGBA');w,h=im.size;cw=w//2; alpha=np.array(im.getchannel('A'))>220; counts=alpha.sum(1); split=min(range(int(h*.4),int(h*.6)),key=lambda y:(counts[y],abs(y-h/2)))
 old=c['atlases']['walk'];oldim=Image.open(cast/old['src']).convert('RGBA')
 oldwidth=[]
 for f in old['frames']:
  x,y,fw,fh=f['rect'];oldwidth.append(measure(oldim.crop((x,y,x+fw,y+fh)))['width'])
 frames=[];measurements=[]
 for i in range(4):
  x=(i%2)*cw; y=0 if i<2 else split; ch=split if i<2 else h-split; v=measure(im.crop((x,y,x+cw,y+ch)));measurements.append(v)
  frames.append({'rect':[x,y,cw,ch],'origin':[v['cx'],v['sole']],'bounds':v['bounds']})
 scale=float(np.median(oldwidth))*old['scale']/float(np.median([v['width'] for v in measurements]))
 c['atlases']['walkTransfer']={'src':str(dest.relative_to(cast)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'size':[w,h],'scale':round(scale,6),'frames':frames}
 report.append({'character':c['id'],'measurements':measurements,'uniformScale':scale,'headWidthRangePx':(max(v['width'] for v in measurements)-min(v['width'] for v in measurements))*scale})
(cast/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(root/'ppolpet-2d-workshop/walk-review/transfer-alignment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
