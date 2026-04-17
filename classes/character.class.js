class Character extends MovableObject {
    height = 230;
    y = 200;
    width = 120;
    speed = 10;
    groundY = 200;
    hurtDuration = 220;
    world = null;
    deathAnimationIndex = 0;
    lastActionAt = Date.now();
    sleepDelay = 15000;
    isSleeping = false;
    wasAboveGround = false;
    jumpAnimationIndex = 0;
    landingFrameUntil = 0;

    imagePathsWalking = [
        'img/2_character_pepe/2_walk/W-21.png',
        'img/2_character_pepe/2_walk/W-22.png',
        'img/2_character_pepe/2_walk/W-23.png',
        'img/2_character_pepe/2_walk/W-24.png',
        'img/2_character_pepe/2_walk/W-25.png',
        'img/2_character_pepe/2_walk/W-26.png'
    ];

    imagePathsJumping = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png'
    ];

    imagePathsHurt = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png'
    ];

    imagePathsDead = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png'
    ];

    imagePathsIdle = [
        'img/2_character_pepe/1_idle/idle/I-1.png',
        'img/2_character_pepe/1_idle/idle/I-2.png',
        'img/2_character_pepe/1_idle/idle/I-3.png',
        'img/2_character_pepe/1_idle/idle/I-4.png',
        'img/2_character_pepe/1_idle/idle/I-5.png',
        'img/2_character_pepe/1_idle/idle/I-6.png',
        'img/2_character_pepe/1_idle/idle/I-7.png',
        'img/2_character_pepe/1_idle/idle/I-8.png'
    ];

    imagePathsSleep = [
        'img/2_character_pepe/1_idle/long_idle/I-11.png',
        'img/2_character_pepe/1_idle/long_idle/I-12.png',
        'img/2_character_pepe/1_idle/long_idle/I-13.png',
        'img/2_character_pepe/1_idle/long_idle/I-14.png',
        'img/2_character_pepe/1_idle/long_idle/I-15.png',
        'img/2_character_pepe/1_idle/long_idle/I-16.png',
        'img/2_character_pepe/1_idle/long_idle/I-17.png',
        'img/2_character_pepe/1_idle/long_idle/I-18.png',
        'img/2_character_pepe/1_idle/long_idle/I-19.png',
        'img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    /** Creates the playable character. */
    constructor() {
        super();
        this.loadImage(this.imagePathsIdle[0]);
        this.loadImages(this.imagePathsWalking);
        this.loadImages(this.imagePathsJumping);
        this.loadImages(this.imagePathsHurt);
        this.loadImages(this.imagePathsDead);
        this.loadImages(this.imagePathsIdle);
        this.loadImages(this.imagePathsSleep);
        this.applyGravity();
    }

    /** Starts the movement and animation intervals. */
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 80);
    }

    /** Updates the character movement. */
    updateMovement() {
        if (this.isMovementPaused()) {
            this.stopRunningSound();
            return;
        }

        const isMovingHorizontally = this.handleHorizontalMovement();
        this.handleJumpInput();
        this.updateSleepState(isMovingHorizontally);
        this.updateWorldAfterMovement(isMovingHorizontally);
    }

    /** Checks whether the character must pause. */
    isMovementPaused() {
        return !this.world || !this.world.gameStarted || this.isDead() || this.world.gameOver || this.world.gameWon;
    }

    /** Stops the running sound safely. */
    stopRunningSound() {
        if (this.world) {
            this.world.updateRunningSound(false);
        }
    }

    /** Handles left and right movement. */
    handleHorizontalMovement() {
        let isMovingHorizontally = false;
        isMovingHorizontally = this.moveRightIfRequested() || isMovingHorizontally;
        isMovingHorizontally = this.moveLeftIfRequested() || isMovingHorizontally;
        return isMovingHorizontally;
    }

    /** Moves the character to the right. */
    moveRightIfRequested() {
        if (!this.world.keyboard.RIGHT || this.x >= this.world.level.levelEndX) {
            return false;
        }

        this.moveRight();
        this.otherDirection = false;
        this.rememberAction();
        return true;
    }

    /** Moves the character to the left. */
    moveLeftIfRequested() {
        if (!this.world.keyboard.LEFT || this.x <= 0) {
            return false;
        }

        this.moveLeft();
        this.otherDirection = true;
        this.rememberAction();
        return true;
    }

    /** Handles jump input. */
    handleJumpInput() {
        if (this.world.keyboard.SPACE && !this.isAboveGround() && this.speedY === 0) {
            this.jump();
        }
    }

    /** Updates the sleep state. */
    updateSleepState(isMovingHorizontally) {
        if (this.shouldStayAwake(isMovingHorizontally)) {
            this.rememberAction();
            return;
        }

        this.setSleepState(Date.now() - this.lastActionAt > this.sleepDelay);
    }

    /** Checks whether the character should stay awake. */
    shouldStayAwake(isMovingHorizontally) {
        return isMovingHorizontally || this.isAboveGround() || this.isHurt() || this.isActionKeyPressed();
    }

    /** Checks whether an action key is pressed. */
    isActionKeyPressed() {
        return this.world.keyboard.LEFT || this.world.keyboard.RIGHT || this.world.keyboard.SPACE;
    }

    /** Stores the timestamp of the last action. */
    rememberAction() {
        this.lastActionAt = Date.now();
        this.setSleepState(false);
    }

    /** Updates the sleep state and audio. */
    setSleepState(value) {
        if (this.isSleeping === value) {
            return;
        }

        this.isSleeping = value;
        this.world?.synchronizeAudioState();
    }

    /** Updates the camera and running sound. */
    updateWorldAfterMovement(isMovingHorizontally) {
        const isRunning = isMovingHorizontally && !this.isAboveGround();
        this.world.updateRunningSound(isRunning);
        this.world.cameraX = this.world.getCameraOffsetFor(this.x);
    }

    /** Updates the selected animation image. */
    updateAnimation() {
        if (!this.world) {
            return;
        }

        this.world.synchronizeAudioState();
        this.updateJumpAnimationState();
        this.isDead() ? this.playDeadAnimation() : this.playAliveAnimation();
    }

    /** Updates the jump animation state. */
    updateJumpAnimationState() {
        const isInAir = this.isAboveGround();

        if (isInAir && !this.wasAboveGround) {
            this.startJumpAnimation();
        }

        if (!isInAir && this.wasAboveGround) {
            this.finishJumpAnimation();
        }

        this.wasAboveGround = isInAir;
    }

    /** Starts the jump animation with the first frame. */
    startJumpAnimation() {
        this.jumpAnimationIndex = 0;
        this.landingFrameUntil = 0;
        this.showJumpFrame(0);
    }

    /** Finishes the jump animation on the last frame. */
    finishJumpAnimation() {
        this.jumpAnimationIndex = this.imagePathsJumping.length - 1;
        this.landingFrameUntil = Date.now() + 100;
        this.showJumpFrame(this.jumpAnimationIndex);
    }

    /** Checks whether the landing frame should still be shown. */
    shouldShowLandingFrame() {
        return Date.now() < this.landingFrameUntil;
    }

    /** Plays the correct animation in the normal state. */
    playAliveAnimation() {
        if (this.world.gameOver || this.world.gameWon) {
            this.playAnimation(this.getEndStateImagePaths());
            return;
        }

        if (this.isHurt()) {
            this.playAnimation(this.imagePathsHurt);
            return;
        }

        if (this.isAboveGround()) {
            this.playJumpAnimation();
            return;
        }

        if (this.shouldShowLandingFrame()) {
            this.showJumpFrame(this.imagePathsJumping.length - 1);
            return;
        }

        this.playAnimation(this.getGroundImagePaths());
    }

    /** Plays the jump animation without looping back to the first frame. */
    playJumpAnimation() {
        this.jumpAnimationIndex = Math.max(this.jumpAnimationIndex, this.getJumpFrameIndex());
        this.showJumpFrame(this.jumpAnimationIndex);
    }

    /** Returns the correct jump frame index for the current vertical speed. */
    getJumpFrameIndex() {
        const thresholds = [16, 12, 8, 4, 0, -4, -8, -12];
        const index = thresholds.findIndex((threshold) => this.speedY >= threshold);
        return index === -1 ? this.imagePathsJumping.length - 1 : index;
    }

    /** Draws a specific jump frame. */
    showJumpFrame(index) {
        const clampedIndex = Math.max(0, Math.min(index, this.imagePathsJumping.length - 1));
        const path = this.imagePathsJumping[clampedIndex];
        this.image = this.imageCache[path];
    }

    /** Returns the image sequence for the game end. */
    getEndStateImagePaths() {
        return this.isAboveGround() ? this.imagePathsJumping : this.imagePathsIdle;
    }

    /** Returns the image sequence for the current state. */
    getGroundImagePaths() {
        return this.isSleeping ? this.imagePathsSleep : this.getStandingImagePaths();
    }

    /** Returns the idle or walking images. */
    getStandingImagePaths() {
        return this.isWalking() ? this.imagePathsWalking : this.imagePathsIdle;
    }

    /** Checks whether the character is walking. */
    isWalking() {
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    /** Uses the character's shorter hurt duration. */
    isHurt(duration = this.hurtDuration) {
        return super.isHurt(duration);
    }

    /** Starts a jump with sound. */
    jump(power = 22) {
        if (this.speedY !== 0) {
            return;
        }

        this.rememberAction();
        this.startJumpAnimation();
        super.jump(power);
        this.world.playJumpSound();
    }

    /** Starts a bounce without playing the jump sound again. */
    bounce(power = 15) {
        this.rememberAction();
        this.startJumpAnimation();
        super.jump(power);
    }

    /** Responds to damage, stays awake, and updates the health bar. */
    hit(damage = 20) {
        super.hit(damage);
        this.rememberAction();

        if (this.world && this.world.statusBar) {
            this.world.statusBar.setPercentage(this.energy);
        }
    }

    /** Plays the death images one after another. */
    playDeadAnimation() {
        const path = this.getDeadAnimationPath();
        this.image = this.imageCache[path];
        this.deathAnimationIndex = Math.min(this.deathAnimationIndex + 1, this.imagePathsDead.length);
    }

    /** Returns the correct death image path. */
    getDeadAnimationPath() {
        const lastIndex = this.imagePathsDead.length - 1;
        const imageIndex = Math.min(this.deathAnimationIndex, lastIndex);
        return this.imagePathsDead[imageIndex];
    }
}