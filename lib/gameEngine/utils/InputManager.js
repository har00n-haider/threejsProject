import * as THREE from '../../three.module.js';
import DispatcherEvent from './Dispatcher.js';
import globals from '../Globals.js';

class InputManager {
  constructor(renderElem) {
    this.pointerIsDown = false;
    this.pointerPos = new THREE.Vector2();
    renderElem.addEventListener( 'pointermove', this.onPointerMove, false );
    renderElem.addEventListener( 'pointerdown', this.onPointerDown, false );
    renderElem.addEventListener( 'pointerup'  , this.onPointerUp, false);
    renderElem.addEventListener( 'pointermove', this.onPointerMove, false);
    this.clickEvent = new DispatcherEvent('click');
    this.moveEvent = new DispatcherEvent('move');
    this.pointerPosList = [];
  }

  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components
  normWinPntrPos = (x , y) => {
    return new THREE.Vector2(
        ( x / window.innerWidth  ) * 2 - 1,
      - ( y / window.innerHeight ) * 2 + 1
    );
  }

  updatePointer = (x, y) => { 
    this.pointerPos = this.normWinPntrPos(
      x, 
      y
    )
  }

  onPointerMove = ( event ) => {
      // TODO: Implement all pointer pos in this list 
      // let events = event.getCoalescedEvents();
      // for(let e of events) {
      //   this.pointerPosList.push(this.normWinPntrPos(e.pageX, e.pageY));
      // }
      this.updatePointer(event.x, event.y);
      this.moveEvent.fire({
        pointerPos : this.pointerPos , 
        pointerIsDown : this.pointerIsDown
      });
  }
  
  onPointerDown = (event) => {
    this.pointerIsDown = true;
    this.updatePointer(event.x, event.y);
    this.clickEvent.fire(this.pointerPos);
  }

  onPointerUp = (event) => {
    this.pointerIsDown = false;
  }
}

export default InputManager;
