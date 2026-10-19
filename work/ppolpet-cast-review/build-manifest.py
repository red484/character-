"""Measure existing PNGs only; leaves all image pixels untouched."""
from PIL import Image
import numpy as np
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parent
chars=json.loads((ROOT/'characters.json').read_text())
manifest={'version':1,'status':'review-draft','canvas':[320,320],'ground':286,'characters':[]}
for c in chars:
 item={k:c[k] for k in ('id','name','special')};item['atlases']={}
 for kind,cols,rows in [('poses',4,3),('walk',4,2),('expressions',3,2)]:
  ver=2 if kind=='poses' and c['id'] in ['angel','bunny','cloud'] else 1
  rel=f"assets/{c['id']}/{kind}-v{ver}.png";im=Image.open(ROOT/rel).convert('RGBA');a=np.array(im)[:,:,3];h,w=a.shape
  # Find the clear horizontal gutters, rather than cutting protruding feet at nominal row boundaries.
  counts=(a>180).sum(axis=1);smooth=np.convolve(counts,np.ones(5)/5,mode='same')
  ys=[0]
  for j in range(1,rows):
   mid=round(h*j/rows);lo=mid-round(h/rows*.13);hi=mid+round(h/rows*.13)
   best=smooth[lo:hi];minimum=best.min();candidates=np.where(best<=minimum+1)[0]+lo
   ys.append(int(candidates[len(candidates)//2]))
  ys.append(h);frames=[]
  for row in range(rows):
   y0,y1=ys[row:row+2]
   columnCounts=(a[y0:y1]>180).sum(axis=0)
   xsplits=[0]
   for k in range(1,cols):
    mid=round(w*k/cols);lo=mid-round(w/cols*.14);hi=mid+round(w/cols*.14)
    band=columnCounts[lo:hi];candidates=np.where(band<=band.min()+1)[0]+lo
    xsplits.append(int(candidates[len(candidates)//2]))
   xsplits.append(w)
   for col in range(cols):
    x0,x1=xsplits[col:col+2];mask=a[y0:y1,x0:x1]>180
    yy,xx=np.where(mask);assert len(xx)>1000,(c['id'],kind,row,col)
    top,bottom=int(yy.min()),int(yy.max());left,right=int(xx.min()),int(xx.max())
    # Head center from the widest head row, excluding low body and tail.
    widths=mask.sum(axis=1);limit=top+int((bottom-top)*.72);r=top+int(np.argmax(widths[top:limit]));xs=np.where(mask[r])[0];cx=float((xs.min()+xs.max())/2)
    frames.append({'rect':[x0,y0,x1-x0,y1-y0],'origin':[cx,bottom+1],'bounds':[left,top,right+1,bottom+1]})
  f=frames[0];scale=min(236/(f['bounds'][3]-f['bounds'][1]),272/max(f['bounds'][2]-f['bounds'][0],1))
  # One uniform scale for every pose in the atlas: no per-frame head inflation or vertical compression.
  item['atlases'][kind]={'src':rel,'size':[w,h],'scale':round(scale,6),'frames':frames,'sha256':hashlib.sha256((ROOT/rel).read_bytes()).hexdigest(),'rowCuts':ys}
 manifest['characters'].append(item)
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('15 atlases / 130 source cells measured')
for c in manifest['characters']:print(c['id'],[(k,v['rowCuts']) for k,v in c['atlases'].items()])

# Preserve/recompute the separately reviewed Starlight pose transfers.
if (ROOT/'assets/bunny/walk-starlight-v1.png').exists():
 import subprocess,sys
 subprocess.run([sys.executable,str(ROOT/'measure-transferred-walk.py')],check=True)
