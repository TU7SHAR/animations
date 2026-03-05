import * as THREE from "three";

export const numPoints = 1000; // High density for that smooth electric look

export function createVisualizer(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // 1. The Main Electric Wave
  const mainMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
  });
  const mainLine = new THREE.Line(geometry, mainMaterial);

  // 2. The Faded Reflection
  const refMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25, // Fader than main
    blending: THREE.AdditiveBlending,
  });
  const refLine = new THREE.Line(geometry.clone(), refMaterial);

  // --- THE CAGE SETUP ---
  const topGroup = new THREE.Group();
  const bottomGroup = new THREE.Group();

  topGroup.add(mainLine);
  bottomGroup.add(refLine);

  // Lift the main wave and drop the reflection to create the center gap
  topGroup.position.y = 1.5;
  bottomGroup.position.y = -3.5;

  scene.add(topGroup, bottomGroup);

  return { main: mainLine, ref: refLine };
}
