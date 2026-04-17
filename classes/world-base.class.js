class WorldBase {
    character = new Character();
    level = null;
    canvas = null;
    context = null;
    keyboard = null;
    cameraX = 0;
    statusBar = new StatusBar({ x: 10, y: 10, percentage: 100, imagePaths: HEALTH_STATUS_BAR_IMAGES });
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
    fontFamily = '"Zabars", Arial, sans-serif';
    startScreenImage = new Image();
    gameOverImage = new Image();
    youWinImage = new Image();

    /** Creates the game world. */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.loadScreenImages();
        this.resetGame();
        this.draw();
        this.startLoop();
    }

    /** Loads start and end images. */
    loadScreenImages() {
        this.startScreenImage.src = 'img/9_intro_outro_screens/start/startscreen_1.png';
        this.gameOverImage.src = 'img/You won, you lost/Game Over.png';
        this.youWinImage.src = 'img/You won, you lost/You Won B.png';
    }

    /** Resets the entire game. */
    resetGame() {
        this.detachOldCharacter();
        this.clearInputStates();
        this.buildFreshGameState();
        this.assignWorldReferences();
        this.synchronizeAudioState();
    }

    /** Detaches old world references. */
    detachOldCharacter() {
        if (this.character) {
            this.character.world = null;
        }

        if (this.level) {
            this.level.enemies.forEach(this.detachEnemyWorld.bind(this));
        }
    }

    /** Detaches the world from an enemy. */
    detachEnemyWorld(enemy) {
        enemy.world = null;
    }

    /** Builds a fresh game state. */
    buildFreshGameState() {
        this.level = createLevel1();
        this.character = new Character();
        this.statusBar = this.createHealthBar();
        this.bottleBar = new BottleStatusBar();
        this.coinBar = new CoinStatusBar();
        this.endbossBar = new EndbossStatusBar();
        this.resetProgressValues();
    }

    /** Creates the health bar. */
    createHealthBar() {
        return new StatusBar(this.createHealthBarConfiguration());
    }

    /** Returns the health bar configuration. */
    createHealthBarConfiguration() {
        return { x: 10, y: 10, percentage: 100, imagePaths: HEALTH_STATUS_BAR_IMAGES };
    }

    /** Sets collectible values and states. */
    resetProgressValues() {
        this.throwableObjects = [];
        this.throwKeyWasPressed = false;
        this.collectedBottles = 0;
        this.collectedCoins = 0;
        this.totalCoins = this.level.coins.length;
        this.cameraX = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.endScreenScheduled = false;
        this.actionButtons = {};
        this.updateRunningSound(false);
    }

    /** Connects objects to the current world. */
    assignWorldReferences() {
        this.character.world = this;
        this.character.animate();
        this.level.enemies.forEach(this.attachEnemyWorld.bind(this));
        this.statusBar.setPercentage(100);
        this.bottleBar.setPercentage(0);
        this.coinBar.setPercentage(0);
        this.endbossBar.setPercentage(100);
    }

    /** Assigns the world to an enemy. */
    attachEnemyWorld(enemy) {
        enemy.world = this;
    }

    /** Clears all input states. */
    clearInputStates() {
        this.keyboard.LEFT = false;
        this.keyboard.RIGHT = false;
        this.keyboard.UP = false;
        this.keyboard.DOWN = false;
        this.keyboard.SPACE = false;
        this.keyboard.D = false;
    }

    /** Starts the game once. */
    startGame() {
        if (this.gameStarted || this.gameOver || this.gameWon) {
            return;
        }

        this.handleUserInteraction();
        this.clearInputStates();
        this.gameStarted = true;
    }

    /** Starts a new round directly. */
    restartGame() {
        this.resetGame();
        this.startGame();
    }

    /** Returns to the start screen. */
    returnToStartScreen() {
        this.resetGame();
    }

    /** Handles canvas clicks. */
    handleCanvasClick(x, y) {
        this.handleUserInteraction();
        const actionName = this.getClickedActionName(x, y);

        if (actionName) {
            this.handleActionButton(actionName);
        }
    }

    /** Returns the name of the clicked button. */
    getClickedActionName(x, y) {
        return Object.keys(this.actionButtons).find((actionName) => {
            return this.isInsideButton(this.actionButtons[actionName], x, y);
        });
    }

    /** Runs a button action. */
    handleActionButton(actionName) {
        const actions = {
            sound: () => this.toggleSound(),
            start: () => this.startGame(),
            restart: () => this.restartGame(),
            home: () => this.returnToStartScreen(),
            back: () => this.returnToStartScreen()
        };

        if (actions[actionName]) {
            actions[actionName]();
        }
    }

    /** Checks whether a point is inside a button. */
    isInsideButton(button, x, y) {
        if (!button) {
            return false;
        }

        return x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height;
    }

    /** Toggles sound on or off. */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.synchronizeAudioState();
    }

    /** Starts the world logic. */
    startLoop() {
        setInterval(this.updateWorld.bind(this), 1000 / 60);
    }

    /** Checks whether the game loop is paused. */
    isLoopPaused() {
        return !this.gameStarted || this.gameOver || this.gameWon;
    }

    /** Returns the end of the background. */
    getBackgroundEndX() {
        if (!this.level.backgroundObjects.length) {
            return this.canvas.width;
        }

        return Math.max(...this.level.backgroundObjects.map(this.getBackgroundObjectEndX));
    }

    /** Returns the end of a background object. */
    getBackgroundObjectEndX(backgroundObject) {
        return backgroundObject.x + backgroundObject.width;
    }

    /** Calculates the camera position for the character. */
    getCameraOffsetFor(characterX) {
        const desiredCameraX = -characterX + 100;
        const maxCameraOffset = Math.min(0, this.canvas.width - this.getBackgroundEndX());
        return Math.max(maxCameraOffset, Math.min(0, desiredCameraX));
    }

    /** Finds the end boss in the level. */
    getEndboss() {
        return this.level.enemies.find(this.isEndboss.bind(this));
    }

    /** Checks whether an enemy is the end boss. */
    isEndboss(enemy) {
        return enemy instanceof Endboss;
    }

    /** Spawns the end boss when the area is reached. */
    spawnEndbossIfNeeded() {
        if (!this.level.endbossFactory || this.character.x < this.level.endbossSpawnX) {
            return;
        }

        const endboss = this.level.endbossFactory();
        endboss.world = this;
        this.level.enemies.push(endboss);
        this.level.endbossFactory = null;
    }

    /** Checks whether the end boss bar should be visible. */
    shouldShowEndbossBar() {
        const endboss = this.getEndboss();
        return !!endboss && !endboss.isBossDead && this.character.x > endboss.x - 650;
    }
}