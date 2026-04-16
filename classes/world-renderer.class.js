class WorldRenderer extends WorldGameplay {
    // Zeichnet die komplette Szene.
    draw() {
        this.clearCanvas();
        this.actionButtons = {};
        this.gameStarted ? this.drawRunningScene() : this.drawStartScene();
        requestAnimationFrame(this.draw.bind(this));
    }

    // Löscht den sichtbaren Bereich.
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Zeichnet die Startsituation.
    drawStartScene() {
        this.drawFullscreenImage(this.startScreenImage);
        this.drawStartSceneButtons();
    }

    // Zeichnet die Buttons auf dem Startbildschirm.
    drawStartSceneButtons() {
        this.drawActionButton(this.getSoundButtonLabel(), 24, 24, 160, 48, 'sound', this.getSoundButtonOptions());
        this.drawActionButton('START GAME', this.canvas.width / 2 - 130, this.canvas.height - 110, 260, 64, 'start');
    }

    // Liefert die Beschriftung des Soundbuttons.
    getSoundButtonLabel() {
        return this.soundEnabled ? 'SOUND ON' : 'SOUND OFF';
    }

    // Liefert das Design des Soundbuttons.
    getSoundButtonOptions() {
        if (this.soundEnabled) {
            return this.createButtonOptions('#70d64f', '#1f5a15', '#15380d', `24px ${this.fontFamily}`, 14);
        }

        return this.createButtonOptions('#d8dadd', '#54585e', '#222831', `24px ${this.fontFamily}`, 14);
    }

    // Baut ein Button-Designobjekt.
    createButtonOptions(fillStyle, strokeStyle, textStyle, font, radius) {
        return { fillStyle, strokeStyle, textStyle, font, radius };
    }

    // Zeichnet die laufende Spielszene.
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

    // Zeichnet Weltobjekte mit Kameraversatz.
    drawWorld() {
        this.context.translate(this.cameraX, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.context.translate(-this.cameraX, 0);
    }

    // Zeichnet Leisten und Zähler.
    drawUserInterface() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.shouldShowEndbossBar()) {
            this.addToMap(this.endbossBar);
        }
        this.drawCounters();
    }

    // Zeichnet die Zahlenwerte der Sammlungen.
    drawCounters() {
        this.context.font = `20px ${this.fontFamily}`;
        this.context.fillStyle = 'white';
        this.context.fillText(`${this.collectedBottles}/${this.maxBottles}`, 165, 88);
        this.context.fillText(`${this.collectedCoins}/${this.totalCoins}`, 165, 128);
    }

    // Zeichnet ein bildfüllendes Motiv.
    drawFullscreenImage(image) {
        if (image.complete && image.naturalWidth > 0) {
            this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    // Zeichnet den Endbildschirm mit Rück-Button.
    drawEndScreen(image) {
        this.drawScreenOverlay(image);
        this.drawActionButton('ZURÜCK', this.canvas.width / 2 - 110, this.canvas.height - 96, 220, 58, 'back');
    }

    // Zeichnet das halbtransparente Endscreen-Overlay.
    drawScreenOverlay(image) {
        this.context.save();
        this.context.fillStyle = 'rgba(0, 0, 0, 0.35)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawContainedOverlayImage(image, this.canvas.width * 0.72, this.canvas.height * 0.6);
        this.context.restore();
    }

    // Zeichnet ein Bild proportional in den Zielbereich.
    drawContainedOverlayImage(image, maxWidth, maxHeight) {
        if (!image.complete || image.naturalWidth === 0) {
            return;
        }

        const size = this.getContainedOverlaySize(image, maxWidth, maxHeight);
        this.context.globalAlpha = 0.92;
        this.context.drawImage(image, size.x, size.y, size.width, size.height);
        this.context.globalAlpha = 1;
    }

    // Zeichnet einen klickbaren Canvas-Button.
    drawActionButton(label, x, y, width, height, actionName, options = {}) {
        this.actionButtons[actionName] = { x, y, width, height };
        const buttonOptions = this.mergeButtonOptions(options);
        this.paintButtonShape(x, y, width, height, buttonOptions);
        this.paintButtonLabel(label, x, y, width, height, buttonOptions);
    }

    // Ergänzt Standardwerte für Buttons.
    mergeButtonOptions(options) {
        return {
            fillStyle: options.fillStyle || '#ffb300',
            strokeStyle: options.strokeStyle || '#6b2d00',
            textStyle: options.textStyle || '#3a1600',
            font: options.font || `32px ${this.fontFamily}`,
            radius: options.radius || 18
        };
    }

    // Malt die Buttonfläche.
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

    // Malt die Buttonbeschriftung.
    paintButtonLabel(label, x, y, width, height, options) {
        this.context.save();
        this.context.fillStyle = options.textStyle;
        this.context.font = options.font;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(label, x + width / 2, y + height / 2 + 2);
        this.context.restore();
    }

    // Zeichnet ein Rechteck mit runden Ecken.
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

    // Berechnet die Bildgröße innerhalb eines Bereichs.
    getContainedOverlaySize(image, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
        const width = image.naturalWidth * ratio;
        const height = image.naturalHeight * ratio;
        return { width, height, x: (this.canvas.width - width) / 2, y: (this.canvas.height - height) / 2 };
    }

    // Zeichnet mehrere Objekte nacheinander.
    addObjectsToMap(objects) {
        objects.forEach(this.addToMap.bind(this));
    }

    // Zeichnet ein einzelnes Objekt.
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

    // Spiegelt ein Objekt horizontal.
    flipImage(drawableObject) {
        this.context.save();
        this.context.translate(drawableObject.x + drawableObject.width / 2, 0);
        this.context.scale(-1, 1);
        this.context.translate(-drawableObject.x - drawableObject.width / 2, 0);
    }

    // Hebt die Spiegelung wieder auf.
    restoreImageOrientation() {
        this.context.restore();
    }
}