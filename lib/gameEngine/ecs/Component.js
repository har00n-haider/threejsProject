// Base for all components
class Component {
  constructor(gameObject) {
    this.gameObject = gameObject;
    this.markedForDestruction = false;
  }
  update() {}
  destroy() {}
}
export default Component;
