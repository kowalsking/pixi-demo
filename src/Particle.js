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
    this.setupCanvas();
    this.clickHandler();
  }

  setupCanvas() {
    this.canvas = new PIXI.Application(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.canvas.view);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const rendererOptions = {
      view: this.canvas.view,
    };

    this.stage = new PIXI.Container();
    this.emitter = null;
    this.renderer = PIXI.autoDetectRenderer(
      this.canvas.width,
      this.canvas.height,
      rendererOptions
    );
  }

  setupSpine(loader, res) {
    this.bigwin = new PIXI.spine.Spine(res.bigwin.spineData);
    this.bigwin.skeleton.setToSetupPose();
    this.bigwin.autoUpdate = false;

    this.bigwinContainer = new PIXI.Container();
    this.bigwinContainer.addChild(this.bigwin);

    this.localRect = this.bigwin.getLocalBounds();
    this.bigwin.position.set(-this.localRect.x, -this.localRect.y);

    this.bigwinContainer.scale.set(1);
    this.bigwinContainer.position.set(
      window.innerWidth * 0.5,
      window.innerHeight * 0.5
    );

    this.stage.addChild(this.bigwinContainer);

    this.bigwin.state.setAnimation(0, "big_win_all", true);
  }

  update() {
    window.requestAnimationFrame.bind(window, this.update.bind(this))();
    const framerate = document.getElementById("framerate");
    const now = Date.now();
    this.bigwin.update((now - this.elapsed) * 0.001);
    this.emitter.update((now - this.elapsed) * 0.001);

    framerate.innerHTML = (1000 / (now - this.elapsed)).toFixed(2);

    this.elapsed = now;

    this.renderer.render(this.stage);
  }

  preload() {
    const urls = [this.imagePaths.spritesheet];
    urls.push("images/bc.png");
    const loader = PIXI.loader;
    loader.add("bigwin", "bigwin/big_win_animation.json");
    urls.forEach((url, idx) => {
      loader.add(`img${idx}`, url);
    });

    loader.load((loader, res) => {
      this.setupSpine(loader, res);
      const art = this.imagePaths.art;
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
    this.canvas.view.addEventListener("mouseup", (e) => {
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
