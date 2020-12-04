import * as THREE from "../../../lib/three.module.js";
import Component from "../CoroutineRunner.js";

class CameraInfo extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.camera = gameObject.parent;
    this.projScreenMatrix = new THREE.Matrix4();
    this.frustum = new THREE.Frustum();
  }

  update() {
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromMatrix(this.projScreenMatrix);
  }
}

export default CameraInfo;
