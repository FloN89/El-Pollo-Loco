let canvas;
let world;
let keyboard = new Keyboard();
let fullscreenButton;
let gameStage;
let startScreenStateInterval;

const keyBindings = { ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', ArrowDown: 'DOWN', Space: 'SPACE', KeyD: 'D' };

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
    synchronizeStartScreenImprint();
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

// Hält den Impressum-Link auf dem Startbildschirm synchron.
function synchronizeStartScreenImprint() {
    if (!gameStage) {
        return;
    }

    startScreenStateInterval = setInterval(updateStartScreenImprintState, 120);
}

// Aktualisiert die Startscreen-Klasse.
function updateStartScreenImprintState() {
    gameStage.classList.toggle('show-start-screen-imprint', !!world && !world.gameStarted);
}

// Bindet den Klick auf das Canvas.
function bindCanvasEvents() {
    canvas.addEventListener('click', handleCanvasClick);
}

// Reagiert auf Canvas-Klicks.
function handleCanvasClick(event) {
    if (!world) {
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
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
}

// Richtet die Tastatursteuerung ein.
function bindKeyboardEvents() {
    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);
}

// Reagiert auf gedrückte Tasten.
function handleWindowKeyDown(event) {
    handleAnyUserInteraction();

    if (world && !world.gameStarted && isStartKey(event.code)) {
        event.preventDefault();
        startGameIfNeeded();
        return;
    }

    if (event.code === 'Space') {
        event.preventDefault();
    }

    if (!world || world.gameOver || world.gameWon) {
        return;
    }

    setPressedKeyState(event.code, true);
}

function isStartKey(code) {
    return code === 'Enter';
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
    if (!world) {
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

function toggleImpressum(show) {
    const dialog = document.getElementById('impressum-dialog');

    if (!dialog) {
        return;
    }

    if (show) {
        dialog.showModal();
    } else {
        dialog.close();
    }
}