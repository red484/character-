"""Starlight mesh prototype. Authored cross-section loft + implicit ear union.
No view-conditioned geometry, face placement or image switching.
Run with the project python-deps on sys.path. All output in assets/.
"""
from pathlib import Path
import sys,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'python-deps'))
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage.measure import marching_cubes
import trimesh
from PIL import Image
OUT=ROOT/'assets';OUT.mkdir(exist_ok=True)
PURPLE=[150,134,197,255];PINK=[255,185,209,255];CREAM=[255,232,169,255]
scene=trimesh.Scene(); stats={}

def material(name,color=PURPLE):
 rgb=np.array(color[:3])/255;linear=np.where(rgb<=.04045,rgb/12.92,((rgb+.055)/1.055)**2.4)
 return trimesh.visual.material.PBRMaterial(name=name,baseColorFactor=np.r_[linear,1.0],metallicFactor=0,roughnessFactor=.78)

def add(name,mesh,mat=None,pivot=None):
 saved_normals=mesh.vertex_normals.copy()
 mesh.fix_normals()
 mesh.vertex_normals=saved_normals
 if mat: mesh.visual=trimesh.visual.TextureVisuals(material=mat)
 if pivot is not None:
  pivot=np.array(pivot);mesh.vertices-=pivot
  transform=np.eye(4);transform[:3,3]=pivot
 else: transform=np.eye(4)
 scene.add_geometry(mesh,node_name=name,geom_name=name,transform=transform)
 stats[name]={'vertices':len(mesh.vertices),'triangles':len(mesh.faces),'watertight':bool(mesh.is_watertight)}
 return mesh

HEAD={'y':[.70,.75,.86,1.06,1.36,1.66,1.94,2.12,2.23], 'x':[.001,.42,.77,1.00,1.10,1.08,.90,.59,.001], 'z':[.001,.29,.51,.66,.76,.75,.62,.41,.001]}
EAR={'y':[1.88,2.00,2.12,2.25,2.36,2.42], 'x':[.28,.275,.235,.16,.10,.001], 'z':[.25,.25,.21,.15,.09,.001]}
_profiles={}
def loft_field(x,y,z,profile,centerx=0,centerz=0,lean=0):
 ys=profile['y'];cl=np.clip(y,ys[0],ys[-1]);key=id(profile)
 if key not in _profiles:_profiles[key]=(PchipInterpolator(ys,profile['x']),PchipInterpolator(ys,profile['z']))
 rx=_profiles[key][0](cl);rz=_profiles[key][1](cl)
 cx=centerx+lean*(cl-ys[0]);cz=centerz
 radial=(np.sqrt(((x-cx)/rx)**2+((z-cz)/rz)**2)-1)*np.minimum(rx,rz)
 return np.maximum(radial,np.maximum(ys[0]-y,y-ys[-1]))
def smin(a,b,k):
 h=np.maximum(k-np.abs(a-b),0)/k
 return np.minimum(a,b)-h*h*k*.25

def headfield(x,y,z):
 # Smooth authored latitude section; lower cheeks slightly wider than crown.
 s=np.clip((y-1.465)/.765,-.999999,.999999)
 rx=1.10*(1-s*s)**.46*(1-.09*s);rz=.78*(1-s*s)**.50*(1-.02*s)
 d=np.maximum((np.sqrt((x/rx)**2+(z/rz)**2)-1)*np.minimum(rx,rz),np.maximum(.70-y,y-2.23))
 for side in [-1,1]:d=smin(d,loft_field(x,y,z,EAR,side*.60,-.02,side*.28),.20)
 return d

