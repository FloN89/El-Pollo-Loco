class WorldGameplay extends WorldAudio {
    /** Aktualisiert die komplette Spielwelt. */
    updateWorld() {
        if (this.isLoopPaused()) {
            return;
        }

        this.spawnEndbossIfNeeded();
        this.checkCollisions();
        this.checkCollectiblesAndThrows();
        this.checkEndbossBehavior();
        this.removeFinishedThrowableObjects();
        this.checkGameState();
    }

    /** Prüft Sammelobjekte und Würfe. */
    checkCollectiblesAndThrows() {
        this.checkBottleCollisions();
        this.checkCoinCollisions();
        this.checkThrowObjects();
        this.checkThrowableCollisions();
    }

    /** Prüft Sieg und Niederlage. */
    checkGameState() {
        this.scheduleGameOverIfNeeded();
        this.finishGameIfBossIsDead();
    }

    /** Plant das Game Over. */
    scheduleGameOverIfNeeded() {
        if (!this.character.isDead() || this.endScreenScheduled) {
            return;
        }

        this.endScreenScheduled = true;
        this.clearInputStates();
        this.updateRunningSound(false);
        setTimeout(this.finishGameOver.bind(this), 900);
    }

    /** Beendet das Spiel mit Niederlage. */
    finishGameOver() {
        this.gameOver = true;
        this.clearInputStates();
        this.stopAllLoopingSounds();
        this.playGameOverSound();
    }

    /** Beendet das Spiel nach Boss-Tod. */
    finishGameIfBossIsDead() {
        const endboss = this.getEndboss();

        if (!endboss || !endboss.isBossDead || this.gameWon) {
            return;
        }

        this.gameWon = true;
        this.clearInputStates();
        this.stopAllLoopingSounds();
        this.playWinningSound();
    }

    /** Prüft Flaschenkollisionen. */
    checkBottleCollisions() {
        for (let index = this.level.bottles.length - 1; index >= 0; index--) {
            if (this.canCollectBottle(index)) {
                this.collectBottle(index);
            }
        }
    }

    /** Prüft, ob eine Flasche eingesammelt werden kann. */
    canCollectBottle(index) {
        const bottle = this.level.bottles[index];
        return this.character.isCollidingWith(bottle) && this.collectedBottles < this.maxBottles;
    }

    /** Sammelt eine Flasche ein. */
    collectBottle(index) {
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        this.bottleBar.setPercentage(this.collectedBottlePercentage());
    }

    /** Liefert den Flaschenfortschritt. */
    collectedBottlePercentage() {
        return this.collectedBottles / this.maxBottles * 100;
    }

    /** Prüft Münzkollisionen. */
    checkCoinCollisions() {
        for (let index = this.level.coins.length - 1; index >= 0; index--) {
            if (this.character.isCollidingWith(this.level.coins[index])) {
                this.collectCoin(index);
            }
        }
    }

    /** Sammelt eine Münze ein. */
    collectCoin(index) {
        this.level.coins.splice(index, 1);
        this.collectedCoins++;
        this.coinBar.setPercentage(this.collectedCoinPercentage());
        this.playCoinSound();
    }

    /** Liefert den Münzfortschritt. */
    collectedCoinPercentage() {
        return this.collectedCoins / this.totalCoins * 100;
    }

    /** Prüft den Wurfknopf. */
    checkThrowObjects() {
        if (this.canThrowBottle()) {
            this.throwBottle();
        }

        this.throwKeyWasPressed = this.keyboard.D;
    }

    /** Prüft, ob eine Flasche geworfen werden darf. */
    canThrowBottle() {
        return this.keyboard.D && !this.throwKeyWasPressed && this.collectedBottles > 0;
    }

    /** Wirft eine Flasche. */
    throwBottle() {
        const startX = this.getThrowableStartX();
        const startY = this.character.y + 100;
        const direction = this.getThrowDirection();
        this.throwableObjects.push(new ThrowableObjects(startX, startY, direction));
        this.playBottleThrowSound();
        this.collectedBottles--;
        this.bottleBar.setPercentage(this.collectedBottlePercentage());
    }

    /** Liefert die X-Startposition für einen Wurf. */
    getThrowableStartX() {
        return this.character.otherDirection ? this.character.x : this.character.x + this.character.width - 20;
    }

    /** Liefert die Wurfrichtung. */
    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }

    /** Prüft Kollisionen von Wurfobjekten. */
    checkThrowableCollisions() {
        this.throwableObjects.forEach(this.handleThrowableCollision.bind(this));
    }

    /** Verarbeitet Treffer eines Wurfobjekts. */
    handleThrowableCollision(throwableBottle) {
        if (throwableBottle.isBroken) {
            return;
        }

        const hitEnemy = this.getHitEnemyForThrowable(throwableBottle);
        if (hitEnemy) {
            this.handleThrowableHit(throwableBottle, hitEnemy);
        }
    }

    /** Findet den getroffenen Gegner. */
    getHitEnemyForThrowable(throwableBottle) {
        return this.level.enemies.find((enemy) => this.canThrowableHitEnemy(throwableBottle, enemy));
    }

    /** Prüft, ob ein Wurfobjekt einen Gegner trifft. */
    canThrowableHitEnemy(throwableBottle, enemy) {
        if (this.isDeadStompEnemy(enemy)) {
            return false;
        }

        return throwableBottle.isCollidingWith(enemy);
    }

    /** Reagiert auf einen Wurf-Treffer. */
    handleThrowableHit(throwableBottle, enemy) {
        throwableBottle.splash();
        this.playHitSound();
        enemy instanceof Endboss ? this.damageEndboss(enemy) : this.defeatChicken(enemy);
    }

    /** Verarbeitet Schaden am Endboss. */
    damageEndboss(endboss) {
        endboss.takeDamage(20);
        this.endbossBar.setPercentage(endboss.energy);
    }

    /** Besiegt ein Huhn. */
    defeatChicken(chicken) {
        chicken.die();
        this.scheduleEnemyRemoval(chicken, 150);
    }

    /** Prüft das Verhalten des Endbosses. */
