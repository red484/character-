# Starlight mesh prototype — external asset pipeline

## Scope
One Starlight character, based on `assets/starlight-reference.png`. Angel is only a quality/layout reference. This is an external GLB geometry asset, not the procedural workshop model and not a sprite. Existing workshop sources remain unchanged.

Blender and bpy were not installed when this prototype was produced. An offline Python pipeline constructs authored latitude sections, performs a smooth implicit union of head and ears, extracts a surface with marching cubes, smooths it, creates a fixed cylindrical UV texture, and exports GLB/OBJ. The browser loads that GLB with GLTFLoader and rotates the single loaded scene.

## Reproduce
Python 3.12 with NumPy, SciPy, scikit-image, trimesh and Pillow. Dependencies installed in `python-deps/` (development only; do not ship).

```
python3 src/build_mesh.py
```

Serve the parent `work` directory and visit `http://127.0.0.1:8766/starlight-mesh/`.
The model files are in `assets/starlight-prototype.glb` and `assets/starlight-prototype.obj`. Keep OBJ together with `material.mtl` and the exported PNG texture. GLB embeds the texture and materials. The mesh imports into Blender; there is no native .blend authoring file in this environment.

## Model structure
- Continuous head + two ears, with a real smooth union at their roots.
- Fixed head UVs. Ring eyes, triangular mouth/nose and cheeks never move based on camera angle.
- Separate conforming pink inner-ear patches.
- Separate torso, short arms, feet, paw pads and tail, with named pivot-ready nodes.
- No bones, skins, animations or pretend motion controls.

## Validation / limitations
`assets/mesh-audit.json` records counts and structure. UV seams duplicate render vertices; welded topology is checked separately by `src/validate_mesh.py`. The asset is a dense sculpt prototype, not a production animation mesh. Retopology, skin weights and deformation tests remain for after external-shape approval.

The supplied sheet is an illustration with inconsistent perspective across views, not calibrated orthographic drawings. Depth and hidden surfaces are estimates. Side-eye visibility is determined by the actual surface, rather than view-dependent eye repainting. Reference similarity must be judged visually; a valid GLB is not evidence of a matched design.

## Preservation
Previous canonical renderer and internal review are backed up under `backups/mesh-transition-20261013/` in the workspace. This prototype is a separate sibling project and does not replace the workshop or other five characters.
