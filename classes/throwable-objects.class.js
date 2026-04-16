class ThrowableObjects extends MovableObject {
    width = 60;
    height = 70;
    groundY = 360;
    speedY = 22;
    throwSpeed = 5;
    isBroken = false;
    isFinished = false;

    imagePathsFlying = [
        'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
        'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
    ];

    imagePathsSplash = [
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        'img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    // Erstellt eine geworfene Flasche.
    constructor(x, y, direction = 1) {
        super();
        this.loadImage(this.imagePathsFlying[0]);
        this.loadImages(this.imagePathsFlying);
        this.loadImages(this.imagePathsSplash);
        this.x = x;
        this.y = y;
        this.throwSpeed *= direction;
        this.applyGravity();
        this.animate();
    }

    // Startet Flug und Animation.
    animate() {
        setInterval(this.updateFlight.bind(this), 1000 / 60);
        setInterval(this.updateAnimation.bind(this), 90);
    }

    // Bewegt die Flasche im Flug.
    updateFlight() {
        if (this.isBroken || this.isFinished) {
            return;
        }

        this.x += this.throwSpeed;

        if (this.hasHitGround()) {
            this.finish();
        }
    }

    // Prüft, ob die Flasche auf dem Boden angekommen ist.
    hasHitGround() {
        return this.y >= this.groundY && this.speedY <= 0;
    }

    // Wechselt das passende Bild.
    updateAnimation() {
        if (this.isBroken) {
            this.playAnimation(this.imagePathsSplash);
            return;
        }

        this.playAnimation(this.imagePathsFlying);
    }

    // Löst die Splash-Animation aus.
    splash() {
        if (this.isBroken || this.isFinished) {
            return;
        }

        this.isBroken = true;
        this.throwSpeed = 0;
        this.speedY = 0;
        this.acceleration = 0;
        this.scheduleFinish();
    }

    // Markiert die Flasche später als fertig.
    scheduleFinish() {
        setTimeout(this.finish.bind(this), 350);
    }

    // Beendet das Wurfobjekt.
    finish() {
        this.isFinished = true;
        this.throwSpeed = 0;
        this.speedY = 0;
        this.acceleration = 0;
    }
}