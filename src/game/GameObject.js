import * as THREE from "../../lib/three.module.js";
import { removeArrayElement } from "../utils/utils.js";

class GameObject {
  constructor(parent, name) {
    this.name = name;
    this.components = [];
    this.transform = new THREE.Object3D();
    this.transform.name = name;
    this.parent = parent;
    parent.add(this.transform); // This is where the object gets added to Three.js scene
  }

  addComponent(ComponentType, ...args) {
    const component = new ComponentType(this, ...args);
    this.components.push(component);
    return component;
  }

  removeComponent(component) {
    removeArrayElement(this.components, component);
  }

  getComponent(ComponentType) {
    return this.components.find(c => c instanceof ComponentType);
  }

  update() {
    for (const component of this.components) {
      component.update();
    }
  }

  destroy()
  {
    for (const component of this.components) {
      component.destroy();
    }
  }

}

export default GameObject;
