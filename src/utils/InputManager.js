
import * as THREE from "../../lib/three.module.js";
import DispatcherEvent from "../../src/utils/Dispatcher.js";
import globals from "../globals.js";

class InputManager {
  constructor(renderElem) {
    this.mousePos = new THREE.Vector2();
    renderElem.addEventListener( 'pointermove', this.onMouseMove, false );
    renderElem.addEventListener( 'pointerdown', this.onMouseDown, false );
    this.clickEvent = new DispatcherEvent('click');
  }

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  onMouseMove = ( event ) => {
    this.mousePos.x =   ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mousePos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    //console.log(this.mousePos);
  }

  onMouseDown = (event) => {
    this.clickEvent.fire(this.mousePos);
  }

  update() {

  }
}

export default InputManager;
