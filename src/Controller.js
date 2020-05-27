import { bigwinList } from "./js/config.js";

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
    this.eventsHandler();
    this.preload();
  }

  setupCanvas() {
    this.createCanvas();
    this.createRenderer();
  }

  createCanvas() {
    this.canvas = document.querySelector("#canvas");
    this.app = new PIXI.Application({ width: this.width, height: this.height });
    this.canvas.append(this.app.view);
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
    this.loader = PIXI.loader;
    this.addToLoader(this.loader);

    this.loader.load((_, res) => {
      this.onAssetsLoaded(_, res);
    });
  }

  addToLoader(loader) {
    const urls = [this.imagePaths.spritesheet];

    Object.keys(bigwinList).forEach((bw, idx) => {
      loader.add(`${bw}`, bigwinList[bw]);
    });

    urls.forEach((url, idx) => {
      loader.add(`img${idx}`, url);
    });
  }

  onAssetsLoaded(_, res) {
    this.setupSpine(_, res, "MMA");
    this.setupParticle();
    this.createSelectsAnimations("MMA");

    this.update();
  }

  setupSpine(_, res, name, animation = "big_win_all") {
    this.bigwin = new PIXI.spine.Spine(res[name].spineData);
    this.bigwin.skeleton.setToSetupPose();
    this.bigwin.autoUpdate = false;
    console.log(this.bigwin.state);

    if (this.bigwinContainer) {
      this.bigwinContainer.removeChildren();
    } else {
      this.bigwinContainer = new PIXI.Container();
    }
    this.bigwin.state.onEvent = function (i, event) {
      console.log("event fired!", i, event.data.name);
    };

    this.bigwinContainer.addChild(this.bigwin);

    this.bigwinContainer.scale.set(1);
    this.bigwinContainer.position.set(this.width / 2, this.height / 2);

    this.stage.addChild(this.bigwinContainer);
    this.bigwin.state.setAnimation(0, animation, true);
  }

  setupParticle() {
    const art = this.imagePaths.art;
    const emitterContainer = new PIXI.Container();

    this.stage.addChild(emitterContainer);

    this.emitter = new PIXI.particles.Emitter(
      emitterContainer,
      art,
      this.config
    );
    this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
    this.emitter.updateOwnerPos(this.width / 2, this.height / 2);
  }

  createSelectsAnimations(name) {
    const animations = document.querySelector("#animation");
    animations.textContent = "";
    Object.keys(this.loader.resources[name].data.animations).forEach((anim) => {
      const option = document.createElement("option");
      option.textContent = anim;
      option.value = anim;
      return animations.append(option);
    });
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

  eventsHandler() {
    const coeff = 1920 / 1080;
    const openSidebar = document.querySelector(".openSidebar");
    const closeSidebar = document.querySelector(".closeSidebar");
    const bigwin = document.querySelector("#bigwin");
    const animations = document.querySelector("#animation");

    // coins explosion
    this.app.renderer.plugins.interaction.on("pointerdown", (e) => {
      if (!this.emitter) return;
      this.emitter.emit = true;
      this.emitter.resetPositionTracking();
      this.emitter.updateOwnerPos(e.data.global.x, e.data.global.y);
    });

    openSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(
        this.app.width - 500,
        (this.width - 500) / coeff
      );
    });

    closeSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(this.width, this.height);
    });

    bigwin.addEventListener("change", (e) => {
      this.setupSpine(null, this.loader.resources, e.target.value);
      this.setupParticle();
      this.createSelectsAnimations(e.target.value);
    });

    animations.addEventListener("change", (e) => {
      this.setupSpine(
        null,
        this.loader.resources,
        bigwin.value,
        e.target.value
      );
      this.setupParticle();
    });
  }
}

export default Controller;
