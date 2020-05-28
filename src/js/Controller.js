import { bigwinList, animationSetup } from "./config.js";

class Controller {
  constructor(imagePaths, config, type) {
    this.imagePaths = imagePaths;
    this.config = config;
    this.type = animationSetup.type;
    this.name = animationSetup.name;
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

    this.countLoops();
    this.handleBigwinEvents();
  }

  handleBigwinEvents() {
    this.bigwin.state.onEvent = (i, event) => {
      if (event.data.name === "startLoop") {
        if (this.type === "stretch") {
          this.stretchAnimation();
        } else if (this.type === "loop" && this.loopFlag === undefined) {
          console.log("start", this.bigwin.state.tracks[0].trackTime);
          this.loopAnimation();
        }
      }
      if (event.data.name === "endLoop") {
        if (this.type === "stretch") {
          this.bigwin.state.timeScale = 1;
        } else if (this.type === "loop") {
          console.log("end", this.bigwin.state.tracks[0].trackTime);
          if (--this.loops === 0) {
            this.countLoops();
            this.bigwin.state.timeScale = 1;
            return;
          } else {
            const jumpTrackTime =
              (bigwinList[this.name].loopStartFrame * 30) / 1000; //start loop time
            this.bigwin.state.tracks[0].trackTime = jumpTrackTime;
          }
        }
      }
    };
  }

  stretchAnimation() {
    // const animationStart = this.bigwin.state.tracks[0].trackTime * 1000;
    const duration = animationSetup.duration;
    const loopStartFrame = bigwinList[this.name].loopStartFrame;
    const loopEndFrame = bigwinList[this.name].loopEndFrame;
    const animationStart = (loopStartFrame / 30) * 1000;
    const animationEnd = (loopEndFrame / 30) * 1000;
    const timeScale =
      (animationEnd - animationStart) / (duration - animationStart);
    this.bigwin.state.timeScale = Math.abs(timeScale);
  }

  loopAnimation() {
    this.loopFlag = true;
    const loopStartFrame = bigwinList[this.name].loopStartFrame;
    const loopEndFrame = bigwinList[this.name].loopEndFrame;
    const framesCount = loopEndFrame - loopStartFrame;
    const loopDurationInMs = framesCount * 30;
    const duration = animationSetup.duration;

    const moreLoopOverhead = Math.abs(duration - loopDurationInMs * this.loops);
    const lessLoopOverhead = Math.abs(
      duration - loopDurationInMs * (this.loops - 1)
    );

    if (moreLoopOverhead >= lessLoopOverhead && this.loops > 1) this.loops--;

    const loopSpeed = duration / (loopDurationInMs * this.loops);
    this.bigwin.state.timeScale = loopSpeed;
  }

  countLoops() {
    const loopStartFrame = bigwinList[this.name].loopStartFrame;
    const loopEndFrame = bigwinList[this.name].loopEndFrame;
    const framesCount = loopEndFrame - loopStartFrame;
    const loopDurationInMs = framesCount * 30;
    const duration = animationSetup.duration;

    if (duration >= loopDurationInMs) {
      this.loops = Math.round(duration / loopDurationInMs);
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
    const animations = document.querySelector("#animation");

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
    });

    bigwin.addEventListener("change", (e) => {
      this.name = e.target.value;
      this.setupSpine(null, this.loader.resources);
      this.setupParticle();
    });
  }
}

export default Controller;
