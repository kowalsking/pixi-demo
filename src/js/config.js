export const imagePaths = {
  spritesheet: "images/coin.json",
  art: [
    {
      framerate: 30,
      loop: false,
      textures: [
        "0001.png",
        "0002.png",
        "0003.png",
        "0004.png",
        "0005.png",
        "0006.png",
        "0007.png",
        "0008.png",
        "0009.png",
        "0010.png",
        "0011.png",
        "0012.png",
        "0013.png",
        "0014.png",
        "0015.png",
        "0016.png",
        "0017.png",
        "0018.png",
        "0019.png",
        "0020.png",
        "0021.png",
        "0022.png",
        "0023.png",
        "0024.png",
        "0025.png",
        "0026.png",
        "0027.png",
        "0028.png",
        "0029.png",
        "0030.png",
      ],
    },
    {
      framerate: 30,
      loop: false,
      textures: [
        "0030.png",
        "0029.png",
        "0028.png",
        "0027.png",
        "0026.png",
        "0025.png",
        "0024.png",
        "0023.png",
        "0022.png",
        "0021.png",
        "0020.png",
        "0019.png",
        "0018.png",
        "0017.png",
        "0016.png",
        "0015.png",
        "0014.png",
        "0013.png",
        "0012.png",
        "0011.png",
        "0010.png",
        "0009.png",
        "0008.png",
        "0007.png",
        "0006.png",
        "0005.png",
        "0004.png",
        "0003.png",
        "0002.png",
        "0001.png",
      ],
    },
  ],
};

export const particleConfig = {
  alpha: {
    start: 1,
    end: 1,
  },
  scale: {
    start: 0.45,
    end: 0.45,
    minimumScaleMultiplier: 0.5,
  },
  color: {
    start: "#ffffff",
    end: "#f9fcc0",
  },
  speed: {
    list: [
      {
        value: 500,
        time: 0,
      },
      {
        value: 0,
        time: 0.1,
      },
      {
        value: 0,
        time: 1,
      },
    ],
    isStepped: false,
    minimumSpeedMultiplier: 2.25,
  },
  acceleration: {
    x: 0,
    y: 2000,
  },
  startRotation: {
    min: 0,
    max: 360,
  },
  rotationSpeed: {
    min: 100,
    max: 200,
  },
  lifetime: {
    min: 1.5,
    max: 1.5,
  },
  blendMode: "normal",
  frequency: 0.001,
  emitterLifetime: 0.5,
  maxParticles: 70,
  pos: {
    x: 0,
    y: 0,
  },
  addAtBack: true,
  spawnType: "point",
};

// const canvas = document.querySelector("#canvas");
// const coeff = 1920 / 1080;
// console.log("f", canvas.style.width);

// export const resizeConfig = {
//   get width() {
//     return canvas.width;
//   },
//   get height() {
//     return this.width / coeff;
//   },
// };
