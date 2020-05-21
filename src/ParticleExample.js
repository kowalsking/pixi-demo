(function (window) {
  /**
   *  Basic example setup
   *  @class ParticleExample
   *  @constructor
   *  @param {String[]} imagePaths The local path to the image source
   *  @param {Object} config The emitter configuration
   *  @param {null|"path"|"anim"} [type=null] Particle type to create.
   *  @param {boolean} [useParticleContainer=false] If a ParticleContainer should be used instead of a Container.
   *  @param {boolean} [stepColors=false] If the color settings should be manually stepped.
   */
  var ParticleExample = function (
    imagePaths,
    config,
    config1,
    type,
    useParticleContainer,
    stepColors
  ) {
    var canvas = document.getElementById("stage");
    // Basic PIXI Setup
    var rendererOptions = {
      view: canvas,
    };
    /*var preMultAlpha = !!options.preMultAlpha;
		if(rendererOptions.transparent && !preMultAlpha)
			rendererOptions.transparent = "notMultiplied";*/
    var stage = new PIXI.Container(),
      emitter = null,
      emitter1 = null,
      renderer = PIXI.autoDetectRenderer(
        canvas.width,
        canvas.height,
        rendererOptions
      ),
      bg = null;

    var framerate = document.getElementById("framerate");
    var particleCount = document.getElementById("particleCount");

    // Calculate the current time
    var elapsed = Date.now();

    var updateId;

    // Update function every frame
    var update = function () {
      // Update the next frame
      updateId = requestAnimationFrame(update);

      var now = Date.now();
      if (emitter) emitter.update((now - elapsed) * 0.001);

      if (emitter1) emitter1.update((now - elapsed) * 0.001);

      framerate.innerHTML = (1000 / (now - elapsed)).toFixed(2);

      elapsed = now;

      if (emitter && particleCount)
        particleCount.innerHTML = emitter.particleCount;

      // render the stage
      renderer.render(stage);
    };

    // Resize the canvas to the size of the window
    window.onresize = function (event) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderer.resize(canvas.width, canvas.height);
    };
    window.onresize();

    // Preload the particle images and create PIXI textures from it
    var urls,
      makeTextures = false;
    if (imagePaths.spritesheet) urls = [imagePaths.spritesheet];
    else if (imagePaths.textures) urls = imagePaths.textures.slice();
    else {
      urls = imagePaths.slice();
      makeTextures = true;
    }
    urls.push("images/bc.png");
    var loader = PIXI.loader;
    for (var i = 0; i < urls.length; ++i) loader.add("img" + i, urls[i]);
    loader.load(function () {
      bg = new PIXI.Sprite(PIXI.Texture.fromImage("images/bc.png"));
      bg.width = canvas.width;
      bg.height = canvas.height;
      //bg.tint = 0x000000;
      stage.addChild(bg);
      //collect the textures, now that they are all loaded
      var art;
      if (makeTextures) {
        art = [];
        for (var i = 0; i < imagePaths.length; ++i)
          art.push(PIXI.Texture.fromImage(imagePaths[i]));
      } else art = imagePaths.art;
      // Create the new emitter and attach it to the stage
      var emitterContainer;
      if (useParticleContainer) {
        emitterContainer = new PIXI.ParticleContainer();
        emitterContainer.setProperties({
          scale: true,
          position: true,
          rotation: true,
          uvs: true,
          alpha: true,
        });
      } else emitterContainer = new PIXI.Container();
      stage.addChild(emitterContainer);
      window.emitter = emitter = new PIXI.particles.Emitter(
        emitterContainer,
        art,
        config
      );
      window.emitter1 = emitter1 = new PIXI.particles.Emitter(
        emitterContainer,
        art,
        config1
      );
      if (stepColors)
        emitter.startColor = PIXI.particles.ParticleUtils.createSteppedGradient(
          config.color.list,
          stepColors
        );
      if (type == "path")
        emitter.particleConstructor = PIXI.particles.PathParticle;
      else if (type == "anim")
        emitter.particleConstructor = PIXI.particles.AnimatedParticle;

      emitter1.particleConstructor = PIXI.particles.AnimatedParticle;

      // Center on the stage
      emitter.updateOwnerPos(window.innerWidth / 2, window.innerHeight / 2);

      // setInterval(() => {
      //   if (!emitter) return;
      //   emitter.maxParticles = randomInteger(10, 1200);
      //   emitter.minimumScaleMultiplier = 0.1 + Math.random() / 10.0;
      //   emitter.frequency = 0.005 + (Math.random() - 0.5) / 100.0;
      //   var cl = randomInteger(1, 3);
      //   switch (cl) {
      //     case 1:
      //       emitter.startColor.value = {
      //         r: randomInteger(80, 255),
      //         g: 255,
      //         b: 255,
      //       };
      //       break;
      //     case 2:
      //       emitter.startColor.value = {
      //         r: 255,
      //         g: randomInteger(120, 255),
      //         b: 255,
      //       };
      //       break;
      //     case 3:
      //       emitter.startColor.value = {
      //         r: 255,
      //         g: 255,
      //         b: randomInteger(180, 255),
      //       };
      //       break;
      //   }

      //   emitter.emitterLifetime = Math.random() * 3.0;
      //   emitter.acceleration = { x: 0, y: randomInteger(100, 8000) };
      //   emitter.emit = true;
      //   emitter1.emit = true;
      //   emitter.resetPositionTracking();
      //   emitter1.resetPositionTracking();
      //   emitter.updateOwnerPos(
      //     window.innerWidth / 2,
      //     window.innerHeight * 1.2 - randomInteger(0, window.innerHeight * 1.2)
      //   );
      // }, 2000);

      // Click on the canvas to trigger
      canvas.addEventListener("mouseup", function (e) {
        if (!emitter) return;
        emitter.emit = true;
        emitter.resetPositionTracking();
        emitter.updateOwnerPos(e.offsetX || e.layerX, e.offsetY || e.layerY);
      });

      // Start the update
      update();
      var randomInteger = function (min, max) {
        // случайное число от min до (max+1)
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
      };
      //for testing and debugging
      window.destroyEmitter = function () {
        emitter.destroy();
        emitter = null;
        window.destroyEmitter = null;
        //cancelAnimationFrame(updateId);

        //reset SpriteRenderer's batching to fully release particles for GC
        if (
          renderer.plugins &&
          renderer.plugins.sprite &&
          renderer.plugins.sprite.sprites
        )
          renderer.plugins.sprite.sprites.length = 0;

        renderer.render(stage);
      };
    });
  };

  // Assign to global space
  window.ParticleExample = ParticleExample;
})(window);
