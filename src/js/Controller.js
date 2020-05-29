import { bigwinList } from "./config.js";

class Controller {
  constructor(imagePaths, config, type) {
    this.imagePaths = imagePaths;
    this.config = config;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.setup();
  }

  animationSetup() {
    const jsonTextarea = document.querySelector("#jsonTextarea");
    this.animationConfig = JSON.parse(jsonTextarea.value);

    this.type = this.animationConfig.type;
    this.name = this.animationConfig.name;
  }

  setup() {
    this.elapsed = Date.now();
    this.setupCanvas();
    this.animationSetup();
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
      loader.add(`${bw}`, bigwinList[bw].path);
    });

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
    this.bigwin = new PIXI.spine.Spine(res[this.name].spineData);
    this.bigwin.skeleton.setToSetupPose();
    this.bigwin.autoUpdate = false;
    console.log(this.bigwin.state);

    if (this.bigwinContainer) {
      this.bigwinContainer.removeChildren();
    } else {
      this.bigwinContainer = new PIXI.Container();
    }

    this.bigwinContainer.addChild(this.bigwin);

    this.bigwinContainer.scale.set(1);
    this.bigwinContainer.position.set(this.width / 2, this.height / 2);

    this.stage.addChild(this.bigwinContainer);

    this.bigwin.state.setAnimation(0, bigwinList[this.name].animation, true);

    this.calculateSpeed();
    this.handleBigwinEvents();
  }

  handleBigwinEvents() {
    console.log("type: ", this.animationConfig.type);
    console.log("loops: ", this.loops);
    console.log("speed: ", this.speed);
    console.log(
      "duration: ",
      this.animationConfig.duration / 1000 + " seconds"
    );

    this.bigwin.state.onEvent = (i, event) => {
      const start =
        event.data.name === "startLoop" || event.data.name === "start";
      const end = event.data.name === "endLoop" || event.data.name === "end";
      if (start) {
        this.startLoop();
      }
      if (end) {
        this.endLoop();
      }
    };
  }

  calculateSpeed() {
    const duration = this.animationConfig.duration;
    const loopStartFrame = bigwinList[this.name].loopStartFrame;
    const loopEndFrame = bigwinList[this.name].loopEndFrame;
    const animationStart = (loopStartFrame / 30) * 1000;
    const animationEnd = (loopEndFrame / 30) * 1000;
    const framesCount = loopEndFrame - loopStartFrame;
    const loopDurationInMs = framesCount * 30;

    if (this.animationConfig.type === "stretch") {
      return (this.speed = Math.abs(
        (animationEnd - animationStart) / (duration - animationStart)
      ));
    } else if (this.animationConfig.type === "loop") {
      this.loops = Math.round(duration / loopDurationInMs);
      if (this.loops === 0) this.loops = 1;
      return (this.speed = duration / (loopDurationInMs * this.loops));
    }
  }

  startLoop() {
    return (this.bigwin.state.timeScale = this.speed);
  }

  endLoop() {
    if (this.type === "stretch") {
      this.bigwin.state.timeScale = 1;
    } else if (this.type === "loop") {
      if (--this.loops === 0) {
        this.calculateSpeed();
        this.bigwin.state.timeScale = 1;
        return;
      } else {
        const jumpTrackTime =
          (bigwinList[this.name].loopStartFrame * 30) / 1000; //start loop time
        this.bigwin.state.tracks[0].trackTime = jumpTrackTime;
      }
    }
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
    const jsonTextarea = document.querySelector("#jsonTextarea");
    const prettyBtn = document.querySelector("#prettyBtn");
    const invalidJson = document.querySelector(".invalidJson");

    // coins explosion
    this.app.renderer.plugins.interaction.on("pointerdown", (e) => {
      if (!this.emitter) return;
      this.emitter.emit = true;
      this.emitter.resetPositionTracking();
      this.emitter.updateOwnerPos(e.data.global.x, e.data.global.y);
    });

    openSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(this.width - 500, (this.width - 500) / coeff);
      this.bigwinContainer.scale.x = (this.width - 500) / this.width;
      this.bigwinContainer.scale.y = (this.width - 500) / coeff / this.height;
    });

    closeSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(this.width, this.height);
      this.bigwinContainer.scale.x = 1;
      this.bigwinContainer.scale.y = 1;
    });

    bigwin.addEventListener("change", (e) => {
      this.animationConfig.name = e.target.value;
      jsonTextarea.value = JSON.stringify(this.animationConfig, undefined, 4);
      this.animationSetup();
      this.setupSpine(null, this.loader.resources);
      this.setupParticle();
    });

    prettyBtn.addEventListener("click", (e) => {
      try {
        const obj = JSON.parse(jsonTextarea.value);
        this.animationSetup();
        jsonTextarea.classList.remove("error");
        jsonTextarea.value = JSON.stringify(obj, undefined, 4);
        invalidJson.textContent = "";
        this.setupSpine(null, this.loader.resources);
      } catch (e) {
        invalidJson.textContent = e.message;
        console.log(e);

        jsonTextarea.classList.add("error");
      }
    });
  }
}

export default Controller;
