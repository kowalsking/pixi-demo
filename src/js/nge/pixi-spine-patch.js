PIXI.spine.Spine.prototype.replaceSpineRegion = function (attachment, sprite, region, assetKey) {
    const replacement = region.replacement;
    const atlas = (replacement) ? nge.assets.getAtlasForTexture(replacement.name): false;

    if(atlas && nge.wrap.cache.hasAtlas(atlas)) {
        sprite.region.texture = nge.wrap.cache.getAtlas(atlas).textures[replacement.name];
        sprite.replaced = true;
        this.setSpriteRegion(sprite.attachment, sprite, sprite.region);
    }else if(assetKey){
        var lazyTexture = nge.wrap.cache.getTexture('lazy_' + assetKey);

        if(lazyTexture){
            sprite.region.texture = lazyTexture;
            sprite.texture = lazyTexture;
            sprite.replaced = true;

            /*const scaleFactor = nge.assets.getQualityFactor();
            sprite.scale.x = scaleFactor * attachment.scaleX * attachment.width / region.originalWidth;
            sprite.scale.y = scaleFactor * -attachment.scaleY * attachment.height / region.originalHeight;*/
            this.setSpriteRegion(sprite.attachment, sprite, sprite.region);
        }
    }
};

PIXI.spine.Spine.prototype.setSpriteRegion = function (attachment, sprite, region) {
    sprite.region = region;
    sprite.attachment = attachment;
    sprite.texture = region.texture;

    if(region.replacement && !sprite.replaced)
        return this.replaceSpineRegion(attachment, sprite, region);

    const scaleFactor = nge.assets.getQualityFactor();

    if (!region.size) {
        sprite.scale.x = scaleFactor * attachment.scaleX * attachment.width / region.originalWidth;
        sprite.scale.y = scaleFactor * -attachment.scaleY * attachment.height / region.originalHeight;
    } else {
        sprite.scale.x = scaleFactor * region.size.width / region.originalWidth;
        sprite.scale.y = scaleFactor * -region.size.height / region.originalHeight;
    }
};

PIXI.spine.core.TextureAtlas.prototype.defaultLoad = PIXI.spine.core.TextureAtlas.prototype.load;

