import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js'
import * as m from '../lib/THREE.MeshLine.js';
import Component from "../lib/gameEngine/ecs/Component.js";
import Kanji from "./Kanji.js";

class KanjiManager extends Component {
    constructor(gameObject) {
      super(gameObject);
      this.currKanji = this.genKanji('./assets/0f9af.svg');
    }
  
    genKanji = (kanjiPath) => {
        const KanjiGo = globals.gameObjectManager.createGameObject(
            this.gameObject.transform,
            'KanjiGo',
        );
        KanjiGo.addComponent(Kanji, kanjiPath);
        return KanjiGo;
    }  

    update = () => {

    }
  
    destroy = () => {
    }
  
}
  
export default KanjiManager;