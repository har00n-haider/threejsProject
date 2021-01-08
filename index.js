/* eslint-disable no-use-before-define */
/* eslint-disable import/extensions */
import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import Debugger from './lib/gameEngine/utils/Debugger.js';
import InputManager from './lib/gameEngine/utils/InputManager.js';
import globals from './lib/gameEngine/Globals.js';
import InfiniteGridHelper from './lib/InfiniteGridHelper.js';
import {OBJLoader} from './lib/OBJLoader.js';
// GameObjects
import GameObjectManager from './lib/gameEngine/ecs/GameObjectManager.js';
import AudioManager from './lib/gameEngine/utils/AudioManager.js';
import {rand} from "./lib/gameEngine/utils/Utils.js";


// Initial seup of scene, camera and lights
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
  camera.position.set(0, 5, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // scene
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

  // getting the section plane data from 3drepo
  const url = 'https://api1.www.3drepo.io/api/HH/5169d210-43a0-11eb-8a99-47d28b0b42bd/issues/d161f560-4481-11eb-b892-037e1438a15d?key=b6b27d58c21d5ccaf1a0540d02cb2998';
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      display3drepoMesh(data.viewpoint.clippingPlanes[0]);
    })
    .catch((error) => {
      console.log('Dammit');
      console.log(error);
    });
}

function display3drepoMesh(clippingPlane) {
  console.log(clippingPlane);
  // const normal = repoApiToThreejs(new THREE.Vector3(
  //   clippingPlane.normal[0],
  //   clippingPlane.normal[1],
  //   clippingPlane.normal[2],
  // ));

  const distance = 5;
  const planeNormal = new THREE.Vector3(1,1,1).normalize();
  const newPos = new THREE.Vector3(planeNormal.x, planeNormal.y, planeNormal.z).multiplyScalar(distance);
  const planeEq = {
    a : planeNormal.x,
    b : planeNormal.y,
    c : planeNormal.z,
    d : distance
  }

  // the dice model
  const loader = new OBJLoader();
  loader.load(
    // resource URL
    'assets/dado.obj',
    // called when resource is loaded
    function ( object ) {
      object.lookAt(new THREE.Vector3(0,1,0));
      object.rotateOnWorldAxis(new THREE.Vector3(0,1,0), -90 * Math.PI/180);
      globals.scene.add( object );
    },
    // called when loading is in progresses
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );

  // plane
  const plane = globals.gameObjectManager.createGameObject(globals.scene, 'plane');
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 'green', side: THREE.DoubleSide });
  const planeGeo = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.transform.add(planeGeo);
  plane.transform.lookAt(planeNormal);
  plane.transform.position.set(newPos.x, newPos.y, newPos.z);

  //let perpVector = new THREE.Vector3(0, planeNormal.z, -planeNormal.y);
  let perpVector = calculateRandPerpVector(planeNormal, 10);
  let normalArrow = new THREE.ArrowHelper(planeNormal,newPos, 3, 0xff0000);
  let perpArrow = new THREE.ArrowHelper(perpVector, newPos, 3, 'purple');
  console.log(perpVector.angleTo(planeNormal)*(180/Math.PI));

  globals.scene.add(normalArrow);
  globals.scene.add(perpArrow);

  // points 
  const points = globals.gameObjectManager.createGameObject(globals.scene, 'plane');
  var dotGeometry = new THREE.Geometry();
  dotGeometry.vertices = calculateRandomPointsOnPlane(planeEq, 100, 5);

  var dotMaterial = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false, color: 'blue' } );
  var dots = new THREE.Points( dotGeometry, dotMaterial );
  points.transform.add(dots);



  // // scotch tape
  // const scotchTape = globals.gameObjectManager.createGameObject(globals.scene, 'scotchTape');
  // const tapegeometry = new THREE.CylinderGeometry(25, 25, 10, 64);
  // const tapeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  // const tapeCylinder = new THREE.Mesh(tapegeometry, tapeMaterial);
  // scotchTape.transform.add(tapeCylinder);
}

function repoApiToThreejs(vector) {
  return new THREE.Vector3(
    vector.z,
    vector.y,
    vector.x,
  );
}


function calculateRandomPointsOnPlane(planeEq, numPoints, range){
  let randArr = [];
  for (let i = 0; i < numPoints; i++) {
    let xRand = rand(-range, range);
    let yRand = rand(-range, range);
    let z = (planeEq.d - planeEq.a*xRand - planeEq.b*yRand)/planeEq.c;
    randArr.push(new THREE.Vector3(xRand, yRand,z))
  }
  return randArr;
}

function calculateRandPerpVector(vector, range){
  let xRand = rand(-range, range);
  let yRand = rand(-range, range);
  let z = (-vector.x*xRand -vector.y*yRand)/vector.z;
  return new THREE.Vector3(xRand, yRand, z);
}

initialise();
setupGameObjects();
requestAnimationFrame(render);
