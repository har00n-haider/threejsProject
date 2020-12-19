import * as THREE from "./lib/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js"
import {deepDiffMapper} from "./src/utils/Utils.js";
import Debugger from "./src/utils/Debugger.js"
import InputManager from "./src/utils/InputManager.js"
import globals from "./src/Globals.js";
import InfiniteGridHelper from './lib/InfiniteGridHelper.js';
// GameObjects
import GameObjectManager from "./src/game/GameObjectManager.js";
import KubeGen from "./src/game/gameObjects/KubeGen.js"

// Initial seup of scene, camera and lights
function initialise(){
    // canvas setup
    const canvas = document.querySelector("canvas");
    globals.renderer = new THREE.WebGLRenderer({ 
        canvas : canvas,
        antialias: true,
    });
    globals.renderer.shadowMap.enabled = true;
    globals.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    globals.renderer.setPixelRatio(window.devicePixelRatio);
    globals.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    window.addEventListener('resize', () => {
        onCanvasResize();
    }, false);

    // camera
    const fov = 60;
    const aspect = 2;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    globals.canvas = canvas;
    globals.mainCamera = camera;
    camera.position.set(0, 5, 10);
    camera.lookAt(new THREE.Vector3(0,0,0))

    //scene
    const scene = new THREE.Scene();
    globals.scene = scene;
    scene.background = new THREE.Color('#B19CD9');

    // lights
    function addLight(...pos) {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(...pos);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        scene.add(light);
        scene.add(light.target);
    }
    addLight(5, 5, 2);
    addLight(-5, 5, 5);

    // // sky box
    // const loader = new THREE.CubeTextureLoader();
    // const texture = loader.load([
    //     './resources/posx.jpg',
    //     './resources/negx.jpg',
    //     './resources/posy.jpg',
    //     './resources/negy.jpg',
    //     './resources/posz.jpg',
    //     './resources/negz.jpg',
    // ]);
    // this._scene.background = texture;
}

function onCanvasResize() {
    const canvas = globals.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        globals.mainCamera.aspect = width / height;
        globals.mainCamera.updateProjectionMatrix();
        globals.renderer.setSize(width, height, false);
    }
}

// Main render loop
function render(curTimeMilliSec) {
    // timing
    globals.timeMilliSec = curTimeMilliSec;
    if (globals.lastTimeMilliSec === null) {
        globals.lastTimeMilliSec = curTimeMilliSec;
    }
    globals.deltaTimeMillSec = curTimeMilliSec - globals.lastTimeMilliSec;
    globals.lastTimeMilliSec = curTimeMilliSec;

    globals.debugger.update();
    //TODO: does this need tp be in here?
    globals.orbitControls.update();
    globals.gameObjectManager.update();
    globals.renderer.render(globals.scene, globals.mainCamera);
    requestAnimationFrame(render);
}

function setupGameObjects(){
    // grid
    const grid = new InfiniteGridHelper(0.5,100,new THREE.Color('white'), 100);
    globals.scene.add(grid);
    
    // controls
    globals.orbitControls = new OrbitControls( 
        globals.mainCamera, 
        globals.renderer.domElement 
    );

    // debug axes
    var axes = new THREE.AxesHelper( 5 );
    globals.scene.add( axes );
    
    // Initialise game objects
    globals.gameObjectManager = new GameObjectManager();
    globals.inputManager = new InputManager(globals.renderer.domElement);
    globals.debugger = new Debugger(globals, document.getElementById('debugWrapper'));
    
    const kubeGen = globals.gameObjectManager.createGameObject(
        globals.scene,
        "KubeGen",
    )
    kubeGen.addComponent(KubeGen, 3);
    
    // boundary box to visualize the random generation
    const bbwire = new THREE.WireframeGeometry(new THREE.BoxGeometry(20,20,20))
    const bbline = new THREE.LineSegments( bbwire );
    bbline.material.depthTest = false;
    bbline.material.opacity = 1;
    bbline.material.transparent = true;
    globals.scene.add(bbline);
}


initialise();
setupGameObjects();
requestAnimationFrame(render);