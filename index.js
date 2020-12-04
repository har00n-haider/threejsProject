
import globals from "./src/globals.js";
import * as THREE from "../lib/three.module.js";
import GameObjectManager from "./src/game/GameObjectManager.js";
import Kube from "./src/game/Kube.js"
import { Vector3 } from "./lib/three.module.js";
import { resizeRendererToDisplaySize } from "./src/utils/utils.js";


// Initial seup of scene, camera and lights
const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({ canvas });
const fov = 45;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
globals.canvas = canvas;
globals.camera = camera;
camera.position.set(0, 5, 10);
camera.lookAt(new Vector3(0,0,0))
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
    
// Initialise game objects
globals.gameObjectManager = new GameObjectManager();

// Setting up camera object
const gameObject = globals.gameObjectManager.createGameObject(
    camera,
    "camera",
    globals
);

// Setting up cubes
function addCube(x, y, z){
    var geometry = new THREE.BoxGeometry( x, y, z)
    var material = new THREE.MeshStandardMaterial( { color: 0x0000ff })
    var cube = new THREE.Mesh ( geometry, material )
    return cube;
}
var newCube = addCube(2,2,2)
var kubeGo = globals.gameObjectManager.createGameObject(
    scene,
    "Kube",
    globals
);
kubeGo.addComponent(Kube, newCube)

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