import Component from "../lib/gameEngine/ecs/Component.js";
import { loadSvg } from './KanjiSVGParser.js'; 
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import * as kU from './KanjiUtility.js';
import Stroke from "./Stroke.js";
import globals from "../lib/gameEngine/Globals.js";

class Kanji extends Component {
  constructor(gameObject, kanjiPath) {
    super(gameObject);

    // reference kanji
    this.drawKanji(kanjiPath);

    // inputs strokes
    this.inpStroke = []
    this.curInpStroke = undefined;
    this.genStroke();
  }

  //TODO: Have this use the GO with stroke component
  drawKanji = (kanjiPath) => {
    let kanjiVecData = loadSvg(kanjiPath);
    for(const geoms of kanjiVecData.geometry){
      for(const geo of geoms){
        if(geo.type == "cubicBezier"){
          const noPnts = 30;
          const pnts = [];
          for (let i = 0; i < noPnts; i++) {
            pnts.push(kU.vec2SvgToThree(
              kU.getPntOnCubicBezier(i/noPnts, geo),
              kanjiVecData.svgInfo
            ));
          }   
          this.gameObject.transform.add(kU.getMeshLineFromPnts(pnts));
        } 
      }
    }
  }

  genStroke = () => {
    const strokeGo = globals.gameObjectManager.createGameObject(
      this.gameObject.transform,
      'strokeGo'
    );
    strokeGo.addComponent(Stroke);
    this.curInpStroke = strokeGo.getComponent(Stroke);
    this.inpStroke.push(this.curInpStroke);
  }

  update = () => {
    if(this.curInpStroke.line != undefined){
      if(this.curInpStroke.line.completed){
        this.genStroke();
      }
    }
  }

  destroy = () => {
  }
  
}
  
export default Kanji;