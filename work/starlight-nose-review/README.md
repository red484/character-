# Nose attachment candidate — internal only

Baseline: canonical pet-render.js SHA256 077bccec8b55685c3eee63d2ed4f066b4090766152a4969a109bf1fc05991f9b. Production source is unchanged. before-renderer.js is the retained baseline review adapter. candidate.diff contains the candidate changes.

Standing candidate only: redistribute the previous nasal depth lobe to a slightly lower latitude using two smooth Gaussian fields. Change only local Z; all head X/Y vertices remain identical. Search the modified anterior centerline for its maximum Z, and attach the existing golden triangle at that fixed UV. No separate nose mesh, billboard, geometry swap or rotation-conditioned nose placement. The triangle's width is 1.5 times the original to retain a small visible cap at grazing angles. Front nose height/width consequently change slightly; front head outline and body proportions remain unchanged. Eyes and cheeks keep their existing legacy view-dependent system; this work does not claim to convert the entire face to fixed UV.

The 75/90 close-ups use the identical texture generated under the full-view camera, then render with a common zoom camera. The old and candidate meshes share the same studio, orthographic camera and scale. Drag updates real scene yaw; it does not switch between captured images.

Browser regression confirms candidate 0/360 pixel equality and seated before/after pixel equality. Shape and appearance are pending user review. No rigging, locomotion, other character edits, or public deployment.
