
import * as THREE from "../../lib/three.module.js";
import DispatcherEvent from "../../src/utils/Dispatcher.js";

class InputManager {
  constructor() {
    this.mousePos = new THREE.Vector2();
    window.addEventListener( 'mousemove', this.onMouseMove, false );
    window.addEventListener( 'mousedown', this.onMouseDown, false );
    this.clickEvent = new DispatcherEvent('click');
  }

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  onMouseMove = ( event ) => {
    this.mousePos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  onMouseDown = (event) => {
    this.clickEvent.fire(this.mousePos);
  }

  update() {

  }
}

export default InputManager;
