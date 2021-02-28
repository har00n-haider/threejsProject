import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js'
import * as m from '../lib/THREE.MeshLine.js';
import Component from "../lib/gameEngine/ecs/Component.js";
import Kanji from "./Kanji.js";

class KanjiManager extends Component {
    constructor(gameObject) {
      super(gameObject);
      this.kanjiPathList = [];
      this.kanjiPathList.push('./assets/05674.svg');
      this.kanjiPathList.push('./assets/058e5.svg');
      this.kanjiPathList.push('./assets/05a62.svg');
      this.kanjiPathList.push('./assets/0665e.svg');
      this.kanjiPathList.push('./assets/06751.svg');
      this.kanjiPathList.push('./assets/06a44.svg');
      this.kanjiPathList.push('./assets/06f13.svg');
      this.kanjiPathList.push('./assets/072d0.svg');
      this.kanjiPathList.push('./assets/07725.svg');
      this.kanjiPathList.push('./assets/07de0.svg');
      this.kanjiPathList.push('./assets/08757.svg');
      this.kanjiPathList.push('./assets/0916a.svg');
      this.kanjiPathList.push('./assets/095d8.svg');
      this.kanjiPathList.push('./assets/09955.svg');
      this.kanjiPathList.push('./assets/09b45.svg');
      this.kanjiPathList.push('./assets/05b51.svg');
      this.currKanji = this.genKanji(this.kanjiPathList.pop());
    }
  
    genKanji = (kanjiPath) => {
        const KanjiGo = globals.gameObjectManager.createGameObject(
            this.gameObject.transform,
            'KanjiGo',
        );
        const kanji = KanjiGo.addComponent(Kanji, kanjiPath)
        kanji.completedEvent.regCb(this.handleKanjiCompleted);
        return kanji;
    }  

    update = () => {
    }
  
    destroy = () => {
    }

    handleKanjiCompleted = () => {
      this.currKanji.destroy();
      this.currKanji = this.genKanji(this.kanjiPathList.pop());
    }
  
}
  
export default KanjiManager;