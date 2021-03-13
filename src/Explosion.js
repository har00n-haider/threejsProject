import Component from "../lib/gameEngine/ecs/Component.js";
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import globals from "../lib/gameEngine/Globals.js";
import * as ku from './KanjiUtility.js'; 
import * as THREE from '../lib/three.module.js';
import DispatcherEvent from '../lib/gameEngine/utils/Dispatcher.js';
import ResourceTracker from '../lib/gameEngine/utils/ResourceTracker.js';
import ParticleSystem from './ParticleSystem.js';
import { getBox } from "../lib/gameEngine/utils/Utils.js";

class Explosion extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.resTracker = new ResourceTracker();
    this.explosionAudio = new Audio('assets/Explosion+7_freesoundeffects.com.mp3');
    this.explosionAudio.play();
    this.gameObject.getComponent(ParticleSystem).play();
  }

  update = () => {
  }

  destroy = () => {
  }
}
  
export default Explosion;