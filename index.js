
import gameObjectManager from "./src/game/GameObjectManager.js"
import globals from "./src/globals.js";


// Main render loop
let then = 0;
function render(now) {
// convert to seconds
globals.time = now * 0.001;
// make sure delta time isn't too big.
globals.deltaTime = Math.min(globals.time - then, 1 / 20);
then = globals.time;

// if (resizeRendererToDisplaySize(renderer)) {
//     const canvas = renderer.domElement;
//     camera.aspect = canvas.clientWidth / canvas.clientHeight;
//     camera.updateProjectionMatrix();
// }

// gameObjectManager.update();
// inputManager.update();

// renderer.render(scene, camera);

requestAnimationFrame(render);
}

requestAnimationFrame(render);