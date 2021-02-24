import Component from "../lib/gameEngine/ecs/Component.js";

class Stroke extends Component {
    constructor(gameObject, config) {
        super(gameObject);

        let linePosArr = []
        let line = undefined;
        let MAX_POINTS = 500;
        let drawCount = 0;
        let posIdx = 0;
        
        getLine();
        globals.scene.add(line);
        updateLinePositions();
        
    }
    
    update = () => {
        let pntAdded = updateLinePositions();
        if(pntAdded && (drawCount + 1 ) < MAX_POINTS){
            drawCount++;
        }
        line.geometry.setDrawRange( 0, drawCount );
        // required after the first render
        line.geometry.attributes.position.needsUpdate = true;
    }

    destroy = () => {
    }

    getLine = () => {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
        geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.setDrawRange( 0, drawCount );
        const material = new THREE.LineBasicMaterial( { color: 'red' } );
        line = new THREE.Line( geometry,  material );
        return line;
    }
    
    updateLinePositions = () => {
        if(globals.inputManager.pointerIsDown){
            const positions = line.geometry.attributes.position.array;
            const camera = globals.mainCamera;
            const curPos = globals.inputManager.pointerPos;
            const wldPos = (new THREE.Vector3()).set(
                curPos.x, 
                curPos.y, 
                -1
            ).unproject( camera );
            positions[posIdx++] = wldPos.x ;
            positions[posIdx++] = wldPos.y ;
            positions[posIdx++] = 0;
            return true;
        }
        return false;
    }
}

export default Stroke;