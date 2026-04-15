class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    statusBar = new StatusBar();
    bottleBar = new BottleStatusBar();
    coinBar = new CoinStatusBar();
    endbossBar = new EndbossStatusBar();

    throwableObjects = [];
    throwKeyWasPressed = false;
    collectedBottles = 0;
    collectedCoins = 0;
    maxBottles = 5;
    totalCoins = 0;
    gameOver = false;
    gameWon = false;
    endScreenScheduled = false;

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.totalCoins = this.level.coins.length;
        this.setWorld();
        this.draw();
        this.run();
    }

    setWorld() {
        this.character.world = this;
        this.character.animate();
        this.bottleBar.setPercentage(0);
        this.coinBar.setPercentage(0);
        this.endbossBar.setPercentage(100);
        this.statusBar.setPercentage(100);
    }

    run() {
        setInterval(() => {
            if (this.gameOver || this.gameWon) {
                return;
            }

            this.checkCollisions();
            this.checkBottleCollisions();
            this.checkCoinCollisions();
            this.checkThrowObjects();
            this.checkThrowableCollisions();
            this.checkEndbossBehavior();
            this.removeFinishedThrowableObjects();
            this.checkGameState();
        }, 1000 / 60);
    }

    getEndboss() {
        return this.level.enemies.find((enemy) => enemy instanceof Endboss);
    }

    checkGameState() {
        if (this.character.isDead() && !this.endScreenScheduled) {
            this.endScreenScheduled = true;
            setTimeout(() => {
                this.gameOver = true;
            }, 900);
        }

        let boss = this.getEndboss();
        if (boss && boss.isBossDead && !this.gameWon) {
            this.gameWon = true;
        }
    }

    checkBottleCollisions() {
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            let bottle = this.level.bottles[i];

            if (this.character.iscolliding(bottle) && this.collectedBottles < this.maxBottles) {
                this.level.bottles.splice(i, 1);
                this.collectedBottles++;
                this.bottleBar.setPercentage((this.collectedBottles / this.maxBottles) * 100);
            }
        }
    }

    checkCoinCollisions() {
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            let coin = this.level.coins[i];

            if (this.character.iscolliding(coin)) {
                this.level.coins.splice(i, 1);
                this.collectedCoins++;
                this.coinBar.setPercentage((this.collectedCoins / this.totalCoins) * 100);
            }
        }
    }

    checkThrowObjects() {
        if (this.keyboard.D && !this.throwKeyWasPressed && this.collectedBottles > 0) {
            let direction = this.character.otherDirection ? -1 : 1;
            let startX = this.character.otherDirection ? this.character.x : this.character.x + this.character.width - 20;
            let bottle = new ThrowableObjects(startX, this.character.y + 100, direction);
            this.throwableObjects.push(bottle);

            this.collectedBottles--;
            this.bottleBar.setPercentage((this.collectedBottles / this.maxBottles) * 100);
        }

        this.throwKeyWasPressed = this.keyboard.D;
    }

    checkThrowableCollisions() {
        for (let i = 0; i < this.throwableObjects.length; i++) {
            let bottle = this.throwableObjects[i];

            if (bottle.isBroken) {
                continue;
            }

            for (let j = 0; j < this.level.enemies.length; j++) {
                let enemy = this.level.enemies[j];

                if (enemy instanceof Chicken && enemy.isDeadChicken) {
                    continue;
                }

                if (bottle.iscolliding(enemy)) {
                    bottle.splash();

                    if (enemy instanceof Endboss) {
                        enemy.takeDamage(20);
                        this.endbossBar.setPercentage(enemy.energy);
                    } else if (enemy instanceof Chicken) {
                        enemy.die();
                        setTimeout(() => {
                            let index = this.level.enemies.indexOf(enemy);
                            if (index > -1) {
                                this.level.enemies.splice(index, 1);
                            }
                        }, 300);
                    }

                    break;
                }
            }
        }
    }

    checkEndbossBehavior() {
        let boss = this.getEndboss();

        if (!boss || boss.isBossDead) {
            return;
        }

        let bossAttacked = boss.updateBehavior(this.character);

        if (bossAttacked && !this.character.isHurt()) {
            this.character.hit(boss.attackDamage);
            this.statusBar.setPercentage(this.character.energy);
        }
    }

    removeFinishedThrowableObjects() {
        this.throwableObjects = this.throwableObjects.filter((bottle) => !bottle.isFinished);
    }

    checkCollisions() {
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
            let enemy = this.level.enemies[i];

            if (!this.character.iscolliding(enemy)) {
                continue;
            }

            if (enemy instanceof Chicken && !enemy.isDeadChicken && this.isJumpingOnChicken(enemy)) {
                enemy.die();
                this.character.speedY = 15;

                setTimeout(() => {
                    let index = this.level.enemies.indexOf(enemy);
                    if (index > -1) {
                        this.level.enemies.splice(index, 1);
                    }
                }, 500);
            } else if (enemy instanceof Chicken && !enemy.isDeadChicken && !this.character.isHurt()) {
                this.character.hit(5);
                this.statusBar.setPercentage(this.character.energy);
            }
        }
    }

    isJumpingOnChicken(chicken) {
        return this.character.speedY < 0 &&
               this.character.x + this.character.width > chicken.x &&
               this.character.x < chicken.x + chicken.width &&
               this.character.y + this.character.height > chicken.y &&
               this.character.y + this.character.height < chicken.y + 40;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);

        this.drawUi();

        if (this.gameOver) {
            this.drawOverlay('GAME OVER', 'Pepe ist tot');
        } else if (this.gameWon) {
            this.drawOverlay('DU HAST GEWONNEN', 'Der Endboss ist besiegt');
        }

        requestAnimationFrame(() => this.draw());
    }

    drawUi() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.endbossBar);

        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`${this.collectedBottles}/${this.maxBottles}`, 165, 88);
        this.ctx.fillText(`${this.collectedCoins}/${this.totalCoins}`, 165, 128);
    }

    drawOverlay(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(subtitle, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.textAlign = 'left';
    }

    addObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addToMap(object);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack();
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width / 2, 0);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-mo.x - mo.width / 2, 0);
    }

    flipImageBack() {
        this.ctx.restore();
    }
}