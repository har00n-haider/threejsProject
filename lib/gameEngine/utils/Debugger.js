import * as THREE from '../../three.module.js';
import globals from '../Globals.js';

class Debugger  {
    constructor(globals, debuggerElem) {
      this.globals = globals;
      this.debuggerElem = debuggerElem;
      this.lastHitPoint = new THREE.Vector3();
      // activating the 
      globals.canvas.onkeyup = function(e){
        // space bar
        if(e.keyCode == 32){
          this.lastHitPoint = this.getFirstHitInScene(this.globals.inputManager.pointerPos);
        }
      }.bind(this);

      this.clickEvents = 0;
      globals.inputManager.clickEvent.regCb((pointerPos)=>{
        this.clickEvents++;
      });
    }

    update = () => {
        this.debuggerElem.innerHTML = 
        "window size: " + window.innerWidth + " , " + 
                          window.innerHeight + "<br>" + 
        "canvas size (DOM ELEM): " + this.globals.canvas.clientWidth + " , " + 
                          this.globals.canvas.clientHeight + "<br>" +
        "canvas size (RESOLUTION): " + this.globals.canvas.width + " , " + 
                          this.globals.canvas.height + "<br>" +    
        "device pixel ratio: " + window.devicePixelRatio + "<br>" +
        "FPS : " + (1000/globals.deltaTimeMillSec).toFixed(2) + "<br>" +                                
        "pointer pos: " + this.globals.inputManager.pointerPos.x.toFixed(2) + " , " + 
                          this.globals.inputManager.pointerPos.y.toFixed(2) + "<br>" +
        "registered clicks: " + this.clickEvents + "<br>" + 
        "pointer pos: " + this.lastHitPoint.x.toFixed(2) + " , " + 
                          this.lastHitPoint.y.toFixed(2) + " , " +
                          this.lastHitPoint.z.toFixed(2)
        ;
    }   

    drawDebugClickRay = (pointerPos) =>
    {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointerPos, this.globals.mainCamera);
        let pointerArrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000);
        this.globals.scene.add(pointerArrow);
    }

    getFirstHitInScene = (pointerPos) =>
    {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointerPos, this.globals.mainCamera);
        const intersects = raycaster.intersectObjects( this.globals.scene.children , true);
        if (intersects.length > 0)
        {
          return intersects[0].point;
        }
        else
        {
          return new THREE.Vector3(0,0,0);
        }
    }
}

export default Debugger;