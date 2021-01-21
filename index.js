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
    // const issueId = '8f802f30-567f-11eb-b14c-331a8baa9a5e'; // 5-4-1
    // const issueId = '602cb4b0-567f-11eb-b14c-331a8baa9a5e'; // in half
    // const issueId = 'afe494c0-5669-11eb-b14c-331a8baa9a5e'; // 3-1-2
    // const issueId = 'e23cc080-5729-11eb-b14c-331a8baa9a5e'; // 3-5-1
    // const issueId = 'e49e9360-599c-11eb-bb0d-b34330a480ad'; // full clip box -  5-3-1
    // const issueId = '35992d00-59d1-11eb-9e73-c3cab698f37e'; // full clip box - axis aligned
    // const issueId = 'a8794560-59d8-11eb-9e73-c3cab698f37e'; // full clip box - straight down the middle
    // const issueId = '2d6812f0-59da-11eb-bb0d-b34330a480ad'; // 4 plane clip box
    // const issueId = 'd1b73ae0-5b36-11eb-8190-0f3cc630421e'; // section starts outside box
    const issueId = '89ace260-5c06-11eb-95bf-77794e8460c9'; // 4 planes - two not parallel

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
      });
      // .catch((error) => {
      //   console.log('Dammit');
      //   console.log(error);
      // });
}

function display3drepoMesh(clippingPlanes) {
  let planeArr = [];
  for (const repoPlane of clippingPlanes) {
    const plane = getPlaneFromVals(
      repoPlane.normal[0],
      repoPlane.normal[1],
      repoPlane.normal[2],
      repoPlane.distance
    );
    planeArr.push(plane);
  }

  const faceToPlaneMap = mapPlanesToFaces(planeArr);


  // Assuming only a single initial plane exists
  const bbox = getBoundingBoxFromModel();

  const H1Pos = planeArr[0];
  const H1Neg = genOppParrPlane(H1Pos, bbox);
  const H2Pos = genAdjOrthPlane(H1Pos, H1Neg, bbox);
  const H2Neg = genOppParrPlane(H2Pos, bbox);
  const H3Pos = genAdjOrthPlane(H2Pos, H2Neg, bbox, H1Pos.normal);
  const H3Neg = genOppParrPlane(H3Pos, bbox);

  addPlane(H1Pos);
  addPlane(H1Neg);
  addPlane(H2Pos);
  addPlane(H2Neg);
  addPlane(H3Pos);
  addPlane(H3Neg);

  const planeArr2 = [];

  planeArr2.push(H1Pos);
  planeArr2.push(H1Neg);
  planeArr2.push(H2Pos);
  planeArr2.push(H2Neg);
  planeArr2.push(H3Pos);
  planeArr2.push(H3Neg);

  //convertToCivilStyleBoxSection(planeArr2);



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
        opacity: 0.2,
        transparent: true,
      });
      object.children[0].material = modelMat;
      globals.scene.add( object );
      addBbox(object);
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

//#region Plane conversion functions

