
import globals from "./src/globals.js";
import * as THREE from "../lib/three.module.js";
import GameObjectManager from "./src/game/GameObjectManager.js";
import KubeController from "./src/game/Kube.js"
import InputManager from "./src/utils/InputManager.js"
import { Vector3 } from "./lib/three.module.js";
import { resizeRendererToDisplaySize } from "./src/utils/utils.js";


// Initial seup of scene, camera and lights
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas });
const fov = 45;
const aspect = 5; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
globals.canvas = canvas;
globals.mainCamera = camera;
camera.position.set(0, 5, 10);
camera.lookAt(new Vector3(0,0,0))
const scene = new THREE.Scene();
globals.scene = scene;
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
    
// Initialise game objects
globals.gameObjectManager = new GameObjectManager();
globals.inputManager = new InputManager();

// Setting up camera object
const gameObject = globals.gameObjectManager.createGameObject(
    camera,
    "camera"
);

// Setting up cube
var kubeGo = globals.gameObjectManager.createGameObject(
    scene,
    "Kube"
);
kubeGo.addComponent(KubeController, 3);


// Main render loop
function render(now) {
    
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    globals.gameObjectManager.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);