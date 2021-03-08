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
    useOrbitControls: true,
    enableOrbitControls: true,
    activeCamera: 'game',
    sceneBg: '#bdbdd4',
  },  
  gameOptions: {
    enableInputStrokes: false,
  }
};
export default globals;
