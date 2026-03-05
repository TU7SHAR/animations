import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import gsap from "gsap";
import { initMic, getAudioData } from "./mic.js";
import { createVisualizer, numPoints } from "./wave.js";
import "./style.css";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  75,
);
camera.position.z = 20;

const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    3.0,
    0.5,
    0.1,
  ),
);

const { main, ref } = createVisualizer(scene);
const tempColor = new THREE.Color();
const animProxy = { time: 0 };

gsap.to(animProxy, {
  time: 1000,
  duration: 1000,
  ease: "none",
  repeat: -1,
  onUpdate: () => {
    let volume = getAudioData();
    if (volume < 0.01) volume = 0;
    const t = animProxy.time * 0.7;

    const pos = main.geometry.attributes.position.array;
    const refPos = ref.geometry.attributes.position.array;
    const col = main.geometry.attributes.color.array;
    const rCol = ref.geometry.attributes.color.array;

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const x = progress * 24 - 12;

      // --- THE CAGE MATH ---
      const base = Math.sin(progress * 7.0 + t * 2.0);
      const detail = Math.sin(progress * 35.0 - t * 5.0) * 0.4;
      const electric = Math.sin(progress * 16.0 + t * 2.0) * 0.1;

      let combined = base + detail + electric;

      // STIFFNESS: Sharpen peaks using:
      // $$f(x) = \text{sign}(x) \cdot |x|^{2.2}$$
      let finalY = Math.sign(combined) * Math.pow(Math.abs(combined), 2.2);

      const mask = Math.sin(progress * Math.PI);
      const amp = volume * 6.0;

      // 1. Main Wave Position
      pos[i * 3] = x;
      pos[i * 3 + 1] = finalY * mask * amp;
      pos[i * 3 + 2] = 0;

      // 2. Reflection Position (THE "NO-CLASH" FIX)
      // We removed the negative multiplier. Now, when Main goes down,
      // Ref also goes down, keeping the gap constant.
      refPos[i * 3] = x;
      refPos[i * 3 + 1] = finalY * mask * amp * 0.5;
      refPos[i * 3 + 2] = 0;

      // Color Gradient (Purple -> Cyan)
      let hue = (0.75 + progress * 0.3) % 1.0;
      tempColor.setHSL(hue, 1.0, 0.6);

      col[i * 3] = tempColor.r * 2.5;
      col[i * 3 + 1] = tempColor.g * 2.5;
      col[i * 3 + 2] = tempColor.b * 2.5;

      rCol[i * 3] = col[i * 3];
      rCol[i * 3 + 1] = col[i * 3 + 1];
      rCol[i * 3 + 2] = col[i * 3 + 2];
    }
    main.geometry.attributes.position.needsUpdate = true;
    main.geometry.attributes.color.needsUpdate = true;
    ref.geometry.attributes.position.needsUpdate = true;
    ref.geometry.attributes.color.needsUpdate = true;
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

["click", "touchstart"].forEach((ev) =>
  window.addEventListener(ev, () => initMic(), { once: true }),
);
