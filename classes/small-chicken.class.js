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

    /** Erstellt ein kleines Huhn. */
    constructor(x) {
        super();
        this.loadImage(this.imagePathsWalking[0]);
        this.loadImages(this.imagePathsWalking);
        this.loadImages([this.imagePathDead]);
        this.x = x;
        this.animate();
    }

    /** Startet Bewegung und Animation. */
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 130);
    }

    /** Bewegt das kleine Huhn. */
    updateMovement() {
        if (this.isPaused()) {
            return;
        }

        this.moveLeft();
    }

    /** Prüft, ob das kleine Huhn pausieren soll. */
    isPaused() {
        return this.isDeadChicken || !this.world || !this.world.gameStarted || this.world.gameOver || this.world.gameWon;
    }

    /** Aktualisiert das Huhnbild. */
    updateAnimation() {
        if (this.isDeadChicken) {
            this.loadImage(this.imagePathDead);
            return;
        }

        this.playAnimation(this.imagePathsWalking);
    }

    /** Lässt das kleine Huhn sterben. */
    die() {
        this.isDeadChicken = true;
        this.loadImage(this.imagePathDead);
    }
}