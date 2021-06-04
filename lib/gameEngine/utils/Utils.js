import * as THREE from "../../three.module.js";
import {OBJLoader} from '../../OBJLoader.js';
import {MTLLoader} from '../../MTLLoader.js';
import {VertexNormalsHelper} from '../../VertexNormalsHelper.js'

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function randVec3(range){
  return new Vector3(
    rand(-range, range),
    rand(-range, range),
    rand(-range, range)
  );
}

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function removeArrayElement(array, element) {
  const ndx = array.indexOf(element);
  if (ndx >= 0) {
    array.splice(ndx, 1);
  }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function loadObjModel(fileName, scene, loadMtl = false, displayNormals = false){
  const objFilePath ='./assets/' + fileName + '.obj';
  const mtlFilePath ='./assets/' + fileName + '.mtl';
  const onLoad = function ( object ) {
    scene.add( object );
    if(displayNormals)
    {
      for( const mesh of object.children){
        const helper = new VertexNormalsHelper( mesh, 0.1, 0xff0000 );
        scene.add( helper );
      }
    }
  };
  const onProgress = function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  };
  const onError = function ( error ) {
    console.log( 'loading error: ' + error );
  };
  if(loadMtl){
    const mtlLoader = new MTLLoader();
    // mtlLoader.setPath('obj/male02/');
    mtlLoader.load(mtlFilePath, function(materials) {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      // objLoader.setPath('obj/male02/');
      objLoader.load(objFilePath, onLoad, onProgress, onError);
    });
  }
  else{
    const objLoader = new OBJLoader();
    objLoader.load(objFilePath, onLoad, onProgress, onError);
  }
}

function getBoundingBoxFromModel() {
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

function addPointAsSphere(pos, scene, color = 'yellow', size = 0.07) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const sphere = new THREE.Mesh(geometry, material);
  if(pos.isVector3){
    sphere.position.set(pos.x, pos.y, pos.z);
  }
  else if(pos.isVector2){
    sphere.position.set(pos.x, pos.y, 0);
  }
  scene.add(sphere);
}

function addArrowHelper(vector, origin = new THREE.Vector3(), length = 8, color = 'green') {
  const vectorNorm = new THREE.Vector3().copy(vector).normalize();
  let arrow = new THREE.ArrowHelper(vectorNorm, origin, length, color);
  globals.scene.add(arrow);
}

function getBox(scale = 1, color = 'blue'){
  const tColor = new THREE.Color(color);
  const geometry = new THREE.BoxGeometry( scale, scale, scale );
  const material = new THREE.MeshStandardMaterial({
    color : tColor,
    emissive : 0x212121,
    roughness : 0.3,
  });
  const cube = new THREE.Mesh( geometry, material );
  cube.name = 'UtilsCube';
  return cube;
}

function getMesh(vertices, indices, normals, colors){
  // convert intermediate mesh to THREE mesh
  let threeMesh;
  const geometry = new THREE.BufferGeometry();
  for(const vert of mesh.vertices){
    for (let i = 0; i < 3; i++) {
      vertices.push(vert[i]);
    }
  }
  for(const tri of mesh.triangles){
    for (let i = 0; i < 3; i++) {
      indices.push(tri[i] - 1);
    }
  }
  geometry.setIndex( indices );
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
  // geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
  // const material = new THREE.MeshPhongMaterial( {
  //   side: THREE.DoubleSide,
  //   vertexColors: true
  // } );
  const material = new THREE.MeshStandardMaterial( {
    wireframe: true,
  } );
  threeMesh = new THREE.Mesh( geometry, material );
  return threeMesh;
}

export {
  rand,
  removeArrayElement,
  clamp,
  randVec3,
  loadObjModel,
  getBoundingBoxFromModel,
  addPointAsSphere,
  addArrowHelper,
  getRandomColor,
  getBox,
};
