
import GameObjectManager from "./src/game/GameObjectManager.js"
import globals from "./src/globals.js";
import * as THREE from "../lib/three.module.js";
import {resizeRendererToDisplaySize} from "./src/utils/utils.js"


// Initial setup
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas });
const fov = 45;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
globals.canvas = canvas;
globals.camera = camera;
camera.position.set(0, 40, 80);
// // Orbit controls - TODO: need to fix the way it is imported
// const controls = new OrbitControls(camera, canvas);
// controls.enableKeys = false;
// controls.target.set(0, 5, 0);
// controls.update();
const scene = new THREE.Scene();
scene.background = new THREE.Color("grey");
function addLight(...pos) {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
    scene.add(light.target);
}
addLight(5, 5, 2);
addLight(-5, 5, 5);


// Initialise
globals.gameObjectManager = new GameObjectManager();

globals.gameObjectManager.createGameObject(
    camera,
    "camera",
    globals
);

// globals.gameObjectManager.createGameObject()



// Main render loop
let then = 0;
function render(now) {
    // convert to seconds
    globals.time = now * 0.001;
    // make sure delta time isn't too big.
    globals.deltaTime = Math.min(globals.time - then, 1 / 20);
    then = globals.time;
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    globals.gameObjectManager.update();
    renderer.render(scene, camera);

    console.log(globals.time);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);