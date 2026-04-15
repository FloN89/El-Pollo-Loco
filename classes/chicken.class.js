class Chicken extends MovableObject {
    height = 50;
    y = 370;
    width = 50;
    isDeadChicken = false;

    IMAGES_WALKING = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    IMAGE_DEAD = 'img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    constructor() {
        super();
        this.loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.IMAGE_DEAD]);
        this.x = 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (!this.isDeadChicken) {
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.isDeadChicken) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 150);
    }

    die() {
        this.isDeadChicken = true;
        this.speed = 0;
        this.img = this.imageCache[this.IMAGE_DEAD];
    }
}