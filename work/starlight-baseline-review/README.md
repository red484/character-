# Existing Three.js baseline comparison

The canonical renderer and presets remain byte-identical to the pre-GLB backup. The rejected GLB is also unchanged, and archived with its source in outputs/starlight-baseline-review/rejected-glb-experiment.zip.

review-renderer.js is an isolated copy of the canonical renderer. The only additions expose its existing build/pose/face and studio functions for a shared-scene comparison. See review-access.diff. No geometry, texture, material, pose or motion function is changed. The workshop does not import this copy.

All captures use one renderer, one scene, canonical studio lights, orthographic camera at (0,1.25,8), half span 1.5, 500 square output. Visible vertex bounds at 0 degrees define a uniform whole-model scale to height 2.4 and floor y=0. This normalization remains constant at all six yaw angles. Materials are preserved, so different material responses remain visible.

The Three.js default frozen model is the baseline, not unapproved reference-profile.js review options. The old candidate pages remain available. GLB has only a seated static model; standing is unavailable and explicitly labeled. No new pose or rig was fabricated.

Scope ends at comparison. Proposed later edits are confined to side facial placement and ear-root review while protecting front geometry, body proportions and materials.