function mapPlanesToFaces(planesArr){
  const faceToPlaneMap = new Map();
  faceToPlaneMap.set("H1Pos", null)
  faceToPlaneMap.set("H1Neg", null)
  faceToPlaneMap.set("H2Pos", null)
  faceToPlaneMap.set("H2Neg", null)
  faceToPlaneMap.set("H3Pos", null)
  faceToPlaneMap.set("H3Neg", null)
  if(planesArr.length <= 0){
    return faceToPlaneMap;
  }
  if(planesArr.length >= 1){
    const planePairs = getPlanePairs(planesArr);
    let x = 1;
  }

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

// Solving three linear equations
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

function getPlanePairs(planesArr){
  const planePairs = [];
  planesArr.forEach(plane => {
    plane.checkedForPair = false;
    plane.foundPair = false;
  });
  while(planesArr.filter(plane => plane.checkedForPair == true).length != planesArr.length){
    let currPlane = null;
    for (let i = 0; i < planesArr.length; i++) {
      if(currPlane == null)
      {
        if(planesArr[i].checkedForPair == false)
        {
          currPlane = planesArr[i];
        }
        break;
      }
      if(arePlanesParrallel(currPlane, planesArr[i])){
        planePairs.push({
          p1 : currPlane,
          p2 : planesArr[i]
        });
        currPlane.checkedForPair = true;
        currPlane.foundPair = true;
        planesArr[i].checkedForPair = true;
        planesArr[i].foundPair = true;
        currPlane = null;
        break;
      };
      if(i == (planesArr - 1)){
        currPlane.checkedForPair = true;
        currPlane = null;
      }
    }
  }
  for (plane of planesArr.filter(plane => plane.foundPair = false)){
    planePairs.push({
      p1 : plane,
      p2 : null
    });
  }
  // clean up
  for (plane of planesArr){

  }
  return planePairs;
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
      case 'C&B':
          civilOrthVec1 = new THREE.Vector3(0, normal.z, -normal.y);
          break;
      case 'C&A':
          civilOrthVec1 = new THREE.Vector3(-normal.z, 0, normal.x);
          break;
      case 'B&A':
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

function convertToCivilStyleBoxSection(planeArr){
  let planePairs = getPlanePairs(planeArr);
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
}

function genOppParrPlane(plane, bbox){
  const farPnt = getFarthestPntFromPlane(bbox.vertices, plane)
  const oppParPlane = getPlaneFromPntNorm(farPnt, plane.normal);
  return oppParPlane;
}

function genAdjOrthPlane(plane, oppParPlane, bbox, upDir = new THREE.Vector3(0, 1, 0)){
  // Figure out the point and normal of the adjacent orth plane
  // Using the upDir as y axis by default to keep things looking somewhat axis aligned
  const upDirProjVec = getProjVecOnPlane(upDir, plane);
  const orthDir = new THREE.Vector3().crossVectors(plane.normal, upDirProjVec);
  const vecToCenter =  new THREE.Vector3().copy(oppParPlane.center).sub(plane.center);
  const centerPoint =  new THREE.Vector3().copy(plane.center).add(vecToCenter.multiplyScalar(0.5));
  const orthPlaneMid = getPlaneFromPntNorm(centerPoint, orthDir);

  const farPnt = getFarthestPntFromPlane(bbox.vertices, orthPlaneMid);
  const orthPlane = getPlaneFromPntNorm(farPnt, orthDir);
  return orthPlane;
}

function getFarthestPntFromPlane(points, plane){
  const distVals = points.map(vert => getDistOfPntFromPlane(vert, plane));
  const idxMaxDistVal = distVals.reduce(
    (iMax, currVal, iCurr, arr) => {
      return Math.abs(currVal) > Math.abs(arr[iMax]) ? iCurr : iMax;
    }, 0
  );
  const farthestPnt = new THREE.Vector3().copy(points[idxMaxDistVal]);
  return farthestPnt;
}

function getProjVecOnPlane(vec, plane){
  // k - original vector
  // n - plane normal
  // kpp - k projected onto plane
  // kpn - k projected onto n
  // kpn = k.n/(||n||)^2 . n
  const k = new THREE.Vector3().copy(vec);
  const n = new THREE.Vector3().copy(plane.normal);
  const kpn = (new THREE.Vector3().copy(n)).multiplyScalar(k.dot(n) / (n.length() * n.length()));
  const kpp = new THREE.Vector3().add(k).sub(kpn);
  return kpp;
}

function isPntInBbox(pnt, bbox, addPoint = true){
  let xOk = (pnt.x < bbox.max.x) && (pnt.x > bbox.min.x);
  let yOk = (pnt.y < bbox.max.y) && (pnt.y > bbox.min.y);
  let zOk = (pnt.z < bbox.max.z) && (pnt.z > bbox.min.z);
  let result = xOk && yOk && zOk;
  if(addPoint){
    let inColor = 'red';
    let outColor = 'green';
    if(result){
      addPointAsSphere(pnt, inColor, 0.07);
    }else{
      addPointAsSphere(pnt, outColor, 0.07);
    }
  }
  return result;
}

function getBoundingBoxFromModel(){
  const bbox = new THREE.Box3();
  let dice = globals.scene.getObjectByName('dice', true);
  bbox.expandByObject(dice);
  let diagonalVector = new THREE.Vector3(
    bbox.max.x - bbox.min.x,
    bbox.max.y - bbox.min.y,
    bbox.max.z - bbox.min.z
  ).multiplyScalar(0.5);
  bbox.center = new THREE.Vector3(
    bbox.min.x,
    bbox.min.y,
    bbox.min.z
  ).add(diagonalVector);
  bbox.vertices = [
    new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
    new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.min.z),
    new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.min.z),
    new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.max.z),
    new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
    new THREE.Vector3(bbox.min.x, bbox.max.y, bbox.max.z),
    new THREE.Vector3(bbox.max.x, bbox.min.y, bbox.max.z),
    new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.min.z),
  ]
  return bbox;
}

