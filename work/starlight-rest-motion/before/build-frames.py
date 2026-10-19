"""Compose existing SVG sprite layers into 16 motion frames; no raster repainting."""
from pathlib import Path
import re,json
r=Path(__file__).parent
src=(r/'assets/source-layers.svg').read_text()
defs=re.search(r'<defs>(.*?)</defs>',src,re.S).group(1)
extra='<mask id="rigid-head"><rect width="196" height="129" fill="white"/><path d="M137 59 L170 57 L194 77 L196 129 L121 129 L128 110 L140 85 Z" fill="black"/></mask><clipPath id="body-under"><path d="M131 59 L170 57 L194 77 L196 129 L115 129 L122 110 L134 85 Z"/></clipPath><clipPath id="foot"><ellipse cx="181" cy="108" rx="16" ry="18"/></clipPath><mask id="no-foot"><rect width="196" height="129" fill="white"/><ellipse cx="181" cy="108" rx="16" ry="18" fill="black"/></mask>'
settle=[(-3,1.6,1.3,.14),(-2.7,1.4,1.15,.12),(-2.1,1.05,.9,.12),(-1.45,.72,.65,.12),(-.8,.4,.38,.14),(-.3,.14,.15,.16),(-.08,.03,.03,.2),(0,0,0,.55)]
import math
rest=[(0,0,math.sin(i*math.pi/8)**2*.75,.35) for i in range(8)]
config={'size':[256,192],'sourceSize':[196,129],'sourceOffset':[30,37],'groundY':161,'headScale':[1,1],'motion':'low-pose settling → quiet rest','source':'../starlight-rest-layer-fit/assets/source-layers.svg','states':{}}
for name,poses in [('settle',settle),('rest',rest)]:
 frames=[]
 for i,(y,angle,lift,duration) in enumerate(poses):
  body=f'<g mask="url(#no-foot)"><g transform="translate(0 124) scale(1 {1+lift/60}) translate(0 -124)" clip-path="url(#body-under)"><g clip-path="url(#outer)"><use href="#source"/></g></g></g><g clip-path="url(#foot)"><g clip-path="url(#outer)"><use href="#source"/></g></g>'
  head='<g mask="url(#rigid-head)"><use href="#source"/></g>'
  content=f'{body}<g transform="translate(0 {y}) rotate({angle} 78 124)"><g clip-path="url(#outer)">{head}</g></g>'
  out=f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="192" viewBox="0 0 256 192"><defs>{defs}{extra}</defs><g transform="translate(30 37)">{content}</g></svg>'
  file=f'frames/{name}-{i+1:02d}.svg';(r/file).write_text(out)
  frames.append({'file':file,'duration':duration,'headY':y,'headAngle':angle,'bodyLift':lift,'headScale':[1,1],'faceOffsetsUnchanged':True})
 config['states'][name]=frames
(r/'motion.json').write_text(json.dumps(config,ensure_ascii=False,indent=2))
print('16 SVG motion frames created from source layers')
