class Character extends MovableObject {
    height = 230;
    y = 180;
    width = 120;
    speed = 10;
    groundY = 180;
    hurtDuration = 220;
    world = null;
    deathAnimationIndex = 0;

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

    // Erstellt den spielbaren Charakter.
    constructor() {
        super();
        this.loadImage(this.imagePathsIdle[0]);
        this.loadImages(this.imagePathsWalking);
        this.loadImages(this.imagePathsJumping);
        this.loadImages(this.imagePathsHurt);
        this.loadImages(this.imagePathsDead);
        this.loadImages(this.imagePathsIdle);
        this.applyGravity();
    }

    // Startet Bewegungs- und Bildwechselintervalle.
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 80);
    }

    // Aktualisiert die Charakterbewegung.
    updateMovement() {
        if (this.isMovementPaused()) {
            this.stopRunningSound();
            return;
        }

        const isMovingHorizontally = this.handleHorizontalMovement();
        this.handleJumpInput();
        this.updateWorldAfterMovement(isMovingHorizontally);
    }

    // Prüft, ob der Charakter pausieren muss.
    isMovementPaused() {
        return !this.world || !this.world.gameStarted || this.isDead() || this.world.gameOver || this.world.gameWon;
    }

    // Stoppt das Laufgeräusch sicher.
    stopRunningSound() {
        if (this.world) {
            this.world.updateRunningSound(false);
        }
    }

    // Verarbeitet links und rechts.
    handleHorizontalMovement() {
        let isMovingHorizontally = false;
        isMovingHorizontally = this.moveRightIfRequested() || isMovingHorizontally;
        isMovingHorizontally = this.moveLeftIfRequested() || isMovingHorizontally;
        return isMovingHorizontally;
    }

    // Bewegt den Charakter nach rechts.
    moveRightIfRequested() {
        if (!this.world.keyboard.RIGHT || this.x >= this.world.level.levelEndX) {
            return false;
        }

        this.moveRight();
        this.otherDirection = false;
        return true;
    }

    // Bewegt den Charakter nach links.
    moveLeftIfRequested() {
        if (!this.world.keyboard.LEFT || this.x <= 0) {
            return false;
        }

        this.moveLeft();
        this.otherDirection = true;
        return true;
    }

    // Verarbeitet den Sprungknopf.
    handleJumpInput() {
        if (this.world.keyboard.SPACE && !this.isAboveGround() && this.speedY === 0) {
            this.jump();
        }
    }

    // Aktualisiert Kamera und Laufgeräusch.
    updateWorldAfterMovement(isMovingHorizontally) {
        const isRunning = isMovingHorizontally && !this.isAboveGround();
        this.world.updateRunningSound(isRunning);
        this.world.cameraX = this.world.getCameraOffsetFor(this.x);
    }

    // Aktualisiert die Bildauswahl.
    updateAnimation() {
        if (!this.world) {
            return;
        }

        this.isDead() ? this.playDeadAnimation() : this.playAliveAnimation();
    }

    // Spielt die passende Bildreihe im normalen Zustand.
    playAliveAnimation() {
        if (this.world.gameOver || this.world.gameWon) {
            this.playAnimation(this.getEndStateImagePaths());
            return;
        }

        this.playAnimation(this.getImagePathsForCurrentState());
    }

    // Liefert die Bildreihe für das Spielende.
    getEndStateImagePaths() {
        return this.isAboveGround() ? this.imagePathsJumping : this.imagePathsIdle;
    }

    // Liefert die Bildreihe für den aktuellen Zustand.
    getImagePathsForCurrentState() {
        if (this.isHurt()) {
            return this.imagePathsHurt;
        }

        if (this.isAboveGround()) {
            return this.imagePathsJumping;
        }

        return this.isWalking() ? this.imagePathsWalking : this.imagePathsIdle;
    }

    // Prüft, ob gerade gelaufen wird.
    isWalking() {
        return this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    }

    // Startet einen Sprung mit Sound.
    jump(power = 22) {
    if (this.speedY !== 0) {
        return;
    }

    super.jump(power);
    this.world.playJumpSound();
}

    // Spielt die Todesbilder nacheinander ab.
    playDeadAnimation() {
        const path = this.getDeadAnimationPath();
        this.image = this.imageCache[path];
        this.deathAnimationIndex = Math.min(this.deathAnimationIndex + 1, this.imagePathsDead.length);
    }

    // Liefert das richtige Todesbild.
    getDeadAnimationPath() {
        const lastIndex = this.imagePathsDead.length - 1;
        const imageIndex = Math.min(this.deathAnimationIndex, lastIndex);
        return this.imagePathsDead[imageIndex];
    }
}