function getDistOfPntFromPlane(pnt, plane){
  return plane.a*pnt.x + plane.b*pnt.y + plane.c*pnt.z + plane.d;
}

function getPlaneFromPntNorm(point, normal){
  const planeNorm = new THREE.Vector3().copy(normal).normalize();
  const plane = getPlaneFromVals(
    planeNorm.x,
    planeNorm.y,
    planeNorm.z,
    (
      planeNorm.x * point.x +
      planeNorm.y * point.y +
      planeNorm.z * point.z
    ) * -1
  );
  return plane
}

// ax + by + cz + d = 0
function getPlaneFromVals(a,b,c,d){
  const planeNormal = new THREE.Vector3(a,b,c);
  const planeCenter = new THREE.Vector3().add(new THREE.Vector3().copy(planeNormal).multiplyScalar(-d));
  const plane = {
    a : planeNormal.x,
    b : planeNormal.y,
    c : planeNormal.z,
    d : d,
    normal: planeNormal,
    center: planeCenter
  };
  return plane;
}

//#endregion

//#region Debug helpers
function calculateRandomPointsOnPlane(plane, numPoints, range, addToScene = false){
  let randArr = [];
  for (let i = 0; i < numPoints; i++) {
    let xRand = rand(-range, range);
    let yRand = rand(-range, range);
    let z = (-plane.d - plane.a*xRand - plane.b*yRand)/plane.c;
    randArr.push(new THREE.Vector3(xRand, yRand,z))
    addPointAsSphere(randArr[i]);
  }
  return randArr;
}

function calculateRandPerpVector(vector, range){
  let xRand = rand(-range, range);
  let yRand = rand(-range, range);
  let z = (-vector.x*xRand -vector.y*yRand)/vector.z;
  return new THREE.Vector3(xRand, yRand, z);
}

function addPointAsSphere(pos, color = 'yellow', size = 0.1){
  const geometry = new THREE.SphereGeometry( size , 32, 32 );
  const material = new THREE.MeshBasicMaterial( {color: color} );
  const sphere = new THREE.Mesh( geometry, material);
  sphere.position.set(pos.x,pos.y,pos.z);
  globals.scene.add( sphere );
}

function addArrowHelper(vector, origin = new THREE.Vector3(), length = 8, color = 'green'){
  const vectorNorm = new THREE.Vector3().copy(vector).normalize();
  let arrow = new THREE.ArrowHelper(vectorNorm, origin, length, color);
  globals.scene.add(arrow);
}

function addPlane(plane, color = 'green', addNorm = false){
  // plane
  const planeNormal = plane.normal;
  const pos = plane.center;
  const planeObj = globals.gameObjectManager.createGameObject(globals.scene, 'plane');
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshPhongMaterial({
    color: color,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const planeGeo = new THREE.Mesh(planeGeometry, planeMaterial);
  planeObj.transform.add(planeGeo);
  planeObj.transform.lookAt(planeNormal);
  planeObj.transform.position.set(pos.x, pos.y, pos.z);
  if(addNorm){
    addArrowHelper(plane.normal, plane.center, 2, 'red');
  }
}

function addBbox(object){
  const box = new THREE.BoxHelper( object, 0xffff00 );
  globals.scene.add( box );
}
//#endregion

initialise();
setupGameObjects();
requestAnimationFrame(render);
