import * as THREE from '../../../lib/three.module.js';
import Component from '../Component.js';
import globals from  '../../Globals.js';

class LinearSpline {
  constructor(lerp) {
    this._points = [];
    this._lerp = lerp;
  }

  AddPoint(t, d) {
    this._points.push([t, d]);
  }

  Get(t) {
    let p1 = 0;

    for (let i = 0; i < this._points.length; i++) {
      if (this._points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this._points.length - 1, p1 + 1);

    if (p1 == p2) {
      return this._points[p1][1];
    }

    return this._lerp(
      (t - this._points[p1][0]) / (
        this._points[p2][0] - this._points[p1][0]),
      this._points[p1][1], this._points[p2][1]);
  }
}

class ParticleSystem extends Component {
  constructor(gameObject) {
    super(gameObject);

    this._parent = gameObject.transform;
    this._camera = globals.mainCamera;
    this._particles = [];

    this._LoadMaterials();
    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
    this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));
    this._ConfigureSplines();

    this._isPlaying = false;
    this._lifeMaxSecs = 0.1;
    this._lifeSecs = this._lifeMaxSecs;

    this._points = new THREE.Points(this._geometry, this._material);
    this._parent.add(this._points);

  }

  _LoadMaterials(){
    const uniforms = {
      diffuseTexture: {
        value: new THREE.TextureLoader().load('assets/fire.png')
      },
      pointMultiplier: {
        value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
      }
    };
   
    const _VertexShader = `
    uniform float pointMultiplier;

    attribute float size;
    attribute float angle;
    attribute vec4 colour;

    varying vec4 vColour;
    varying vec2 vAngle;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      gl_Position = projectionMatrix * mvPosition;

      gl_PointSize = size * pointMultiplier / gl_Position.w;
      // HH: Why is the cosine and sine being calculated here instead of in the fragment shader
      vAngle = vec2(cos(angle), sin(angle));
      vColour = colour;
    }`;

    const _FragmentShader = `
    uniform sampler2D diffuseTexture;

    varying vec4 vColour;
    varying vec2 vAngle;

    void main() {
      // HH: Rotate the gl_PointCoord?
      vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
      gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
    }`;

    this._material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: _VertexShader,
      fragmentShader: _FragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

  }

  _ConfigureSplines(){
    this._alphaSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSpline.AddPoint(0.0, 0.0);
    this._alphaSpline.AddPoint(0.1, 1.0);
    this._alphaSpline.AddPoint(0.6, 1.0);
    this._alphaSpline.AddPoint(1.0, 0.0);

    // this._colourSpline = new LinearSpline((t, a, b) => {
    //   const c = a.clone();
    //   return c.lerp(b, t);
    // });
    // this._colourSpline.AddPoint(0.0, new THREE.Color(0xFFFF80));
    // this._colourSpline.AddPoint(1.0, new THREE.Color(0xFF8080));

    this._sizeSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSpline.AddPoint(0.0, 1.0);
    this._sizeSpline.AddPoint(0.5, 5.0);
    this._sizeSpline.AddPoint(1.0, 1.0);
  }
  
  _AddParticles() {
    const particlesPerCall = 20;
    const spread = 0.3;
    const maxVelocity = 15;
    for (let i = 0; i < particlesPerCall; i++) {
      const lifeSec = (Math.random() * 0.75 + 0.25) * 2.0;
      const size = Math.random() * 1.0;
      // Particle definition
      this._particles.push({
        position: new THREE.Vector3(
          (Math.random() * 2 - 1) * spread,
          (Math.random() * 2 - 1) * spread,
          (Math.random() * 2 - 1) * spread),
          size : size,
          maxSize : size,
          colour : new THREE.Color(Math.random(),Math.random(),Math.random()),
          alpha : 1.0,
          lifeSec : lifeSec,
          maxLifeSec: lifeSec,
          rotation : Math.random() * 2.0 * Math.PI,
          velocity: new THREE.Vector3(
            (Math.random() * 2 - 1) * maxVelocity, 
            (Math.random() * 2 - 1) * maxVelocity, 
            (Math.random() * 2 - 1) * maxVelocity),
      });
    }
  }

  /**
   * Updates the particles through their lifetime
   */
  _UpdateParticles(_deltaTimeSec) {
    if(this._particles.length <= 0){ return; }

    // Update life & kill particles...puny particle mortals!!!
    for (let p of this._particles) {
      p.lifeSec -= _deltaTimeSec;
    }
    this._particles = this._particles.filter(p => {
      return p.lifeSec > 0.0;
    });
    // Animations
    for (let p of this._particles) {
      const t = 1.0 - p.lifeSec / p.maxLifeSec;
      p.rotation += _deltaTimeSec * 0.5;
      p.alpha = this._alphaSpline.Get(t);
      p.size = p.maxSize * this._sizeSpline.Get(t);
      // p.colour.copy(this._colourSpline.Get(t));

      // Movement
      p.position.add(p.velocity.clone().multiplyScalar(_deltaTimeSec));
      const drag = p.velocity.clone();
      drag.multiplyScalar(_deltaTimeSec * 0.1);
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
      p.velocity.sub(drag);
    }
    // Sort for correct drawing order
    // TODO: could switch to radix sort
    this._particles.sort((a, b) => {
      const d1 = this._camera.position.distanceToSquared(a.position);
      const d2 = this._camera.position.distanceToSquared(b.position);
      if (d1 > d2) {
        return -1;
      }
      if (d1 < d2) {
        return 1;
      }
      return 0;
    });
  }

  /**
   * Converting the custom particle objects into THREE
   * compatible geometries.
   */
  _UpdateGeometry() {
    if(this._particles.length <= 0){ return; }
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];
    for (let p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.size);
      angles.push(p.rotation);
    }
    // These values are used by the shader
    // HH: Does this have to be done twice (once on the constructor?)
    this._geometry.setAttribute(
      'position', new THREE.Float32BufferAttribute(positions, 3));
    this._geometry.setAttribute(
      'size', new THREE.Float32BufferAttribute(sizes, 1));
    this._geometry.setAttribute(
      'colour', new THREE.Float32BufferAttribute(colours, 4));
    this._geometry.setAttribute(
      'angle', new THREE.Float32BufferAttribute(angles, 1));
    // Attribute has change so we need to resend to GPU
    // HH: Not too sure what going on here ... 
    this._geometry.attributes.position.needsUpdate  = true;
    this._geometry.attributes.size.needsUpdate      = true;
    this._geometry.attributes.colour.needsUpdate    = true;
    this._geometry.attributes.angle.needsUpdate     = true;
  }

  update() {
    let _deltaTimeSec = globals.deltaTimeMillSec * 0.001;
    if(this._isPlaying){
      this._AddParticles();
      this._lifeSecs -= _deltaTimeSec;
      if ( this._lifeSecs <= 0){
        this._lifeSecs = 0;
        this._isPlaying = false;
      };
    }
    // automatically destroy
    if(this._points.length === 0 &&  this._isPlaying){
      this.destroy();
    }
    this._UpdateParticles(_deltaTimeSec);
    this._UpdateGeometry();
  }

  play = () => {
    this._isPlaying = true;
    this._lifeSecs = this._lifeMaxSecs;
  }
  
  destroy = () => {
    // remove from scene and cleanup
    this._parent.remove(this._points);
    this._geometry.dispose();
    this._material.dispose();
  }
}

export default ParticleSystem;