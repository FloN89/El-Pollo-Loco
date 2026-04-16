class World {
    character = new Character();
    level = null;
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
    actionButtons = {};
    soundEnabled = true;
    audioUnlocked = false;
    isRunningSoundActive = false;

    backgroundMusic = null;
    runningSound = null;

    audioPaths = {
        backgroundMusic: 'audio/background music.mp3',
        running: 'audio/running sound.mp3',
        coin: 'audio/coin.mp3',
        hit: 'audio/hit sound.mp3',
        bottle: 'audio/bottle sound.mp3',
    };

    effectVolume = {
        coin: 0.45,
        bottle: 0.5,
        hit: 0.55,
    };

    fontFamily = '"Zabars", Arial, sans-serif';

    startScreenImage = new Image();
    gameOverImage = new Image();
    youWinImage = new Image();

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;

        this.loadScreenImages();
        this.setupAudio();
        this.resetGame();
        this.draw();
        this.run();
    }

    loadScreenImages() {
        this.startScreenImage.src = 'img/9_intro_outro_screens/start/startscreen_1.png';
        this.gameOverImage.src = 'img/You won, you lost/Game Over.png';
        this.youWinImage.src = 'img/You won, you lost/You Won B.png';
    }

    setupAudio() {
        this.backgroundMusic = this.createLoopingAudio(this.audioPaths.backgroundMusic, 0.22);
        this.runningSound = this.createLoopingAudio(this.audioPaths.running, 0.35);
    }

    createLoopingAudio(src, volume = 1) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = volume;
        audio.addEventListener('error', () => {
            console.warn(`Audio konnte nicht geladen werden: ${src}`);
        });
        return audio;
    }

    createEffectAudio(src, volume = 1) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = volume;
        audio.addEventListener('error', () => {
            console.warn(`Audio konnte nicht geladen werden: ${src}`);
        });
        return audio;
    }

    handleUserInteraction() {
        this.audioUnlocked = true;
        this.syncAudioState();
    }

    syncAudioState() {
        this.syncBackgroundMusic();
        this.syncRunningSound();
    }

    syncBackgroundMusic() {
        if (!this.backgroundMusic) {
            return;
        }

        if (!this.soundEnabled || !this.audioUnlocked) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            return;
        }

        if (this.backgroundMusic.paused) {
            this.backgroundMusic.play().catch(() => {});
        }
    }

    syncRunningSound() {
        if (!this.runningSound) {
            return;
        }

        const shouldPlay = this.soundEnabled && this.audioUnlocked && this.isRunningSoundActive;

        if (!shouldPlay) {
            this.runningSound.pause();
            this.runningSound.currentTime = 0;
            return;
        }

        if (this.runningSound.paused) {
            this.runningSound.play().catch(() => {});
        }
    }

    updateRunningSound(isRunning) {
        this.isRunningSoundActive = isRunning;
        this.syncRunningSound();
    }

    playCoinSound() {
        this.playEffect(this.audioPaths.coin, this.effectVolume.coin);
    }

    playBottleThrowSound() {
        this.playEffect(this.audioPaths.bottle, this.effectVolume.bottle);
    }

    playHitSound() {
        this.playEffect(this.audioPaths.hit, this.effectVolume.hit);
    }

    playEffect(src, volume = 1) {
        if (!this.soundEnabled || !this.audioUnlocked) {
            return;
        }

        const audio = this.createEffectAudio(src, volume);
        audio.play().catch(() => {});
    }

    resetGame() {
        if (this.character) {
            this.character.world = null;
        }

        this.clearInputStates();
        this.level = createLevel1();
        this.character = new Character();
        this.statusBar = new StatusBar();
        this.bottleBar = new BottleStatusBar();
        this.coinBar = new CoinStatusBar();
        this.endbossBar = new EndbossStatusBar();
        this.throwableObjects = [];
        this.throwKeyWasPressed = false;
        this.collectedBottles = 0;
        this.collectedCoins = 0;
        this.totalCoins = this.level.coins.length;
        this.camera_x = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.endScreenScheduled = false;
        this.actionButtons = {};
        this.updateRunningSound(false);
        this.setWorld();
        this.syncAudioState();
    }

    clearInputStates() {
        this.keyboard.LEFT = false;
        this.keyboard.RIGHT = false;
        this.keyboard.UP = false;
        this.keyboard.DOWN = false;
        this.keyboard.SPACE = false;
        this.keyboard.D = false;
    }

    startGame() {
        if (!this.gameStarted && !this.gameOver && !this.gameWon) {
            this.handleUserInteraction();
            this.clearInputStates();
            this.gameStarted = true;
        }
    }

    returnToStartScreen() {
        this.resetGame();
    }

    handleCanvasClick(x, y) {
        this.handleUserInteraction();

        if (this.isInsideButton(this.actionButtons.sound, x, y)) {
            this.toggleSound();
            return;
        }

        if (this.isInsideButton(this.actionButtons.start, x, y)) {
            this.startGame();
            return;
        }

        if (this.isInsideButton(this.actionButtons.back, x, y)) {
            this.returnToStartScreen();
        }
    }

    isInsideButton(button, x, y) {
        if (!button) {
            return false;
        }

        return x >= button.x &&
               x <= button.x + button.width &&
               y >= button.y &&
               y <= button.y + button.height;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.syncAudioState();
    }

    setWorld() {
        this.character.world = this;
        this.character.animate();
        this.bottleBar.setPercentage(0);
        this.coinBar.setPercentage(0);
        this.endbossBar.setPercentage(100);
        this.statusBar.setPercentage(100);
    }

    getBackgroundEndX() {
        if (!this.level || !this.level.backgroundObjects || this.level.backgroundObjects.length === 0) {
            return this.canvas.width;
        }

        return Math.max(
            ...this.level.backgroundObjects.map((backgroundObject) => backgroundObject.x + backgroundObject.width)
        );
    }

    getCameraOffsetFor(characterX) {
        const desiredCameraX = -characterX + 100;
        const maxCameraOffset = Math.min(0, this.canvas.width - this.getBackgroundEndX());

        return Math.max(maxCameraOffset, Math.min(0, desiredCameraX));
    }

    run() {
        setInterval(() => {
            if (!this.gameStarted || this.gameOver || this.gameWon) {
                return;
            }

            this.spawnEndbossIfNeeded();
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

    spawnEndbossIfNeeded() {
        if (!this.level.endbossFactory) {
            return;
        }

        if (this.character.x < this.level.endbossSpawnX) {
            return;
        }

        this.level.enemies.push(this.level.endbossFactory());
        this.level.endbossFactory = null;
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
            this.clearInputStates();
            this.updateRunningSound(false);

            setTimeout(() => {
                this.gameOver = true;
                this.clearInputStates();
            }, 900);
        }

        let boss = this.getEndboss();

        if (boss && boss.isBossDead && !this.gameWon) {
            this.gameWon = true;
            this.clearInputStates();
            this.updateRunningSound(false);
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
                this.playCoinSound();
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
            this.playBottleThrowSound();

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
                    this.playHitSound();

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
                this.playHitSound();

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
        this.actionButtons = {};

        if (!this.gameStarted) {
            this.drawFullscreenImage(this.startScreenImage, 'START');
            this.drawCanvasButton(
                this.soundEnabled ? 'SOUND ON' : 'SOUND OFF',
                24,
                24,
                160,
                48,
                'sound',
                this.soundEnabled
                    ? {
                          fillStyle: '#70d64f',
                          strokeStyle: '#1f5a15',
                          textStyle: '#15380d',
                          font: `24px ${this.fontFamily}`,
                          radius: 14,
                      }
                    : {
                          fillStyle: '#d8dadd',
                          strokeStyle: '#54585e',
                          textStyle: '#222831',
                          font: `24px ${this.fontFamily}`,
                          radius: 14,
                      }
            );
            this.drawCanvasButton(
                'START GAME',
                this.canvas.width / 2 - 130,
                this.canvas.height - 110,
                260,
                64,
                'start'
            );

            requestAnimationFrame(() => this.draw());
            return;
        }

        this.drawWorld();
        this.drawUi();

        if (this.gameOver) {
            this.drawEndScreen(this.gameOverImage, 'GAME OVER');
        } else if (this.gameWon) {
            this.drawEndScreen(this.youWinImage, 'YOU WIN');
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

        this.ctx.font = `20px ${this.fontFamily}`;
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
            this.ctx.font = `bold 48px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fallbackText, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }

    drawEndScreen(image, fallbackText) {
        this.drawScreenOverlay(image, fallbackText);
        this.drawCanvasButton('ZURÜCK', this.canvas.width / 2 - 110, this.canvas.height - 96, 220, 58, 'back');
    }

    drawScreenOverlay(image, fallbackText) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (image.complete && image.naturalWidth > 0) {
            const size = this.getContainedOverlaySize(image, this.canvas.width * 0.72, this.canvas.height * 0.6);
            this.ctx.globalAlpha = 0.92;
            this.ctx.drawImage(image, size.x, size.y, size.width, size.height);
            this.ctx.globalAlpha = 1;
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            this.ctx.fillRect(120, 140, this.canvas.width - 240, this.canvas.height - 280);
            this.ctx.fillStyle = 'white';
            this.ctx.font = `bold 42px ${this.fontFamily}`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(fallbackText, this.canvas.width / 2, this.canvas.height / 2);
        }

        this.ctx.restore();
    }

    drawCanvasButton(label, x, y, width, height, action, options = {}) {
        this.actionButtons[action] = { x, y, width, height };

        const {
            fillStyle = '#ffb300',
            strokeStyle = '#6b2d00',
            textStyle = '#3a1600',
            font = `32px ${this.fontFamily}`,
            radius = 18,
        } = options;

        this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = 4;
        this.drawRoundedRect(x, y, width, height, radius);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = textStyle;
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x + width / 2, y + height / 2 + 2);
        this.ctx.restore();
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
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