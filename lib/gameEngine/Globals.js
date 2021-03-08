const globals = {
  debugger: undefined,
  canvas: undefined,
  timeMilliSec: 0,
  deltaTimeMillSec: null,
  inputManager: undefined,
  mainCamera: undefined,
  editorCamera: undefined,
  gameCamera: undefined,
  scene: undefined,
  renderer: undefined,
  orbitControls: undefined,
  gameObjectManager: undefined,
  audioManager: undefined,
  orthoSize: undefined,
  options: {
    enableOrbitControls: true,
    activeCamera : 'game',
  },  
  gameOptions: {
    enableInputStrokes : false,
  }
};
export default globals;
