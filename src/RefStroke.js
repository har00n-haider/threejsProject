import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js';
import ResourceTracker from '../lib/gameEngine/utils/ResourceTracker.js';


class RefStroke extends Component {
  constructor(gameObject, stroke) {
    super(gameObject);
    // makea line
    this.resTracker= new ResourceTracker();
    this.line = ku.getMeshLineFromPnts( stroke.points );
    this.resTracker.track(this.line);

    this.gameObject.transform.add(this.line);
    this.refPoints = ku.genRefPntsForLine(stroke.points);
    this.number = stroke.strokeNo;
    this.passes = false;
  }

  updateState = (passed) => {
    this.passed = passed;
    this.line.material.color.setHex(0x008000);
  }

  update = () => {
  }

  destroy = () => {
    this.resTracker.dispose();
  }

}

export default RefStroke;