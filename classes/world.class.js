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

    gameStarted = false;
    gameOver = false;
    gameWon = false;
    endScreenScheduled = false;

    startScreenImage = new Image();
    gameOverImage = new Image();
    youWinImage = new Image();

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.totalCoins = this.level.coins.length;

        this.loadScreenImages();
        this.setWorld();
        this.draw();
        this.run();
    }

    loadScreenImages() {
        this.startScreenImage.src = 'img/9_intro_outro_screens/start/startscreen_1.png';
        this.gameOverImage.src = 'img/You won, you lost/Game Over.png';
        this.youWinImage.src = 'img/you win.png';
    }

    startGame() {
        if (!this.gameStarted && !this.gameOver && !this.gameWon) {
            this.gameStarted = true;
        }
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
            if (!this.gameStarted || this.gameOver || this.gameWon) {
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

    shouldShowEndbossBar() {
        let boss = this.getEndboss();

        if (!boss || boss.isBossDead) {
            return false;
        }

        return this.character.x > boss.x - 650;
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
            let startX = this.character.otherDirection
                ? this.character.x
                : this.character.x + this.character.width - 20;

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

        if (!this.gameStarted) {
            this.drawFullscreenImage(this.startScreenImage, 'START');
            requestAnimationFrame(() => this.draw());
            return;
        }

        this.drawWorld();
        this.drawUi();

        if (this.gameOver) {
            this.drawScreenOverlay(this.gameOverImage, 'GAME OVER');
        } else if (this.gameWon) {
            this.drawScreenOverlay(this.youWinImage, 'YOU WIN');
        }

        requestAnimationFrame(() => this.draw());
    }

    drawWorld() {
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
    }

    drawUi() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);

        if (this.shouldShowEndbossBar()) {
            this.addToMap(this.endbossBar);
        }

        this.ctx.font = '20px Zabars, Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`${this.collectedBottles}/${this.maxBottles}`, 165, 88);
        this.ctx.fillText(`${this.collectedCoins}/${this.totalCoins}`, 165, 128);
    }

    drawFullscreenImage(image, fallbackText) {
        if (image.complete && image.naturalWidth > 0) {
            this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Zabars, Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fallbackText, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }

    drawScreenOverlay(image, fallbackText) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (image.complete && image.naturalWidth > 0) {
            const size = this.getContainedOverlaySize(image, this.canvas.width * 0.72, this.canvas.height * 0.6);
            this.ctx.globalAlpha = 0.9;
            this.ctx.drawImage(image, size.x, size.y, size.width, size.height);
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            this.ctx.fillRect(120, 140, this.canvas.width - 240, this.canvas.height - 280);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 42px Zabars, Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fallbackText, this.canvas.width / 2, this.canvas.height / 2);
        }

        this.ctx.restore();
    }

    getContainedOverlaySize(image, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = image.naturalWidth * ratio;
        const height = image.naturalHeight * ratio;

        return {
            width,
            height,
            x: (this.canvas.width - width) / 2,
            y: (this.canvas.height - height) / 2,
        };
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