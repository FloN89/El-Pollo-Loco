let canvas;
let world;
let keyboard = new Keyboard();
let gameStage;
let fullscreenButton;
let helpOverlay;
let mobileButtons = [];

/** Initialisiert das Spiel nach dem Laden der Seite. */
function initializeGame() {
    cacheElements();
    world = new World(canvas, keyboard);
    setupAudioUnlock();
    setupHelpOverlay();
    synchronizeStartScreenOverlayButtons();
    bindCanvasEvents();
    bindKeyboardEvents();
    setupFullscreenButton();
    setupMobileControls();
    setupOrientationGuard();
}
/** Sammelt wichtige DOM-Elemente. */
function cacheElements() {
    canvas = document.getElementById('canvas');
    gameStage = document.getElementById('game-stage');
    fullscreenButton = document.getElementById('fullscreen-btn');
    helpOverlay = document.getElementById('help-overlay');
    mobileButtons = Array.from(document.querySelectorAll('.mobile-btn'));
}

/** Startet das Spiel bei Bedarf. */
function startGameIfNeeded() {
    if (!world.gameStarted && !world.gameOver && !world.gameWon) {
        world.startGame();
        synchronizeStartScreenOverlayButtons();
    }
}

/** Richtet Entsperrer für Audio ein. */
function setupAudioUnlock() {
    ['click', 'touchstart', 'keydown'].forEach((eventName) => {
        document.addEventListener(eventName, handleAnyUserInteraction, { once: true });
    });
}

/** Reagiert auf jede Nutzerinteraktion. */
function handleAnyUserInteraction() {
    world.handleUserInteraction();
    synchronizeStartScreenOverlayButtons();
}

/** Richtet die Hilfe ein. */
function setupHelpOverlay() {
    bindHelpOpenButtons();
    bindHelpCloseButtons();
}

/** Bindet alle Öffner für die Hilfe. */
function bindHelpOpenButtons() {
    document.getElementById('start-screen-help').addEventListener('click', openHelpOverlay);
}

/** Öffnet die Hilfe. */
function openHelpOverlay() {
    helpOverlay.classList.add('is-visible');
    helpOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
}

/** Bindet alle Schließer für die Hilfe. */
function bindHelpCloseButtons() {
    document.getElementById('help-overlay-close').addEventListener('click', closeHelpOverlay);
    document.getElementById('help-overlay-action').addEventListener('click', closeHelpOverlay);
    helpOverlay.addEventListener('click', handleHelpBackdropClick);
}

/** Schließt die Hilfe. */
function closeHelpOverlay() {
    helpOverlay.classList.remove('is-visible');
    helpOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
}

/** Reagiert auf Klicks auf den Overlay-Hintergrund. */
function handleHelpBackdropClick(event) {
    if (event.target === helpOverlay) {
        closeHelpOverlay();
    }
}

/** Prüft, ob die Hilfe sichtbar ist. */
function isHelpOpen() {
    return helpOverlay.classList.contains('is-visible');
}

/** Hält die Startscreen-Buttons synchron. */
function synchronizeStartScreenOverlayButtons() {
    updateStartScreenOverlayState(!world.gameStarted && !world.gameOver && !world.gameWon);
}

/** Schaltet die Startscreen-Klasse. */
function updateStartScreenOverlayState(shouldShow) {
    gameStage.classList.toggle('show-start-screen-actions', shouldShow);
}

/** Bindet den Klick auf das Canvas. */
function bindCanvasEvents() {
    canvas.addEventListener('click', handleCanvasClick);
}

/** Reagiert auf Canvas-Klicks. */
function handleCanvasClick(event) {
    if (shouldBlockGameplayForOrientation()) {
        return;
    }

    const position = getCanvasPosition(event);
    world.handleCanvasClick(position.x, position.y);
    synchronizeStartScreenOverlayButtons();
}

/** Rechnet Browser-Koordinaten auf Canvas um. */
function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

/** Richtet die Tastatursteuerung ein. */
function bindKeyboardEvents() {
    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);
}

/** Reagiert auf gedrückte Tasten. */
function handleWindowKeyDown(event) {
    if (shouldBlockGameplayForOrientation()) {
        return;
    }

    handleStartKey(event.code);

    if (canReadKeyboard()) {
        setPressedKeyState(event.code, true);
    }
}

/** Startet das Spiel per Tastatur. */
function handleStartKey(code) {
    if (!isStartKey(code) || isHelpOpen()) {
        return;
    }

    startGameIfNeeded();
}

/** Prüft, ob die Taste das Spiel startet. */
function isStartKey(code) {
    return code === 'Enter' || code === 'Space';
}

/** Prüft, ob Tasten ins Spiel dürfen. */
function canReadKeyboard() {
    return !world.gameOver && !world.gameWon && !isHelpOpen();
}

