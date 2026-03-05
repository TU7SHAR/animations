import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import gsap from "gsap";
import "./style.css";
import { initMic, getAudioData } from "./mic.js";

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  75,
);
camera.position.z = 15;

const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- Geometry & Colors ---
const numPoints = 500;
const positions = new Float32Array(numPoints * 3);
const colors = new Float32Array(numPoints * 3);

const color1 = new THREE.Color(0.7, 0.0, 1.0);
const color2 = new THREE.Color(0.0, 1.0, 0.4);
const color3 = new THREE.Color(1.0, 0.8, 0.0);

for (let i = 0; i < numPoints; i++) {
  const progress = i / (numPoints - 1);
  const x = progress * 20 - 10;

  positions[i * 3] = x;
  positions[i * 3 + 1] = 0;
  positions[i * 3 + 2] = 0;

  const vertexColor = new THREE.Color();
  if (progress < 0.5) {
    vertexColor.lerpColors(color1, color2, progress * 2.0);
  } else {
    vertexColor.lerpColors(color2, color3, (progress - 0.5) * 2.0);
  }

  colors[i * 3] = vertexColor.r * 2.0;
  colors[i * 3 + 1] = vertexColor.g * 2.0;
  colors[i * 3 + 2] = vertexColor.b * 2.0;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const material = new THREE.LineBasicMaterial({
  vertexColors: true,
});
const line = new THREE.Line(geometry, material);
scene.add(line);

// --- Post-Processing ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  2.0,
  0.5,
  0.0,
);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// audio
const animProxy = { time: 0 };

window.addEventListener("click", () => {
  initMic();
});

gsap.to(animProxy, {
  time: 100,
  duration: 100,
  ease: "none",
  repeat: -1,
  onUpdate: () => {
    const posArray = line.geometry.attributes.position.array;
    const t = animProxy.time;

    let volume = getAudioData();

    if (volume < 0.02) volume = 0;

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);

      const wave1 = Math.sin(progress * 12.0 + t * 12.0) * 0.6;
      const wave2 = Math.sin(progress * 28.0 + t * 18.0) * 0.25;
      const wave3 = Math.sin(progress * 55.0 + t * 30.0) * 0.1;

      const smoothCurve = wave1 + wave2 + wave3;
      const mask = Math.sin(progress * Math.PI);

      const amplitude = volume * 25.0;
      posArray[i * 3 + 1] = smoothCurve * mask * amplitude;
    }

    line.geometry.attributes.position.needsUpdate = true;
  },
});

const animate = () => {
  composer.render();
  requestAnimationFrame(animate);
};
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
