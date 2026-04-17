class WorldRenderer extends WorldGameplay {
    /** Draws the entire scene. */
    draw() {
        this.clearCanvas();
        this.actionButtons = {};
        this.gameStarted ? this.drawRunningScene() : this.drawStartScene();
        requestAnimationFrame(this.draw.bind(this));
    }

    /** Clears the visible area. */
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /** Draws the start scene. */
    drawStartScene() {
        this.drawFullscreenImage(this.startScreenImage);
        this.drawStartSceneButtons();
    }

    /** Draws the buttons on the start screen. */
    drawStartSceneButtons() {
        const width = 260;
        const height = 64;
        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2 + 40;
        this.drawActionButton(this.getSoundButtonLabel(), 24, 24, 160, 48, 'sound', this.getSoundButtonOptions());
        this.drawActionButton('START GAME', x, y, width, height, 'start');
    }

    /** Returns the label for the sound button. */
    getSoundButtonLabel() {
        return this.soundEnabled ? 'SOUND ON' : 'SOUND OFF';
    }

    /** Returns the style for the sound button. */
    getSoundButtonOptions() {
        if (this.soundEnabled) {
            return this.createButtonOptions('#70d64f', '#1f5a15', '#15380d', `24px ${this.fontFamily}`, 14);
        }

        return this.createButtonOptions('#d8dadd', '#54585e', '#222831', `24px ${this.fontFamily}`, 14);
    }

    /** Builds a button style object. */
    createButtonOptions(fillStyle, strokeStyle, textStyle, font, radius) {
        return { fillStyle, strokeStyle, textStyle, font, radius };
    }

    /** Draws the running game scene. */
    drawRunningScene() {
        this.drawWorld();
        this.drawUserInterface();

        if (this.gameOver) {
            this.drawEndScreen(this.gameOverImage);
        }

        if (this.gameWon) {
            this.drawEndScreen(this.youWinImage);
        }
    }

    /** Draws world objects with camera offset. */
    drawWorld() {
        this.context.translate(this.cameraX, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.enemies);
        this.addToMap(this.character);
        this.addObjectsToMap(this.throwableObjects);
        this.context.translate(-this.cameraX, 0);
    }

    /** Draws bars and counters. */
    drawUserInterface() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);

        if (this.shouldShowEndbossBar()) {
            this.addToMap(this.endbossBar);
        }

        this.drawCounters();
    }

    /** Draws the numeric collectible counters. */
    drawCounters() {
        this.context.font = `20px ${this.fontFamily}`;
        this.context.fillStyle = 'white';
        this.context.fillText(`${this.collectedBottles}/${this.maxBottles}`, 165, 88);
        this.context.fillText(`${this.collectedCoins}/${this.totalCoins}`, 165, 128);
    }

    /** Draws a full-screen image. */
    drawFullscreenImage(image) {
        if (image.complete && image.naturalWidth > 0) {
            this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /** Draws the end screen with action buttons. */
    drawEndScreen(image) {
        this.drawScreenOverlay(image);
        this.drawActionButton('HOME', this.canvas.width / 2 - 240, this.canvas.height - 96, 180, 58, 'home');
        this.drawActionButton('RESTART', this.canvas.width / 2 + 20, this.canvas.height - 96, 220, 58, 'restart');
    }

    /** Draws the semi-transparent end screen overlay. */
    drawScreenOverlay(image) {
        this.context.save();
        this.context.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawContainedOverlayImage(image, this.canvas.width * 0.72, this.canvas.height * 0.6);
        this.context.restore();
    }

    /** Draws an image proportionally inside the target area. */
    drawContainedOverlayImage(image, maxWidth, maxHeight) {
        if (!image.complete || image.naturalWidth === 0) {
            return;
        }

        const size = this.getContainedOverlaySize(image, maxWidth, maxHeight);
        this.context.globalAlpha = 0.92;
        this.context.drawImage(image, size.x, size.y, size.width, size.height);
        this.context.globalAlpha = 1;
    }

    /** Draws a clickable canvas button. */
    drawActionButton(label, x, y, width, height, actionName, options = {}) {
        this.actionButtons[actionName] = { x, y, width, height };
        const buttonOptions = this.mergeButtonOptions(options);
        this.paintButtonShape(x, y, width, height, buttonOptions);
        this.paintButtonLabel(label, x, y, width, height, buttonOptions);
    }

    /** Adds default values for buttons. */
    mergeButtonOptions(options) {
        return {
            fillStyle: options.fillStyle || '#ffb300',
            strokeStyle: options.strokeStyle || '#6b2d00',
            textStyle: options.textStyle || '#3a1600',
            font: options.font || `32px ${this.fontFamily}`,
            radius: options.radius || 18
        };
    }

    /** Paints the button shape. */
    paintButtonShape(x, y, width, height, options) {
        this.context.save();
        this.context.fillStyle = options.fillStyle;
        this.context.strokeStyle = options.strokeStyle;
        this.context.lineWidth = 4;
        this.drawRoundedRectangle(x, y, width, height, options.radius);
        this.context.fill();
        this.context.stroke();
        this.context.restore();
    }

    /** Paints the button label. */
    paintButtonLabel(label, x, y, width, height, options) {
        this.context.save();
        this.context.fillStyle = options.textStyle;
        this.context.font = options.font;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(label, x + width / 2, y + height / 2 + 2);
        this.context.restore();
    }

    /** Draws a rounded rectangle. */
    drawRoundedRectangle(x, y, width, height, radius) {
        this.context.beginPath();
        this.context.moveTo(x + radius, y);
        this.context.lineTo(x + width - radius, y);
        this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.context.lineTo(x + width, y + height - radius);
        this.context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.context.lineTo(x + radius, y + height);
        this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
    }

    /** Calculates the image size inside an area. */
    getContainedOverlaySize(image, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = image.naturalWidth * ratio;
        const height = image.naturalHeight * ratio;

        return {
            width,
            height,
            x: (this.canvas.width - width) / 2,
            y: (this.canvas.height - height) / 2
        };
    }

    /** Draws multiple objects in sequence. */
    addObjectsToMap(objects) {
        objects.forEach(this.addToMap.bind(this));
    }

    /** Draws a single object. */
    addToMap(drawableObject) {
        if (drawableObject.otherDirection) {
            this.flipImage(drawableObject);
        }

        drawableObject.draw(this.context);
        drawableObject.drawFrame(this.context);

        if (drawableObject.otherDirection) {
            this.restoreImageOrientation();
        }
    }

    /** Flips an object horizontally. */
    flipImage(drawableObject) {
        this.context.save();
        this.context.translate(drawableObject.x + drawableObject.width / 2, 0);
        this.context.scale(-1, 1);
        this.context.translate(-drawableObject.x - drawableObject.width / 2, 0);
    }

    /** Restores the original image orientation. */
    restoreImageOrientation() {
        this.context.restore();
    }
}