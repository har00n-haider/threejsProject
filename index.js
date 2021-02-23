/* eslint-disable no-use-before-define */
/* eslint-disable import/extensions */
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import Debugger from './lib/gameEngine/utils/Debugger.js';
import InputManager from './lib/gameEngine/utils/InputManager.js';
import globals from './lib/gameEngine/Globals.js';
import InfiniteGridHelper from './lib/InfiniteGridHelper.js';
import {GUI} from './lib/dat.gui.module.js';
// GameEngine stuff
import GameObjectManager from './lib/gameEngine/ecs/GameObjectManager.js';
import AudioManager from './lib/gameEngine/utils/AudioManager.js';
import * as Utils from './lib/gameEngine/utils/Utils.js';
// Project specific stuff
import * as Kanji from './src/Kanji.js';

//#region Game engine stuff

// Initial setup of scene, camera and lights
function initialise() {
  // canvas setup
  const canvas = document.querySelector('canvas');
  globals.renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  globals.renderer.shadowMap.enabled = true;
  globals.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  globals.renderer.setPixelRatio(window.devicePixelRatio);
  globals.renderer.setSize(window.innerWidth, window.innerHeight, true);
  window.addEventListener('resize', () => {
    onCanvasResize();
  }, false);

  // camera

  // perspective
  // const fov = 60;
  // const aspect = window.innerWidth / window.innerHeight;
  // const near = 0.1;
  // const far = 1000;
  // const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // ortho 
  globals.orthoSize = 5;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.OrthographicCamera( 
    globals.orthoSize * aspect / - 2, 
    globals.orthoSize * aspect / 2, 
    globals.orthoSize / 2, 
    globals.orthoSize / - 2, 
    near,
    far );
  camera.position.set(0.3, 2.5, 10);
  camera.lookAt(new THREE.Vector3(0.3, 2.5, 0));

  globals.canvas = canvas;
  globals.mainCamera = camera;

  // scene
  const scene = new THREE.Scene();
  globals.scene = scene;
  scene.background = new THREE.Color('#c4dbff');

  // lights
  function addLight(...pos) {
    const color = 0xffffff;
    const intensity = 0.5;
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

  // sky box
  // const loader = new THREE.CubeTextureLoader();
  // const texture = loader.load([
  //     './resources/posx.jpg',
  //     './resources/negx.jpg',
  //     './resources/posy.jpg',
  //     './resources/negy.jpg',
  //     './resources/posz.jpg',
  //     './resources/negz.jpg',
  // ]);
  // globals.scene.background = texture;
}

function updateOrthCamera(camera){
  const aspect = window.innerWidth / window.innerHeight;
  camera.left   = globals.orthoSize * aspect / - 2; 
  camera.right  = globals.orthoSize * aspect / 2;
  camera.top    = globals.orthoSize / 2;
  camera.bottom = globals.orthoSize / - 2;
}

function onCanvasResize() {
  if(globals.mainCamera.isOrthographicCamera){
    updateOrthCamera(globals.mainCamera);
  }
  else{
    globals.mainCamera.aspect = window.innerWidth / window.innerHeight;
  }
  globals.mainCamera.updateProjectionMatrix();
  globals.renderer.setSize(window.innerWidth, window.innerHeight, false);
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

  Kanji.update();
  globals.debugger.update();
  globals.gameObjectManager.update();
  globals.renderer.render(globals.scene, globals.mainCamera);
  requestAnimationFrame(render);
}

function setupGameObjects() {
  // audio
  globals.audioManager = new AudioManager();

  // grid
  const grid = new InfiniteGridHelper(0.5, 100, new THREE.Color('white'), 100);
  globals.scene.add(grid);

  // default orbit controls
  globals.orbitControls = new OrbitControls(
    globals.mainCamera,
    globals.renderer.domElement,
  );

  // debug axes
  const axes = new THREE.AxesHelper(5);
  globals.scene.add(axes);

  // Initialise game objects
  globals.inputManager = new InputManager(globals.renderer.domElement);
  globals.gameObjectManager = new GameObjectManager();
  globals.debugger = new Debugger(globals, document.getElementById('debugWrapper'));

  Kanji.init();
  Kanji.drawKanji();
}

function setupDatGUI(){
  const gui = new GUI();
  gui.add(globals, 'shit', 0, 0.5).name('something');
}

//#endregion 

initialise();
setupGameObjects();
requestAnimationFrame(render);
