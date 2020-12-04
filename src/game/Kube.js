import Component from "./Component.js";

class Kube extends Component {
  constructor(gameObject, mesh) {
    super(gameObject);
    this.mesh = mesh;
    gameObject.transform.add(this.mesh);
  }

  update() {
    this.gameObject.transform.position.x += 0.01;
  }
}

export default Kube;
