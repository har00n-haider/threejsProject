import Component from "../Component.js";
import * as THREE from "../../../lib/three.module.js";
import globals from "../../globals.js";

class KubeGen extends Component {
  constructor(gameObject, config) {
    super(gameObject);
    this.kubes = [];

  }

  makeKube = () =>{
    let kubeGo = globals.gameObjectManager.createGameObject(
        this.gameObject.transform,
        'Kube' + this.kubes.length
    );
    kubeGo.addComponent(KubeController, 3);
    this.kubes.push(kubeGo);
  }

  update = () => {
  }

  destroy = () => {
  }

}

export default KubeGen;
