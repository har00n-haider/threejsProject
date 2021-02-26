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
        lineWidth: 10,
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

function vec2SvgToThree(svgVec, svgInfo){
    let scaledVec = new THREE.Vector2(svgVec.x, svgVec.y - svgInfo.height).multiplyScalar(svgInfo.scale);
    return new THREE.Vector2(scaledVec.x, -scaledVec.y);
}

function genPntsForVectorPath(vectorPaths, pntsInStroke, svgInfo){
  // get the distance breakdown
  const vecLenInfo = {
    pathLengths : Array(vectorPaths.length).fill(0),
    totLength   : 0
  }
  for (let i = 0; i < vectorPaths.length; i++) {
    switch(vectorPaths[i].type){
      case "cubicBezier":
        vecLenInfo.pathLengths[i] = getLengthOfCubicBezier(vectorPaths[i]);
        vecLenInfo.totLength += vecLenInfo.pathLengths[i];
        break;
    }
  }
  // get the points across the whole vector path
  let pnts = [];
  let vecPthIdx = 0;
  let vecPathOffset = 0;
  for (let i = 0; i < pntsInStroke; i++) {
    let tPath = i/pntsInStroke;
    let tPathScaled = tPath * vecLenInfo.totLength;
    if(tPathScaled > vecLenInfo.pathLengths[vecPthIdx]){
      const nxtVecPthIdx = vecPthIdx + 1;
      if(nxtVecPthIdx !== vectorPaths.length){
        // switch to the next vec path element (order below is important)
        vecPathOffset += vecLenInfo.pathLengths[vecPthIdx];
        vecPthIdx = nxtVecPthIdx;
      }
    }
    let tVecPath = (tPathScaled - vecPathOffset) / vecLenInfo.pathLengths[vecPthIdx];
    tVecPath = Utils.clamp(tVecPath, 0, 1);
    if(vectorPaths[vecPthIdx] == undefined){
      var x = 1;
    }
    pnts.push(vec2SvgToThree(
      getPntOnCubicBezier(tVecPath, vectorPaths[vecPthIdx]),
      svgInfo
    ));
  }
  return pnts;
}

function addRefPntsToScene(refPnts, scene){
  for (const pnt of refPnts) {
    Utils.addPointAsSphere(
      new THREE.Vector3(pnt.x, pnt.y, 0), 
      scene);
  }
}

function genRefPntsForLine(line){
  const lnPnts = line.posArr;
  if(lnPnts.length > 3){
    let refPnts = [];
    const halfDist = line.totalDist/2;
    refPnts.push(lnPnts[0].clone());
    let currDist = 0;
    for (let i = 1; i < lnPnts.length; i++) {
      currDist += lnPnts[i].clone().sub(lnPnts[i-1]).length();
      if(currDist > halfDist){
        refPnts.push(lnPnts[i]);
        break;
      }
    }
    refPnts.push(lnPnts[lnPnts.length - 1]);
    return refPnts;
  }
  return [];
}

export{
    getMeshLineFromPnts,
    getLineFromPnts,
    getPntOnCubicBezier,
    vec2SvgToThree,
    addRefPntsToScene,
    genRefPntsForLine,
    getLengthOfCubicBezier,
    genPntsForVectorPath
}