# Offline voxel sampling creates a single connected head/ear mesh, independent of camera.
step=.018
axes=[np.arange(-1.24,1.25,step),np.arange(.61,2.64,step),np.arange(-.89,.90,step)]
x,y,z=np.meshgrid(*axes,indexing='ij');field=headfield(x,y,z)
v,f,_,_=marching_cubes(field,0,spacing=(step,step,step));v+=np.array([a[0] for a in axes]);head=trimesh.Trimesh(v,f,process=True)
trimesh.smoothing.filter_taubin(head,lamb=.35,nu=.36,iterations=3)
# One fixed cylindrical UV layout; seam at the back, face lives on the front surface.
pos=head.vertices;uv=np.column_stack(((np.arctan2(pos[:,0],pos[:,2])/(2*np.pi)+.5)%1,pos[:,1]/2.7))
# Duplicate triangles crossing the UV seam so interpolation never crosses the face.
vv=[];uu=[];ff=[]
for face in head.faces:
 us=uv[face].copy()
 if np.ptp(us[:,0])>.5:us[us[:,0]<.5,0]+=1
 ff.append([len(vv),len(vv)+1,len(vv)+2]);vv.extend(pos[face]);uu.extend(us)
# Retain smooth vertex normals across seam, without introducing separate face geometry.
normals=head.vertex_normals[head.faces].reshape(-1,3)
head=trimesh.Trimesh(np.array(vv),np.array(ff),vertex_normals=normals,process=False)
W=2048;H=2048
u=np.linspace(0,1,W)[None,:];Y=np.linspace(2.7,0,H)[:,None];lon=(u-.5)*2*np.pi
tex=np.zeros((H,W,4),np.float32);tex[:]=PURPLE

def blend(mask,color):
 global tex
 a=np.clip(mask,0,1)[...,None];tex=tex*(1-a)+np.array(color)*a
# Invert the fixed cylindrical UV analytically to place face marks in model-space XY.
# This keeps the reference's round front eye rings while following the true surface.
sy=np.clip((Y-1.465)/.765,-.999999,.999999)
rx=1.10*(1-sy*sy)**.46*(1-.09*sy);rz=.78*(1-sy*sy)**.50*(1-.02*sy)
X=rx*rz*np.sin(lon)/np.sqrt((rz*np.sin(lon))**2+(rx*np.cos(lon))**2)
front=(np.cos(lon)>0)
for side in [-1,1]:
 ex=(X-side*.49)/.205;ey=(Y-1.13)/.205;r=np.sqrt(ex*ex+ey*ey)
 ring=np.clip((.09-np.abs(r-1))/.015,0,1)
 lid=np.clip((.028-np.abs(Y-(1.125+.042*ex*ex)))/.007,0,1)*(np.abs(ex)<.92)
 cheek=np.sqrt(((X-side*.73)/.14)**2+((Y-.985)/.115)**2)
 blend(np.clip((1-cheek)/.09,0,1)*front,PINK)
 blend(np.maximum(ring,lid)*front,CREAM)
# Tiny inverted triangular nose/mouth motif from the reference, no extra black eye.
yn=(Y-.97)/.075
nose=(yn>=0)&(yn<=1)&(np.abs(lon)<.05*yn)
blend(nose,CREAM)
img=Image.fromarray(np.uint8(np.clip(tex,0,255)));img.save(OUT/'starlight-albedo.png')
mat=trimesh.visual.material.PBRMaterial(name='Starlight_FixedFace',baseColorTexture=img,metallicFactor=0,roughnessFactor=.72)
head.visual=trimesh.visual.TextureVisuals(uv=np.array(uu),material=mat)
head.vertices[:,1]-=.12
add('Head_Ears_Continuous',head,pivot=[0,.65,0])

# Rounded inner-ear patches sit on the actual fused surface (not flat triangles).
for side in [-1,1]:
 verts=[];faces=[];N=26
 for i in range(N+1):
  t=i/N;yy=2.06+.275*t;cx=side*(.665+.085*t);half=.105*np.sin(np.pi*(.15+.85*t))
  for j in range(N+1):
   xx=cx+(j/N*2-1)*half;yy2=yy+.025*(j/N*2-1)**2*(1-t)
   low=0;high=.45
   for _ in range(24):
    mid=(low+high)/2
    if headfield(xx,yy2,mid)<0:low=mid
    else:high=mid
   verts.append([xx,yy2-.12,(low+high)/2+.004])
 for i in range(N):
  for j in range(N):
   a=i*(N+1)+j;faces.extend([[a,a+1,a+N+1],[a+1,a+N+2,a+N+1]])
 add(f'InnerEar_{side}',trimesh.Trimesh(verts,faces),material('InnerEar',PINK),pivot=[0,.77,0])

