import Component from "../Component.js";
import * as THREE from "../../../lib/three.module.js";
import globals from "../../Globals.js";

/**
 * Creates a Kube and adds a mesh of 
 * the defined size
 */
class KubeController extends Component {
  constructor(gameObject, size) {
    super(gameObject);
    this.mesh = this.addCube(size);
    this.uuid = this.mesh.uuid;
    gameObject.transform.add(this.mesh);
    globals.inputManager.clickEvent.regCb(this.kubeHitCheck);
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

  kubeHitCheck = (mousePos) => {
    // console.log("click happened event data at : " + mousePos.x + ", " + mousePos.y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mousePos, globals.mainCamera );
    const intersects = raycaster.intersectObjects( [this.mesh] );
    if (intersects.length > 0)
    {
      this.destroy();
    }
  }

  destroy(){
      globals.inputManager.clickEvent.deRegCb(this.kubeHitCheck);
      console.log("destroying component");
      this.gameObject.transform.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = undefined;
  }

}

export default KubeController;
