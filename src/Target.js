import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import ResourceTracker from '../lib/gameEngine/utils/ResourceTracker.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js';

class Target extends Component {
  constructor(gameObject) {
    super(gameObject);
    const params = this.getRandomTargetParams();
    this.resTracker = new ResourceTracker();
    this.speed = params.speed;
    this.rotRate = params.rotRate;
    this.qB = params.qB;
    this.t = 0;
  
    // set up the target object
    this.targetBox = Utils.getBox(0.5, params.color);
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

  getRandomTargetParams = () => {
    // definition
    const params = {
      rotRate : undefined,
      speed : undefined,
      color : undefined,
      qB: {
        p1: undefined,
        p2: undefined,
        p3: undefined,
      }
    }

    params.color = Utils.getRandomColor();
    params.speed = Utils.rand(0.2, 0.6);
    params.rotRate = Utils.rand(0.005, 0.1);

    // bezier
    const maxX = 6;
    const minX = 0
    const hafX = maxX/2;
    const maxY = 15;
    const minY = 5;
    const pnt1 = new THREE.Vector2(Utils.rand(minX, maxX), 0);
    let pnt3;
    // make sure that we have parabolas that go both directions
    if(pnt1.x > hafX){
      pnt3 = new THREE.Vector2(Utils.rand(0, hafX), 0);
    }
    else{
      pnt3 = new THREE.Vector2(Utils.rand(hafX, maxX), 0);
    }
    const pnt2 = new THREE.Vector2(Utils.rand(pnt1.x, pnt3.x), Utils.rand(minY, maxY));
    params.qB.p1 = pnt1;
    params.qB.p2 = pnt2;
    params.qB.p3 = pnt3;

    return params;
  }

}

export default Target;