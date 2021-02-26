import * as THREE from '../lib/three.module.js';
import * as ku from './KanjiUtility.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js';
import globals from '../lib/gameEngine/Globals.js';

//#region  public 

let svgInfo = {}

/**
 * Points are return in THREE coordinate system
 * @param {*} pathToSvg 
 * @param {*} pntsInStroke 
 */
function getStrokesFromSvg(pathToSvg, pntsInStroke, scale = 0.05){
  // get raw data from file
  var svgStr = readStringFromFileAtPath(pathToSvg);
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(svgStr, "image/svg+xml");
  setSvgInfo(
      parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('width')),
      parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('height')),
      scale,
  );
  let pathElems = xmlDoc.getElementsByTagName("path");
  // get stroke from raw data
  const strokes = [];
  for(const pathElem of pathElems){
    let pathStr = pathElem.getAttribute("d");
    const vectorPaths = getVectorPathsFromPathStr(pathStr);
    // stroke definition
    const rawStroke = {
      strokeNo    : pathElem.getAttribute('id').split('-')[1].replace('s',''),
      points      : svgToThreeVec2Arr(ku.genPntsForVectorPaths(vectorPaths, pntsInStroke)),
    }

    // drawing each bezier seperately
    for(const vp of vectorPaths){
      svgToThreeVec2Arr(ku.getPntsOnCubicBezier(vp, 10))
      .forEach( pnt => Utils.addPointAsSphere(pnt, globals.scene, 'purple', 0.01));
    }

    // drawing complete path
    rawStroke.points
    .forEach( pnt => Utils.addPointAsSphere(pnt, globals.scene, 'blue', 0.03));
    strokes.push(rawStroke);
  }
  return strokes;
}

//#endregion


//#region  private 

/**
 * Uses regex to get the SVG parametric objects from the d 
 */
function getVectorPathsFromPathStr(pathStr){
    function pullVal(){
        const valRegex = /-?\d*\.?\d+/;
        const match = pathStr.match(valRegex);
        if(match != null){
            pathStr = pathStr.replace(valRegex, '');
            return parseFloat(match);
        }
        return;
    }
    function pullCommand(){
        const comRegex = /[McC]/;
        const match = pathStr.match(comRegex);
        if(match != null){
            pathStr = pathStr.replace(comRegex, '');
            return match[0];
        }
        return '';
    }
    function cleanStr(){
        const clnRegex = / *,?/;
        let match = pathStr.match(clnRegex);
        while(match != ''){
            pathStr = pathStr.replace(clnRegex, '');
            match = pathStr.match(clnRegex);
        } 
    }
    function runCommand(commChar){
        switch(commChar){
            case 'M':
                const moveX = pullVal();
                const moveY = pullVal();
                lastPnt = new THREE.Vector2(moveX, moveY);
                cleanStr();
                break;
            case 'C':
            case 'c':
                const p2x = pullVal();
                const p2y = pullVal();
                const p3x = pullVal();
                const p3y = pullVal();
                const p4x = pullVal();
                const p4y = pullVal();
                const p2  = new THREE.Vector2(p2x, p2y);
                const p3  = new THREE.Vector2(p3x, p3y);
                const p4  = new THREE.Vector2(p4x, p4y);
                cleanStr();
                let cubeBez = {}
                if(commChar == 'C')
                {
                    cubeBez = 
                    {
                        type: "cubicBezier",
                        p1 : new lastPnt.clone(),
                        p2 : p2,
                        p3 : p3,
                        p4 : p4,
                    }
                }
                else
                {
                    cubeBez = 
                    {
                        type: "cubicBezier",
                        p1 : new THREE.Vector2().add(lastPnt),
                        p2 : p2.clone().add(lastPnt),
                        p3 : p3.clone().add(lastPnt),
                        p4 : p4.clone().add(lastPnt),
                    }
                }
                lastPnt = cubeBez.p4;
                vectorPaths.push(cubeBez);
                break;
            default:
              console.warn( 'unknown SVG command char: ' + commChar);
              break;
        }
    }
    const vectorPaths = [];
    let lastPnt = new THREE.Vector2();
    let lastComChar = '';
    while(pathStr.length > 0){
        let commChar = pullCommand();
        if(commChar == '' && lastComChar == ''){
            return;
        }
        else if(commChar == ''){
            commChar = lastComChar;
        }
        runCommand(commChar);
        lastComChar = commChar;
    }
    return vectorPaths;
}

function readStringFromFileAtPath(pathOfFileToReadFrom){
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;
    return returnValue;
}

function setSvgInfo(width, height, scale){
    svgInfo = {};
    svgInfo.width  = width;
    svgInfo.height = height;
    svgInfo.scale = scale;
    svgInfo.scaledWidth  = svgInfo.width * svgInfo.scale;
    svgInfo.scaledHeight = svgInfo.height * svgInfo.scale;
    Object.freeze(svgInfo);
}

function svgToThreeVec2(svgVec){
  let scaledVec = new THREE.Vector2(svgVec.x, svgVec.y - svgInfo.height).multiplyScalar(svgInfo.scale);
  return new THREE.Vector2(scaledVec.x, -scaledVec.y);
}

function svgToThreeVec2Arr(svgVecArr){
  const convPoints = [];
  for(const pnt of svgVecArr){
    convPoints.push(svgToThreeVec2(pnt));
  }
  return convPoints;
}

//#endregion

export {
    getStrokesFromSvg as loadSvg,
}









