import Controller from "./Controller.js";
import * as config from "./js/config.js";
import "./js/sidebar.js";

new Controller(config.imagePaths, config.particleConfig, "anim");
