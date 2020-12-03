import SafeArray from "../utils/SafeArray.js";
import GameObject from "./GameObject.js";

class GameObjectManager {
  constructor() {
    this.gameObjects = new SafeArray();
  }

  createGameObject(parent, name, globals) {
    const gameObject = new GameObject(parent, name, globals);
    this.gameObjects.add(gameObject);
    return gameObject;
  }

  removeGameObject(gameObject) {
    this.gameObjects.remove(gameObject);
  }

  update() {
    this.gameObjects.forEach(gameObject => gameObject.update());
  }
}

export default GameObjectManager;
