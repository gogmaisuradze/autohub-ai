import * as THREE from 'three';
import repairs from './bmw-body-fit.json';

/** Corrections measured against the BMW shell, for this donor undercarriage.
 * Clone geometry to leave the preloader's shared GLTF untouched. No raycasts
 * or per-frame geometry work are needed on the visitor's device.
 */
export function fitCarBody(root: THREE.Object3D): number {
  let corrected = 0;
  const byName = new Map(repairs.map(repair => [repair.name, repair]));
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    const repair = byName.get(node.name);
    if (!repair || node.geometry.getAttribute('position').count !== repair.vertexCount) return;
    const geometry = node.geometry.clone();
    const position = geometry.getAttribute('position');
    for (let i = 0; i < repair.changes.length; i += 4) {
      position.setXYZ(repair.changes[i], repair.changes[i + 1], repair.changes[i + 2], repair.changes[i + 3]);
      corrected++;
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    node.geometry = geometry;
  });
  return corrected;
}
