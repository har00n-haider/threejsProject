import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js';

class RefStroke extends Component {
  constructor(gameObject, stroke) {
    super(gameObject);
    this.line = ku.getMeshLineFromPnts( stroke.points );
    this.gameObject.transform.add(this.line);
    this.refPoints = ku.genRefPntsForLine(stroke.points);
    this.number = stroke.strokeNo;
    this.passes = false;
    // TODO: remove this debug line
    ku.addRefPntsToScene(this.refPoints, globals.scene, 'blue');
  }

  updateState = (passed) => {
    this.passed = passed;
    this.line.material.color.setHex(0x008000);
  }

  update = () => {
  }

  destroy = () => {
  }

}

export default RefStroke;