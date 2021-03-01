import Component from "../lib/gameEngine/ecs/Component.js";
import { loadSvg } from './KanjiSVGParser.js'; 
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import Stroke from "./Stroke.js";
import RefStroke from "./RefStroke.js";
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js'; 
import * as THREE from '../lib/three.module.js';
import DispatcherEvent from '../lib/gameEngine/utils/Dispatcher.js';

class Kanji extends Component {
  constructor(gameObject, kanjiPath) {
    super(gameObject);

    // reference kanji
    this.refStrokes = []
    this.curRefStroke = undefined;
    this.cmpStrokes = [];
    this.getRefKanji(kanjiPath);

    // inputs strokes
    this.inpStrokes = []
    this.curInpStroke = undefined;
    this.genInpStroke();

    this.completedEvent = new DispatcherEvent('completed');
  }

  //TODO: Have this use the GO with stroke component
  getRefKanji = (kanjiPath) => {
    let strokes = loadSvg(kanjiPath, 50);
    for(const stroke of strokes){
      this.genRefStroke(stroke);
    }
    this.curRefStroke = this.refStrokes.shift();
  }
  
  genRefStroke = (stroke) => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'RefStroke' + stroke.number
      );
    this.refStrokes.push(strokeGo.addComponent(RefStroke, stroke));    
  }

  genInpStroke = () => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'InpStroke'
    );
    this.curInpStroke = strokeGo.addComponent(Stroke);
    this.inpStrokes.push(this.curInpStroke);
  }

  update = () => {
    if(this.curInpStroke.line != undefined){
      if(this.curInpStroke.line.completed){
        this.compareStrokes();
        this.curInpStroke.destroy();
        // kanji is completed
        if(this.curRefStroke == undefined){
          this.completedEvent.fire();
          return;
        }
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
      const passLen = 0.5;
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
        this.cmpStrokes.push(this.curRefStroke);
        this.curRefStroke = this.refStrokes.shift();
        return true;
      }
    }
    return false;
  }

  destroy = () => {
    for (const stroke of this.cmpStrokes) {
      stroke.destroy();
    }
  }
  
}
  
export default Kanji;