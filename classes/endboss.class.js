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
        './img/4_enemie_boss_chicken/1_walk/G1.png',
        './img/4_enemie_boss_chicken/1_walk/G2.png',
        './img/4_enemie_boss_chicken/1_walk/G3.png',
        './img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    imagePathsAlert = [
        './img/4_enemie_boss_chicken/2_alert/G5.png',
        './img/4_enemie_boss_chicken/2_alert/G6.png',
        './img/4_enemie_boss_chicken/2_alert/G7.png',
        './img/4_enemie_boss_chicken/2_alert/G8.png',
        './img/4_enemie_boss_chicken/2_alert/G9.png',
        './img/4_enemie_boss_chicken/2_alert/G10.png',
        './img/4_enemie_boss_chicken/2_alert/G11.png',
        './img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    imagePathsAttack = [
        './img/4_enemie_boss_chicken/3_attack/G13.png',
        './img/4_enemie_boss_chicken/3_attack/G14.png',
        './img/4_enemie_boss_chicken/3_attack/G15.png',
        './img/4_enemie_boss_chicken/3_attack/G16.png',
        './img/4_enemie_boss_chicken/3_attack/G17.png',
        './img/4_enemie_boss_chicken/3_attack/G18.png',
        './img/4_enemie_boss_chicken/3_attack/G19.png',
        './img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    imagePathsHurt = [
        './img/4_enemie_boss_chicken/4_hurt/G21.png',
        './img/4_enemie_boss_chicken/4_hurt/G22.png',
        './img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    imagePathsDead = [
        './img/4_enemie_boss_chicken/5_dead/G24.png',
        './img/4_enemie_boss_chicken/5_dead/G25.png',
        './img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    /** Erstellt den Endboss. */
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

    /** Startet die Bildanimation. */
    animate() {
        setInterval(this.updateAnimation.bind(this), 160);
    }

    /** Aktualisiert den aktuellen Zustand. */
    updateBehavior(character) {
        if (this.isBossDead) {
            return false;
        }

        this.moveInsideArena();
        this.faceCharacter(character);
        return this.tryAttack(character);
    }

    /** Bewegt den Boss in seiner Arena. */
    moveInsideArena() {
        this.x += this.speed * this.direction;

        if (this.x <= this.leftBorder || this.x >= this.rightBorder) {
            this.direction *= -1;
        }
    }

    /** Dreht den Boss zum Charakter. */
    faceCharacter(character) {
        this.otherDirection = character.x > this.x;
    }

    /** Prüft, ob der Boss angreifen kann. */
    tryAttack(character) {
        if (!this.isCharacterInAttackRange(character) || !this.isAttackReady()) {
            return false;
        }

        this.lastAttackAt = Date.now();
        return true;
    }

    /** Prüft die Angriffsreichweite. */
    isCharacterInAttackRange(character) {
        return Math.abs(this.x - character.x) < 140;
    }

    /** Prüft den Cooldown. */
    isAttackReady() {
        return Date.now() - this.lastAttackAt > this.attackCooldown;
    }

    /** Aktualisiert das Bossbild. */
    updateAnimation() {
        this.playAnimation(this.getCurrentAnimationImages());
    }

    /** Liefert die aktuelle Bildreihe. */
    getCurrentAnimationImages() {
        if (this.isBossDead) {
            return this.imagePathsDead;
        }

        if (this.isHurt()) {
            return this.imagePathsHurt;
        }

        return this.isInAttackAnimation() ? this.imagePathsAttack : this.imagePathsWalking;
    }

    /** Prüft, ob gerade die Angriffsanimation läuft. */
    isInAttackAnimation() {
        return Date.now() - this.lastAttackAt < 450;
    }

    /** Verarbeitet Schaden. */
    takeDamage(damage) {
        if (this.isBossDead) {
            return;
        }

        this.hit(damage);
        this.isBossDead = this.energy === 0;
    }
}