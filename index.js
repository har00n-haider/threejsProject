import * as THREE from "./lib/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js"
import {deepDiffMapper} from "./src/utils/Utils.js";
import { resizeRendererToDisplaySize } from "./src/utils/Utils.js";
import Debugger from "./src/utils/Debugger.js"
import InputManager from "./src/utils/InputManager.js"
import globals from "./src/Globals.js";
import InfiniteGridHelper from './lib/InfiniteGridHelper.js';

// GameObjects
import GameObjectManager from "./src/game/GameObjectManager.js";
import KubeGen from "./src/game/gameObjects/KubeGen.js"


// Initial seup of scene, camera and lights
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
const fov = 45;
const aspect = 5; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
globals.canvas = canvas;
globals.mainCamera = camera;
camera.position.set(0, 5, 10);
camera.lookAt(new THREE.Vector3(0,0,0))
const scene = new THREE.Scene();
globals.scene = scene;
scene.background = new THREE.Color('grey');
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




// // grid
// const grid = new InfiniteGridHelper(0.5,100,new THREE.Color('white'), 100);
// scene.add(grid);

// controls
var controls = new OrbitControls( camera, renderer.domElement );
// debug axes
var axes = new THREE.AxesHelper( 5 ); // this will be on top
scene.add( axes );

// Initialise game objects
globals.gameObjectManager = new GameObjectManager();
globals.inputManager = new InputManager(renderer.domElement);
globals.debugger = new Debugger(globals, document.getElementById('debugWrapper'));

// const kubeGen = globals.gameObjectManager.createGameObject(
//     scene,
//     "KubeGen",
// )
// kubeGen.addComponent(KubeGen, 3);

// boundary box for random generation
const bbwire = new THREE.WireframeGeometry(new THREE.BoxGeometry(20,20,20))
const bbline = new THREE.LineSegments( bbwire );
bbline.material.depthTest = false;
bbline.material.opacity = 1;
bbline.material.transparent = true;
scene.add(bbline);


// Main render loop
function render(now) {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        // camera.aspect = canvas.clientWidth / canvas.clientHeight;
        // camera.updateProjectionMatrix();
    }
    globals.debugger.update();
    controls.update();
    globals.gameObjectManager.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);