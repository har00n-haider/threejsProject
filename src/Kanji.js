import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';
import * as Utils from '../lib/gameEngine/utils/Utils.js'
import * as m from '../lib/THREE.MeshLine.js';
import { MeshLine, MeshLineMaterial } from '../lib/THREE.MeshLine.js';

//#region input kanji

let linePosArr = []
let line = undefined;
const MAX_POINTS = 500;
let drawCount = 0;
let posIdx = 0;

function init(){
    getLine();
    globals.scene.add(line);
    updateLinePositions();
}

function getLine(){
	const geometry = new THREE.BufferGeometry();
	const positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point
	geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.setDrawRange( 0, drawCount );
	const material = new THREE.LineBasicMaterial( { color: 'red' } );
	line = new THREE.Line( geometry,  material );
    return line;
}

function updateLinePositions() {
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

function update(){
    let pntAdded = updateLinePositions();
    if(pntAdded && (drawCount + 1 ) < MAX_POINTS){
        drawCount++;
    }
    line.geometry.setDrawRange( 0, drawCount );
    // required after the first render
    line.geometry.attributes.position.needsUpdate = true;
}

//#endregion

//#region svg parsing 


function readStringFromFileAtPath(pathOfFileToReadFrom){
    var request = new XMLHttpRequest();
    request.open("GET", pathOfFileToReadFrom, false);
    request.send(null);
    var returnValue = request.responseText;
    return returnValue;
}

const svgInfo = {}

function setSvgInfo(width, height){
    svgInfo.width  = width;
    svgInfo.height = height;
    svgInfo.scale = 0.05;
    svgInfo.scaledWidth  = svgInfo.width * svgInfo.scale;
    svgInfo.scaledHeight = svgInfo.height * svgInfo.scale;
}

function loadSvg(){
    var svgStr = readStringFromFileAtPath('assets/0f9af.svg');
    // var svgStr = readStringFromFileAtPath('assets/0f9af_edited.svg');
    // Doesn't work
    // var svgStr = readStringFromFileAtPath('assets/04ff5.svg');
    // var svgStr = readStringFromFileAtPath('assets/05a3c.svg');
    // var svgStr = readStringFromFileAtPath('assets/05a49.svg');
    // var svgStr = readStringFromFileAtPath('assets/05a9a.svg');
    // var svgStr = readStringFromFileAtPath('assets/05b80.svg');
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(svgStr, "image/svg+xml");
    setSvgInfo(
        parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('width')),
        parseInt(xmlDoc.getElementsByTagName("svg")[0].getAttribute('height'))
    );
    let gPathElems = xmlDoc.getElementsByTagName("path");
    let pathGeoms = [];
    let pathStrings = [];
    for(const pathElem of gPathElems){
        let pathStr = pathElem.getAttribute("d");
        pathStrings.push(pathStr);
        pathGeoms.push(getGeometryFromPathStr(pathStr));
    }
    return pathGeoms;
}

/**
 * 
 * Uses regex to get the SVG parametric objects from the d 
 * 
 */
function getGeometryFromPathStr(pathStr){
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
                geometry.push(cubeBez);
                break;
        }
    }
    const geometry = [];
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
    return geometry;
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

//#endregion


//#region public functions

function drawKanji(){
    let pathGeoms = loadSvg();
    for(const geoms of pathGeoms){
        for(const geo of geoms){
            if(geo.type == "cubicBezier")
            {
                const noPnts = 30;
                const pnts = [];
                for (let i = 0; i < noPnts; i++) {
                    pnts.push(vec2SvgToThree(getPntOnCubicBezier(i/noPnts, geo)));
                }   
                globals.scene.add(getMeshLineFromPnts(pnts));
            }
        }
    }
}

//#endregion

//#region utility functions

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

function vec2SvgToThree(svgVec){
    let scaledVec = new THREE.Vector2(svgVec.x, svgVec.y - svgInfo.height).multiplyScalar(svgInfo.scale);
    return new THREE.Vector2(scaledVec.x, -scaledVec.y);
}

//#endregion

export {
    drawKanji,
    init,
    update
}