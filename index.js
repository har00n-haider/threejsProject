/* eslint-disable no-use-before-define */
/* eslint-disable import/extensions */
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import Debugger from './lib/gameEngine/utils/Debugger.js';
import InputManager from './lib/gameEngine/utils/InputManager.js';
import globals from './lib/gameEngine/Globals.js';
import InfiniteGridHelper from './lib/InfiniteGridHelper.js';
import {OBJLoader} from './lib/OBJLoader.js';
import {GUI} from './lib/dat.gui.module.js';
// GameEngine stuff
import GameObjectManager from './lib/gameEngine/ecs/GameObjectManager.js';
import AudioManager from './lib/gameEngine/utils/AudioManager.js';
import {rand, randVec3} from './lib/gameEngine/utils/Utils.js';
// Project specific stuff
import {Convert} from './src/3dr2Civil3dSectionConverter.js'; 

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
  const fov = 60;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  globals.canvas = canvas;
  globals.mainCamera = camera;
  camera.position.set(0, 5, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // scene
  const scene = new THREE.Scene();
  globals.scene = scene;
  scene.background = new THREE.Color('#B19CD9');

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
  globals.mainCamera.aspect = window.innerWidth / window.innerHeight;
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

  globals.debugger.update();
  // TODO: does this need tp be in here?
  globals.orbitControls.update();
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

  // controls
  globals.orbitControls = new OrbitControls(
    globals.mainCamera,
    globals.renderer.domElement,
  );

  // debug axes
  const axes = new THREE.AxesHelper(5);
  globals.scene.add(axes);

  // Initialise game objects
  globals.gameObjectManager = new GameObjectManager();
  globals.inputManager = new InputManager(globals.renderer.domElement);
  globals.debugger = new Debugger(globals, document.getElementById('debugWrapper'));

  loadModel();
}

function setupDatGUI(){
  const gui = new GUI();
  gui.add(globals, 'shit', 0, 0.5).name('something');
}
//#endregion

function getSectionPlaneFrom3dRepo(){
    // getting the section plane data from 3drepo
    const apiKey = '670f65dd5a45cc01dc97d771ffad2b35';
    const modelId = '43dac390-5668-11eb-901c-8dcbf0759038';
    // Basic testing : all clip dir -1
    // const issueId = '8f802f30-567f-11eb-b14c-331a8baa9a5e'; // 1 plane - 5-4-1 - back end
    // const issueId = '229498c0-5c8d-11eb-82c1-3d258507f8b6'; // 1 plane - 3-2-1 - front end 
    // const issueId = '602cb4b0-567f-11eb-b14c-331a8baa9a5e'; // 1 plane - in half
    // const issueId = 'afe494c0-5669-11eb-b14c-331a8baa9a5e'; // 1 plane - 3-1-2
    // const issueId = 'e23cc080-5729-11eb-b14c-331a8baa9a5e'; // 1 plane - 3-5-1
    // const issueId = 'e49e9360-599c-11eb-bb0d-b34330a480ad'; // 6 box clip  - 3-5-1
    
    // const issueId = 'e49e9360-599c-11eb-bb0d-b34330a480ad'; // 6 plane - 5-3-1
    // const issueId = '35992d00-59d1-11eb-9e73-c3cab698f37e'; // 6 plane - axis aligned
    // const issueId = 'a8794560-59d8-11eb-9e73-c3cab698f37e'; // 6 plane - straight down the middle
    // const issueId = '2d6812f0-59da-11eb-bb0d-b34330a480ad'; // 4 plane - clip box
    // const issueId = 'd1b73ae0-5b36-11eb-8190-0f3cc630421e'; // 1 plane - section starts outside box
    // const issueId = '89ace260-5c06-11eb-95bf-77794e8460c9'; // 4 plane - two not parallel
    // const issueId = 'a4a8da10-5c15-11eb-82c1-3d258507f8b6'; // 2 plane - diag half section - two planes not parallel
    // const issueId = 'e10f9ed0-5c92-11eb-82c1-3d258507f8b6'; // 3 plane - bottom only 
    // const issueId = '6a9fb9e0-5c94-11eb-82c1-3d258507f8b6'; // 5 plane - 3-2 near side
    
    // clip dir testing
    // const issueId = '3180fd50-5c9d-11eb-82c1-3d258507f8b6'; // 1 plane - diagonal cut -ve clip dir (farthest point behind)
    const issueId = 'fadfb0c0-5efe-11eb-999e-393f16405674'; // 1 plane - diag cut +ve clip dir 
    // const issueId = 'ba1702f0-5ef9-11eb-8ff0-cba8800d66f2'; // 2 plane - quarter - both planes flipped
    // const issueId = 'dfcdd760-5f00-11eb-999e-393f16405674'; // 3 plane - 3d quarter - all planes flipped (3-6-5)
    
    // const issueId = 'e3bd6670-5ca2-11eb-999e-393f16405674'; // 4 plane - 2-4-6  corner box clip, all -ve clip directions
    // const issueId = '9ebeef70-5ca3-11eb-82c1-3d258507f8b6'; // 6 plane - 3-1-2 quarter clip some +ve clipDir
    // const issueId = '3f7ed540-5ef4-11eb-999e-393f16405674'; // 6 plane - 3-6-5 original corner 
    // const issueId = '3ac17ed0-5ef5-11eb-999e-393f16405674'; // 6 plane - 3-6-5 flipped in the x dir

    const teamSpace = 'HH';
    const urlBase = 'https://api1.staging.dev.3drepo.io/api'
    const url = urlBase.concat(
      '/',
      teamSpace, '/',
      modelId, '/',
      'issues', '/',
      issueId, '?key=', apiKey
    );
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(Convert(data.viewpoint.clippingPlanes));
      });
      // .catch((error) => {
      //   console.log('Dammit');
      //   console.log(error);
      // });
}

function loadModel(){
  const loader = new OBJLoader();
  loader.load(
    'assets/dado.obj',
    // called when resource is loaded
    function ( object ) {
      object.name = 'dice';
      const modelMat = new THREE.MeshPhongMaterial({
        color: 'grey',
        opacity: 0.6,
        transparent: true,
      });
      object.children[0].material = modelMat;
      globals.scene.add( object );
      const box = new THREE.BoxHelper(object, 0xffff00);
      globals.scene.add(box);
      getSectionPlaneFrom3dRepo();
    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'loading error: ' + error );
    }
  );
}
//#endregion

initialise();
setupGameObjects();
requestAnimationFrame(render);
