let canvas;
let world;
let keyboard = new Keyboard();
let fullscreenButton;
let gameStage;
let startScreenStateInterval;
let activeOverlayId = null;

const keyBindings = {
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    ArrowDown: 'DOWN',
    Space: 'SPACE',
    KeyD: 'D'
};

// Initialisiert das Spiel nach dem Laden der Seite.
function initializeGame() {
    canvas = document.getElementById('canvas');
    gameStage = document.getElementById('game-stage');
    fullscreenButton = document.getElementById('fullscreen-btn');
    world = new World(canvas, keyboard);
    bindCanvasEvents();
    bindKeyboardEvents();
    setupFullscreenButton();
    setupMobileControls();
    setupAudioUnlock();
    setupOverlays();
    synchronizeStartScreenOverlayButtons();
}

// Startet das Spiel bei Bedarf.
function startGameIfNeeded() {
    if (!world) {
        return;
    }

    world.handleUserInteraction();

    if (!world.gameStarted) {
        world.startGame();
    }
}

// Richtet Entsperrer für Audio ein.
function setupAudioUnlock() {
    window.addEventListener('pointerdown', handleAnyUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleAnyUserInteraction, { passive: true });
    window.addEventListener('keydown', handleAnyUserInteraction);
    window.addEventListener('focus', handleAnyUserInteraction);
}

// Reagiert auf jede Nutzerinteraktion.
function handleAnyUserInteraction() {
    if (world) {
        world.handleUserInteraction();
    }
}

// Richtet alle Overlay-Ereignisse ein.
function setupOverlays() {
    bindOverlayOpenButtons();
    bindOverlayCloseButtons();
    bindOverlayBackdropClicks();
}

// Bindet Buttons zum Öffnen eines Overlays.
function bindOverlayOpenButtons() {
    document.querySelectorAll('[data-open-overlay]').forEach((button) => {
        button.addEventListener('click', handleOverlayOpenClick);
    });
}

// Öffnet das gewünschte Overlay.
function handleOverlayOpenClick(event) {
    event.preventDefault();
    openOverlay(event.currentTarget.dataset.openOverlay);
}

// Bindet Buttons zum Schließen eines Overlays.
function bindOverlayCloseButtons() {
    document.querySelectorAll('[data-close-overlay]').forEach((button) => {
        button.addEventListener('click', handleOverlayCloseClick);
    });
}

// Schließt das gewünschte Overlay.
function handleOverlayCloseClick(event) {
    event.preventDefault();
    closeOverlay(event.currentTarget.dataset.closeOverlay);
}

// Schließt Overlays beim Klick auf den Hintergrund.
function bindOverlayBackdropClicks() {
    document.querySelectorAll('.page-overlay').forEach((overlay) => {
        overlay.addEventListener('click', handleOverlayBackdropClick);
    });
}

// Reagiert auf Hintergrundklicks eines Overlays.
function handleOverlayBackdropClick(event) {
    if (event.target.classList.contains('page-overlay')) {
        closeOverlay(event.currentTarget.id);
    }
}

// Öffnet ein Overlay per ID.
function openOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);

    if (!overlay) {
        return;
    }

    closeOverlay(activeOverlayId);
    activeOverlayId = overlayId;
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
}

// Schließt ein Overlay per ID.
function closeOverlay(overlayId = activeOverlayId) {
    if (!overlayId) {
        return;
    }

    const overlay = document.getElementById(overlayId);

    if (!overlay) {
        return;
    }

    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');

    if (activeOverlayId === overlayId) {
        activeOverlayId = null;
    }

    if (!hasOpenOverlay()) {
        document.body.classList.remove('overlay-open');
    }
}

// Prüft, ob ein Overlay geöffnet ist.
function hasOpenOverlay() {
    return !!document.querySelector('.page-overlay.is-visible');
}

// Öffnet oder schließt das Impressum.
function toggleImpressum(show) {
    show ? openOverlay('impressum-overlay') : closeOverlay('impressum-overlay');
}

// Öffnet oder schließt die Hilfe.
function toggleHelp(show) {
    show ? openOverlay('help-overlay') : closeOverlay('help-overlay');
}

// Hält die Startscreen-Buttons synchron.
function synchronizeStartScreenOverlayButtons() {
    if (!gameStage) {
        return;
    }

    clearInterval(startScreenStateInterval);
    updateStartScreenOverlayState();
    startScreenStateInterval = setInterval(updateStartScreenOverlayState, 120);
}

// Aktualisiert die Startscreen-Klasse.
function updateStartScreenOverlayState() {
    gameStage.classList.toggle('show-start-screen-actions', !!world && !world.gameStarted);
}

