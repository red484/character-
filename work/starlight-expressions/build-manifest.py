from pathlib import Path
from PIL import Image
import numpy as np,json,hashlib
p=Path(__file__).parent
im=Image.open(p/'assets/expressions-v1.png');a=np.array(im);names=['기본','행복','놀람','새침','윙크','졸림'];frames=[]
for i,name in enumerate(names):
 x=i%3*512;y=i//3*512; yy,xx=np.where(a[y:y+512,x:x+512,3]>128)
 frames.append(dict(name=name,sourceRect=[x,y,512,512],origin=[float((xx.min()+xx.max())/2),int(yy.max()+1)],bbox=[int(xx.min()),int(yy.min()),int(xx.max()),int(yy.max())]))
c=dict(atlas='assets/expressions-v1.png',size=[256,288],scale=220/451,groundY=260,frames=frames)
(p/'expressions.json').write_text(json.dumps(c,ensure_ascii=False,indent=2))
base={}
for folder in ['starlight-idle-sway','starlight-rest-motion','starlight-sit','starlight-greet','starlight-look','starlight-walk-timing']:
 for f in (p.parent/folder).rglob('*'):
  if f.is_file():base[str(f)]=hashlib.sha256(f.read_bytes()).hexdigest()
(p/'baseline-hashes.json').write_text(json.dumps(base,indent=2))
print('6 expressions, same scale; preserved',len(base),'files')
