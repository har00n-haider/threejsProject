const globals = {
  debugger: undefined,
  canvas: undefined,
  timeMilliSec: 0,
  deltaTimeMillSec: null,
  inputManager: undefined,
  mainCamera: undefined,
  editorCamera: undefined,
  gameCamera: undefined,
  gameCameraHelper: undefined,
  scene: undefined,
  renderer: undefined,
  orbitControls: undefined,
  gameObjectManager: undefined,
  audioManager: undefined,
  orthoSize: undefined,
  options: {
    useOrbitControls: true,
    enableOrbitControls: false,
    activeCamera: 'game',
    sceneBg: '#bdbdd4',
    enableGameCameraHelper: false,
  },  
  gameOptions: {
    enableInputStrokes: true,
  }
};
export default globals;
