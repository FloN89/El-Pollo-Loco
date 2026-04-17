let canvas;
let world;
let keyboard = new Keyboard();
let gameStage;
let fullscreenButton;
let helpOverlay;
let mobileButtons = [];

/** Initializes the game after the page has loaded. */
function initializeGame() {
    cacheElements();
    world = new World(canvas, keyboard);
    setupAudioUnlock();
    setupHelpOverlay();
    synchronizeStartScreenOverlayButtons();
    bindCanvasEvents();
    bindCanvasHoverEvents();
    bindKeyboardEvents();
    setupFullscreenButton();
    setupMobileControls();
    setupOrientationGuard();
}

/** Collects important DOM elements. */
function cacheElements() {
    canvas = document.getElementById('canvas');
    gameStage = document.getElementById('game-stage');
    fullscreenButton = document.getElementById('fullscreen-btn');
    helpOverlay = document.getElementById('help-overlay');
    mobileButtons = Array.from(document.querySelectorAll('.mobile-btn'));
}

/** Starts the game when needed. */
function startGameIfNeeded() {
    if (!world.gameStarted && !world.gameOver && !world.gameWon) {
        world.startGame();
        synchronizeStartScreenOverlayButtons();
    }
}

/** Sets up the audio unlock handlers. */
function setupAudioUnlock() {
    ['click', 'touchstart', 'keydown'].forEach((eventName) => {
        document.addEventListener(eventName, handleAnyUserInteraction, { once: true });
    });
}

/** Handles any user interaction. */
function handleAnyUserInteraction() {
    world.handleUserInteraction();
    synchronizeStartScreenOverlayButtons();
}

/** Sets up the help overlay. */
function setupHelpOverlay() {
    bindHelpOpenButtons();
    bindHelpCloseButtons();
}

/** Binds all help open buttons. */
function bindHelpOpenButtons() {
    document.getElementById('start-screen-help').addEventListener('click', openHelpOverlay);
}

/** Opens the help overlay. */
function openHelpOverlay() {
    helpOverlay.classList.add('is-visible');
    helpOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
}

/** Binds all help close buttons. */
function bindHelpCloseButtons() {
    document.getElementById('help-overlay-close').addEventListener('click', closeHelpOverlay);
    document.getElementById('help-overlay-action').addEventListener('click', closeHelpOverlay);
    helpOverlay.addEventListener('click', handleHelpBackdropClick);
}

/** Closes the help overlay. */
function closeHelpOverlay() {
    helpOverlay.classList.remove('is-visible');
    helpOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
}

/** Handles clicks on the overlay backdrop. */
function handleHelpBackdropClick(event) {
    if (event.target === helpOverlay) {
        closeHelpOverlay();
    }
}

/** Checks whether the help overlay is visible. */
function isHelpOpen() {
    return helpOverlay.classList.contains('is-visible');
}

/** Keeps the start screen buttons in sync. */
function synchronizeStartScreenOverlayButtons() {
    updateStartScreenOverlayState(!world.gameStarted && !world.gameOver && !world.gameWon);
}

/** Toggles the start screen class. */
function updateStartScreenOverlayState(shouldShow) {
    gameStage.classList.toggle('show-start-screen-actions', shouldShow);
}

/** Binds the click handler for the canvas. */
function bindCanvasEvents() {
    canvas.addEventListener('click', handleCanvasClick);
}

/** Binds hover handlers for canvas buttons. */
function bindCanvasHoverEvents() {
    canvas.addEventListener('mousemove', handleCanvasPointerMove);
    canvas.addEventListener('mouseleave', resetCanvasCursor);
}

/** Handles canvas clicks. */
function handleCanvasClick(event) {
    if (shouldBlockGameplayForOrientation()) {
        return;
    }

    const position = getCanvasPosition(event);
    world.handleCanvasClick(position.x, position.y);
    synchronizeStartScreenOverlayButtons();
}

/** Handles pointer movement over the canvas. */
function handleCanvasPointerMove(event) {
    if (shouldBlockGameplayForOrientation()) {
        resetCanvasCursor();
        return;
    }

    const position = getCanvasPosition(event);
    updateCanvasCursor(position.x, position.y);
}

/** Updates the canvas cursor for clickable action buttons. */
function updateCanvasCursor(x, y) {
    const isHoveringActionButton = Object.values(world?.actionButtons ?? {}).some((button) =>
        isPointInsideButton(x, y, button)
    );

    canvas.style.cursor = isHoveringActionButton ? 'pointer' : 'default';
}

/** Resets the canvas cursor. */
function resetCanvasCursor() {
    canvas.style.cursor = 'default';
}

