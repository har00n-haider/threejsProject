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
    debugStats: false,
    enableOrbitControls: true,
    activeCamera: 'editor',
    sceneBg: '#525252',
    enableGameCameraHelper: false,
  },  
  gameOptions: undefined
};
export default globals;
