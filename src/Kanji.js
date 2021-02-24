import Component from "../lib/gameEngine/ecs/Component.js";
import { loadSvg } from './KanjiSVGParser.js'; 
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import * as kU from './KanjiUtility.js';

class Kanji extends Component {
  constructor(gameObject, kanjiPath) {
    super(gameObject);
    this.drawKanji(kanjiPath);
  }

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

  update = () => {

  }

  destroy = () => {
  }
  
}
  
export default Kanji;