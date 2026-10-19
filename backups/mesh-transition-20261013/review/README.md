# Internal Starlight motion inspection

This folder intentionally lives beside, not inside, the `ppolpet` distribution project. Do not add it to a public build or archive.
Serve the parent `work` folder on localhost and open `/ppolpet-motion-review/`.
The page imports the canonical `../ppolpet/shared/pet-render.js` and preset, and checks SHA-256 against `model-lock.json`.

Scope: static standing only. Current approved `stand` has no breathing/blinking animation. Its 4-second observation clock, speed and looping controls do not synthesize motion. Four identical frames are expected. Other motions are inventoried and locked pending standing approval. Transitions and travel tests are not yet implemented.
PNG export captures the live canvas; WebM records a 4-second live canvas stream when MediaRecorder is supported. Review records use a separate localStorage key with the full renderer hash. No workshop storage is changed.
