import Component from "../Component.js";
import * as THREE from "../../../lib/three.module.js";
import globals from "../../../lib/gameEngine/Globals.js";
import KubeController from '../../game/gameObjects/Kube.js';
import {rand} from '../../utils/Utils.js'
import ParticleSystem from './ExplosionParticleSystem.js';

class KubeGen extends Component {
  constructor(gameObject, config) {
    super(gameObject);
    this.kubeGos = [];
    this.limitKNo = 5;
    this.currentNo = 0;
  }

  makeKube = () => {
    let kubeGo = globals.gameObjectManager.createGameObject(
        this.gameObject.transform,
        'Kube' + this.kubeGos.length
    );
    const velCap = 0.05;
    kubeGo.addComponent(KubeController, 3, new THREE.Vector3(
      rand(-velCap,velCap),
      rand(-velCap,velCap),
      rand(-velCap,velCap)
    ));
    kubeGo.addComponent(ParticleSystem);
    const posCap = 30;
    kubeGo.transform.position.x = rand(-posCap,posCap);
    kubeGo.transform.position.y = rand(-posCap,posCap);
    kubeGo.transform.position.z = rand(-posCap,posCap);
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
