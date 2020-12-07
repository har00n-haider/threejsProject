class Debugger  {
    constructor(globals, debuggerElem) {
      this.globals = globals;
      this.debuggerElem = debuggerElem;
    }

    update = () => {
        this.debuggerElem.innerHTML = 
        "window size: " + window.innerWidth + " , " + 
                          window.innerHeight + "<br>" + 
        "canvas size: " + this.globals.canvas.clientWidth + " , " + 
                          this.globals.canvas.clientHeight + "<br>" +
        "pointer pos: " + this.globals.inputManager.pointerPos.x.toFixed(2) + " , " + 
                          this.globals.inputManager.pointerPos.y.toFixed(2) + "<br>" ;
    }
}

export default Debugger;