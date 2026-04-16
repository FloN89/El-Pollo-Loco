class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 1.5;
    energy = 100;
    lastHit = 0;

    // Wendet Schwerkraft dauerhaft an.
    applyGravity() {
        setInterval(this.updateGravity.bind(this), 1000 / 25);
    }

    // Aktualisiert die Schwerkraft.
    updateGravity() {
        if (!this.shouldApplyGravity()) {
            return;
        }

        this.y -= this.speedY;
        this.speedY -= this.acceleration;
        this.stopAtGroundLevel();
    }

    // Prüft, ob Schwerkraft aktiv sein soll.
    shouldApplyGravity() {
        return this.isAboveGround() || this.speedY > 0;
    }

    // Stoppt das Objekt auf dem Boden.
    stopAtGroundLevel() {
        const groundY = this.groundY ?? 180;

        if (this.y <= groundY) {
            return;
        }

        this.y = groundY;
        this.speedY = 0;
    }

    // Prüft, ob das Objekt in der Luft ist.
    isAboveGround() {
        if (this instanceof ThrowableObjects) {
            return true;
        }

        return this.y < (this.groundY ?? 180);
    }

    // Prüft eine Kollision mit einem anderen Objekt.
    isCollidingWith(otherObject) {
        return this.x + this.width > otherObject.x &&
            this.y + this.height > otherObject.y &&
            this.x < otherObject.x + otherObject.width &&
            this.y < otherObject.y + otherObject.height;
    }

    // Bewegt das Objekt nach rechts.
    moveRight() {
        this.x += this.speed;
    }

    // Bewegt das Objekt nach links.
    moveLeft() {
        this.x -= this.speed;
    }

    // Startet einen Sprung.
    jump(power = 25) {
        this.speedY = power;
    }

    // Fügt Schaden zu.
    hit(damage = 20) {
        this.energy = Math.max(0, this.energy - damage);
        this.lastHit = Date.now();
    }

    // Prüft, ob das Objekt tot ist.
    isDead() {
        return this.energy === 0;
    }

    // Prüft, ob das Objekt gerade verletzt wurde.
    isHurt(duration = 1000) {
        return Date.now() - this.lastHit < duration;
    }
}