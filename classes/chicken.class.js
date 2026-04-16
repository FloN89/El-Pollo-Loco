class Chicken extends MovableObject {
    height = 50;
    y = 370;
    width = 50;
    groundY = 370;
    isDeadChicken = false;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGE_DEAD = 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    constructor(x = 200 + Math.random() * 500) {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.IMAGE_DEAD]);
        this.x = x;
        this.speed = 0.4 + Math.random() * 0.8;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (
                typeof world === 'undefined' ||
                !world ||
                !world.gameStarted ||
                world.gameOver ||
                world.gameWon ||
                this.isDeadChicken
            ) {
                return;
            }

            this.moveLeft();
        }, 1000 / 60);

        setInterval(() => {
            if (
                typeof world === 'undefined' ||
                !world ||
                !world.gameStarted ||
                world.gameOver ||
                world.gameWon ||
                this.isDeadChicken
            ) {
                return;
            }

            this.playAnimation(this.IMAGES_WALKING);
        }, 150);
    }

    die() {
        this.isDeadChicken = true;
        this.speed = 0;
        this.img = this.imageCache[this.IMAGE_DEAD];
    }
}