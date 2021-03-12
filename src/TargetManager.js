import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import ResourceTracker from '../lib/gameEngine/utils/ResourceTracker.js';
import {getBox, rand} from '../lib/gameEngine/utils/Utils.js'; 
import Target from './Target.js';

class TargetManager extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.resTracker = new ResourceTracker();
    this.timerS = 0;
    this.timeToNxtTgtS = 1;
  }

  update = () => {
    if(this.timerS < this.timeToNxtTgtS){
      this.timerS += globals.deltaTimeMillSec / 1000;
    }
    else{
      this.genTarget(this.getRandomTargetParams());
      this.timerS = 0;
    }
  }

  destroy = () => {
    this.resTracker.dispose();
  }

  getRandomTargetParams = () => {
    // definition
    const params = {
      rotRate : globals.gameOptions.targetManagerOptions.rotRate,
      speed : globals.gameOptions.targetManagerOptions.speed,
      qB: {
        p1: undefined,
        p2: undefined,
        p3: undefined,
      }
    }

    const maxX = 6;
    const minX = 0
    const maxY = 15;
    const minY = 5;

    const pnt1 = new THREE.Vector2(rand(minX, maxX), 0);
    const pnt3 = new THREE.Vector2(rand(pnt1.x, maxX), 0);
    const pnt2 = new THREE.Vector2(rand(pnt1.x, pnt3.x), rand(minY, maxY));

    params.qB.p1 = pnt1;
    params.qB.p2 = pnt2;
    params.qB.p3 = pnt3;

    return params;
  }

  genTarget = (targetParams) => {
    const targetGo = globals.gameObjectManager.createGameObject(
        this.gameObject.transform,
        'Target',
    );
    const target = targetGo.addComponent(Target, targetParams);
    return target;
  }  

  
}

export default TargetManager;