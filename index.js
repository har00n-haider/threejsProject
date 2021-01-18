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
// GameObjects
import GameObjectManager from './lib/gameEngine/ecs/GameObjectManager.js';
import AudioManager from './lib/gameEngine/utils/AudioManager.js';
import {rand} from "./lib/gameEngine/utils/Utils.js";

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

  getSectionPlaneFrom3dRepo();
}

function setupDatGUI(){
  const gui = new GUI();
  gui.add(globals, 'shit', 0, 0.5).name("something");

}

function arePlanesParrallel(plane1, plane2){
  let threshold = 0.000001;
  let ratiosToCheck = [];
  let aRatio = plane2.a != 0 ? Math.abs(plane1.a/plane2.a) : 0;
  let bRatio = plane2.b != 0 ? Math.abs(plane1.b/plane2.b) : 0;
  let cRatio = plane2.c != 0 ? Math.abs(plane1.c/plane2.c) : 0;
  if(aRatio != 0) { ratiosToCheck.push(aRatio); }
  if(bRatio != 0) { ratiosToCheck.push(bRatio); }
  if(cRatio != 0) { ratiosToCheck.push(cRatio); }
  let firstRatio = ratiosToCheck[0];
  for (let i = 0; i < ratiosToCheck.length; i++) {
    ratiosToCheck[i] -= firstRatio;
  }
  if(ratiosToCheck.filter(val => val < threshold).length == ratiosToCheck.length)
  {
    return true;
  }
  else {
    return false;
  }
}

function getPointFromPlanes(plane1, plane2, plane3){
  const A = new THREE.Matrix3();
  A.set(
    plane1.a, plane1.b, plane1.c,
    plane2.a, plane2.b, plane2.c,
    plane3.a, plane3.b, plane3.c
    )
  A.invert();
  const B = new THREE.Vector3(
    -plane1.d,
    -plane2.d,
    -plane3.d
    )
  let result = B.applyMatrix3(A);
  return result;
}

function getPlanePairs(planeEqsArr){
  let planePairs = [];
  while(planeEqsArr.length > 0){
    for (let i = 1; i < planeEqsArr.length; i++) {
      if(arePlanesParrallel(planeEqsArr[0], planeEqsArr[i])){
        planePairs.push({
          p1 : planeEqsArr[0],
          p2 : planeEqsArr[i]
        });
        planeEqsArr.splice(0, 1);
        planeEqsArr.splice(i-1, 1);
        break;
      };
    }
  }
  return planePairs;
}

function display3drepoMesh(clippingPlanes) {
  let planeEqArr = []; 
  for (const plane of clippingPlanes) {
    const distance = plane.distance;
    const planeNormal = repoApiToThreejs(plane.normal);
    planeEqArr.push({
      a : planeNormal.x,
      b : planeNormal.y,
      c : planeNormal.z,
      d : distance
    });  
  }
  let planePairs = getPlanePairs(planeEqArr);
  let topPnts = [];
  let btmPnts = [];

  topPnts.push(getPointFromPlanes(planePairs[0].p1, planePairs[1].p1, planePairs[2].p1)); 
  topPnts.push(getPointFromPlanes(planePairs[0].p1, planePairs[1].p2, planePairs[2].p1)); 
  topPnts.push(getPointFromPlanes(planePairs[0].p1, planePairs[1].p1, planePairs[2].p2)); 
  topPnts.push(getPointFromPlanes(planePairs[0].p1, planePairs[1].p2, planePairs[2].p2)); 
  
  btmPnts.push(getPointFromPlanes(planePairs[0].p2, planePairs[1].p1, planePairs[2].p1)); 
  btmPnts.push(getPointFromPlanes(planePairs[0].p2, planePairs[1].p2, planePairs[2].p1)); 
  btmPnts.push(getPointFromPlanes(planePairs[0].p2, planePairs[1].p1, planePairs[2].p2)); 
  btmPnts.push(getPointFromPlanes(planePairs[0].p2, planePairs[1].p2, planePairs[2].p2)); 
  
  for (let pntCtr = 0; pntCtr < topPnts.length; pntCtr ++) {
    let p1 = new THREE.Vector3(topPnts[pntCtr].x, topPnts[pntCtr].y, topPnts[pntCtr].z);
    let p2 = new THREE.Vector3(btmPnts[pntCtr].x, btmPnts[pntCtr].y, btmPnts[pntCtr].z);
    let arwVecOrg = new THREE.Vector3(btmPnts[pntCtr].x, btmPnts[pntCtr].y, btmPnts[pntCtr].z);
    let arwVec = p1.add(p2.multiplyScalar(-1));
    let hlfarwVec = new THREE.Vector3(arwVec.x, arwVec.y, arwVec.z);
    hlfarwVec.multiplyScalar(0.5);
    let midPoint = arwVecOrg.add(hlfarwVec);
    addArrowHelper(arwVec, btmPnts[pntCtr], arwVec.length());
    addPointAsSphere(topPnts[pntCtr]);
    addPointAsSphere(btmPnts[pntCtr]);
    addPointAsSphere(midPoint, 'blue');
  }

  loadModel();
}

