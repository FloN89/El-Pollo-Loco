class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1.5;
    energy = 100;
    lastHit = 0;
    lastY = null;

    /** Applies gravity continuously. */
    applyGravity() {
        setInterval(this.updateGravity.bind(this), 1000 / 25);
    }

    /** Updates gravity. */
    updateGravity() {
        if (!this.shouldApplyGravity()) {
            this.lastY = this.y;
            return;
        }

        this.lastY = this.y;
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
        this.stopAtGroundLevel();
    }

    /** Checks whether gravity should be active. */
    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    /** Stops the object on the ground. */
    stopAtGroundLevel() {
        const groundY = this.groundY ?? 180;

        if (this.y <= groundY) {
            return;
        }

        this.y = groundY;
        this.speedY = 0;
    }

    /** Checks whether the object is above the ground. */
    isAboveGround() {
        if (this instanceof ThrowableObjects) {
            return true;
        }

        return this.y < (this.groundY ?? 180);
    }

    /** Checks a collision with another object. */
    isCollidingWith(otherObject) {
        return this.x + this.width > otherObject.x &&
            this.y + this.height > otherObject.y &&
            this.x < otherObject.x + otherObject.width &&
            this.y < otherObject.y + otherObject.height;
    }

    /** Moves the object to the right. */
    moveRight() {
        this.x += this.speed;
    }

    /** Moves the object to the left. */
    moveLeft() {
        this.x -= this.speed;
    }

    /** Starts a jump. */
    jump(power = 25) {
        this.speedY = power;
    }

    /** Applies damage. */
    hit(damage = 20) {
        this.energy = Math.max(0, this.energy - damage);
        this.lastHit = Date.now();
    }

    /** Checks whether the object is dead. */
    isDead() {
        return this.energy === 0;
    }

    /** Checks whether the object was recently hurt. */
    isHurt(duration = 1000) {
        return Date.now() - this.lastHit < duration;
    }
}