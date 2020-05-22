class Particle {
  constructor(imagePaths, config, type, useParticleContainer, stepColors) {
    this.imagePaths = imagePaths;
    this.config = config;
    this.type = type;
    this.useParticleContainer = useParticleContainer;
    this.stepColors = stepColors;
    this.elapsed = Date.now();
    this.setup();
    this.preload();
  }

  setup() {
    this.canvas = document.querySelector("#stage");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const rendererOptions = {
      view: this.canvas,
    };

    this.stage = new PIXI.Container();
    this.emitter = null;
    this.renderer = PIXI.autoDetectRenderer(
      this.canvas.width,
      this.canvas.height,
      rendererOptions
    );

    this.clickHandler();
  }

  update() {
    window.requestAnimationFrame.bind(window, this.update.bind(this))();
    const framerate = document.getElementById("framerate");
    const now = Date.now();

    if (this.emitter) {
      this.emitter.update((now - this.elapsed) * 0.001);
    }

    framerate.innerHTML = (1000 / (now - this.elapsed)).toFixed(2);

    this.elapsed = now;

    this.renderer.render(this.stage);
  }

  preload() {
    const urls = [this.imagePaths.spritesheet];
    urls.push("images/bc.png");
    const loader = PIXI.loader;
    urls.forEach((url, idx) => {
      loader.add(`img${idx}`, url);
    });

    loader.load(() => {
      const art = this.imagePaths.art;
      this.setupBG();
      let emitterContainer;
      if (this.useParticleContainer) {
        emitterContainer = new PIXI.ParticleContainer();
        emitterContainer.setProperties({
          scale: true,
          position: true,
          rotation: true,
          uvs: true,
          alpha: true,
        });
      } else {
        emitterContainer = new PIXI.Container();
      }

      this.stage.addChild(emitterContainer);

      window.emitter = this.emitter = new PIXI.particles.Emitter(
        emitterContainer,
        art,
        config
      );

      if (this.type === "path") {
        this.emitter.particleConstructor = PIXI.particles.PathParticle;
      } else if (this.type === "anim") {
        this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
      }

      emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
      this.update();
    });
  }

  clickHandler() {
    this.canvas.addEventListener("mouseup", (e) => {
      if (!emitter) return;
      this.emitter.emit = true;
      this.emitter.resetPositionTracking();
      this.emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
    });
  }

  setupBG() {
    const bg = new PIXI.Sprite(PIXI.Texture.fromImage("images/bc.png"));
    bg.width = this.canvas.width;
    bg.height = this.canvas.height;
    this.stage.addChild(bg);
  }
}

window.Particle = Particle;
