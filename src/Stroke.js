import Component from "../lib/gameEngine/ecs/Component.js";
import * as THREE from '../lib/three.module.js';
import globals from "../lib/gameEngine/Globals.js";


class Stroke extends Component {
  constructor(gameObject, config) {
    super(gameObject);
    this.line = this.getLine();
    this.gameObject.transform.add(this.line.object3d);
  }

  update = () => {
    this.updateLine(this.line);
  }

  destroy = () => {
  }

  getLine = () => {
    // Line definition
    const line = {
      object3d    : {},
      linePosArr  : [],
      maxPoints   : 500,
      drawCount   : 0,
      posIdx      : 0,
      completed   : false,
      started     : false
    }
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array( line.maxPoints * 3 ); // 3 vertices per point
    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setDrawRange( 0, line.drawCount );
    const material = new THREE.LineBasicMaterial( { color: 'red' } );
    line.object3d = new THREE.Line( geometry,  material );
    return line;
  }

  updateLine = (line) => {
    if(globals.inputManager.pointerIsDown && !line.completed){
      line.started = true;
      const positions = line.object3d.geometry.attributes.position.array;
      const camera = globals.mainCamera;
      const curPos = globals.inputManager.pointerPos;
      const wldPos = (new THREE.Vector3()).set(
          curPos.x,
          curPos.y,
          -1
      ).unproject( camera );
      positions[line.posIdx++] = wldPos.x ;
      positions[line.posIdx++] = wldPos.y ;
      positions[line.posIdx++] = 0;
      if((line.drawCount + 1 ) < line.maxPoints){
        line.drawCount++;
      }
      line.object3d.geometry.setDrawRange( 0, line.drawCount );
      // required after the first render
      line.object3d.geometry.attributes.position.needsUpdate = true;
    }
    else{
      if(line.started){
        line.completed = true;
      }
    }
  }
}

export default Stroke;