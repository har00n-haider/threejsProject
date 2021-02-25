import * as THREE from '../lib/three.module.js';
import * as ku from './KanjiUtility.js';
//#region  public 

function getStrokesFromSvg(pathToSvg, pntsInStroke){
  // get raw data from file
  var svgStr = readStringFromFileAtPath(pathToSvg);
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(svgStr, "image/svg+xml");
  const svgInfo = setSvgInfo(
      parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('width')),
      parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('height'))
  );
  let pathElems = xmlDoc.getElementsByTagName("path");
  // get stroke from raw data
  let strokes = [];
  for(const pathElem of pathElems){
    let pathStr = pathElem.getAttribute("d");
    const vectorPaths = getVectorPathsFromPathStr(pathStr);
    const rawStroke = {
      strokeNo : pathElem.getAttribute('id').split('-')[1].replace('s',''),
      points   : ku.genPntsForVectorPath(vectorPaths, pntsInStroke, svgInfo)
    }
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
                cleanStr();
                let cubeBez = {}
                if(commChar == 'C')
                {
                    cubeBez = 
                    {
                        type: "cubicBezier",
                        p1 : new THREE.Vector2().add(lastPnt),
                        p2 : new THREE.Vector2(p2x, p2y),
                        p3 : new THREE.Vector2(p3x, p3y),
                        p4 : new THREE.Vector2(p4x, p4y),
                    }
                }
                else
                {
                    cubeBez = 
                    {
                        type: "cubicBezier",
                        p1 : new THREE.Vector2().add(lastPnt),
                        p2 : new THREE.Vector2(p2x, p2y).add(lastPnt),
                        p3 : new THREE.Vector2(p3x, p3y).add(lastPnt),
                        p4 : new THREE.Vector2(p4x, p4y).add(lastPnt),
                    }
                }
                lastPnt = cubeBez.p4;
                vectorPaths.push(cubeBez);
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

function setSvgInfo(width, height){
    const svgInfo = {};
    svgInfo.width  = width;
    svgInfo.height = height;
    svgInfo.scale = 0.05;
    svgInfo.scaledWidth  = svgInfo.width * svgInfo.scale;
    svgInfo.scaledHeight = svgInfo.height * svgInfo.scale;
    return svgInfo;
}

//#endregion


export {
    getStrokesFromSvg as loadSvg,
}









