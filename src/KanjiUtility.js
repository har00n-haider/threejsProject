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
        color: 'grey',
        // color: Utils.getRandomColor(),
        depthTest : false, 
        transparent : true, 
        blending : 1,
        opacity: 0.5,
        resolution: new THREE.Vector2( window.innerWidth , window.innerHeight ),
        sizeAttenuation: false,
        lineWidth: 20,
    });
    var mesh = new THREE.Mesh( g.geometry, material );
    return mesh;
}

/**
 * 
 * @param {*} t must be a value from 0 - 1
 * @param {*} cB 
 */
function getPntOnCubicBezier(t, cB){
    var ti = 1 - t;
    const term1 = new THREE.Vector2().add(cB.p1).multiplyScalar(ti*ti*ti)
    const term2 = new THREE.Vector2().add(cB.p2).multiplyScalar(3*ti*ti*t) 
    const term3 = new THREE.Vector2().add(cB.p3).multiplyScalar(3*ti*t*t)
    const term4 = new THREE.Vector2().add(cB.p4).multiplyScalar(t*t*t);
    const r = new THREE.Vector2().add(term1).add(term2).add(term3).add(term4);
    return r;
}

function getPntsOnCubicBezier(cB, noOfPnts){
  const pnts = [];
  for (let i = 0; i < noOfPnts; i++) {
    pnts.push(getPntOnCubicBezier(i/noOfPnts, cB));
  }
  return pnts;
}

function getLengthOfCubicBezier(cB, res = 0.1){
  let length = 0;
  let curPnt = cB.p1;
  for (let i = res; i <= 1; i+=res) {
    const newPnt = getPntOnCubicBezier(i, cB);
    length += (new THREE.Vector2()).subVectors( newPnt, curPnt).length();
    curPnt = newPnt;
  }
  return length;
}

function genPntsForVectorPaths(vectorPaths, pntsInStroke){
  // get the bezier offsets
  const pthInfo = {
    lengths   : Array(vectorPaths.length).fill(0),
    offsets   : Array(vectorPaths.length).fill(0),
    totLength : 0
  }
  const lstIdx = vectorPaths.length - 1;
  for (let i = 0; i < vectorPaths.length; i++) {
    switch(vectorPaths[i].type){
      case "cubicBezier":
        pthInfo.lengths[i] = getLengthOfCubicBezier(vectorPaths[i]);
        pthInfo.totLength += pthInfo.lengths[i];
        if (i > 0){
          pthInfo.offsets[i] = pthInfo.lengths[i-1] + pthInfo.offsets[i-1];
        }
        break;
    }
  }
  // get the points across the whole vector path
  let pnts = [];
  let pthIdx = 0;
  for (let i = 0; i < pntsInStroke; i++) {
    let tPth = i/pntsInStroke;
    let pPthScaled = tPth * pthInfo.totLength;
    const nxtPthIdx = pthIdx + 1;
    if(nxtPthIdx !== vectorPaths.length && 
       pPthScaled > pthInfo.offsets[nxtPthIdx]){
      pthIdx = nxtPthIdx;
    }
    let tVecPath = (pPthScaled - pthInfo.offsets[pthIdx]) / pthInfo.lengths[pthIdx];
    tVecPath = Utils.clamp(tVecPath, 0, 1);
    pnts.push(getPntOnCubicBezier(tVecPath, vectorPaths[pthIdx]));
  }
  return pnts;
}

function addRefPntsToScene(refPnts, scene, color){
  for (const pnt of refPnts) {
    Utils.addPointAsSphere(
      new THREE.Vector3(pnt.x, pnt.y, 0), 
      scene, color, 0.1);
  }
}

// PERF: need to only process 2D points here
function genRefPntsForPnts(inpPoints){
  const points = [];
  inpPoints.forEach( pnt => points.push(new THREE.Vector2(pnt.x , pnt.y)));
  if(points.length > 3){
    // get total length of line
    let totalDist = 0;
    for (let i = 1; i < points.length; i++) {
      totalDist += points[i].clone().sub(points[i-1]).length();
    }

    // first point
    let refPnts = [];
    refPnts.push(points[0].clone());
    
    // middle point
    const halfDist = totalDist/2;
    let currDist = 0;
    for (let i = 1; i < points.length; i++) {
      currDist += points[i].clone().sub(points[i-1]).length();
      if(currDist > halfDist){
        refPnts.push(points[i]);
        break;
      }
    }

    // last point
    refPnts.push(points[points.length - 1]);
    return refPnts;
  }
  return [];
}

export{
    getMeshLineFromPnts,
    getLineFromPnts,
    getPntOnCubicBezier,
    getPntsOnCubicBezier,
    addRefPntsToScene,
    genRefPntsForPnts as genRefPntsForLine,
    getLengthOfCubicBezier,
    genPntsForVectorPaths
}