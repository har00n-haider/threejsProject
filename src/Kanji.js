import Component from "../lib/gameEngine/ecs/Component.js";
import { loadSvg } from './KanjiSVGParser.js'; 
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import Stroke from "./Stroke.js";
import RefStroke from "./RefStroke.js";
import globals from "../lib/gameEngine/Globals.js";

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
    let kanjiStrokes = loadSvg(kanjiPath, 50);
    for(const stroke of kanjiStrokes){
      this.genRefStroke();
    }
  }

  genRefStroke = () => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'refStrokeGo'
    );
    this.curRefStroke = strokeGo.addComponent(RefStroke);;
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
        this.genInpStroke();
      }
    }
  }

  destroy = () => {
  }
  
}
  
export default Kanji;