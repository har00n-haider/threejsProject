import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';

class RefStroke extends Component {
  constructor(gameObject, stroke) {
    super(gameObject);
    this.gameObject.transform.add(ku.getLineFromPnts( stroke.points ));
    this.number = stroke.strokeNo;
  }

  update = () => {
  }

  destroy = () => {
  }

}

export default RefStroke;