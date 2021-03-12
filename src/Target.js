import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import ResourceTracker from '../lib/gameEngine/utils/ResourceTracker.js';
import {getBox} from '../lib/gameEngine/utils/Utils.js'; 

class Target extends Component {
  constructor(gameObject, params) {
    super(gameObject);
    this.resTracker = new ResourceTracker();
    this.speed = params.speed;
    this.rotRate = params.rotRate;
    this.qB = params.qB;
    this.t = 0;
  
    // set up the target object
    this.targetBox = getBox(0.5)
    this.resTracker.track(this.targetBox);
    this.gameObject.transform.add(this.targetBox);
    this.targetBox.visible = false;
  }

  update = () => {
    const pnt2d = ku.getPntOnQuadBezier(this.t, this.qB)
    this.targetBox.position.set(pnt2d.x, pnt2d.y, 0);
    this.targetBox.rotation.x += this.rotRate;
    this.targetBox.rotation.y += this.rotRate;
    this.targetBox.rotation.z += this.rotRate;
    if(this.t <= 1){
      // only show when there is a valid pos on the parabola
      if(!this.targetBox.visible && this.t > 0){
        this.targetBox.visible = true;
      }
      this.t += this.speed*globals.deltaTimeMillSec/1000;
    }
    else{
      this.destroy();
    }
  }

  destroy = () => {
    this.resTracker.dispose();
    //TODO: this type of stuff should be in the gameObject definition
    // for destroy so you could call super.destroy() 
    this.gameObject.parent.remove(this.gameObject.transform);
    globals.gameObjectManager.removeGameObject(this.gameObject);
  }

}

export default Target;