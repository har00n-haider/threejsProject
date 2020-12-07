import globals from "./src/globals.js";
import * as THREE from "./lib/three.module.js";
import GameObjectManager from "./src/game/GameObjectManager.js";
import KubeController from "./src/game/Kube.js"
import InputManager from "./src/utils/InputManager.js"
import { resizeRendererToDisplaySize } from "./src/utils/utils.js";
import {OrbitControls} from "./lib/OrbitControls.js"
import {deepDiffMapper} from "./src/utils/utils.js";

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
// controls
var controls = new OrbitControls( camera, renderer.domElement );

// debug axes
var axes = new THREE.AxesHelper( 100 ); // this will be on top
scene.add( axes );

// Initialise game objects
globals.gameObjectManager = new GameObjectManager();
globals.inputManager = new InputManager(renderer.domElement);

function debugClickRayCast(mousePos)
{

    // // DEBUG SHIT:
    // //create a blue LineBasicMaterial
    // const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    // const points = [];
    // points.push( new THREE.Vector3( - 10, 0, 0 ) );
    // points.push( new THREE.Vector3( 0, 10, 0 ) );
    // points.push( new THREE.Vector3( 10, 0, 0 ) );
    // const geometry = new THREE.BufferGeometry().setFromPoints( points );
    // const line = new THREE.Line( geometry, material );
    // scene.add(line);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mousePos, globals.mainCamera );

    let dir     = new THREE.Vector3(1,1,1);
    let origin  = new THREE.Vector3(0,0,0);
    let unitArrow = new THREE.ArrowHelper(dir.normalize(), origin, 20, 'purple');
    let mouseArrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000);
    scene.add(mouseArrow);
}
renderer.domElement.onkeyup = function(e){
    // U
    if(e.keyCode == 85){
         debugClickRayCast(globals.inputManager.mousePos);
    }
}

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
        // camera.aspect = canvas.clientWidth / canvas.clientHeight;
        // camera.updateProjectionMatrix();
    }

    controls.update();
    globals.gameObjectManager.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);