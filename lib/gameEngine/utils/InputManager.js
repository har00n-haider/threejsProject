import * as THREE from "../../three.module.js";
import DispatcherEvent from "./Dispatcher.js";
import globals from "../Globals.js";

class InputManager {
  constructor(renderElem) {
    this.pointerPos = new THREE.Vector2();
    renderElem.addEventListener( 'pointermove', this.onMouseMove, false );
    renderElem.addEventListener( 'pointerdown', this.onMouseDown, false );
    this.clickEvent = new DispatcherEvent('click');
  }

  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  onMouseMove = ( event ) => {
    this.pointerPos = this.normaliseWindowPointerPos(
      event.x, 
      event.y
    );
  }

  onMouseDown = (event) => {
    this.clickEvent.fire(this.normaliseWindowPointerPos(
      event.x, 
      event.y
    ));
  }

  update() {
  }

  normaliseWindowPointerPos = (x , y) => {
    return new THREE.Vector2(
        ( x / window.innerWidth  ) * 2 - 1,
      - ( y / window.innerHeight ) * 2 + 1
    );
  }
}

export default InputManager;