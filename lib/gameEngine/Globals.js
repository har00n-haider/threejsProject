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
    activeCamera: 'game',
    sceneBg: '#e4e4fc',
    enableGameCameraHelper: false,
  },  
  gameOptions: {
    enableInputStrokes: false,
    targetManagerOptions : {
      speed : 0.3,
      rotRate : 0.2
    }
  }
};
export default globals;
