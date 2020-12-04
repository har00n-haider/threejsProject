import Component from "./Component.js";
import * as THREE from "../../lib/three.module.js";

/**
 * Creates a Kube and adds a mesh of 
 * the defined size
 */
class KubeController extends Component {
  constructor(gameObject, size) {
    super(gameObject);
    this.mesh = this.addCube(size);
    gameObject.transform.add(this.mesh);
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

  destroy(){
      console.log("desroying component");
      this.gameObject.transform.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = undefined;
  }

}

export default KubeController;
