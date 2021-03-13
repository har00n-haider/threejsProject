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
      this.genTarget();
      this.timerS = 0;
    }
  }

  destroy = () => {
    this.resTracker.dispose();
  }

  genTarget = () => {
    const targetGo = globals.gameObjectManager.createGameObject(
        this.gameObject.transform,
        'Target',
    );
    const target = targetGo.addComponent(Target);
    return target;
  }  

  
}

export default TargetManager;