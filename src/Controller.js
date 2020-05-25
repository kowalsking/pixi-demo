class Controller {
  constructor(imagePaths, config, type) {
    this.imagePaths = imagePaths;
    this.config = config;
    this.type = type;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.setup();
  }

  setup() {
    this.elapsed = Date.now();
    this.setupCanvas();
    this.clickHandler();
    this.preload();
  }

  setupCanvas() {
    this.createCanvas();
    this.createRenderer();
  }

  createCanvas() {
    this.app = new PIXI.Application();
    document.body.appendChild(this.app.view);
    this.app.width = this.width;
    this.app.height = this.height;
  }

  createRenderer() {
    this.stage = new PIXI.Container();
    this.renderer = PIXI.autoDetectRenderer(this.app.width, this.app.height, {
      view: this.app.view,
    });
  }

  preload() {
    const loader = PIXI.loader;
    this.addToLoader(loader);

    loader.load((_, res) => {
      this.onAssetsLoaded(_, res);
    });
  }

  addToLoader(loader) {
    const urls = [this.imagePaths.spritesheet];
    loader.add("bigwin", "bigwin/big_win_animation.json");
    urls.forEach((url, idx) => {
      loader.add(`img${idx}`, url);
    });
  }

  onAssetsLoaded(_, res) {
    this.setupSpine(_, res);
    this.setupParticle();

    this.update();
  }

  setupSpine(_, res) {
    this.bigwin = new PIXI.spine.Spine(res.bigwin.spineData);
    this.bigwin.skeleton.setToSetupPose();
    this.bigwin.autoUpdate = false;

    const bigwinContainer = new PIXI.Container();
    bigwinContainer.addChild(this.bigwin);

    this.localRect = this.bigwin.getLocalBounds();
    this.bigwin.position.set(-this.localRect.x, -this.localRect.y);

    bigwinContainer.scale.set(1);
    bigwinContainer.position.set(this.width / 2, this.height / 2);

    this.stage.addChild(bigwinContainer);
    this.bigwin.state.setAnimation(0, "big_win_all", true);
  }

  setupParticle() {
    const art = this.imagePaths.art;
    const emitterContainer = new PIXI.Container();

    this.stage.addChild(emitterContainer);

    this.emitter = new PIXI.particles.Emitter(emitterContainer, art, config);
    this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
    this.emitter.updateOwnerPos(this.width / 2, this.height / 2);
  }

  update() {
    window.requestAnimationFrame.bind(window, this.update.bind(this))();

    const framerate = document.getElementById("framerate");
    const now = Date.now();
    const delta = now - this.elapsed;
    const frequency = delta * 0.001;
    const fps = 1000 / delta;

    this.bigwin.update(frequency);
    this.emitter.update(frequency);

    framerate.innerHTML = `FPS: ${fps.toFixed(2)}`;
    this.elapsed = now;
    this.renderer.render(this.stage);
  }

  clickHandler() {
    this.app.view.addEventListener("mouseup", (e) => {
      if (!this.emitter) return;
      this.emitter.emit = true;
      this.emitter.resetPositionTracking();
      this.emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
    });
  }
}
