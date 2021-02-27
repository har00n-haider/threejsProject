import Component from "../lib/gameEngine/ecs/Component.js";
import { loadSvg } from './KanjiSVGParser.js'; 
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import Stroke from "./Stroke.js";
import RefStroke from "./RefStroke.js";
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js'; 
import * as THREE from '../lib/three.module.js';


class Kanji extends Component {
  constructor(gameObject, kanjiPath) {
    super(gameObject);

    // reference kanji
    this.refStrokes = []
    this.curRefStroke = undefined;
    this.getRefKanji(kanjiPath);

    // inputs strokes
    this.inpStrokes = []
    this.curInpStroke = undefined;
    this.genInpStroke();
  }

  //TODO: Have this use the GO with stroke component
  getRefKanji = (kanjiPath) => {
    let strokes = loadSvg(kanjiPath, 50);
    for(const stroke of strokes){
      this.genRefStroke(stroke);
    }
  }

  genRefStroke = (stroke) => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'refStrokeGo'
    );
    this.curRefStroke = strokeGo.addComponent(RefStroke, stroke);;
    this.refStrokes.push(this.curRefStroke);    
  }

  genInpStroke = () => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'inpStrokeGo'
    );
    this.curInpStroke = strokeGo.addComponent(Stroke);
    this.inpStrokes.push(this.curInpStroke);
  }

  update = () => {
    if(this.curInpStroke.line != undefined){
      if(this.curInpStroke.line.completed){
        this.compareStrokes()
        this.genInpStroke();
      }
    }
  }

  compareStrokes = () => {
    const canCompare = 
    this.curRefStroke.refPoints.length > 0  && 
    this.curRefStroke.refPoints.length == 
    this.curInpStroke.refPoints.length;
    if(canCompare){
      let strokesMatch = true; 
      const passLen = 0.3;
      for (let i = 0; i < this.curRefStroke.refPoints.length; i++) {
        const iRefPnt = this.curRefStroke.refPoints[i];
        const rRefPnt = this.curInpStroke.refPoints[i];
        const inputLen = (new THREE.Vector2()).subVectors(rRefPnt, iRefPnt).length();
        if(inputLen > passLen){
          strokesMatch = false;
        }
      }
      if(strokesMatch){
        this.curRefStroke.updateState(true);
        this.curRefStroke = this.refStrokes.shift();
        return true;
      }
    }
    return false;
  }

  destroy = () => {
  }
  
}
  
export default Kanji;