function addPlane(planeNormal, distance){
  // plane
  const newPos = new THREE.Vector3(planeNormal.x, planeNormal.y, planeNormal.z).multiplyScalar(-distance);
  const plane = globals.gameObjectManager.createGameObject(globals.scene, 'plane');
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: 'green',
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const planeGeo = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.transform.add(planeGeo);
  plane.transform.lookAt(planeNormal);
  plane.transform.position.set(newPos.x, newPos.y, newPos.z);
}

function getSectionPlaneFrom3dRepo(){
    // getting the section plane data from 3drepo
    const apiKey = '670f65dd5a45cc01dc97d771ffad2b35';
    const modelId = '43dac390-5668-11eb-901c-8dcbf0759038';
    // const issueId = '8f802f30-567f-11eb-b14c-331a8baa9a5e'; // 5-4-1
    // const issueId = '602cb4b0-567f-11eb-b14c-331a8baa9a5e'; // in half
    // const issueId = 'afe494c0-5669-11eb-b14c-331a8baa9a5e'; // 3-1-2
    // const issueId = 'e23cc080-5729-11eb-b14c-331a8baa9a5e'; // 3-5-1
    const issueId = 'e49e9360-599c-11eb-bb0d-b34330a480ad'; // full clip box -  5-3-1
    // const issueId = '35992d00-59d1-11eb-9e73-c3cab698f37e'; // full clip box - axis aligned
    // const issueId = 'a8794560-59d8-11eb-9e73-c3cab698f37e'; // full clip box - straight down the middle 
    // const issueId = '2d6812f0-59da-11eb-bb0d-b34330a480ad'; // 4 plane clip box 

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
        display3drepoMesh(data.viewpoint.clippingPlanes);
      })
      .catch((error) => {
        console.log('Dammit');
        console.log(error);
      });
}

function repoApiToThreejs(vector) {
  return new THREE.Vector3(
    vector[0],
    vector[1],
    vector[2],
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

function loadModel(){
  // the dice model
  const loader = new OBJLoader();
  loader.load(
    // resource URL
    'assets/dado.obj',
    // called when resource is loaded
    function ( object ) {
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
}

function addPointAsSphere(pos, color = 'yellow'){
  const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
  const material = new THREE.MeshBasicMaterial( {color: color} );
  const sphere = new THREE.Mesh( geometry, material);
  sphere.position.set(pos.x,pos.y,pos.z);
  globals.scene.add( sphere );
}

function addArrowHelper(vector, origin, length = 8, color = 'green'){
  let arrow = new THREE.ArrowHelper(vector.normalize(), origin, length, color);
  globals.scene.add(arrow);
}

function convertToCivilStyleSection(normal, distance){
  // Calculate perpendicular vector for section
  // using logic from an answere here: https://math.stackexchange.com/questions/137362/how-to-find-perpendicular-vector-to-another-vector
  // NOTE: probably need to project the editor UP direction
  // on to the plone to get the first orthogonal vector
  const moduliOfOptions = 
  {
    'C&B' : normal.z*normal.z + normal.y*normal.y,
    'C&A' : normal.z*normal.z + normal.x*normal.x,
    'B&A' : normal.y*normal.y + normal.x*normal.x,
  };

  // Create items array
  var orderedPairs = Object.keys(moduliOfOptions).map(function(key) {
    return [key, moduliOfOptions[key]];
  });
  // Sort the array based on the second element
  orderedPairs.sort(function(first, second) {
    return second[1] - first[1];
  });

  let civilOrthVec1 = new THREE.Vector3();
  switch (orderedPairs[0][0])
  {
      case "C&B":
          civilOrthVec1 = new THREE.Vector3(0, normal.z, -normal.y);
          break;
      case "C&A":
          civilOrthVec1 = new THREE.Vector3(-normal.z, 0, normal.x);
          break;
      case "B&A":
          civilOrthVec1 = new THREE.Vector3(-normal.y, normal.x, 0);
          break;
  }

  // Calculate two points on the plane that form the cutting line
  let civilOrthVec2 = new THREE.Vector3().crossVectors(civilOrthVec1, normal);
  let p1 = new THREE.Vector3().add(normal.multiplyScalar(distance));
  let p2 = new THREE.Vector3().add(p1).add(civilOrthVec2);

  let result = 
  {
    sectionUp : civilOrthVec1,
    point1: p1,
    point2: p2, 
  } 
  return result;
}

initialise();
setupGameObjects();
requestAnimationFrame(render);
