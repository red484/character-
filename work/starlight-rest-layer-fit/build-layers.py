# Analyze the source silhouette; compose unchanged source pixels through SVG masks.
# No raster resampling, painting, generation, or deformation occurs here.
from PIL import Image
import numpy as np, json, base64
from pathlib import Path
from collections import deque
root=Path(__file__).parent; path=root/'assets/reference.png'
im=np.array(Image.open(path).convert('RGB')).astype(int)
x0,y0,w,h=270,850,196,129
q=im[y0:y0+h,x0:x0+w]
a=(q[:,:,2]-q[:,:,1]>4)&(q[:,:,0]<245)
seen=set(); queue=deque([(60,80)])
while queue:
 x,y=queue.popleft()
 if (x,y) in seen or not(0<=x<w and 0<=y<h) or not a[y,x]:continue
 seen.add((x,y));queue.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
# Fill holes only inside the connected character contour, preserving pink ears / cream eyes.
bg=set();queue=deque([(0,0)])
while queue:
 x,y=queue.popleft()
 if (x,y) in bg or (x,y) in seen or not(0<=x<w and 0<=y<h):continue
 bg.add((x,y));queue.extend([(x-1,y),(x+1,y),(x,y-1),(x,y+1)])
obj={(x,y) for y in range(h) for x in range(w) if (x,y) not in bg}
edges={}
for x,y in obj:
 for nb,start,end in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
  if nb not in obj:edges.setdefault(start,[]).append(end)
paths=[]
while edges:
 start=next(iter(edges));cur=start;pts=[cur]
 while True:
  nxt=edges[cur].pop()
  if not edges[cur]:del edges[cur]
  cur=nxt
  if cur==start:break
  pts.append(cur)
 if len(pts)>12:
  simple=[]
  for i,p in enumerate(pts):
   p0,p1=pts[i-1],pts[(i+1)%len(pts)]
   if (p[0]-p0[0])*(p1[1]-p[1])!=(p[1]-p0[1])*(p1[0]-p[0]):simple.append(p)
  paths.append('M'+' L'.join(f'{x} {y}' for x,y in simple)+' Z')
outline=' '.join(paths)
regions=[('body','몸·발·꼬리','M137 59 L170 57 L194 77 L196 129 L121 129 L128 110 L140 85 Z'),('ears','귀','M8 21 L35 21 L56 41 L19 67 L6 49 Z M85 30 L101 3 L122 3 L136 49 L116 53 Z'),('eyes','감은 눈','M21 97 H49 V113 H21 Z M80 86 H113 V107 H80 Z'),('nose','작은 코','M60 101 H72 V112 H60 Z')]
source='data:image/png;base64,'+base64.b64encode(path.read_bytes()).decode()
def svg(selected=None):
 defs=f'<clipPath id="outer"><path d="{outline}"/></clipPath><image id="source" href="{source}" x="-{x0}" y="-{y0}" width="1448" height="1086"/>'
 defs+='<mask id="head-mask"><rect width="196" height="129" fill="white"/>'+''.join(f'<path d="{p}" fill="black"/>' for _,_,p in regions)+'</mask>'
 for i,_,p in regions:defs+=f'<clipPath id="{i}-clip"><path d="{p}"/></clipPath>'
 groups='<g id="head" mask="url(#head-mask)"><use href="#source"/></g>' if selected in (None,'head') else ''
 for i,_,p in regions:
  if selected in (None,i):groups+=f'<g id="{i}" clip-path="url(#{i}-clip)"><use href="#source"/></g>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="196" height="129" viewBox="0 0 196 129"><defs>{defs}</defs><g clip-path="url(#outer)">{groups}</g></svg>'
(root/'assets/source-layers.svg').write_text(svg())
for i in ['head']+[r[0] for r in regions]:(root/f'assets/layer-{i}.svg').write_text(svg(i))
(root/'source-layers.json').write_text(json.dumps({'source':'assets/reference.png','crop':[x0,y0,w,h],'pixelPolicy':'Original source RGB pixels unchanged. Transparent outline uses connected color segmentation; edge mask subject to review.','layers':['body','head','ears','eyes','nose'],'nativeResolution':[196,129],'animation':False},ensure_ascii=False,indent=2))
print('Wrote SVG compositing layers. Original file unchanged. Character pixels:',len(obj))
