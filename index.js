
"use strict";
console.log(addNumbers(3,4))

// Setting up 3d scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 5
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

// Setting up cube
function addCube(x,y,z, position){
    var geometry = new THREE.BoxGeometry( x, y, z)
    var material = new THREE.MeshStandardMaterial( { color: 0x0000ff })
    var cube = new THREE.Mesh ( geometry, material )
    cube.position.set(position.x, position.y, position.z)
    scene.add( cube )
    return cube;
}

// Light
var ambientLight = new THREE.AmbientLight ( 0xffffff, 3)
scene.add( ambientLight )
var pointLight = new THREE.PointLight( 0xffffff, 3 );
pointLight.position.set( 25, 50, 25 );
scene.add( pointLight );

function someDeleteFunction(objectToDelete) {
    // var selectedObject = scene.getObjectByName(object.name);
    scene.remove(objectToDelete);
    objectToDelete.geometry.dispose();
    objectToDelete.material.dispose();
    objectToDelete = undefined;
}

function debugLog() {
    console.log("mouse position: " + mouse.x.toFixed(2) + " " + mouse.y.toFixed(2));
}

const mouse = new THREE.Vector2();
// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
var miniCubeIsMoving = false;
var miniCube1;



function onMouseDown(event){
    raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( scene.children );
	for ( let i = 0; i < intersects.length; i ++ ) {

        var hitCube = intersects[ i ].object;
        var hitPos = hitCube.position;
        someDeleteFunction(hitCube);
        miniCube1 = addCube(0.3,0.3,0.3, hitPos);
        miniCubeIsMoving = true;
    }
}

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );


var cube = addCube(1, 1, 1, new THREE.Vector3(2, 1, -5));
const raycaster = new THREE.Raycaster();
// Main loop
function renderMain() {
    window.requestAnimationFrame(renderMain);
    //debugLog();
    cube.rotation.x += 0.04;
    // //  cube.rotation.y += 0.02;
    // //  cube.rotation.z += 0.01;
    if(miniCubeIsMoving){
        miniCube1.position.x += 0.1;
    }
    renderer.render( scene, camera );
    
}
renderMain()