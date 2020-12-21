import Component from "../Component.js";
import * as THREE from "../../../lib/three.module.js";
import globals from "../../Globals.js";
import KubeController from '../../game/gameObjects/Kube.js';
import {rand} from '../../utils/Utils.js'
import ParticleSystem from './ExplosionParticleSystem.js';

class KubeGen extends Component {
  constructor(gameObject, config) {
    super(gameObject);
    this.kubeGos = [];
    this.limitKNo = 1;
    this.currentNo = 0;
  }

  makeKube = () => {
    let kubeGo = globals.gameObjectManager.createGameObject(
        this.gameObject.transform,
        'Kube' + this.kubeGos.length
    );
    kubeGo.addComponent(KubeController, 3);
    kubeGo.addComponent(ParticleSystem);
    kubeGo.transform.position.x = rand(-10,10);
    kubeGo.transform.position.y = rand(-10,10);
    kubeGo.transform.position.z = rand(-10,10);
    this.kubeGos.push(kubeGo);
  }

  update = () => {
    if(this.currentNo < this.limitKNo)
    {
      this.makeKube();
      this.currentNo += 1;
    }
  }

  destroy = () => {
  }

}

export default KubeGen;
