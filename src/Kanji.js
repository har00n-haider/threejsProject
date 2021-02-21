import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';

function readStringFromFileAtPath(pathOfFileToReadFrom)
{
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;
    return returnValue;
}

const svgInfo = {}

function loadSvg(){
    var svgStr = readStringFromFileAtPath('assets/0f9af_edited.svg');
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(svgStr, "image/svg+xml");
    svgInfo.width  = parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('width'));
    svgInfo.height = parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('height'));
    let gPathElems = xmlDoc.getElementsByTagName("path");
    let pathGeoms = [];
    let pathStrings = [];
    // for(const pathElem of gPathElems){
    //     let pathStr = pathElem.getAttribute("d");
    //     pathStrings.push(pathStr);
    //     pathGeoms.push(getGeometryFromPathStr(pathStr));
    // }

    var s = "M 58.651929,46.059857 c 0.796567,0.398856 1.99342,0.319857 3.120988,0.180143 5.4,-0.66 13.08,-1.76 18.48,-2.24 1.157425,-0.08971 2.576567,0.01086 3.52342,0.330429";
    pathGeoms.push(getGeometryFromPathStr(-));
        
    return pathGeoms;
}

function getGeometryFromPathStr(pathStr){
    function getNextDelimIdx(){
        let valChars = ".0123456789"; 
        if(pathStr[0] == '-')
        {
            valChars+= '-';
        }
        for (let idx = 0; idx < pathStr.length; idx++) {
            if(!valChars.includes(pathStr[idx]))
            {
                return idx;
            }
        }
        return pathStr.length; 
    }
    function pullPnt(remTrlChar = false){
        let idx = getNextDelimIdx(pathStr);
        let x = parseFloat(pathStr.substring(0,idx));
        pathStr = pathStr.substring(idx + 1, pathStr.length)
        idx = getNextDelimIdx(pathStr);
        let s = pathStr.substring(0,idx)
        let y = parseFloat(s);
        let yIdx = idx; 
        if(remTrlChar && yIdx < (pathStr.length - 1)){
            yIdx++;
        }
        pathStr = pathStr.substring(yIdx, pathStr.length)
        return svgToThree(new THREE.Vector2(x,y));
    }
    function pullCommand(){

    }
    let geometry = [];
    let lastPnt = new THREE.Vector2();
    while(pathStr.length > 0){
        const commChar = pullCommand(); 
        switch(commChar){
            case 'M':
                lastPnt = pullPnt();
                break;
            case 'C':
                let absCubBez = 
                {
                    type: "cubicBezier",
                    p1 : new THREE.Vector2().add(lastPnt),
                    p2 : pullPnt(true ),
                    p3 : pullPnt(true ),
                    p4 : pullPnt(false),
                }
                lastPnt = absCubBez.p4;
                geometry.push(absCubBez);
                break;
            case 'c':
                let relCubBez = 
                {
                    type: "cubicBezier",
                    p1 : new THREE.Vector2().add(lastPnt),
                    p2 : pullPnt(true ).add(lastPnt),
                    p3 : pullPnt(true ).add(lastPnt),
                    p4 : pullPnt(false).add(lastPnt),
                }
                lastPnt = relCubBez.p4;
                geometry.push(relCubBez);
                break;
            default:
                // Use the same command as last time
        }
    }
    return geometry;
}

function draw(){
    let pathGeoms = loadSvg();
    for(const geoms of pathGeoms){
        for(const geo of geoms){
            if(geo.type == "cubicBezier")
            {
                scaleBezier(geo, 0.1);
                const noPnts = 30;
                const pnts = [];
                for (let i = 0; i < noPnts; i++) {
                    pnts.push(getPntOnCubicBezier(i/noPnts, geo ));
                }   
                addLineFromPnts(pnts);
            }
        }
    }
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

function svgToThree(svgVec){
    return new THREE.Vector2(svgVec.x, -svgVec.y);
}

export {
    draw
}