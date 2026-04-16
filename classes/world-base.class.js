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

    /** Erstellt die Spielwelt. */
    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.loadScreenImages();
        this.resetGame();
        this.draw();
        this.startLoop();
    }

    /** Lädt Start- und Endbilder. */
    loadScreenImages() {
        this.startScreenImage.src = './img/9_intro_outro_screens/start/startscreen_1.png';
        this.gameOverImage.src = './img/You won, you lost/Game Over.png';
        this.youWinImage.src = './img/You won, you lost/You Won B.png';
    }

    /** Setzt das gesamte Spiel zurück. */
    resetGame() {
        this.detachOldCharacter();
        this.clearInputStates();
        this.buildFreshGameState();
        this.assignWorldReferences();
        this.synchronizeAudioState();
    }

    /** Trennt alte Weltreferenzen. */
    detachOldCharacter() {
        if (this.character) {
            this.character.world = null;
        }

        if (this.level) {
            this.level.enemies.forEach(this.detachEnemyWorld.bind(this));
        }
    }

    /** Trennt die Welt von einem Gegner. */
    detachEnemyWorld(enemy) {
        enemy.world = null;
    }

    /** Baut einen frischen Spielzustand auf. */
    buildFreshGameState() {
        this.level = createLevel1();
        this.character = new Character();
        this.statusBar = this.createHealthBar();
        this.bottleBar = new BottleStatusBar();
        this.coinBar = new CoinStatusBar();
        this.endbossBar = new EndbossStatusBar();
        this.resetProgressValues();
    }

    /** Erstellt die Lebensleiste. */
    createHealthBar() {
        return new StatusBar(this.createHealthBarConfiguration());
    }

    /** Liefert die Konfiguration der Lebensleiste. */
    createHealthBarConfiguration() {
        return { x: 10, y: 10, percentage: 100, imagePaths: HEALTH_STATUS_BAR_IMAGES };
    }

    /** Setzt sammelbare Werte und Zustände zurück. */
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

    /** Verbindet Objekte mit der aktuellen Welt. */
    assignWorldReferences() {
        this.character.world = this;
        this.character.animate();
        this.level.enemies.forEach(this.attachEnemyWorld.bind(this));
        this.statusBar.setPercentage(100);
        this.bottleBar.setPercentage(0);
        this.coinBar.setPercentage(0);
        this.endbossBar.setPercentage(100);
    }

    /** Hängt die Welt an einen Gegner. */
    attachEnemyWorld(enemy) {
        enemy.world = this;
    }

    /** Löscht alle Eingaben. */
    clearInputStates() {
        this.keyboard.LEFT = false;
        this.keyboard.RIGHT = false;
        this.keyboard.UP = false;
        this.keyboard.DOWN = false;
        this.keyboard.SPACE = false;
        this.keyboard.D = false;
    }

    /** Startet das Spiel einmalig. */
    startGame() {
        if (this.gameStarted || this.gameOver || this.gameWon) {
            return;
        }

        this.handleUserInteraction();
        this.clearInputStates();
        this.gameStarted = true;
    }

    /** Startet direkt eine neue Runde. */
    restartGame() {
        this.resetGame();
        this.startGame();
    }

    /** Kehrt zum Startbildschirm zurück. */
    returnToStartScreen() {
        this.resetGame();
    }

    /** Verarbeitet Klicks auf dem Canvas. */
    handleCanvasClick(x, y) {
        this.handleUserInteraction();
        const actionName = this.getClickedActionName(x, y);

        if (actionName) {
            this.handleActionButton(actionName);
        }
    }

    /** Liefert den Namen des getroffenen Buttons. */
    getClickedActionName(x, y) {
        return Object.keys(this.actionButtons).find((actionName) => {
            return this.isInsideButton(this.actionButtons[actionName], x, y);
        });
    }

    /** Führt eine Button-Aktion aus. */
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

    /** Prüft, ob ein Punkt in einem Button liegt. */
    isInsideButton(button, x, y) {
        if (!button) {
            return false;
        }

        return x >= button.x && x <= button.x + button.width && y >= button.y && y <= button.y + button.height;
    }

    /** Schaltet Ton an oder aus. */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.synchronizeAudioState();
    }

    /** Startet die Weltlogik. */
    startLoop() {
        setInterval(this.updateWorld.bind(this), 1000 / 60);
    }

    /** Prüft, ob der Spielzyklus aktiv ist. */
    isLoopPaused() {
        return !this.gameStarted || this.gameOver || this.gameWon;
    }

    /** Liefert das Ende des Hintergrunds. */
    getBackgroundEndX() {
        if (!this.level.backgroundObjects.length) {
            return this.canvas.width;
        }

        return Math.max(...this.level.backgroundObjects.map(this.getBackgroundObjectEndX));
    }

    /** Liefert das Ende eines Hintergrundobjekts. */
    getBackgroundObjectEndX(backgroundObject) {
        return backgroundObject.x + backgroundObject.width;
    }

    /** Berechnet die Kameraposition für den Charakter. */
    getCameraOffsetFor(characterX) {
        const desiredCameraX = -characterX + 100;
        const maxCameraOffset = Math.min(0, this.canvas.width - this.getBackgroundEndX());
        return Math.max(maxCameraOffset, Math.min(0, desiredCameraX));
    }

    /** Sucht den Endboss im Level. */
    getEndboss() {
        return this.level.enemies.find(this.isEndboss.bind(this));
    }

    /** Prüft, ob ein Gegner der Endboss ist. */
    isEndboss(enemy) {
        return enemy instanceof Endboss;
    }

    /** Erzeugt den Endboss beim Erreichen des Bereichs. */
    spawnEndbossIfNeeded() {
        if (!this.level.endbossFactory || this.character.x < this.level.endbossSpawnX) {
            return;
        }

        const endboss = this.level.endbossFactory();
        endboss.world = this;
        this.level.enemies.push(endboss);
        this.level.endbossFactory = null;
    }

    /** Prüft, ob die Endbossleiste sichtbar sein soll. */
    shouldShowEndbossBar() {
        const endboss = this.getEndboss();
        return !!endboss && !endboss.isBossDead && this.character.x > endboss.x - 650;
    }
}