// Bindet den Klick auf das Canvas.
function bindCanvasEvents() {
    canvas.addEventListener('click', handleCanvasClick);
}

// Reagiert auf Canvas-Klicks.
function handleCanvasClick(event) {
    if (!world || hasOpenOverlay()) {
        return;
    }

    const position = getCanvasPosition(event);
    world.handleCanvasClick(position.x, position.y);
}

// Rechnet Browser-Koordinaten auf Canvas um.
function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

// Richtet die Tastatursteuerung ein.
function bindKeyboardEvents() {
    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);
}

// Reagiert auf gedrückte Tasten.
function handleWindowKeyDown(event) {
    handleAnyUserInteraction();

    if (event.code === 'Space') {
        event.preventDefault();
    }

    if (hasOpenOverlay()) {
        if (event.code === 'Escape') {
            closeOverlay();
        }
        return;
    }

    if (world && !world.gameStarted && isStartKey(event.code)) {
        event.preventDefault();
        startGameIfNeeded();
        return;
    }

    if (!world || world.gameOver || world.gameWon) {
        return;
    }

    setPressedKeyState(event.code, true);
}

// Reagiert auf losgelassene Tasten.
function handleWindowKeyUp(event) {
    setPressedKeyState(event.code, false);
}

// Prüft, ob die Taste das Spiel starten soll.
function isStartKey(code) {
    return code === 'Space' || code === 'Enter';
}

// Setzt den Tastenzustand passend zum Code.
function setPressedKeyState(code, isPressed) {
    if (code === 'ArrowUp') {
        keyboard.UP = isPressed;
        keyboard.SPACE = isPressed;
    }

    const propertyName = keyBindings[code];

    if (propertyName) {
        keyboard[propertyName] = isPressed;
    }
}

// Richtet den Vollbildknopf ein.
function setupFullscreenButton() {
    if (!document.fullscreenEnabled || !gameStage || !fullscreenButton) {
        return;
    }

    fullscreenButton.addEventListener('click', toggleFullscreenMode);
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    updateFullscreenIcon();
}

// Schaltet zwischen Vollbild und normal um.
async function toggleFullscreenMode() {
    try {
        document.fullscreenElement ? await document.exitFullscreen() : await gameStage.requestFullscreen();
    } catch (error) {
        console.error('Vollbild konnte nicht aktiviert werden.', error);
    }

    updateFullscreenIcon();
}

// Aktualisiert das Vollbildsymbol.
function updateFullscreenIcon() {
    if (fullscreenButton) {
        fullscreenButton.textContent = document.fullscreenElement ? '✕' : '⛶';
    }
}

// Richtet die mobilen Steuerflächen ein.
function setupMobileControls() {
    bindPressButton('btn-left', 'LEFT');
    bindPressButton('btn-right', 'RIGHT');
    bindPressButton('btn-jump', 'SPACE');
    bindPressButton('btn-throw', 'D');
}

// Bindet Touch- und Mausereignisse an einen Button.
function bindPressButton(buttonId, keyName) {
    const button = document.getElementById(buttonId);

    if (!button) {
        return;
    }

    bindButtonEvent(button, 'touchstart', handlePressStart.bind(null, keyName), { passive: false });
    bindButtonEvent(button, 'touchend', handlePressEnd.bind(null, keyName), { passive: false });
    bindButtonEvent(button, 'touchcancel', handlePressEnd.bind(null, keyName), { passive: false });
    bindButtonEvent(button, 'mousedown', handlePressStart.bind(null, keyName));
    bindButtonEvent(button, 'mouseup', handlePressEnd.bind(null, keyName));
    bindButtonEvent(button, 'mouseleave', handlePressEnd.bind(null, keyName));
}

// Bindet ein einzelnes Ereignis an einen Button.
function bindButtonEvent(button, eventName, handler, options) {
    button.addEventListener(eventName, handler, options);
}

// Reagiert auf das Drücken eines mobilen Buttons.
function handlePressStart(keyName, event) {
    event.preventDefault();

    if (!world || hasOpenOverlay()) {
        keyboard[keyName] = false;
        return;
    }

    world.handleUserInteraction();

    if (world.gameOver || world.gameWon) {
        keyboard[keyName] = false;
        return;
    }

    startGameIfNeeded();
    keyboard[keyName] = true;
}

// Reagiert auf das Loslassen eines mobilen Buttons.
function handlePressEnd(keyName, event) {
    event.preventDefault();
    keyboard[keyName] = false;
}