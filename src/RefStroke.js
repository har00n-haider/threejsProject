import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js';

class RefStroke extends Component {
  constructor(gameObject, stroke) {
    super(gameObject);
    this.gameObject.transform.add(ku.getMeshLineFromPnts( stroke.points ));
    ku.addRefPntsToScene(ku.genRefPntsForLine(stroke.points), globals.scene, 'blue');
    this.number = stroke.strokeNo;
  }

  update = () => {
  }

  destroy = () => {
  }

}

export default RefStroke;