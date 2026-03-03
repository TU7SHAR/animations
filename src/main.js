import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Pane } from "tweakpane";
import gsap from "gsap";
import "./style.css";

const pane = new Pane();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111113);

const PARAMS = {
  speed: 1.0,
};

pane
  .addBinding(PARAMS, "speed", {
    min: 0.1,
    max: 3.0,
    step: 0.1,
    label: "Anim Speed",
  })
  .on("change", (ev) => {
    gsap.globalTimeline.timeScale(ev.value);
  });

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
camera.position.z = 25;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

function createFrame(size) {
  const shape = new THREE.Shape();
  shape.moveTo(-size, -size);
  shape.lineTo(size, -size);
  shape.lineTo(size, size);
  shape.lineTo(-size, size);
  shape.lineTo(-size, -size);

  const hole = new THREE.Path();
  const holeSize = size - 0.15;
  hole.moveTo(-holeSize, -holeSize);
  hole.lineTo(holeSize, -holeSize);
  hole.lineTo(holeSize, holeSize);
  hole.lineTo(-holeSize, holeSize);
  hole.lineTo(-holeSize, -holeSize);
  shape.holes.push(hole);

  const extrudeSettings = { depth: 0.2, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
  return new THREE.Mesh(geometry, material);
}

// 7-frames
const frames = [];

for (let i = 0; i < 7; i++) {
  let size = 3.0 - i * 0.35;
  let frame = createFrame(size);
  scene.add(frame);
  frames.push(frame);
}

const snapAngle = Math.PI;

frames.forEach((frame, index) => {
  let delayAmount = (6 - index) * 0.15;

  gsap.to(frame.rotation, {
    y: `+=${snapAngle}`,
    duration: 0.8,
    ease: "power2.inOut",
    repeat: -1,
    repeatDelay: 1.2,
    delay: delayAmount,
  });

  gsap.to(frame.rotation, {
    x: `+=${snapAngle}`,
    duration: 0.8,
    ease: "power2.inOut",
    repeat: -1,
    repeatDelay: 1.2,
    delay: delayAmount + 0.6,
  });
});

const rendererloop = () => {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(rendererloop);
};

rendererloop();
