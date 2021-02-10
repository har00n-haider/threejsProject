import * as THREE from '../lib/three.module.js';
import globals from '../lib/gameEngine/Globals.js';
// GameEngine stuff
import {rand, randVec3} from '../lib/gameEngine/utils/Utils.js';

//#region public functions

// Converts an array of 3drepo clipping planes into 
// a Civil 3D section.
function Convert(clippingPlanes, bbox) {
    let planeArr = [];
    for (const repoPlane of clippingPlanes) {
        const plane = getPlaneFromVals(
            repoPlane.normal[0],
            repoPlane.normal[1],
            repoPlane.normal[2],
            repoPlane.distance,
            repoPlane.clipDirection,
            '3drepo',
        );
        planeArr.push(plane);
    }
    const faces = mapPlanesToFaces(planeArr);
    adaptFlippedFaces(faces);
    fillMissingFaces(faces, bbox);
    return getCivilSectionFromPlanes(faces);
}

//#endregion

//#region private functions

// Takes into account the clip direction, and removes the 
// flipped faces of the clip box (will be reconstructed later)
function adaptFlippedFaces(faces) {
    for (const face of faces) {
        let posFaceFlipped = face.pos != null && face.pos.clipDir > 0;
        let negFaceFlipped = face.neg != null && face.neg.clipDir > 0;
        if (posFaceFlipped && negFaceFlipped) {
            // bail if two sides of the same face are flipped
            console.log("error: clip dir on two planes on the same axis are flipped");
        }
        else {
            face.pos = negFaceFlipped ? null : face.pos;
            face.neg = posFaceFlipped ? null : face.neg;
        }
    }
}

// Reconstructs the missing planes around the bounding box of 
// the model to form a cube. It does nothing to a complete 
// set of planes representing a cube 
function fillMissingFaces(faces, bbox) {
    const axisVecs = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1)
    ];
    let fullFaces = [];
    // Fill as many orth faces as we can, need at least one full face
    for (const face of faces) {
        if (face.pos != null && face.neg == null) {
            face.neg = genOppParrPlane(face.pos, bbox);
        }
        else if (face.pos == null && face.neg != null) {
            face.pos = genOppParrPlane(face.neg, bbox);
        }
        if (face.pos != null && face.neg != null) {
            fullFaces.push(face);
        }
    }
    // Fill in the rest
    if (fullFaces.length != 3) {
        for (const face of faces) {
            if (face.pos == null && face.neg == null) {
                if (fullFaces.length == 1) {
                    // Choose an axis orthogonal vector that is not parallel to full face
                    let chosenAxisVec = axisVecs[0];
                    for (let i = 1; i < axisVecs.length; i++) {
                        if (areVec3sParallel(fullFaces[0].pos.normal, chosenAxisVec)) {
                            chosenAxisVec = axisVecs[i];
                            continue;
                        }
                        else{
                            break;
                        }
                    }
                    face.neg = genAdjOrthPlane(fullFaces[0].pos, fullFaces[0].neg, bbox, chosenAxisVec);
                    face.pos = genOppParrPlane(face.neg, bbox);
                    fullFaces.push(face);
                }
                else if (fullFaces.length > 1) {
                    // Use first full face as the origin plane to go orthogonal two 
                    // and the second full face normal as up dir
                    face.neg = genAdjOrthPlane(fullFaces[0].pos, fullFaces[0].neg, bbox, fullFaces[1].pos.normal);
                    face.pos = genOppParrPlane(face.neg, bbox);
                    fullFaces.push(face);
                }
            }
        }
    }
}

// Takes an array of planes and maps them 
// set of parallel faces on a cuboid
function mapPlanesToFaces(planesArr) {
    const f2PlnMap = [];
    const seekAndDestroy = () => {
        const p = planesArr[0];
        const addHalfPair = () => {
            f2PlnMap.push({
                pos: p,
                neg: null,
            });
            planesArr.splice(0, 1);
        };
        let pairFound = false;
        if (planesArr.length > 1) {
            for (let i = 1; i < planesArr.length; i++) {
                if (areVec3sParallel(p.normal, planesArr[i].normal)) {
                    f2PlnMap.push({
                        pos: p,
                        neg: planesArr[i],
                    });
                    planesArr.splice(0, 1);
                    planesArr.splice(i - 1, 1);
                    pairFound = true
                    break;
                }
            }
            if (!pairFound) {
                addHalfPair(p);
            }
        }
        else {
            addHalfPair(p);
        }
    };
    if (planesArr.length <= 0) {
        return f2PlnMap;
    }
    while (planesArr.length > 0) {
        seekAndDestroy();
    }
    while (f2PlnMap.length < 3) {
        f2PlnMap.push({
            pos: null,
            neg: null,
        });
    }
    return f2PlnMap;
}