/** Reagiert auf losgelassene Tasten. */
function handleWindowKeyUp(event) {
    setPressedKeyState(event.code, false);
}

/** Setzt den Tastenzustand passend zum Code. */
function setPressedKeyState(code, isPressed) {
    const keyMap = {
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        Space: 'SPACE',
        KeyD: 'D'
    };

    if (keyMap[code]) {
        keyboard[keyMap[code]] = isPressed;
    }
}

/** Richtet den Vollbildknopf ein. */
function setupFullscreenButton() {
    if (!document.fullscreenEnabled || !gameStage || !fullscreenButton) {
        return;
    }

    fullscreenButton.addEventListener('click', toggleFullscreenMode);
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
}

/** Schaltet zwischen Vollbild und normal um. */
async function toggleFullscreenMode() {
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await gameStage.requestFullscreen();
            await tryLockLandscapeOrientation();
        }
    } catch (error) {
        updateFullscreenIcon();
    }
}

/** Aktualisiert das Vollbildsymbol. */
function updateFullscreenIcon() {
    if (fullscreenButton) {
        fullscreenButton.textContent = document.fullscreenElement ? '✕' : '⛶';
    }
}

/** Richtet die mobilen Steuerflächen ein. */
function setupMobileControls() {
    blockMobileContextMenus();
    bindPressButton('btn-left', 'LEFT');
    bindPressButton('btn-right', 'RIGHT');
    bindPressButton('btn-jump', 'SPACE');
    bindPressButton('btn-throw', 'D');
}

/** Verhindert Kontextmenüs auf mobilen Buttons. */
function blockMobileContextMenus() {
    mobileButtons.forEach((button) => button.addEventListener('contextmenu', stopButtonContextMenu));
}

/** Stoppt das Kontextmenü. */
function stopButtonContextMenu(event) {
    event.preventDefault();
}

/** Bindet Druck- und Loslass-Events an einen Button. */
function bindPressButton(buttonId, keyName) {
    const button = document.getElementById(buttonId);

    if (!button) {
        return;
    }

    button.dataset.key = keyName;
    ['touchstart', 'mousedown'].forEach((name) => button.addEventListener(name, handlePressStart));
    ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach((name) => button.addEventListener(name, handlePressEnd));
}

/** Reagiert auf das Drücken eines mobilen Buttons. */
function handlePressStart(event) {
    const button = event.currentTarget;

    if (shouldIgnoreMobileInput(event, button)) {
        return;
    }

    event.preventDefault();
    world.handleUserInteraction();
    keyboard[button.dataset.key] = true;
    startGameIfNeeded();
}

/** Prüft, ob ein mobiler Input ignoriert werden soll. */
function shouldIgnoreMobileInput(event, button) {
    return !button ||
        !button.dataset.key ||
        world.gameOver ||
        world.gameWon ||
        isHelpOpen() ||
        shouldBlockGameplayForOrientation() ||
        isSecondaryMouseButton(event);
}

/** Prüft, ob die zweite Maustaste benutzt wurde. */
function isSecondaryMouseButton(event) {
    return event.type === 'mousedown' && event.button !== 0;
}

/** Reagiert auf das Loslassen eines mobilen Buttons. */
function handlePressEnd(event) {
    const button = event.currentTarget;

    if (button?.dataset.key) {
        keyboard[button.dataset.key] = false;
    }
}

/** Erzwingt auf Mobile/Tablets das Spielen im Querformat. */
function setupOrientationGuard() {
    updateOrientationRequirement();

    ['resize', 'orientationchange'].forEach((eventName) => {
        window.addEventListener(eventName, updateOrientationRequirement);
    });

    document.addEventListener('fullscreenchange', updateOrientationRequirement);
}

/** Aktualisiert den Sperrstatus je nach Geräteausrichtung. */
function updateOrientationRequirement() {
    const isBlocked = shouldBlockGameplayForOrientation();
    document.body.classList.toggle('portrait-game-blocked', isBlocked);

    if (isBlocked) {
        releaseAllKeys();
        return;
    }

    tryLockLandscapeOrientation();
}

/** Prüft, ob das Spiel wegen Hochformat blockiert werden soll. */
function shouldBlockGameplayForOrientation() {
    return isMobileOrTabletDevice() && window.innerHeight > window.innerWidth;
}

/** Erkennt Mobile- und Tablet-Geräte. */
function isMobileOrTabletDevice() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** Setzt alle gedrückten Tasten zurück. */
function releaseAllKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

/** Versucht unterstützte Geräte auf Querformat zu sperren. */
async function tryLockLandscapeOrientation() {
    if (!isMobileOrTabletDevice()) {
        return;
    }

    if (window.innerWidth <= window.innerHeight) {
        return;
    }

    if (!screen.orientation?.lock) {
        return;
    }

    try {
        await screen.orientation.lock('landscape');
    } catch (error) {}
}