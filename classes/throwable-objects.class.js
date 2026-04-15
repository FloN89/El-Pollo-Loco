class ThrowableObjects extends MovableObject {
    width = 60;
    height = 60;
    groundY = 360;
    isBroken = false;
    isFinished = false;
    direction = 1;
    speedX = 10;

    IMAGES_ROTATION = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    IMAGES_SPLASH = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    constructor(x, y, direction = 1) {
        super();
        this.loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages(this.IMAGES_SPLASH);
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.otherDirection = direction < 0;
        this.throw();
        this.animate();
    }

    throw() {
        this.speedY = 22;
        this.speedX = 12;
        this.applyGravity();

        this.throwInterval = setInterval(() => {
            if (!this.isBroken) {
                this.x += this.speedX * this.direction;

                if (this.y >= this.groundY) {
                    this.y = this.groundY;
                    this.splash();
                }
            }
        }, 25);
    }

    animate() {
        this.rotationInterval = setInterval(() => {
            if (!this.isBroken) {
                this.playAnimation(this.IMAGES_ROTATION);
            }
        }, 80);
    }

    splash() {
        if (this.isBroken) {
            return;
        }

        this.isBroken = true;
        this.speedX = 0;
        this.speedY = 0;

        clearInterval(this.throwInterval);
        clearInterval(this.rotationInterval);

        let currentFrame = 0;

        this.splashInterval = setInterval(() => {
            this.img = this.imageCache[this.IMAGES_SPLASH[currentFrame]];
            currentFrame++;

            if (currentFrame >= this.IMAGES_SPLASH.length) {
                clearInterval(this.splashInterval);
                this.isFinished = true;
            }
        }, 50);
    }
}