PIXI.spine.core.TextureAtlas.prototype.packedlLoad = function (atlasText) {
    var _this = this;
    var reader = new PIXI.spine.core.TextureAtlasReader(atlasText);
    var tuple = new Array(4);
    var page = null;
    var iterateParser = function () {
        while (true) {
            var line = reader.readLine();
            if (line == null) {
                return;
            }
            line = line.trim();
            if (line.length == 0)
                page = null;
            else if (!page) {
                page = new PIXI.spine.core.TextureAtlasPage();
                page.name = line;
                if (reader.readTuple(tuple) == 2) {
                    page.width = parseInt(tuple[0]);
                    page.height = parseInt(tuple[1]);
                    reader.readTuple(tuple);
                }
                reader.readTuple(tuple);
                page.minFilter = PIXI.spine.core.Texture.filterFromString(tuple[0]);
                page.magFilter = PIXI.spine.core.Texture.filterFromString(tuple[1]);
                var direction = reader.readValue();
                page.uWrap = PIXI.spine.core.TextureWrap.ClampToEdge;
                page.vWrap = PIXI.spine.core.TextureWrap.ClampToEdge;
                if (direction == "x")
                    page.uWrap = PIXI.spine.core.TextureWrap.Repeat;
                else if (direction == "y")
                    page.vWrap = PIXI.spine.core.TextureWrap.Repeat;
                else if (direction == "xy")
                    page.uWrap = page.vWrap = PIXI.spine.core.TextureWrap.Repeat;
                /*textureLoader(line, function (texture) {
                    page.baseTexture = texture;
                    if (!texture.hasLoaded) {
                        texture.width = page.width;
                        texture.height = page.height;
                    }
                    _this.pages.push(page);
                    page.setFilters();
                    if (!page.width || !page.height) {
                        page.width = texture.realWidth;
                        page.height = texture.realHeight;
                        if (!page.width || !page.height) {
                            console.log("ERROR spine atlas page " + page.name + ": meshes wont work if you dont specify size in atlas (http://www.html5gamedevs.com/topic/18888-pixi-spines-and-meshes/?p=107121)");
                        }
                    }
                    iterateParser();
                });*/
                iterateParser();
                _this.pages.push(page);
                break;
            }
            else {
                var region = new PIXI.spine.core.TextureAtlasRegion();
                region.name = line;
                region.page = page;
                var rotate = reader.readValue() == "true" ? 6 : 0;
                reader.readTuple(tuple);
                var x = parseInt(tuple[0]);
                var y = parseInt(tuple[1]);
                reader.readTuple(tuple);
                var width = parseInt(tuple[0]);
                var height = parseInt(tuple[1]);
                var resolution = 1;//page.baseTexture.resolution;
                x /= resolution;
                y /= resolution;
                width /= resolution;
                height /= resolution;
                //var frame = new PIXI.Rectangle(x, y, rotate ? height : width, rotate ? width : height);
                if (reader.readTuple(tuple) == 4) {
                    if (reader.readTuple(tuple) == 4) {
                        reader.readTuple(tuple);
                    }
                }
                //var originalWidth = parseInt(tuple[0]) / resolution;
                //var originalHeight = parseInt(tuple[1]) / resolution;
                reader.readTuple(tuple);
                //var offsetX = parseInt(tuple[0]) / resolution;
                //var offsetY = parseInt(tuple[1]) / resolution;
                //var orig = new PIXI.Rectangle(0, 0, originalWidth, originalHeight);
                //var trim = new PIXI.Rectangle(offsetX, originalHeight - height - offsetY, width, height);
                const atlas = nge.assets.getAtlasForTexture(region.name + '.png');
                let texture;
                if(nge.wrap.cache.hasAtlas(atlas)) {
                    texture = nge.wrap.cache.getAtlas(atlas).textures[region.name + '.png'];
                } else {
                    texture = nge.wrap.cache.getTexture('1px_empty');
                    region.replacement = {width: width, height: height, name: region.name + '.png'};
                }
                region.texture = texture;
                region.index = parseInt(reader.readValue());
                region.texture._updateUvs();
                _this.regions.push(region);
            }
        }
    };
    iterateParser();
};

PIXI.spine.core.TextureAtlas.prototype.load = function(atlasText, textureLoader, callback) {
    if(textureLoader)
        this.defaultLoad(atlasText, textureLoader, callback);
    else
        this.packedlLoad(atlasText);
};

PIXI.spine.core.AnimationState.prototype.trackEntry = function (trackIndex, animation, loop, last) {
    var entry = this.trackEntryPool.obtain();
    entry.trackIndex = trackIndex;
    entry.animation = animation;
    entry.loop = loop;
    entry.eventThreshold = 0;
    entry.attachmentThreshold = 0;
    entry.drawOrderThreshold = 0;
    entry.animationStart = 0;
    entry.animationEnd = animation.duration;
    entry.animationLast = -1;
    entry.nextAnimationLast = -1;
    entry.delay = 0;
    entry.trackTime = 0;
    entry.trackLast = -1;
    entry.nextTrackLast = -1;
    entry.trackEnd = Number.MAX_VALUE;
    if(!entry.timeScale){
        entry._timeScale = 1;
        Object.defineProperties(entry, {
            "timeScale": {
                "get": function() { return entry._timeScale * nge.statesManager.getTimeScale(); },
                "set": function(v) { entry._timeScale = v ; }
            }
        });
    }
    entry.alpha = 1;
    entry.interruptAlpha = 1;
    entry.mixTime = 0;
    entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
    return entry;
};
