from pathlib import Path
import sys,json,hashlib
R=Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'python-deps'))
import trimesh,numpy as np
p=R/'assets/starlight-prototype.glb';s=trimesh.load(p,force='scene');report={}
for name,g in s.geometry.items():
 m=g.copy();m.merge_vertices(merge_tex=True,merge_norm=True)
 report[name]={'finite':bool(np.isfinite(m.vertices).all()),'faces':len(m.faces),'welded_watertight':bool(m.is_watertight),'components':len(m.split(only_watertight=False)),'bounds':m.bounds.tolist()}
assert report['Head_Ears_Continuous']['welded_watertight']
assert report['Head_Ears_Continuous']['components']==1
assert all(v['finite'] for v in report.values())
out={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'glb_reload':'passed','head_ear_connected_manifold':'passed','parts':report}
(R/'assets/validation.json').write_text(json.dumps(out,indent=2));print(json.dumps({k:v for k,v in out.items() if k!='parts'}))
