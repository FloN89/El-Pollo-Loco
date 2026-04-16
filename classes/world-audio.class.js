class WorldAudio extends WorldBase {
    soundEnabled = true;
    isRunningSoundActive = false;
    backgroundMusic = null;
    runningSound = null;

    audioPaths = {
        backgroundMusic: 'audio/background music.mp3',
        running: 'audio/running sound.mp3',
        coin: 'audio/coin.mp3',
        hit: 'audio/hit sound.mp3',
        bottle: 'audio/bottle sound.mp3',
        jump: 'audio/jump sound.mp3',
        winning: 'audio/winning sound.mp3',
        gameOver: 'audio/game over sound.mp3'
    };

    effectVolume = {
        coin: 0.45,
        bottle: 0.5,
        hit: 0.55,
        jump: 0.5,
        winning: 0.7,
        gameOver: 0.7
    };

    constructor(canvas, keyboard) {
        super(canvas, keyboard);
        this.setupAudio();
        this.synchronizeAudioState();
    }

    // Richtet alle Audiodateien ein.
    setupAudio() {
        this.backgroundMusic = this.createLoopingAudio(this.audioPaths.backgroundMusic, 0.22);
        this.runningSound = this.createLoopingAudio(this.audioPaths.running, 0.35);
        this.attemptAutomaticAudioStart();
    }

    // Erstellt ein wiederholtes Audioelement.
    createLoopingAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = volume;
        return audio;
    }

    // Erstellt ein einmaliges Effektgeräusch.
    createEffectAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = volume;
        return audio;
    }

    // Versucht den Ton direkt beim Laden zu starten.
    attemptAutomaticAudioStart() {
        this.playLoopingAudio(this.backgroundMusic);
        this.runningSound.pause();
        this.runningSound.currentTime = 0;
    }

    // Reagiert auf eine echte Nutzerinteraktion.
    handleUserInteraction() {
        this.synchronizeAudioState();
    }

    // Synchronisiert alle laufenden Sounds.
    synchronizeAudioState() {
        this.synchronizeBackgroundMusic();
        this.synchronizeRunningSound();
    }

    // Hält die Hintergrundmusik aktuell.
    synchronizeBackgroundMusic() {
        if (!this.soundEnabled) {
            this.stopAudio(this.backgroundMusic);
            return;
        }

        this.playLoopingAudio(this.backgroundMusic);
    }

    // Hält das Laufgeräusch aktuell.
    synchronizeRunningSound() {
        const shouldPlay = this.soundEnabled && this.isRunningSoundActive;
        shouldPlay ? this.playLoopingAudio(this.runningSound) : this.stopAudio(this.runningSound);
    }

    // Startet oder stoppt das Laufgeräusch.
    updateRunningSound(isRunning) {
        this.isRunningSoundActive = isRunning;
        this.synchronizeRunningSound();
    }

    // Startet ein Loop-Audio sicher.
    playLoopingAudio(audio) {
        if (!audio || !audio.paused) {
            return;
        }

        audio.play().catch(() => {});
    }

    // Stoppt ein Audioelement komplett.
    stopAudio(audio) {
        if (!audio) {
            return;
        }

        audio.pause();
        audio.currentTime = 0;
    }

    // Spielt einen benannten Effekt ab.
    playNamedEffect(name) {
        if (!this.soundEnabled) {
            return;
        }

        const audio = this.createEffectAudio(this.audioPaths[name], this.effectVolume[name]);
        audio.play().catch(() => {});
    }

    // Spielt das Münzgeräusch.
    playCoinSound() {
        this.playNamedEffect('coin');
    }

    // Spielt das Flaschenwurfgeräusch.
    playBottleThrowSound() {
        this.playNamedEffect('bottle');
    }

    // Spielt das Treffergeräusch.
    playHitSound() {
        this.playNamedEffect('hit');
    }

    // Spielt das Sprunggeräusch.
    playJumpSound() {
        this.playNamedEffect('jump');
    }

    // Spielt das Sieggeräusch.
    playWinningSound() {
        this.playNamedEffect('winning');
    }

    // Spielt das Game-Over-Geräusch.
    playGameOverSound() {
        this.playNamedEffect('gameOver');
    }

    // Stoppt alle Dauersounds.
    stopAllLoopingSounds() {
        this.stopAudio(this.backgroundMusic);
        this.stopAudio(this.runningSound);
    }
}