function getCivilSectionFromPlanes(planePairs) {
    let topPnts = [];
    let btmPnts = [];

    // This order needs to be maintaned in to make sure section points are sequential 
    // square coordinates
    topPnts.push(getPointFromPlanes(planePairs[0].pos, planePairs[1].neg, planePairs[2].neg));
    topPnts.push(getPointFromPlanes(planePairs[0].pos, planePairs[1].pos, planePairs[2].neg));
    topPnts.push(getPointFromPlanes(planePairs[0].pos, planePairs[1].pos, planePairs[2].pos));
    topPnts.push(getPointFromPlanes(planePairs[0].pos, planePairs[1].neg, planePairs[2].pos));
    btmPnts.push(getPointFromPlanes(planePairs[0].neg, planePairs[1].neg, planePairs[2].pos));
    btmPnts.push(getPointFromPlanes(planePairs[0].neg, planePairs[1].pos, planePairs[2].pos));
    btmPnts.push(getPointFromPlanes(planePairs[0].neg, planePairs[1].pos, planePairs[2].neg));
    btmPnts.push(getPointFromPlanes(planePairs[0].neg, planePairs[1].neg, planePairs[2].neg));

    let result = {
        sectionPnts : [],
        heightBelow : 0,
        heightAbove : 0,
        upDirection : null, 
    } 

    // Loop throught the points in array, 
    for (let pntCtr = 0; pntCtr < topPnts.length; pntCtr++) {
        let topPnt = new THREE.Vector3().copy(topPnts[pntCtr]);
        let botPnt = new THREE.Vector3().copy(btmPnts[pntCtr]);
        let arwVecOrg = new THREE.Vector3().copy(btmPnts[pntCtr]);
        let arwVec = topPnt.add(botPnt.multiplyScalar(-1));
        let halfArwVec = new THREE.Vector3().copy(arwVec).multiplyScalar(0.5);
        let midPoint = arwVecOrg.add(halfArwVec);
        // Update result 
        result.sectionPnts.push(midPoint);
        result.upDirection = result.upDirection == null ? new THREE.Vector3().copy(arwVec).normalize() : result.upDirection;
        result.heightAbove = halfArwVec.length(); 
        result.heightBelow = halfArwVec.length(); 
    }

    const plotVecsFromPnts = (pnts) =>{
        let arw01 = new THREE.Vector3().subVectors(pnts[1],pnts[0]);
        let arw12 = new THREE.Vector3().subVectors(pnts[2],pnts[1]);
        let arw23 = new THREE.Vector3().subVectors(pnts[3],pnts[2]);
        addArrowHelper(arw01, pnts[0], arw01.length(), 'black');
        addArrowHelper(arw12, pnts[1], arw12.length(), 'black');
        addArrowHelper(arw23, pnts[2], arw23.length(), 'black');
        for (const pnt of pnts) {
            addPointAsSphere(pnt);
        }
    }


    // Debug 
    if(false){
        plotVecsFromPnts(result.sectionPnts);
    }
    if(true){
        plotVecsFromPnts(topPnts);
        plotVecsFromPnts(btmPnts);
    }

    // TODO: This would be a civil 3d section
    return result;
}

function genOppParrPlane(plane, bbox) {
    const farPnt = getFarthestPntFromPlane(bbox.vertices, plane);
    const oppParPlane = getPlaneFromPntAndNorm(farPnt, plane.normal);
    return oppParPlane;
}

function genAdjOrthPlane(plane, oppParPlane, bbox, upDir) {
    // Figure out the point and normal of the adjacent orth plane
    // Using the upDir as y axis by default to keep things looking somewhat axis aligned
    const upDirProjVec = getProjVecOnPlane(upDir, plane);
    const orthDir = new THREE.Vector3().crossVectors(plane.normal, upDirProjVec);
    const vecToCenter = new THREE.Vector3().copy(oppParPlane.center).sub(plane.center);
    const centerPoint = new THREE.Vector3().copy(plane.center).add(vecToCenter.multiplyScalar(0.5));
    const orthPlaneMid = getPlaneFromPntAndNorm(centerPoint, orthDir);

    const farPnt = getFarthestPntFromPlane(bbox.vertices, orthPlaneMid);
    const orthPlane = getPlaneFromPntAndNorm(farPnt, orthDir);
    return orthPlane;
}

//#region geometric utility functions9

// Solving AX = B
function getPointFromPlanes(plane1, plane2, plane3) {
    const A = new THREE.Matrix3();
    A.set(
        plane1.a, plane1.b, plane1.c,
        plane2.a, plane2.b, plane2.c,
        plane3.a, plane3.b, plane3.c
    )
    A.invert();
    const B = new THREE.Vector3(
        -plane1.d,
        -plane2.d,
        -plane3.d
    )
    let result = B.applyMatrix3(A);
    return result;
}