/** Checks whether a point is inside a button. */
function isPointInsideButton(x, y, button) {
    return !!button &&
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height;
}

/** Converts browser coordinates to canvas coordinates. */
function getCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

/** Sets up keyboard controls. */
function bindKeyboardEvents() {
    window.addEventListener('keydown', handleWindowKeyDown);
    window.addEventListener('keyup', handleWindowKeyUp);
}

/** Handles pressed keys. */
function handleWindowKeyDown(event) {
    if (shouldBlockGameplayForOrientation()) {
        return;
    }

    handleStartKey(event.code);

    if (canReadKeyboard()) {
        setPressedKeyState(event.code, true);
    }
}

/** Starts the game with the keyboard. */
function handleStartKey(code) {
    if (!isStartKey(code) || isHelpOpen()) {
        return;
    }

    startGameIfNeeded();
}

/** Checks whether the key starts the game. */
function isStartKey(code) {
    return code === 'Enter';
}

/** Checks whether keyboard input is allowed. */
function canReadKeyboard() {
    return !world.gameOver && !world.gameWon && !isHelpOpen();
}

/** Handles released keys. */
function handleWindowKeyUp(event) {
    setPressedKeyState(event.code, false);
}

/** Sets the key state for a given key code. */
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

/** Sets up the fullscreen button. */
function setupFullscreenButton() {
    if (!document.fullscreenEnabled || !gameStage || !fullscreenButton) {
        return;
    }

    fullscreenButton.addEventListener('click', toggleFullscreenMode);
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
}

/** Toggles between fullscreen and normal mode. */
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

/** Updates the fullscreen icon. */
function updateFullscreenIcon() {
    if (fullscreenButton) {
        fullscreenButton.textContent = document.fullscreenElement ? '✕' : '⛶';
    }
}

/** Sets up the mobile controls. */
function setupMobileControls() {
    blockMobileContextMenus();
    bindPressButton('btn-left', 'LEFT');
    bindPressButton('btn-right', 'RIGHT');
    bindPressButton('btn-jump', 'SPACE');
    bindPressButton('btn-throw', 'D');
}

/** Prevents context menus on mobile buttons. */
function blockMobileContextMenus() {
    mobileButtons.forEach((button) => button.addEventListener('contextmenu', stopButtonContextMenu));
}

/** Stops the context menu. */
function stopButtonContextMenu(event) {
    event.preventDefault();
}

/** Binds press and release events to a button. */
function bindPressButton(buttonId, keyName) {
    const button = document.getElementById(buttonId);

    if (!button) {
        return;
    }

    button.dataset.key = keyName;
    ['touchstart', 'mousedown'].forEach((name) => button.addEventListener(name, handlePressStart));
    ['touchend', 'touchcancel', 'mouseup', 'mouseleave'].forEach((name) => button.addEventListener(name, handlePressEnd));
}

/** Handles pressing a mobile button. */
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

/** Checks whether a mobile input should be ignored. */
function shouldIgnoreMobileInput(event, button) {
    return !button ||
        !button.dataset.key ||
        world.gameOver ||
        world.gameWon ||
        isHelpOpen() ||
        shouldBlockGameplayForOrientation() ||
        isSecondaryMouseButton(event);
}

/** Checks whether the secondary mouse button was used. */
function isSecondaryMouseButton(event) {
    return event.type === 'mousedown' && event.button !== 0;
}

/** Handles releasing a mobile button. */
function handlePressEnd(event) {
    const button = event.currentTarget;

    if (button?.dataset.key) {
        keyboard[button.dataset.key] = false;
    }
}

/** Enforces landscape gameplay on mobile devices and tablets. */
function setupOrientationGuard() {
    updateOrientationRequirement();

    ['resize', 'orientationchange'].forEach((eventName) => {
        window.addEventListener(eventName, updateOrientationRequirement);
    });

    document.addEventListener('fullscreenchange', updateOrientationRequirement);
}

/** Updates the block state based on the device orientation. */
function updateOrientationRequirement() {
    const isBlocked = shouldBlockGameplayForOrientation();
    document.body.classList.toggle('portrait-game-blocked', isBlocked);

    if (isBlocked) {
        releaseAllKeys();
        resetCanvasCursor();
        return;
    }

    tryLockLandscapeOrientation();
}

/** Checks whether gameplay should be blocked in portrait mode. */
function shouldBlockGameplayForOrientation() {
    return isMobileOrTabletDevice() && window.innerHeight > window.innerWidth;
}

/** Detects mobile devices and tablets. */
function isMobileOrTabletDevice() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** Releases all pressed keys. */
function releaseAllKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
}

/** Tries to lock supported devices to landscape mode. */
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