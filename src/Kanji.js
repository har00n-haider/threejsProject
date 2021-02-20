import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';

const path = 
"M67.25,18\
c4.63,4.66,21.48,23.51,25.39,27.38\
c1.33,1.31,3.03,1.88,4.36,2.25";

function draw(){
    let cubicBezier = 
    {
        p1 : new THREE.Vector2(1.61,2.07),
        p2 : new THREE.Vector2(11.9,5.86),
        p3 : new THREE.Vector2(2.14,9.48),
        p4 : new THREE.Vector2(12.79,8.4),
    }
    scaleBezier(cubicBezier, 1);
    const noPnts = 30;
    const pnts = [];
    for (let i = 0; i < noPnts; i++) {
        pnts.push(getPntOnCubicBezier(i/noPnts, cubicBezier));
    }   
    addLineFromPnts(pnts);
}

function getPntOnCubicBezier(t, cB){
    var ti = 1 - t;
    const term1 = new THREE.Vector2().add(cB.p1).multiplyScalar(ti*ti*ti)
    const term2 = new THREE.Vector2().add(cB.p2).multiplyScalar(3*ti*ti*t) 
    const term3 = new THREE.Vector2().add(cB.p3).multiplyScalar(3*ti*t*t)
    const term4 = new THREE.Vector2().add(cB.p4).multiplyScalar(t*t*t);
    const r = new THREE.Vector2().add(term1).add(term2).add(term3).add(term4);
    return r;
}

function addLineFromPnts(pnts){
    const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const pnts3d = [];
    for(const p of pnts){
        pnts3d.push(new THREE.Vector3(p.x, p.y, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints( pnts3d );
    const line = new THREE.Line( geometry, material );
    globals.scene.add( line );
}

function scaleBezier(cB, scale){
    cB.p1.multiplyScalar(scale);
    cB.p2.multiplyScalar(scale);
    cB.p3.multiplyScalar(scale);
    cB.p4.multiplyScalar(scale);
}

export {
    draw
}