function getFarthestPntFromPlane(points, plane) {
    let distPairs = points.map((vert) => {
        return { point: vert, dist: getDistOfPntFromPlane(vert, plane) };
    });
    // Taking into account the clip direction to choose the farthest point.
    // These will be relative to the plane normal. Only 3drepo planes normal
    // directions need to be processed (generated planes aren't concerned 
    // with clipping)
    if (plane.source == '3drepo') {
        distPairs = distPairs.filter(pair => {
            if (plane.clipDir < 0) {
                return pair.dist > 0;
            }
            else {
                return pair.dist < 0;
            }
        });
    }
    const idxMaxDistVal = distPairs.reduce(
        (iMax, currVal, iCurr, arr) => {
            return Math.abs(currVal.dist) > Math.abs(arr[iMax].dist) ? iCurr : iMax;
        }, 0
    );
    const farPnt = new THREE.Vector3().copy(distPairs[idxMaxDistVal].point);
    return farPnt;
}

function getProjVecOnPlane(vec, plane) {
    // k - original vector
    // n - plane normal
    // kpp - k projected onto plane
    // kpn - k projected onto n
    // kpn = k.n/(||n||)^2 . n
    const k = new THREE.Vector3().copy(vec);
    const n = new THREE.Vector3().copy(plane.normal);
    const kpn = (new THREE.Vector3().copy(n)).multiplyScalar(k.dot(n) / (n.length() * n.length()));
    const kpp = new THREE.Vector3().add(k).sub(kpn);
    return kpp;
}

function getDistOfPntFromPlane(pnt, plane) {
    return plane.a * pnt.x + plane.b * pnt.y + plane.c * pnt.z + plane.d;
}

function getPlaneFromPntAndNorm(point, normal) {
    const planeNorm = new THREE.Vector3().copy(normal).normalize();
    const plane = getPlaneFromVals(
        planeNorm.x,
        planeNorm.y,
        planeNorm.z,
        (
            planeNorm.x * point.x +
            planeNorm.y * point.y +
            planeNorm.z * point.z
        ) * -1
    );
    return plane
}

function areVec3sParallel(vec1, vec2) {
    let result = new THREE.Vector3().crossVectors(vec1, vec2);
    let resultMag = result.length();
    let threshold = 0.000001;
    return resultMag < threshold;
}

// Values are map to plane equation as:
// ax + by + cz + d = 0
function getPlaneFromVals(a, b, c, d, clipDir = -1, source = 'generated') {
    const planeNormal = new THREE.Vector3(a, b, c);
    const planeCenter = new THREE.Vector3().add(new THREE.Vector3().copy(planeNormal).multiplyScalar(-d));
    const plane = {
        a: planeNormal.x,
        b: planeNormal.y,
        c: planeNormal.z,
        d: d,
        normal: planeNormal,
        center: planeCenter
    };
    plane.source = source;
    plane.clipDir = clipDir;
    return plane;
}
//#endregion

//#endregion

//#region Debug helpers
function calculateRandomPointsOnPlane(plane, numPoints, range, addToScene = false) {
    let randArr = [];
    for (let i = 0; i < numPoints; i++) {
        let xRand = rand(-range, range);
        let yRand = rand(-range, range);
        let z = (-plane.d - plane.a * xRand - plane.b * yRand) / plane.c;
        randArr.push(new THREE.Vector3(xRand, yRand, z))
        addPointAsSphere(randArr[i]);
    }
    return randArr;
}

function calculateRandPerpVector(vector, range) {
    let xRand = rand(-range, range);
    let yRand = rand(-range, range);
    let z = (-vector.x * xRand - vector.y * yRand) / vector.z;
    return new THREE.Vector3(xRand, yRand, z);
}

function addPointAsSphere(pos, color = 'yellow', size = 0.07) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);
    globals.scene.add(sphere);
}

function addArrowHelper(vector, origin = new THREE.Vector3(), length = 8, color = 'green') {
    const vectorNorm = new THREE.Vector3().copy(vector).normalize();
    let arrow = new THREE.ArrowHelper(vectorNorm, origin, length, color);
    globals.scene.add(arrow);
}

function addPlane(plane, color = 'green', addNorm = true, size = 10) {
    if (plane.source == 'generated') {
        size = 7;
    }
    const planeNormal = plane.normal;
    const pos = plane.center;
    const planeObj = globals.gameObjectManager.createGameObject(globals.scene, 'plane');
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshPhongMaterial({
        color: color,
        opacity: 0.1,
        transparent: true,
        side: THREE.DoubleSide,
    });
    const planeGeo = new THREE.Mesh(planeGeometry, planeMaterial);
    planeObj.transform.add(planeGeo);
    planeObj.transform.lookAt(planeNormal);
    planeObj.transform.position.set(pos.x, pos.y, pos.z);
    if (addNorm) {
        addArrowHelper(plane.normal, plane.center, 0.5, color);
    }
}

function addFaces(faces) {
    let color = 'grey';
    for (let i = 0; i < faces.length; i++) {
        switch (i) {
            case 0:
                color = 'red';
                break;
            case 1:
                color = 'green';
                break;
            case 2:
                color = 'blue';
                break;
        }
        if (faces[i].pos != null) {
            addPlane(faces[i].pos, color);
        }
        if (faces[i].neg != null) {
            addPlane(faces[i].neg, color);
        }
    }
}
//#endregion

export {
    Convert,
};
  