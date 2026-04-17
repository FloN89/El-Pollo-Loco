class Endboss extends MovableObject {
    width = 300;
    height = 420;
    y = 55;
    speed = 3.5;
    energy = 100;
    attackDamage = 10;
    isBossDead = false;
    lastAttackAt = 0;
    attackCooldown = 1000;
    leftBorder = 2880;
    rightBorder = 3280;
    direction = -1;

    imagePathsWalking = [
        'img/4_enemie_boss_chicken/1_walk/G1.png',
        'img/4_enemie_boss_chicken/1_walk/G2.png',
        'img/4_enemie_boss_chicken/1_walk/G3.png',
        'img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    imagePathsAlert = [
        'img/4_enemie_boss_chicken/2_alert/G5.png',
        'img/4_enemie_boss_chicken/2_alert/G6.png',
        'img/4_enemie_boss_chicken/2_alert/G7.png',
        'img/4_enemie_boss_chicken/2_alert/G8.png',
        'img/4_enemie_boss_chicken/2_alert/G9.png',
        'img/4_enemie_boss_chicken/2_alert/G10.png',
        'img/4_enemie_boss_chicken/2_alert/G11.png',
        'img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    imagePathsAttack = [
        'img/4_enemie_boss_chicken/3_attack/G13.png',
        'img/4_enemie_boss_chicken/3_attack/G14.png',
        'img/4_enemie_boss_chicken/3_attack/G15.png',
        'img/4_enemie_boss_chicken/3_attack/G16.png',
        'img/4_enemie_boss_chicken/3_attack/G17.png',
        'img/4_enemie_boss_chicken/3_attack/G18.png',
        'img/4_enemie_boss_chicken/3_attack/G19.png',
        'img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    imagePathsHurt = [
        'img/4_enemie_boss_chicken/4_hurt/G21.png',
        'img/4_enemie_boss_chicken/4_hurt/G22.png',
        'img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    imagePathsDead = [
        'img/4_enemie_boss_chicken/5_dead/G24.png',
        'img/4_enemie_boss_chicken/5_dead/G25.png',
        'img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    /** Creates the end boss. */
    constructor(x = 3200, leftBorder = 2880, rightBorder = 3280) {
        super();
        this.loadImage(this.imagePathsAlert[0]);
        this.loadImages(this.imagePathsWalking);
        this.loadImages(this.imagePathsAlert);
        this.loadImages(this.imagePathsAttack);
        this.loadImages(this.imagePathsHurt);
        this.loadImages(this.imagePathsDead);
        this.x = x;
        this.leftBorder = leftBorder;
        this.rightBorder = rightBorder;
        this.animate();
    }

    /** Starts the image animation. */
    animate() {
        setInterval(this.updateAnimation.bind(this), 160);
    }

    /** Updates the current behavior. */
    updateBehavior(character) {
        if (this.isBossDead) {
            return false;
        }

        this.moveInsideArena();
        this.faceCharacter(character);
        return this.tryAttack(character);
    }

    /** Moves the boss inside the arena. */
    moveInsideArena() {
        this.x += this.speed * this.direction;

        if (this.x <= this.leftBorder || this.x >= this.rightBorder) {
            this.direction *= -1;
        }
    }

    /** Turns the boss toward the character. */
    faceCharacter(character) {
        this.otherDirection = character.x > this.x;
    }

    /** Checks whether the boss can attack. */
    tryAttack(character) {
        if (!this.isCharacterInAttackRange(character) || !this.isAttackReady()) {
            return false;
        }

        this.lastAttackAt = Date.now();
        return true;
    }

    /** Checks the attack range. */
    isCharacterInAttackRange(character) {
        return Math.abs(this.x - character.x) < 140;
    }

    /** Checks the cooldown. */
    isAttackReady() {
        return Date.now() - this.lastAttackAt > this.attackCooldown;
    }

    /** Updates the boss image. */
    updateAnimation() {
        this.playAnimation(this.getCurrentAnimationImages());
    }

    /** Returns the current animation images. */
    getCurrentAnimationImages() {
        if (this.isBossDead) {
            return this.imagePathsDead;
        }

        if (this.isHurt()) {
            return this.imagePathsHurt;
        }

        return this.isInAttackAnimation() ? this.imagePathsAttack : this.imagePathsWalking;
    }

    /** Checks whether the attack animation is active. */
    isInAttackAnimation() {
        return Date.now() - this.lastAttackAt < 450;
    }

    /** Handles damage. */
    takeDamage(damage) {
        if (this.isBossDead) {
            return;
        }

        this.hit(damage);
        this.isBossDead = this.energy === 0;
    }
}