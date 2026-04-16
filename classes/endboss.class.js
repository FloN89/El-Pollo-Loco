class Endboss extends MovableObject {
    height = 400;
    y = 55;
    width = 250;
    speed = 1.2;
    energy = 100;
    isBossDead = false;
    activated = false;
    currentState = 'alert';
    attackRange = 160;
    detectionRange = 650;
    attackDamage = 15;
    attackCooldown = 1200;
    lastAttack = 0;
    deathAnimationIndex = 0;

    IMAGES_ALERT = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_WALKING = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ATTACK = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor(x = 3200, leftBoundary = x - 320, rightBoundary = x + 80) {
        super();
        this.loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = x;
        this.leftBoundary = leftBoundary;
        this.rightBoundary = rightBoundary;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.isBossDead) {
                this.playDeadAnimation();
                return;
            }

            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
                return;
            }

            if (this.currentState === 'attack') {
                this.playAnimation(this.IMAGES_ATTACK);
            } else if (this.currentState === 'walk') {
                this.playAnimation(this.IMAGES_WALKING);
            } else {
                this.playAnimation(this.IMAGES_ALERT);
            }
        }, 120);
    }

    updateBehavior(character) {
        if (this.isBossDead) {
            return false;
        }

        const distance = character.x - this.x;
        const absoluteDistance = Math.abs(distance);

        if (character.x > this.x - this.detectionRange) {
            this.activated = true;
        }

        if (!this.activated) {
            this.currentState = 'alert';
            return false;
        }

        this.otherDirection = distance > 0;

        if (absoluteDistance > this.attackRange) {
            this.currentState = 'walk';
            this.moveInArena(distance);
            return false;
        }

        this.currentState = 'attack';

        if (this.canAttack()) {
            this.lastAttack = Date.now();
            return true;
        }

        return false;
    }

    moveInArena(distance) {
        if (distance < 0) {
            if (this.x > this.leftBoundary) {
                this.moveLeft();
                this.x = Math.max(this.x, this.leftBoundary);
            } else {
                this.currentState = 'alert';
            }
        } else {
            if (this.x < this.rightBoundary) {
                this.moveRight();
                this.x = Math.min(this.x, this.rightBoundary);
            } else {
                this.currentState = 'alert';
            }
        }
    }

    canAttack() {
        return Date.now() - this.lastAttack > this.attackCooldown;
    }

    takeDamage(amount = 20) {
        if (this.isBossDead) {
            return;
        }

        this.hit(amount);

        if (this.energy === 0) {
            this.isBossDead = true;
            this.currentState = 'dead';
        }
    }

    playDeadAnimation() {
        if (this.deathAnimationIndex < this.IMAGES_DEAD.length) {
            let path = this.IMAGES_DEAD[this.deathAnimationIndex];
            this.img = this.imageCache[path];
            this.deathAnimationIndex++;
        } else {
            let lastImage = this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1];
            this.img = this.imageCache[lastImage];
        }
    }
}