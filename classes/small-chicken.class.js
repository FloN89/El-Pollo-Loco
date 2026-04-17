class SmallChicken extends MovableObject {
    y = 378;
    width = 52;
    height = 52;
    speed = 0.45 + Math.random() * 0.65;
    isDeadChicken = false;

    imagePathsWalking = [
        'img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    imagePathDead = 'img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    /** Creates a small chicken. */
    constructor(x) {
        super();
        this.loadImage(this.imagePathsWalking[0]);
        this.loadImages(this.imagePathsWalking);
        this.loadImages([this.imagePathDead]);
        this.x = x;
        this.animate();
    }

    /** Starts movement and animation. */
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 130);
    }

    /** Moves the small chicken. */
    updateMovement() {
        if (this.isPaused()) {
            return;
        }

        this.moveLeft();
    }

    /** Checks whether the small chicken should pause. */
    isPaused() {
        return this.isDeadChicken || !this.world || !this.world.gameStarted || this.world.gameOver || this.world.gameWon;
    }

    /** Updates the chicken image. */
    updateAnimation() {
        if (this.isDeadChicken) {
            this.loadImage(this.imagePathDead);
            return;
        }

        this.playAnimation(this.imagePathsWalking);
    }

    /** Kills the small chicken. */
    die() {
        this.isDeadChicken = true;
        this.loadImage(this.imagePathDead);
    }
}