checkEndbossBehavior() {
    const endboss = this.getEndboss();

    if (!endboss || endboss.isBossDead) {
        return;
    }

    if (endboss.updateBehavior(this.character) && !this.character.isHurt()) {
        this.damageCharacter(20);
    }
}

    /** Fügt dem Charakter Schaden zu. */
damageCharacter(amount = 20) {
    this.character.hit(amount);
    this.playHitSound();
}

    /** Entfernt abgeschlossene Wurfobjekte. */
    removeFinishedThrowableObjects() {
        this.throwableObjects = this.throwableObjects.filter(this.isThrowableStillActive);
    }

    /** Prüft, ob ein Wurfobjekt aktiv bleibt. */
    isThrowableStillActive(throwableBottle) {
        return !throwableBottle.isFinished;
    }

    /** Prüft Kollisionen zwischen Charakter und Gegnern. */
    checkCollisions() {
        for (let index = this.level.enemies.length - 1; index >= 0; index--) {
            this.handleEnemyCollision(this.level.enemies[index]);
        }
    }

    /** Verarbeitet eine Gegnerkollision. */
handleEnemyCollision(enemy) {
    if (!this.character.isCollidingWith(enemy)) {
        return;
    }

    if (this.canJumpOnEnemy(enemy)) {
        this.jumpOnChicken(enemy);
        return;
    }

    if (this.canEnemyDamageCharacter(enemy)) {
        this.damageCharacter(20);
    }
}

    /** Prüft, ob ein Gegner angesprungen werden kann. */
    canJumpOnEnemy(enemy) {
        return this.isStompEnemy(enemy) && !enemy.isDeadChicken && this.isJumpingOnEnemy(enemy);
    }

    /** Prüft, ob ein Huhn Schaden machen darf. */
    canEnemyDamageCharacter(enemy) {
        return this.isStompEnemy(enemy) && !enemy.isDeadChicken && !this.character.isHurt();
    }

    /** Prüft normale und kleine Hühner. */
    isStompEnemy(enemy) {
        return enemy instanceof Chicken || enemy instanceof SmallChicken;
    }

    /** Prüft, ob ein Huhn schon tot ist. */
    isDeadStompEnemy(enemy) {
        return this.isStompEnemy(enemy) && enemy.isDeadChicken;
    }

    /** Verarbeitet das Springen auf ein Huhn. */
    jumpOnChicken(chicken) {
        chicken.die();
        this.character.speedY = 15;
        this.character.rememberAction();
        this.playHitSound();
        this.scheduleEnemyRemoval(chicken, 200);
    }

    /** Prüft, ob der Charakter auf einem Huhn landet. */
    isJumpingOnEnemy(enemy) {
        return this.character.speedY < 0 &&
            this.character.x + this.character.width > enemy.x &&
            this.character.x < enemy.x + enemy.width &&
            this.character.y + this.character.height > enemy.y &&
            this.character.y + this.character.height < enemy.y + 40;
    }

    /** Entfernt einen Gegner zeitversetzt. */
    scheduleEnemyRemoval(enemy, delay) {
        setTimeout(() => this.removeEnemyIfPresent(enemy), delay);
    }

    /** Entfernt einen Gegner, falls er noch existiert. */
    removeEnemyIfPresent(enemy) {
        const enemyIndex = this.level.enemies.indexOf(enemy);

        if (enemyIndex > -1) {
            this.level.enemies.splice(enemyIndex, 1);
        }
    }
}