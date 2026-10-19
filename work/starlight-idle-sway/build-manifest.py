"""Rebuild settings for connected 2D tilt. Original atlas analysis is in before-tilt/."""
from pathlib import Path
import json
r=Path(__file__).parent
cfg={'size':[256,288],'groundY':260,'duration':3.2,'maxAngle':6,'renderMethod':'connected 2D texture mesh; rigid head, smoothly weighted neck, feet fixed','source':'before-tilt/motion.json / first neutral frame','frames':[{'label':l} for l in ['가운데','왼쪽으로','왼쪽 갸웃','가운데로','가운데','오른쪽으로','오른쪽 갸웃','가운데로']]}
(r/'motion.json').write_text(json.dumps(cfg,ensure_ascii=False,indent=2))
