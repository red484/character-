"""Build the repaired full-frame atlas manifest. Legacy cutout builder is archived."""
from pathlib import Path
import json
r=Path(__file__).parent
cfg=json.loads((r/'before-seam-fix/motion.json').read_text())
cfg.update(atlas='assets/seam-repair-v1.png',atlasSize=[2048,768],frameSize=[512,384],renderMethod='whole repaired raster frame; no runtime face/body compositing',restSource='repaired final frame; not pixel-identical to original sheet')
for name,fs in cfg['states'].items():
 for i,f in enumerate(fs):
  j=i if name=='settle' else 7
  f['sourceRect']=[j%4*512,j//4*384,512,384]
  f['legacyFile']=f['file'];f['file']=cfg['atlas']
  for key in ['faceOffsetsUnchanged','headScale','headY','headAngle','bodyAngle','nearArmAngle','farArmAngle','forepawGroundY']:f.pop(key,None)
  if j==7:f['label']='엎드림 유지'
cfg.pop('headScale',None)
assert (r/cfg['atlas']).is_file()
(r/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
print('8 repaired whole-image frames registered')
