export const placementParts=['nose','mouth','cheekLeft','cheekRight','eyeLeft','eyeRight'];
export const placementDefaults=Object.fromEntries(placementParts.flatMap(k=>['X','Y','Angle'].map(axis=>[k+axis,0])));
export const placementLimits=Object.fromEntries(placementParts.flatMap(k=>[['X',-.07,.07],['Y',-.09,.09],['Angle',-.35,.35]].map(([axis,a,b])=>[k+axis,[a,b]])));
// Offsets are in the face's local coordinates, so a head tilt also tilts placement.
export function placeFeature(anchor,l,p,key){const tilt=l.tilt||0,dx=l.width*(p[key+'X']||0),dy=l.height*(p[key+'Y']||0);return {x:anchor.x+dx*Math.cos(tilt)-dy*Math.sin(tilt),y:anchor.y+dx*Math.sin(tilt)+dy*Math.cos(tilt),angle:tilt+(p[key+'Angle']||0)};}
export function placementEnabled(p,key){return key.startsWith('cheek')?p.cheekMark!=='none':!['original','none'].includes(p[key]);}
