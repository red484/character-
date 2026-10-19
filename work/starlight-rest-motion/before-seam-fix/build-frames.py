"""Articulate source-pixel SVG layers. Head remains rigid; no raster repainting."""
from pathlib import Path
import re,json,math
r=Path(__file__).parent
src=(r/'assets/source-layers.svg').read_text()
defs=re.search(r'<defs>(.*?)</defs>',src,re.S).group(1)
extra='''<mask id="rigid-head"><rect width="196" height="129" fill="white"/><path d="M139 59 C154 79 149 101 138 111 C134 118 125 122 118 124 L118 129 L196 129 L196 0 L155 0 Z" fill="black"/></mask>
<clipPath id="body-under"><path d="M126 62 Q177 55 188 88 L196 129 L112 129 Q101 108 126 62 Z"/></clipPath>
<clipPath id="foot"><ellipse cx="181" cy="108" rx="16" ry="18"/></clipPath>
<mask id="no-foot"><rect width="196" height="129" fill="white"/><ellipse cx="181" cy="108" rx="16" ry="18" fill="black"/></mask>
<clipPath id="limb-source"><ellipse cx="155" cy="90" rx="13" ry="20"/></clipPath>
<clipPath id="paw-source"><ellipse cx="180" cy="110" rx="11" ry="9"/></clipPath>'''
# Head Y, rigid angle, torso angle, near elbow angle, far elbow angle, label, hold.
settle=[(-24,3,-7,2,15,'앞발로 지지',.28),(-23,2.9,-7,6,17,'앞발을 짚기',.16),(-20,2.5,-6,17,25,'팔꿈치 굽히기',.16),(-16,2,-5,31,37,'가슴 낮추기',.16),(-12,1.8,-4,43,48,'앞발 접기',.18),(-6,.9,-2,62,67,'턱 가까이',.20),(-2,.25,-.6,76,80,'머리 기대기',.24),(0,0,0,84,84,'원본 엎드림',.9)]
config={'size':[256,192],'sourceSize':[196,129],'sourceOffset':[30,37],'groundY':161,'headScale':[1,1],'motion':'supported crouch → forelimb fold → source lying pose','states':{}}
use='<g clip-path="url(#outer)"><use href="#source"/></g>'
def limb(x,y,angle):
 # Limb rotates about its planted wrist. Source pixels are sampled from the existing torso.
 return f'<g transform="translate({x} {y}) rotate({angle}) translate(-155 -110)" clip-path="url(#limb-source)">{use}</g>'
def paw(x):
 return f'<g transform="translate({x} 116) translate(-180 -110)" clip-path="url(#paw-source)">{use}</g>'
for state in ['settle','rest']:
 frames=[]
 poses=settle if state=='settle' else [(0,0,0,84,84,'원본 엎드림',.4)]*8
 for i,(y,angle,body_angle,near,far,label,duration) in enumerate(poses):
  torso=f'<g mask="url(#no-foot)"><g transform="rotate({body_angle} 180 122)" clip-path="url(#body-under)">{use}</g></g><g clip-path="url(#foot)">{use}</g>'
  arms=limb(70,117,far)+paw(67)+limb(111,117,near)+paw(110)
  head=f'<g transform="translate(0 {y}) rotate({angle} 78 124)"><g clip-path="url(#outer)"><g mask="url(#rigid-head)"><use href="#source"/></g></g></g>'
  # At contact all additional forelimbs are physically occluded by the head.
  content=torso+arms+head
  if state=='rest' or i==7: content=use
  out=f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="192" viewBox="0 0 256 192"><defs>{defs}{extra}</defs><g transform="translate(30 37)">{content}</g></svg>'
  file=f'frames/{state}-{i+1:02d}.svg';(r/file).write_text(out)
  frames.append({'file':file,'duration':duration,'headY':y,'headAngle':angle,'bodyAngle':body_angle,'nearArmAngle':near,'farArmAngle':far,'label':label,'headScale':[1,1],'faceOffsetsUnchanged':True,'forepawGroundY':161})
 config['states'][state]=frames
(r/'motion.json').write_text(json.dumps(config,ensure_ascii=False,indent=2))
print('Built supported lowering transition, ending on the unchanged original pose')
