class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    groundY = 180;
    gravityInterval = null;

    applyGravity() {
        if (this.gravityInterval) {
            return;
        }

        this.gravityInterval = setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;

                if (!this.isAboveGround() && this.speedY < 0) {
                    this.y = this.getGroundY();
                    this.speedY = 0;
                }
            }
        }, 1000 / 25);
    }

    getGroundY() {
        return this.groundY;
    }

    isAboveGround() {
        if (this instanceof ThrowableObjects) {
            return this.y < this.groundY || this.speedY > 0;
        }

        return this.y < this.getGroundY();
    }

    iscolliding(mo) {
        return this.x + this.width > mo.x &&
               this.y + this.height > mo.y &&
               this.x < mo.x + mo.width &&
               this.y < mo.y + mo.height;
    }

    hit(amount = 5) {
        if (this.isDead()) {
            return;
        }

        this.energy -= amount;

        if (this.energy < 0) {
            this.energy = 0;
        }

        this.lastHit = new Date().getTime();
    }

    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    isDead() {
        return this.energy === 0;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    jump(power = 30) {
        this.speedY = power;
    }
}