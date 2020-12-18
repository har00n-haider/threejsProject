import * as THREE from '../../lib/three.module.js';

class Debugger  {
    constructor(globals, debuggerElem) {
      this.globals = globals;
      this.debuggerElem = debuggerElem;

      // activating the 
      globals.canvas.onkeyup = function(e){
        // U button
        if(e.keyCode == 85){
          this.debugClickRayCast(this.globals.inputManager.pointerPos);
        }
      }.bind(this);
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
        "pointer pos: " + this.globals.inputManager.pointerPos.x.toFixed(2) + " , " + 
                          this.globals.inputManager.pointerPos.y.toFixed(2) + "<br>" ;
    }

    debugClickRayCast = (pointerPos) =>
    {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointerPos, this.globals.mainCamera);
        let dir     = new THREE.Vector3(1,1,1);
        let origin  = new THREE.Vector3(0,0,0);
        let unitArrow = new THREE.ArrowHelper(dir.normalize(), origin, 20, 'purple');
        let pointerArrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000);
        this.globals.scene.add(pointerArrow);
    }
}

export default Debugger;