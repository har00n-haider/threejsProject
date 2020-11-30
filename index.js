// Setting up 3d scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
camera.position.z = 5
const renderer = new THREE.WebGLRenderer({ antialias: true})
renderer.setSize( window.innerWidth, window.innerHeight )
document.body.appendChild( renderer.domElement )

// Setting up cube
var geometry = new THREE.BoxGeometry( 1, 1, 1)
var material = new THREE.MeshStandardMaterial( { color: 0x0000ff })
var cube = new THREE.Mesh ( geometry, material )
cube.position.set( 2, 1, -5 )
scene.add( cube )

// Light
var ambientLight = new THREE.AmbientLight ( 0xffffff, 3)
scene.add( ambientLight )
var pointLight = new THREE.PointLight( 0xffffff, 3 );
pointLight.position.set( 25, 50, 25 );
scene.add( pointLight );


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// calculate mouse position in normalized device coordinates
// (-1 to +1) for both components
function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function renderMain() {
    window.requestAnimationFrame(renderMain);

    
	raycaster.setFromCamera( mouse, camera );
	const intersects = raycaster.intersectObjects( scene.children );
	for ( let i = 0; i < intersects.length; i ++ ) {
		intersects[ i ].object.material.color.set( 0xff0000 );
    }
    
    debugLog();
    cube.rotation.x += 0.04;
    // //  cube.rotation.y += 0.02;
    // //  cube.rotation.z += 0.01;

	renderer.render( scene, camera );
}

function debugLog() {
    console.log("mouse position: " + mouse.x.toFixed(2) + " " + mouse.y.toFixed(2));
}

window.addEventListener( 'mousemove', onMouseMove, false );


renderMain()