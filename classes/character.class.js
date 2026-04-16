class Character extends MovableObject {
    height = 230;
    y = 180;
    width = 120;
    speed = 10;
    groundY = 180;
    hurtDuration = 220;
    world = null;
    deathAnimationIndex = 0;
    lastActionAt = Date.now();
    sleepDelay = 15000;
    isSleeping = false;

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

    /** Erstellt den spielbaren Charakter. */
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

    /** Startet Bewegungs- und Bildwechselintervalle. */
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 80);
    }

    /** Aktualisiert die Charakterbewegung. */
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

    /** Prüft, ob der Charakter pausieren muss. */
    isMovementPaused() {
        return !this.world || !this.world.gameStarted || this.isDead() || this.world.gameOver || this.world.gameWon;
    }

    /** Stoppt das Laufgeräusch sicher. */
    stopRunningSound() {
        if (this.world) {
            this.world.updateRunningSound(false);
        }
    }

    /** Verarbeitet links und rechts. */
    handleHorizontalMovement() {
        let isMovingHorizontally = false;
        isMovingHorizontally = this.moveRightIfRequested() || isMovingHorizontally;
        isMovingHorizontally = this.moveLeftIfRequested() || isMovingHorizontally;
        return isMovingHorizontally;
    }

    /** Bewegt den Charakter nach rechts. */
    moveRightIfRequested() {
        if (!this.world.keyboard.RIGHT || this.x >= this.world.level.levelEndX) {
            return false;
        }

        this.moveRight();
        this.otherDirection = false;
        this.rememberAction();
        return true;
    }

    /** Bewegt den Charakter nach links. */
    moveLeftIfRequested() {
        if (!this.world.keyboard.LEFT || this.x <= 0) {
            return false;
        }

        this.moveLeft();
        this.otherDirection = true;
        this.rememberAction();
        return true;
    }

    /** Verarbeitet den Sprungknopf. */
    handleJumpInput() {
        if (this.world.keyboard.SPACE && !this.isAboveGround() && this.speedY === 0) {
            this.jump();
        }
    }

    /** Aktualisiert den Schlafzustand. */
    updateSleepState(isMovingHorizontally) {
        if (this.shouldStayAwake(isMovingHorizontally)) {
            this.rememberAction();
            return;
        }

        this.setSleepState(Date.now() - this.lastActionAt > this.sleepDelay);
    }

    /** Prüft, ob der Charakter wach bleiben soll. */
    shouldStayAwake(isMovingHorizontally) {
        return isMovingHorizontally || this.isAboveGround() || this.isHurt() || this.isActionKeyPressed();
    }

    /** Prüft, ob eine Aktionstaste gedrückt wird. */
    isActionKeyPressed() {
        return this.world.keyboard.LEFT || this.world.keyboard.RIGHT || this.world.keyboard.SPACE;
    }

    /** Merkt sich die letzte Aktion. */
    rememberAction() {
        this.lastActionAt = Date.now();
        this.setSleepState(false);
    }

    /** Setzt den Schlafstatus und Sound neu. */
    setSleepState(value) {
        if (this.isSleeping === value) {
            return;
        }

        this.isSleeping = value;
        this.world?.synchronizeAudioState();
    }

    /** Aktualisiert Kamera und Laufgeräusch. */
    updateWorldAfterMovement(isMovingHorizontally) {
        const isRunning = isMovingHorizontally && !this.isAboveGround();
        this.world.updateRunningSound(isRunning);
        this.world.cameraX = this.world.getCameraOffsetFor(this.x);
    }

    /** Aktualisiert die Bildauswahl. */
    updateAnimation() {
        if (!this.world) {
            return;
        }

        this.world.synchronizeAudioState();
        this.isDead() ? this.playDeadAnimation() : this.playAliveAnimation();
    }

    /** Spielt die passende Bildreihe im normalen Zustand. */
    playAliveAnimation() {
        if (this.world.gameOver || this.world.gameWon) {
            this.playAnimation(this.getEndStateImagePaths());
            return;
        }

        this.playAnimation(this.getImagePathsForCurrentState());
    }

    /** Liefert die Bildreihe für das Spielende. */
    getEndStateImagePaths() {
        return this.isAboveGround() ? this.imagePathsJumping : this.imagePathsIdle;
    }

    /** Liefert die Bildreihe für den aktuellen Zustand. */
    getImagePathsForCurrentState() {
        if (this.isHurt()) {
            return this.imagePathsHurt;
        }

        return this.isAboveGround() ? this.imagePathsJumping : this.getGroundImagePaths();
    }

    /** Liefert die Bildreihe am Boden. */
    getGroundImagePaths() {
        return this.isSleeping ? this.imagePathsSleep : this.getStandingImagePaths();
    }

    /** Liefert Idle oder Laufbilder. */
    getStandingImagePaths() {
        return this.isWalking() ? this.imagePathsWalking : this.imagePathsIdle;
    }

    /** Prüft, ob gerade gelaufen wird. */
    isWalking() {
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    /** Nutzt die kurze Hurt-Dauer des Charakters. */
isHurt(duration = this.hurtDuration) {
    return super.isHurt(duration);
}

    /** Startet einen Sprung mit Sound. */
    jump(power = 22) {
        if (this.speedY !== 0) {
            return;
        }

        this.rememberAction();
        super.jump(power);
        this.world.playJumpSound();
    }

    /** Reagiert auf Schaden, bleibt wach und aktualisiert die Healthbar. */
         hit(damage = 20) {
               super.hit(damage);
               this.rememberAction();

                  if (this.world && this.world.statusBar) {
                  this.world.statusBar.setPercentage(this.energy);
    }
}

    /** Spielt die Todesbilder nacheinander ab. */
    playDeadAnimation() {
        const path = this.getDeadAnimationPath();
        this.image = this.imageCache[path];
        this.deathAnimationIndex = Math.min(this.deathAnimationIndex + 1, this.imagePathsDead.length);
    }

    /** Liefert das richtige Todesbild. */
    getDeadAnimationPath() {
        const lastIndex = this.imagePathsDead.length - 1;
        const imageIndex = Math.min(this.deathAnimationIndex, lastIndex);
        return this.imagePathsDead[imageIndex];
    }
}