import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as Ku from './KanjiUtility.js';

class RefStroke extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.gameObject.transform.add(this.getLine());
  }

  update = () => {
  }

  destroy = () => {
  }

  getLine = () => {
    return Ku.getMeshLineFromPnts(pnts);
  }

  updateLine = (line) => {
  }
}

export default RefStroke;