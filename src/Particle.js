import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";
import "./pixi-legacy";

class Particle {
  constructor(imagePaths, config, type, useParticleContainer, stepColors) {
    this.imagePaths = imagePaths;
    this.config = config;
    this.type = type;
    this.useParticleContainer = useParticleContainer;
    this.stepColors = stepColors;
    this.setup();
    this.update(Date.now());
    this.preload();
  }

  setup() {
    const stage = document.querySelector("#stage");
    this.canvas = new PIXI.Application({ width: 400, height: 400 });
    stage.append(this.canvas.view);

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
  }

  update(elapsed) {
    window.requestAnimationFrame.bind(this, this.update);
    const now = Date.now();

    if (this.emitter) {
      emitter.update((now - elapsed) * 0.001);
    }

    framerate.innerHTML = (1000 / (now - elapsed)).toFixed(2);

    elapsed = now;

    if (this.emitter && particleCount) {
      particleCount.innerHTML = emitter.particleCount;
    }

    this.renderer.render(this.stage);
  }

  preload() {
    this.urls = [];
    const loader = PIXI.Loader.shared;
    Object.keys(this.imagePaths.spritesheet.frames).map((img) => {
      this.urls.push(`./images/title${img}`);
    });
    this.urls.forEach((url, idx) => {
      loader.add(`${idx}`, url);
    });

    loader.load(() => {
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
      console.log(particles);

      window.emitter = this.emitter = new particles.Emitter(
        emitterContainer,
        art,
        config
      );

      if (this.type === "path") {
        this.emitter.particleConstructor = PIXI.particles.PathParticle;
      } else if (type === "anim") {
        this.emitter.particleConstructor = PIXI.particles.AnimatedParticle;
      }

      emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);
    });
  }
}

export default Particle;
