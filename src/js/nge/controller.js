nge.App[nge.appNS].Com.BigWinUni.Controller = nge.Com.Base.extend(function () {

    this.LOOP_TYPES = {
        STRETCH:    'stretch',
        LOOP:       'loop'
    };

    this.spinButton     = null;
    this.counter        = null;
    this.container      = null;
    this.coinsEmitter   = null;
    this.cfg            = null;
    this.subscribed     = null;
    this.mainAnim       = null;

    this.loopsCount     = null;
    this.loopSpeed      = 1;

    this.counterAnimDummySprite = null;

    let _transportClosed = false;

    this.STAGES = {
        NONE:           0,
        ODOMETER:       1,
        AFTER_ODOMETER: 2
    };

    this.frameToMs = (frame) => {
        return frame * 30;
    };

    this.jumpToFrame = (trackIndex, frame) => {
        const jumpTrackTime = this.frameToMs(frame) / 1000;
        this.mainAnim.spine.state.getCurrent(trackIndex).trackTime = jumpTrackTime;
    };

    this.speedupTrack = (trackIndex, timeScale) => {
        this.mainAnim.spine.state.getCurrent(trackIndex).timeScale = timeScale;
    };

    this.stopTrack = (trackIndex) => {
        const state = this.mainAnim.spine.state;

        if (state.getCurrent(trackIndex)) {
            state.setEmptyAnimation(trackIndex, 0);
        }
    };

    this.getOdometerDuration = (totalWin) => {
        const totalBet  = nge.Lib.Money.toCoins(nge.localData.get('totalBet.value'));
        const multedBet = +nge.localData.get('BIGWIN_MULT') * totalBet;

        for (let i = 0; i < this.cfg.odometerDurations.length; i++) {
            const cfg = this.cfg.odometerDurations[i];
            if (totalWin >= (multedBet * cfg.mult)) {
                return cfg;
            }
        }
        return this.cfg.odometerDurations[0];
    };

    /**
     * Fire on start of show
     * @param {number} totalWin total win data
     */
    this.playStage0 = (totalWin) => {
        this.animData = this.getOdometerDuration(totalWin);
        const duration = this.animData.duration;

        this.mainAnim.setAnimationByName(this.cfg.mainTrackIndex, this.cfg.mainTrackName);
        this.speedupTrack(this.cfg.mainTrackIndex, 1);

        if (this.cfg.loopType === this.LOOP_TYPES.LOOP) {
            const framesCount       = this.cfg.loopEndFrame - this.cfg.loopStartFrame;
            const loopDurationInMs  = this.frameToMs(framesCount);
            let loops               = 1;

            if (duration >= loopDurationInMs)
                loops = Math.floor(duration / loopDurationInMs);

            const moreLoopOverhead = Math.abs(duration - (loopDurationInMs * loops));
            const lessLoopOverhead = Math.abs(duration - (loopDurationInMs * (loops - 1)));

            if (moreLoopOverhead >= lessLoopOverhead && loops > 1)
                loops--;

            this.loopSpeed = duration / (loopDurationInMs * loops);
            this.loopsCount = loops;
        }

        nge.observer.fire('odometer.init', '^bigWinAmount');
        nge.observer.fire('odometer.go',
            {
                to: totalWin,
                duration: duration,
                effect: this.cfg.textAnimationParams
            });

        this.stage = this.STAGES.ODOMETER;
    };

    /**
     * Fire on 'startLoop' event
     */
    this.playStage1 = () => {
        if (this.stage === this.STAGES.AFTER_ODOMETER || !this.animData)
            return;

        if (this.cfg.loopType === this.LOOP_TYPES.STRETCH) {
            const animationStart    = this.mainAnim.spine.state.getCurrent(this.cfg.mainTrackIndex).trackTime * 1000;
            const animationEnd      = (this.cfg.loopEndFrame / 30) * 1000;
            const timeScale         = (animationEnd - animationStart) / (this.animData.duration - animationStart);

            this.speedupTrack(this.cfg.mainTrackIndex, timeScale);
        }
        else if (this.cfg.loopType === this.LOOP_TYPES.LOOP) {
            this.speedupTrack(this.cfg.mainTrackIndex, this.loopSpeed);
        }
    };

    /**
     * Fire on 'endLoop' event
     */
    this.playStage2 = () => {
        if (this.cfg.loopType === this.LOOP_TYPES.STRETCH) {
            this.speedupTrack(this.cfg.mainTrackIndex, 1);
        }
        else if (this.cfg.loopType === this.LOOP_TYPES.LOOP) {
            if (--this.loopsCount === 0)
                return;

            this.jumpToFrame(this.cfg.mainTrackIndex, this.cfg.loopStartFrame);
        }
    };

    /**
     * Show big win
     * @param {object} data win data
     * @return {boolean} result
     */
    this.show = (data) => {
        const totalWin = data.totalWin;

        if (!totalWin)
            return false;

        nge.localData.set('win.winType', 'big');
        this.winAmount          = totalWin;

        nge.observer.fire('win.big.show');

        this.counter.visible    = false;
        this.container.visible  = true;
        this.loopsCount         = null;
        this.loopSpeed          = 1;

        this.playStage0(totalWin);

        if (this.cfg.followSlotName) {
            this.counterAnimDummySprite = this.mainAnim.findSprite(this.cfg.followSlotName);
            if (!this.counterAnimDummySprite) {
                throw new Error(`Can't find slot ${this.cfg.followSlotName} in big win animation`);
            }
        }

        let sprite = this.counterAnimDummySprite.currentSprite;
        if (this.counter.parent !== sprite.parent) {
            sprite.visible = false;
            this.counter.scale.y = -this.counter.scale.y;
            sprite.parent.addChild(this.counter);
        }

        this.counter.visible = true;

        if (this.cfg.parallelLoopTracks) {
            this.cfg.parallelLoopTracks.forEach(v => {
                const trackName     = v.name;
            const trackIndex    = v.index;
            this.mainAnim.setAnimationByName(trackIndex, trackName, true);
        });
        }

        return true;
    };

    /**
     * Fire on counter stops clicking
     */
    this.onOdometerComplete = () => {
        if (nge.localData.get('win.winType') !== 'big') return;
        nge.observer.fire('win.big.counterComplete');

        const onComplete = (track) => {
            if (track.trackIndex === this.cfg.mainTrackIndex)
                this.cycleComplete();
        };

        this.mainAnim.spine.state.listeners.forEach((e, i) => {
            if (e.complete && e.complete.toString() === onComplete.toString()) {
            this.mainAnim.spine.state.listeners.splice(i, 1);
            return;
        }
    });

        nge.observer.fire('win.big.phase2');
        this.stage = this.STAGES.AFTER_ODOMETER;
        this.mainAnim.spine.state.addListener({complete: onComplete});
    };

    this.hideElements = () => {
        this.container.visible  = false;
        this.counter.visible    = true;
        this.counter.text       = '0';

        nge.objects.checkInputOnTop(this.spinButton);

        if (this.cfg.parallelLoopTracks) {
            this.cfg.parallelLoopTracks.forEach(v => {
                const trackIndex = v.index;
            this.stopTrack(trackIndex);
        });
        }
    };

    this.cycleComplete = () => {
        this.hideElements();
        this.stage = this.STAGES.NONE;
        nge.localData.set('win.winType', 'none');
        this.winAmount = 0;
        if(!_transportClosed) {
            nge.observer.fire('win.brain.animationComplete');
            nge.observer.fire('win.big.hide');
        }
    };

    this.abortOdometerExtension = () => {
        // extension method
    };

    this.abort = () => {
        switch(this.stage) {

            case this.STAGES.ODOMETER:
                nge.observer.fire('odometer.stop');
                this.jumpToFrame(this.cfg.mainTrackIndex, this.cfg.jump2Frame);
                this.speedupTrack(this.cfg.mainTrackIndex, 1);
                this.abortOdometerExtension();
                this.onOdometerComplete();
                break;

            case this.STAGES.AFTER_ODOMETER:
                if (this.mainAnim.spine.state.getCurrent(this.cfg.mainTrackIndex).trackTime < (this.frameToMs(this.cfg.jump2Frame)) / 1000) {
                    this.jumpToFrame(this.cfg.mainTrackIndex, this.cfg.jump2Frame);
                }
                this.speedupTrack(this.cfg.mainTrackIndex, 2);
                break;

            default:
                // NOTE nothing to skip;
                break;
        }
    };

    this.onTransportClose = () => {
        nge.localData.set('win.winType', 'none');
        this.loopSpeed = 1;
        this.animData = null;
        _transportClosed = true;
    };

    this.subscribe = () => {
        nge.observer.add('win.hide', this.hideElements);
        nge.observer.add('win.bigWin.startShow', this.show);
        nge.observer.add('odometer.complete', this.onOdometerComplete);
        nge.observer.add('win.abortWin', this.abort);
        nge.observer.add('Transport.close', this.onTransportClose);
    };

    this.inputInit = () => {
        this.mainAnim.interactive = true;
        this.mainAnim.inputEnableChildren = true;
        this.mainAnim.onChildInputDown.add(this.abort);
    };

    this.subscribeToSpineEvents = () => {
        const events = this.mainAnim.spine.spineData.events;

        const hasEventStart = events.findIndex(v => v.name === 'startLoop') !== -1;
        if (!hasEventStart) throw new Error('Big win must contain "startLoop" event');

        const hasEventEnd = events.findIndex(v => v.name === 'endLoop') !== -1;
        if (!hasEventEnd) throw new Error('Big win must contain "endLoop" event');

        this.mainAnim.onEvent.add((i, d) => {
            // loop events
            if (d.data.name === 'startLoop') {
            this.playStage1();
        } else if (d.data.name === 'endLoop') {
            this.playStage2();
        }

        // emitter events
        if (this.coinsEmitters &&
            this.cfg.emitter &&
            this.cfg.emitter.event === d.data.name) {

            for (var iEmitter in this.coinsEmitters) {
                var emitter = this.coinsEmitters[iEmitter];
                if (emitter.on) continue;
                emitter.start();
                return;
            }
        }
    }, this);
    };

    this.emitterInit = () => {
        this.coinsEmitters = nge.findAll('^bigWinEmitter');
    };

    this.init = () => {
        this.emitterInit();
    };

    this.create = () => {
        this.createDefault();
        this.cfg = this.getInstance('Cfg').get();
        this.spinButton = nge.findOne('^spinButtonButton');

        const parent = nge.findOne('^' + this.cfg.parentContainerName);
        if (!parent)
            throw new Error('Cant\'t find parent with: ' + this.cfg.parentContainerName);

        this.stage = this.STAGES.NONE;
        this.winAmount = 0;
        this.container = nge.findOne('^bigWinContainer');
        parent.addChild(this.container);
        this.counter = nge.findOne('^bigWinAmount');
        this.counter.visible = false;

        this.mainAnim = nge.findOne('^bigWinAnim');
        this.init();
        this.inputInit();
        this.subscribeToSpineEvents();

        if (!this.subscribed) {
            this.subscribe();
            this.subscribed = true;
        }

        _transportClosed = false;
    };
});
