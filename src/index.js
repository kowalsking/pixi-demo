var app = new PIXI.Application(window.innerWidth, window.innerHeight);
document.body.appendChild(app.view);

app.stop();

// load spine data
PIXI.loader.add("bigwin", "bigwin/big_win_animation.json").load(onAssetsLoaded);

var dragon = null;

function onAssetsLoaded(loader, res) {
  // instantiate the spine animation
  dragon = new PIXI.spine.Spine(res.bigwin.spineData);
  dragon.skeleton.setToSetupPose();
  dragon.autoUpdate = false;

  // create a container for the spine animation and add the animation to it
  var dragonCage = new PIXI.Container();
  dragonCage.addChild(dragon);

  // measure the spine animation and position it inside its container to align it to the origin
  var localRect = dragon.getLocalBounds();
  dragon.position.set(-localRect.x, -localRect.y);

  dragonCage.scale.set(1);
  dragonCage.position.set(window.innerWidth * 0.5, window.innerHeight * 0.5);

  // add the container to the stage
  app.stage.addChild(dragonCage);

  // once position and scaled, set the animation to play
  dragon.state.setAnimation(0, "big_win_all", true);

  app.start();
}

app.ticker.add(function () {
  // update the spine animation, only needed if dragon.autoupdate is set to false
  dragon.update(0.01666666666667); // HARDCODED FRAMERATE!
});
