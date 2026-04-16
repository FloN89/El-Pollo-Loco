let canvas;
let world;
let keyboard = new Keyboard();

function initGame() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);

    bindCanvasEvents();
    setupFullscreenButton();
    setupMobileControls();

    console.log('My Character is', world.character);
}

function startGameIfNeeded() {
    if (!world) {
        return;
    }

    world.handleUserInteraction();

    if (!world.gameStarted) {
        world.startGame();
    }
}

function bindCanvasEvents() {
    canvas.addEventListener('click', (event) => {
        if (!world) {
            return;
        }

        world.handleUserInteraction();

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        world.handleCanvasClick(x, y);
    });
}

function setupFullscreenButton() {
    const stage = document.getElementById('game-stage');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    if (!stage || !fullscreenBtn) {
        return;
    }

    const updateFullscreenIcon = () => {
        const isFullscreen = document.fullscreenElement === stage || document.webkitFullscreenElement === stage;
        fullscreenBtn.textContent = isFullscreen ? '✕' : '⛶';
    };

    fullscreenBtn.addEventListener('click', async () => {
        try {
            if (document.fullscreenElement === stage || document.webkitFullscreenElement === stage) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } else if (stage.requestFullscreen) {
                await stage.requestFullscreen();
            } else if (stage.webkitRequestFullscreen) {
                stage.webkitRequestFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen konnte nicht gestartet werden:', error);
        }

        updateFullscreenIcon();
    });

    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    updateFullscreenIcon();
}

function setupMobileControls() {
    bindPressButton('btn-left', 'LEFT');
    bindPressButton('btn-right', 'RIGHT');
    bindPressButton('btn-jump', 'SPACE');
    bindPressButton('btn-throw', 'D');
}

function bindPressButton(buttonId, keyName) {
    const button = document.getElementById(buttonId);

    if (!button) {
        return;
    }

    const press = (event) => {
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
    };

    const release = (event) => {
        event.preventDefault();
        keyboard[keyName] = false;
    };

    button.addEventListener('touchstart', press, { passive: false });
    button.addEventListener('touchend', release, { passive: false });
    button.addEventListener('touchcancel', release, { passive: false });
    button.addEventListener('mousedown', press);
    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
}

window.addEventListener('keydown', (event) => {
    if (world) {
        world.handleUserInteraction();
    }

    if (event.keyCode == 32 || event.keyCode == 13) {
        startGameIfNeeded();
    }

    if (event.keyCode == 32) {
        event.preventDefault();
    }

    if (world && (world.gameOver || world.gameWon)) {
        return;
    }

    if (event.keyCode == 37) {
        keyboard.LEFT = true;
    } else if (event.keyCode == 39) {
        keyboard.RIGHT = true;
    } else if (event.keyCode == 38) {
        keyboard.UP = true;
        keyboard.SPACE = true;
    } else if (event.keyCode == 40) {
        keyboard.DOWN = true;
    } else if (event.keyCode == 32) {
        keyboard.SPACE = true;
    } else if (event.keyCode == 68) {
        keyboard.D = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.keyCode == 37) {
        keyboard.LEFT = false;
    } else if (event.keyCode == 39) {
        keyboard.RIGHT = false;
    } else if (event.keyCode == 38) {
        keyboard.UP = false;
        keyboard.SPACE = false;
    } else if (event.keyCode == 40) {
        keyboard.DOWN = false;
    } else if (event.keyCode == 32) {
        keyboard.SPACE = false;
    } else if (event.keyCode == 68) {
        keyboard.D = false;
    }
});