import globals from '../lib/gameEngine/Globals.js';
import * as THREE from '../lib/three.module.js';

function loadSvg(){
    const svgStr = String.raw`<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
    <g id="kvg:StrokePaths_0f9af" style="fill:none;stroke:#000000;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;">
    <g id="kvg:0f9af">
        <g id="kvg:0f9af-g1">
            <path id="kvg:0f9af-s1" d="M15.79,16.09c3.41,2.12,8.82,8.72,9.68,12.02"/>
            <path id="kvg:0f9af-s2" d="M40.64,13.14c0.02,0.38,0.04,0.99-0.04,1.54c-0.53,3.25-3.54,10.39-7.67,14.76"/>
            <path id="kvg:0f9af-s3" d="M14.96,34.21c0.71,0.35,2,0.39,2.71,0.35c5-0.25,18.66-2.94,24.98-3.79c1.17-0.16,1.88,0.17,2.47,0.34"/>
            <path id="kvga:0f9af-s4" d="M14.93,47.95c0.62,0.34,2.76,0.4,3.39,0.34c5.24-0.46,17.31-3.07,23.59-4.16c1.03-0.18,1.66,0.16,2.18,0.33"/>
            <path id="kvg:0f9af-s5" d="M12,64.89c0.66,0.77,1.88,0.9,2.54,0.77c5.09-1.05,20.48-6.57,28.71-9.16"/>
            <path id="kvg:0f9af-s6" d="M29.78,35.06c0.97,0.94,1.14,2.29,1.14,3.12C30.92,74.25,28.25,86,15,97"/>
        </g>
        <g id="kvg:0f9af-g2">
            <g id="kvg:0f9af-g3">
                <path id="kvg:0f9af-s7" d="M67.02,14c0.07,0.92,0.29,2.4-0.13,3.69C64.24,25.76,55.84,42.28,46,52.1"/>
                <path id="kvg:0f9af-s8" d="M67.25,18c4.63,4.66,21.48,23.51,25.39,27.38c1.33,1.31,3.03,1.88,4.36,2.25"/>
            </g>
            <g id="kvg:0f9af-g4">
                <g id="kvg:0f9af-g5">
                    <path id="kvg:0f9af-s9" d="M 58.651929,46.059857 c 0.796567,0.398856 1.99342,0.319857 3.120988,0.180143 5.4,-0.66 13.08,-1.76 18.48,-2.24 1.157425,-0.08971 2.576567,0.01086 3.52342,0.330429"/>
                </g>
                <g id="kvg:0f9af-g6">
                    <path id="kvg:0f9af-s10" d="M 57.76,53.58 c0.61,0.15,3,1,4.21,0.87c3.29-0.37,17.99-4.02,19.51-4.17c1.52-0.15,4.28-0.29,3.95,2.89c-0.43,4.17-2.68,16.92-6,23.84c-1.89,3.94-3.18,3.45-6.23,0.46"/>
                    <path id="kvg:0f9af-s11" d="M 64.94,54.55 c 0.87,0.87 1.8,2 1.8,3.5 -0.219826,13.545146 0.202719,23.466557 -0.18,37.006667"/>
                </g>
            </g>
        </g>
    </g>
    </g>
    <g id="kvg:StrokeNumbers_0f9af" style="font-size:8;fill:#808080">
        <text transform="matrix(1 0 0 1 9.25 16.25)">1</text>
        <text transform="matrix(1 0 0 1 32.25 12.25)">2</text>
        <text transform="matrix(1 0 0 1 7.25 34.25)">3</text>
        <text transform="matrix(1 0 0 1 8.25 48.25)">4</text>
        <text transform="matrix(1 0 0 1 4.25 65.25)">5</text>
        <text transform="matrix(1 0 0 1 23.00 42.25)">6</text>
        <text transform="matrix(1 0 0 1 59.25 15.25)">7</text>
        <text transform="matrix(1 0 0 1 75.25 22.25)">8</text>
        <text transform="matrix(1 0 0 1 59.3 44)">9</text>
        <text transform="matrix(1 0 0 1 50.5 63.5)">10</text>
        <text transform="matrix(1 0 0 1 68.5 61.8)">11</text>
    </g>
    </svg>
    `;
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(svgStr, "image/svg+xml");
    let gPathElems = xmlDoc.getElementsByTagName("path");
    let pathGeoms = [];
    // let pathStrings = [];
    // for(const pathElem of gPathElems){
    //     let pathStr = pathElem.getAttribute("d");
    //     pathStrings.push(pathStr);
    //     pathGeoms.push(getGeometryFromPathStr(pathStr));
    // }

    getGeometryFromPathStr("M 58.651929,46.059857 c 0.796567,0.398856 1.99342,0.319857 3.120988,0.180143 5.4,-0.66 13.08,-1.76 18.48,-2.24 1.157425,-0.08971 2.576567,0.01086 3.52342,0.330429");
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
    pathStr = pathStr.replace(/ /g, '');
    let geometry = [];
    let lastPnt = new THREE.Vector2();
    while(pathStr.length > 0){
        switch(pathStr[0]){
            case 'M':
                pathStr = pathStr.substring(1, pathStr.length);
                lastPnt = pullPnt();
                break;
            case 'C':
                pathStr = pathStr.substring(1, pathStr.length);
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
                pathStr = pathStr.substring(1, pathStr.length);
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