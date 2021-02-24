import * as THREE from '../lib/three.module.js';
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js'

function getLineFromPnts( pnts ){
    const material = new THREE.LineBasicMaterial( { color: Utils.getRandomColor() } );
    const pnts3d = [];
    for(const p of pnts){   
        pnts3d.push(new THREE.Vector3(p.x, p.y, 0));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints( pnts3d );
    const line = new THREE.Line( geometry, material );
    return line;
}

function getMeshLineFromPnts( pnts ) {
    var line = new THREE.Geometry();
    for(const p of pnts){   
        line.vertices.push( new THREE.Vector3(p.x, p.y, 0));
    }
    var g = new MeshLine();
    g.setGeometry( line  );
    var material = new MeshLineMaterial( {
        useMap: false,
        color: Utils.getRandomColor(),
        opacity: 1,
        resolution: new THREE.Vector2( window.innerWidth , window.innerHeight ),
        sizeAttenuation: false,
        lineWidth: 20,
    });
    var mesh = new THREE.Mesh( g.geometry, material );
    return mesh;
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

function vec2SvgToThree(svgVec, svgInfo){
    let scaledVec = new THREE.Vector2(svgVec.x, svgVec.y - svgInfo.height).multiplyScalar(svgInfo.scale);
    return new THREE.Vector2(scaledVec.x, -scaledVec.y);
}

function addRefPntsToScene(refPnts, scene){
  for (const pnt of refPnts) {
    Utils.addPointAsSphere(
      new THREE.Vector3(pnt.x, pnt.y, 0), 
      scene);
  }
}

export{
    getMeshLineFromPnts,
    getLineFromPnts,
    getPntOnCubicBezier,
    vec2SvgToThree,
    addRefPntsToScene
}