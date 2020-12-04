import Component from "./Component.js";
import * as THREE from "../../lib/three.module.js";
import globals from "../globals.js";


/**
 * Creates a Kube and adds a mesh of 
 * the defined size
 */
class KubeController extends Component {
  constructor(gameObject, size) {
    super(gameObject);
    this.mesh = this.addCube(size);
    gameObject.transform.add(this.mesh);
    globals.inputManager.clickEvent.registerCallback(this.kubeHitCheck);
  }

  addCube(size){
    var geometry = new THREE.BoxGeometry(size, size, size);
    var material = new THREE.MeshStandardMaterial( { color: 0x0000ff });
    var cube = new THREE.Mesh ( geometry, material );
    return cube;
  } 

  update() {
    this.gameObject.transform.position.x += 0.01;
  }

  kubeHitCheck(eventData){
    console.log("click happened event data : " + eventData);

    // const raycaster = new THREE.Raycaster();
    // raycaster.setFromCamera( mouse, camera );
    // const intersects = raycaster.intersectObjects( scene.children );
    // for ( let i = 0; i < intersects.length; i ++ ) {
  
    //     hitCube = intersects[ i ].object;
    //     hitPos = hitCube.position;
    //     someDeleteFunction(hitCube);
    //     miniCube1 = addCube(0.3,0.3,0.3, hitPos)
    // }
  }


  destroy(){
      console.log("desroying component");
      this.gameObject.transform.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = undefined;
  }

}

export default KubeController;
