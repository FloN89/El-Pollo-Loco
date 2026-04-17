class WorldGameplay extends WorldAudio {
    /** Updates the entire game world. */
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

    /** Checks collectibles and throw actions. */
    checkCollectiblesAndThrows() {
        this.checkBottleCollisions();
        this.checkCoinCollisions();
        this.checkThrowObjects();
        this.checkThrowableCollisions();
    }

    /** Checks victory and defeat conditions. */
    checkGameState() {
        this.scheduleGameOverIfNeeded();
        this.finishGameIfBossIsDead();
    }

    /** Schedules the game over state. */
    scheduleGameOverIfNeeded() {
        if (!this.character.isDead() || this.endScreenScheduled) {
            return;
        }

        this.endScreenScheduled = true;
        this.clearInputStates();
        this.updateRunningSound(false);
        setTimeout(this.finishGameOver.bind(this), 900);
    }

    /** Finishes the game with a defeat. */
    finishGameOver() {
        this.gameOver = true;
        this.clearInputStates();
        this.stopAllLoopingSounds();
        this.playGameOverSound();
    }

    /** Finishes the game after the boss dies. */
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

    /** Checks bottle collisions. */
    checkBottleCollisions() {
        for (let index = this.level.bottles.length - 1; index >= 0; index--) {
            if (this.canCollectBottle(index)) {
                this.collectBottle(index);
            }
        }
    }

    /** Checks whether a bottle can be collected. */
    canCollectBottle(index) {
        const bottle = this.level.bottles[index];
        return this.character.isCollidingWith(bottle) && this.collectedBottles < this.maxBottles;
    }

    /** Collects a bottle. */
    collectBottle(index) {
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        this.bottleBar.setPercentage(this.collectedBottlePercentage());
    }

    /** Returns the bottle progress. */
    collectedBottlePercentage() {
        return this.collectedBottles / this.maxBottles * 100;
    }

    /** Checks coin collisions. */
    checkCoinCollisions() {
        for (let index = this.level.coins.length - 1; index >= 0; index--) {
            if (this.canCollectCoin(index)) {
                this.collectCoin(index);
            }
        }
    }

    /** Checks whether a coin can be collected. */
    canCollectCoin(index) {
        const coin = this.level.coins[index];
        return this.isCharacterTouchingCoin(coin);
    }

    /** Uses a smaller hitbox so coins are only collected on real contact. */
    isCharacterTouchingCoin(coin) {
    const coinCenter = this.getCoinCenter(coin);
    const pickupArea = this.getCharacterCoinPickupArea();

    return this.isPointInsideArea(coinCenter, pickupArea);
    }
    
    getCoinCenter(coin) {
        return {
            x: coin.x + coin.width / 2,
            y: coin.y + coin.height / 2
        };
    }
    
    getCharacterCoinPickupArea() {
        return {
            left: this.character.x + 12,
            right: this.character.x + this.character.width - 12,
            top: this.character.y + 15,
            bottom: this.character.y + 170
        };
    }
    
    isPointInsideArea(point, area) {
        return point.x >= area.left &&
            point.x <= area.right &&
            point.y >= area.top &&
            point.y <= area.bottom;
    };
        

    /** Collects a coin. */
    collectCoin(index) {
        this.level.coins.splice(index, 1);
        this.collectedCoins++;
        this.coinBar.setPercentage(this.collectedCoinPercentage());
        this.playCoinSound();
    }

    /** Returns the coin progress. */
    collectedCoinPercentage() {
        return this.collectedCoins / this.totalCoins * 100;
    }

    /** Checks the throw button. */
    checkThrowObjects() {
        if (this.canThrowBottle()) {
            this.throwBottle();
        }

        this.throwKeyWasPressed = this.keyboard.D;
    }

    /** Checks whether a bottle can be thrown. */
    canThrowBottle() {
        return this.keyboard.D && !this.throwKeyWasPressed && this.collectedBottles > 0;
    }

    /** Throws a bottle. */
    throwBottle() {
        const startX = this.getThrowableStartX();
        const startY = this.character.y + 100;
        const direction = this.getThrowDirection();
        this.throwableObjects.push(new ThrowableObjects(startX, startY, direction));
        this.playBottleThrowSound();
        this.collectedBottles--;
        this.bottleBar.setPercentage(this.collectedBottlePercentage());
    }

    /** Returns the throw start X position. */
    getThrowableStartX() {
        return this.character.otherDirection ? this.character.x : this.character.x + this.character.width - 20;
    }

    /** Returns the throw direction. */
    getThrowDirection() {
        return this.character.otherDirection ? -1 : 1;
    }

    /** Checks collisions for throwable objects. */
    checkThrowableCollisions() {
        this.throwableObjects.forEach(this.handleThrowableCollision.bind(this));
    }

    /** Handles hits from a throwable object. */
    handleThrowableCollision(throwableBottle) {
        if (throwableBottle.isBroken) {
            return;
        }

        const hitEnemy = this.getHitEnemyForThrowable(throwableBottle);

        if (hitEnemy) {
            this.handleThrowableHit(throwableBottle, hitEnemy);
        }
    }

    /** Finds the enemy hit by a throwable object. */
    getHitEnemyForThrowable(throwableBottle) {
        return this.level.enemies.find((enemy) => this.canThrowableHitEnemy(throwableBottle, enemy));
    }

    /** Checks whether a throwable object can hit an enemy. */
    canThrowableHitEnemy(throwableBottle, enemy) {
        if (this.isDeadStompEnemy(enemy)) {
            return false;
        }

        return throwableBottle.isCollidingWith(enemy);
    }

    /** Handles a throwable hit. */
    handleThrowableHit(throwableBottle, enemy) {
        throwableBottle.splash();
        this.playHitSound();
        enemy instanceof Endboss ? this.damageEndboss(enemy) : this.defeatChicken(enemy);
    }

    /** Applies damage to the endboss. */
    damageEndboss(endboss) {
        endboss.takeDamage(20);
        this.endbossBar.setPercentage(endboss.energy);
    }

    /** Defeats a chicken. */
    defeatChicken(chicken) {
        chicken.die();
        this.scheduleEnemyRemoval(chicken, 150);
    }

    /** Checks the endboss behavior. */
    checkEndbossBehavior() {
        const endboss = this.getEndboss();

        if (!endboss || endboss.isBossDead) {
            return;
        }

        if (endboss.updateBehavior(this.character) && !this.character.isHurt()) {
            this.damageCharacter(20);
        }
    }

    /** Applies damage to the character. */
    damageCharacter(amount = 20) {
        this.character.hit(amount);
        this.playHitSound();
    }

    /** Removes finished throwable objects. */
    removeFinishedThrowableObjects() {
        this.throwableObjects = this.throwableObjects.filter(this.isThrowableStillActive);
    }

    /** Checks whether a throwable object stays active. */
    isThrowableStillActive(throwableBottle) {
        return !throwableBottle.isFinished;
    }

    /** Checks collisions between the character and enemies. */
    checkCollisions() {
        for (let index = this.level.enemies.length - 1; index >= 0; index--) {
            this.handleEnemyCollision(this.level.enemies[index]);
        }
    }

    /** Handles an enemy collision. */
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

    /** Checks whether an enemy can be jumped on. */
    canJumpOnEnemy(enemy) {
        return this.isStompEnemy(enemy) && !enemy.isDeadChicken && this.isJumpingOnEnemy(enemy);
    }

    /** Checks whether a chicken can damage the character. */
    canEnemyDamageCharacter(enemy) {
        return this.isStompEnemy(enemy) && !enemy.isDeadChicken && !this.character.isHurt();
    }

    /** Checks regular and small chickens. */
    isStompEnemy(enemy) {
        return enemy instanceof Chicken || enemy instanceof SmallChicken;
    }

    /** Checks whether a stomp enemy is already dead. */
    isDeadStompEnemy(enemy) {
        return this.isStompEnemy(enemy) && enemy.isDeadChicken;
    }

    /** Handles jumping on a chicken. */
    jumpOnChicken(chicken) {
        chicken.die();
        this.character.bounce(15);
        this.playHitSound();
        this.scheduleEnemyRemoval(chicken, 200);
    }

    /** Checks whether the character lands on a chicken. */
    isJumpingOnEnemy(enemy) {
        return this.character.speedY < 0 &&
            this.character.x + this.character.width > enemy.x &&
            this.character.x < enemy.x + enemy.width &&
            this.character.y + this.character.height > enemy.y &&
            this.character.y + this.character.height < enemy.y + 40;
    }

    /** Removes an enemy after a delay. */
    scheduleEnemyRemoval(enemy, delay) {
        setTimeout(() => this.removeEnemyIfPresent(enemy), delay);
    }

    /** Removes an enemy if it still exists. */
    removeEnemyIfPresent(enemy) {
        const enemyIndex = this.level.enemies.indexOf(enemy);

        if (enemyIndex > -1) {
            this.level.enemies.splice(enemyIndex, 1);
        }
    }
}