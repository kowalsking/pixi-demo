import { bigwinList } from "./config.js";
import fields from "./fields.js";

class Controller {
  constructor(imagePaths) {
    this.imagePaths = imagePaths;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.setup();
  }

  animationSetup() {
    this.animationConfig = JSON.parse(fields.spineTextarea.value);

    this.type = this.animationConfig.type;
    this.name = this.animationConfig.name;
  }

  configSetup() {
    this.config = JSON.parse(fields.emitterTextarea.value);
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
    this.loadInitialFiles();

    this.loader.load((_, res) => {
      this.onAssetsLoaded(_, res);
    });
  }

  loadInitialFiles() {
    const urls = [this.imagePaths.spritesheet];

    console.log("urls", urls);

    Object.keys(bigwinList).forEach((bw) => {
      this.loader.add(`${bw}`, bigwinList[bw].path);
    });
    this.loader.add(`coin`, urls[0]);

    // urls.forEach((url, idx) => {
    //   loader.add(`img${idx}`, url);
    // });
  }

  onAssetsLoaded(_, res) {
    this.setupSpine(_, res);
    this.setupParticle();
    fields.loader.style.display = "none";

    this.update();
  }

  setupSpine(_, res) {
    this.animationSetup();
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
    console.log(`duration: ${this.animationConfig.duration / 1000} seconds`);

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
    this.configSetup();
    const art = this.imagePaths.art;
    if (this.emitterContainer) {
      this.emitterContainer.removeChildren();
    } else {
      this.emitterContainer = new PIXI.Container();
    }
    this.stage.addChild(this.emitterContainer);

    this.emitter = new PIXI.particles.Emitter(
      this.emitterContainer,
      art,
      this.config
    );
    this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
    this.emitter.updateOwnerPos(this.width / 2, this.height / 2);
  }

  update() {
    window.requestAnimationFrame.bind(window, this.update.bind(this))();

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

    // coins explosion
    this.app.renderer.plugins.interaction.on("pointerdown", (e) => {
      if (!this.emitter) return;
      this.emitter.emit = true;
      this.emitter.resetPositionTracking();
      console.log(e.data.global.x, e.data.global.y);
      console.log(this.app.renderer.plugins.interaction.mouse.global);
      const x = this.app.renderer.plugins.interaction.mouse.global.x;
      const y = this.app.renderer.plugins.interaction.mouse.global.y;
      this.emitter.updateOwnerPos(x, y);
    });

    fields.openSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(this.width - 500, (this.width - 500) / coeff);
      this.stage.pivot(0.5);
      // this.bigwinContainer.scale.x = (this.width - 500) / this.width;
      // this.bigwinContainer.scale.y = (this.width - 500) / coeff / this.height;

      this.stage.scale.x = (this.width - 500) / this.width;
      this.stage.scale.y = (this.width - 500) / coeff / this.height;
    });

    fields.closeSidebar.addEventListener("click", (e) => {
      this.app.renderer.resize(this.width, this.height);
      // this.stage.scale.x = 1;
      // this.stage.scale.y = 1;
    });

    window.addEventListener("click", (e) => {
      console.log(e);
    });

    bigwin.addEventListener("change", (e) => {
      this.animationConfig.name = e.target.value;
      fields.spineTextarea.value = JSON.stringify(
        this.animationConfig,
        undefined,
        4
      );
      this.setupSpine(null, this.loader.resources);
      this.setupParticle();
    });

    fields.prettyBtn.addEventListener("click", (e) => {
      this.handleTextarea(fields.spineTextarea);
      this.handleTextarea(fields.emitterTextarea);
      this.setupSpine(null, this.loader.resources);
      console.log(this.loader.resources);

      this.setupParticle();
    });

    fields.file.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      const url = URL.createObjectURL(file);
      console.dir(file);

      const loader = PIXI.loader;

      reader.addEventListener("load", (e) => {
        try {
          console.log(reader.result);
          const json = JSON.parse(reader.result);
          loader.add(`imgJSON${Math.random()}`, url);
          loader.load((_, res) => {
            console.log(res);
          });
          this.upgradeTextures(json, file.name);
        } catch (e) {
          console.log(e);
        }
      });
      reader.readAsText(file);
    });
  }

  handleTextarea(textarea) {
    try {
      const obj = JSON.parse(textarea.value);
      textarea.classList.remove("error");
      textarea.value = JSON.stringify(obj, undefined, 4);
      fields.invalidJson.textContent = "";
    } catch (e) {
      fields.invalidJson.textContent = e.message;
      console.log(e);
      textarea.classList.add("error");
    }
  }

  upgradeTextures(json, name) {
    this.imagePaths.art[0].textures = Object.keys(json.frames);
    this.imagePaths.art[1].textures = Object.keys(json.frames).reverse();
    console.log(this.imagePaths);
  }
}

export default Controller;
