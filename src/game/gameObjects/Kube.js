import Component from "../Component.js";
import * as THREE from "../../../lib/three.module.js";
import globals from "../../../lib/gameEngine/Globals.js";
import ParticleSystem from './ExplosionParticleSystem.js';

/**
 * Creates a Kube and adds a mesh of 
 * the defined size
 */
class KubeController extends Component {
  constructor(gameObject, size, velocity) {
    super(gameObject);
    this.mesh = this.addCube(size);
    this.uuid = this.mesh.uuid;
    this.velocity = velocity;
    this.explosionAudio = new Audio('assets/Explosion+7_freesoundeffects.com.mp3');
    gameObject.transform.add(this.mesh);
    globals.inputManager.clickEvent.regCb(this.kubeHitCheck);
  }

  addCube(size){
    var geometry = new THREE.BoxGeometry(size, size, size);
    var material = new THREE.MeshStandardMaterial( { color: 0xC4D99C });
    var cube = new THREE.Mesh ( geometry, material );
    return cube;
  } 

  update() {
    this.gameObject.transform.position.x += this.velocity.x;
    this.gameObject.transform.position.y += this.velocity.y;
    this.gameObject.transform.position.z += this.velocity.z;
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
      this.explosionAudio.play();
      this.gameObject.getComponent(ParticleSystem).play();
      console.log("destroying component");
      globals.inputManager.clickEvent.deRegCb(this.kubeHitCheck);
      this.gameObject.transform.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = undefined;
  }

}

export default KubeController;
