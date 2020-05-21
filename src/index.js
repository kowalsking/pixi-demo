import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";
import coin from "./coin.png";
import i1 from "./images/tile000.png";
import i2 from "./images/tile011.png";
import i3 from "./images/tile021.png";
import i4 from "./images/tile029.png";
// import Particle from "./Particle";
import spritesheetCoin from "./coin.json";
import "./ParticleExample";
// new Particle({
//   spritesheet: spritesheetCoin,
// });

const app = new PIXI.Application();
document.body.append(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

const coins = [i1, i2, i3, i4];

var emitter = new particles.Emitter(
  // The PIXI.Container to put the emitter in
  // if using blend modes, it's important to put this
  // on top of a bitmap, and not use the root stage Container
  container,

  // The collection of particle images to use
  [
    PIXI.Texture.from(i1),
    PIXI.Texture.from(i2),
    PIXI.Texture.from(i3),
    PIXI.Texture.from(i4),
  ],

  // Emitter configuration, edit this to change the look
  // of the emitter
  {
    alpha: {
      list: [
        {
          value: 1,
          time: 0,
        },
        {
          value: 0.2,
          time: 0.5,
        },
        {
          value: 1,
          time: 1,
        },
      ],
      isStepped: false,
    },
    scale: {
      list: [
        {
          value: 1,
          time: 0,
        },
        {
          value: 1,
          time: 1,
        },
      ],
      isStepped: false,
    },
    // color: {
    //   list: [
    //     {
    //       value: "fb1010",
    //       time: 0,
    //     },
    //     {
    //       value: "f5b830",
    //       time: 1,
    //     },
    //   ],
    //   isStepped: false,
    // },
    // speed: {
    //   list: [
    //     {
    //       value: 0,
    //       time: 0,
    //     },
    //     {
    //       value: 1,
    //       time: 1,
    //     },
    //   ],
    //   isStepped: false,
    // },
    // startRotation: {
    //   min: 0,
    //   max: 0,
    // },
    // rotationSpeed: {
    //   min: 0,
    //   max: 0,
    // },
    lifetime: {
      min: 1,
      max: 1,
    },
    frequency: 0.001,
    spawnChance: 1,
    particlesPerWave: 1,
    emitterLifetime: 10,
    maxParticles: 1,
    pos: {
      x: 0,
      y: 0,
    },
    addAtBack: false,
    spawnType: "circle",
    spawnCircle: {
      x: app.view.width / 2,
      y: app.view.height / 2,
      r: 1,
    },
  }
);

// Calculate the current time
var elapsed = Date.now();

// Update function every frame
var update = function () {
  // Update the next frame
  requestAnimationFrame(update);

  var now = Date.now();

  // The emitter requires the elapsed
  // number of seconds since the last update
  emitter.update((now - elapsed) * 0.001);
  elapsed = now;

  // Should re-render the PIXI Stage
  // renderer.render(stage);
};

// Start emitting
emitter.emit = true;

// Start the update
update();