def loft_mesh(profile,center=(0,0,0),sections=72,around=72):
 ys=np.linspace(profile['y'][0],profile['y'][-1],sections);rx=PchipInterpolator(profile['y'],profile['x'])(ys);rz=PchipInterpolator(profile['y'],profile['z'])(ys)
 verts=[];faces=[]
 for i,yy in enumerate(ys):
  for j in range(around):
   a=2*np.pi*j/around;verts.append([center[0]+rx[i]*np.cos(a),center[1]+yy,center[2]+rz[i]*np.sin(a)])
 for i in range(sections-1):
  for j in range(around):
   a=i*around+j;b=i*around+(j+1)%around;c=a+around;d=b+around;faces.extend([[a,b,c],[b,d,c]])
 # End caps are independent tiny disks, not open rings.
 for row,reverse in [(0,True),(sections-1,False)]:
  k=len(verts);verts.append([center[0],center[1]+ys[row],center[2]])
  for j in range(around):
   a=row*around+j;b=row*around+(j+1)%around;faces.append([k,b,a] if reverse else [k,a,b])
 return trimesh.Trimesh(verts,faces,process=True)
body=loft_mesh({'y':[.10,.16,.31,.48,.62,.79],'x':[.015,.28,.405,.37,.26,.01],'z':[.015,.23,.31,.29,.21,.01]},center=(0,0,-.025))
add('Torso',body,material('Lilac'),pivot=[0,.45,0])
for side in [-1,1]:
 arm=loft_mesh({'y':[.26,.30,.40,.52,.62],'x':[.005,.11,.135,.11,.008],'z':[.005,.10,.13,.11,.008]},center=(side*.36,0,.08),sections=40,around=48)
 add(f'Arm_{side}',arm,material('Lilac'),pivot=[side*.31,.65,.03])
 # Short seated paw, with a softly flattened sole.
 paw=trimesh.creation.icosphere(subdivisions=4);paw.vertices*=np.array([.235,.225,.235]);paw.vertices+=np.array([side*.255,.24,.33]);paw.vertices[:,1]=np.maximum(paw.vertices[:,1],.018)
 add(f'Foot_{side}',paw,material('Lilac'),pivot=[side*.24,.25,.13])
 for k,(dx,dy,r) in enumerate([(0,-.035,.078),(-.067,.06,.035),(0,.095,.038),(.067,.06,.035)]):
  pad=trimesh.creation.icosphere(subdivisions=3);pad.vertices*=np.array([r,r,.022]);pad.vertices+=np.array([side*.255+dx,.24+dy,.548 if k==0 else .535]);add(f'PawPad_{side}_{k}',pad,material('PinkJelly',PINK),pivot=[side*.24,.25,.13])
tail=trimesh.creation.icosphere(subdivisions=4);tail.vertices*=np.array([.215,.22,.23]);tail.vertices+=np.array([0,.33,-.39]);add('Tail',tail,material('Lilac'),pivot=[0,.32,-.22])
(OUT/'starlight-prototype.glb').write_bytes(scene.export(file_type='glb'))
scene.export(str(OUT/'starlight-prototype.obj'))
(OUT/'mesh-audit.json').write_text(json.dumps({'method':'authored sectional loft + smooth implicit head/ear union; fixed UV face; no camera dependent assets','reference':'starlight-reference.png','head_profile':{'latitude_center':1.465,'half_height':.765,'half_width':1.10,'half_depth':.78,'width_exponent':.46,'depth_exponent':.50,'lower_cheek_bias':.09},'ear_profile':EAR,'parts':stats,'triangles':sum(x['triangles'] for x in stats.values()),'rigging':'named pivot-ready nodes only; no bones or animations yet','limitations':['triangle topology requires animation retopology','hidden head depths inferred from illustrated reference','inner-ear surfaces separate conformal patches','material appearance depends on viewer lighting']},indent=2))
print(json.dumps({'glb_bytes':(OUT/'starlight-prototype.glb').stat().st_size,'triangles':sum(x['triangles'] for x in stats.values())}))
