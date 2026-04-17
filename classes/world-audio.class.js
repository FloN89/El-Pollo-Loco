class WorldAudio extends WorldBase {
    soundEnabled = true;
    isRunningSoundActive = false;
    backgroundMusic = null;
    runningSound = null;
    snoreSound = null;
    activeEffectSounds = [];
    soundStorageKey = 'el-pollo-loco-sound';

    audioPaths = {
        backgroundMusic: 'audio/background music.mp3',
        running: 'audio/running sound.mp3',
        coin: 'audio/coin.mp3',
        hit: 'audio/hit sound.mp3',
        bottle: 'audio/bottle sound.mp3',
        jump: 'audio/jump sound.mp3',
        winning: 'audio/winning sound.mp3',
        gameOver: 'audio/game over sound.mp3',
        snore: 'audio/snore.mp3'
    };

    effectVolume = {
        coin: 0.45,
        bottle: 0.5,
        hit: 0.55,
        jump: 0.5,
        winning: 0.7,
        gameOver: 0.7
    };

    /** Creates the audio manager. */
    constructor(canvas, keyboard) {
        super(canvas, keyboard);
        this.loadSoundSetting();
        this.setupAudio();
        this.synchronizeAudioState();
    }

    /** Loads the saved sound setting. */
    loadSoundSetting() {
        const value = localStorage.getItem(this.soundStorageKey);

        if (value !== null) {
            this.soundEnabled = value === 'true';
        }
    }

    /** Saves the current sound setting. */
    saveSoundSetting() {
        localStorage.setItem(this.soundStorageKey, String(this.soundEnabled));
    }

    /** Sets up all audio files. */
    setupAudio() {
        this.backgroundMusic = this.createLoopingAudio(this.audioPaths.backgroundMusic, 0.22);
        this.runningSound = this.createLoopingAudio(this.audioPaths.running, 0.35);
        this.snoreSound = this.createLoopingAudio(this.audioPaths.snore, 0.28);
        this.attemptAutomaticAudioStart();
    }

    /** Creates a looping audio element. */
    createLoopingAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = volume;
        return audio;
    }

    /** Creates a one-shot effect sound. */
    createEffectAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = volume;
        return audio;
    }

    /** Tries to start audio directly on load. */
    attemptAutomaticAudioStart() {
        this.playLoopingAudio(this.backgroundMusic);
        this.stopAudio(this.runningSound);
        this.stopAudio(this.snoreSound);
    }

    /** Handles a real user interaction. */
    handleUserInteraction() {
        this.synchronizeAudioState();
    }

    /** Synchronizes all active sounds. */
    synchronizeAudioState() {
        this.synchronizeBackgroundMusic();
        this.synchronizeRunningSound();
        this.synchronizeSnoreSound();
        this.stopAllEffectSoundsIfMuted();
    }

    /** Keeps the background music state up to date. */
    synchronizeBackgroundMusic() {
        if (!this.soundEnabled) {
            this.stopAudio(this.backgroundMusic);
            return;
        }

        this.playLoopingAudio(this.backgroundMusic);
    }

    /** Keeps the running sound state up to date. */
    synchronizeRunningSound() {
        const shouldPlay = this.soundEnabled && this.isRunningSoundActive;
        shouldPlay ? this.playLoopingAudio(this.runningSound) : this.stopAudio(this.runningSound);
    }

    /** Keeps the snoring sound state up to date. */
    synchronizeSnoreSound() {
        const shouldPlay = this.soundEnabled && this.gameStarted && this.character?.isSleeping;
        shouldPlay ? this.playLoopingAudio(this.snoreSound) : this.stopAudio(this.snoreSound);
    }

    /** Stops effect sounds when audio is muted. */
    stopAllEffectSoundsIfMuted() {
        if (!this.soundEnabled) {
            this.stopAllEffectSounds();
        }
    }

    /** Starts or stops the running sound. */
    updateRunningSound(isRunning) {
        this.isRunningSoundActive = isRunning;
        this.synchronizeRunningSound();
    }

    /** Starts a loop audio safely. */
    playLoopingAudio(audio) {
        if (!audio || !audio.paused) {
            return;
        }

        audio.play().catch(() => {});
    }

    /** Stops an audio element completely. */
    stopAudio(audio) {
        if (!audio) {
            return;
        }

        audio.pause();
        audio.currentTime = 0;
    }

    /** Plays a named effect. */
    playNamedEffect(name) {
        if (!this.soundEnabled) {
            return;
        }

        const audio = this.createEffectAudio(this.audioPaths[name], this.effectVolume[name]);
        this.registerEffectAudio(audio);
        audio.play().catch(() => {});
    }

    /** Stores a running effect sound. */
    registerEffectAudio(audio) {
        this.activeEffectSounds ??= [];
        this.activeEffectSounds.push(audio);
        audio.addEventListener('ended', () => this.removeFinishedEffect(audio));
    }

    /** Removes a finished effect sound. */
    removeFinishedEffect(audio) {
        this.activeEffectSounds = (this.activeEffectSounds ?? []).filter((sound) => sound !== audio);
    }

    /** Stops all effect sounds. */
    stopAllEffectSounds() {
        (this.activeEffectSounds ?? []).forEach((audio) => this.stopAudio(audio));
        this.activeEffectSounds = [];
    }

    /** Toggles sound on or off and saves the setting. */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundSetting();
        this.synchronizeAudioState();
    }

    /** Plays the coin sound. */
    playCoinSound() {
        this.playNamedEffect('coin');
    }

    /** Plays the bottle throw sound. */
    playBottleThrowSound() {
        this.playNamedEffect('bottle');
    }

    /** Plays the hit sound. */
    playHitSound() {
        this.playNamedEffect('hit');
    }

    /** Plays the jump sound. */
    playJumpSound() {
        this.playNamedEffect('jump');
    }

    /** Plays the winning sound. */
    playWinningSound() {
        this.playNamedEffect('winning');
    }

    /** Plays the game over sound. */
    playGameOverSound() {
        this.playNamedEffect('gameOver');
    }

    /** Stops all looping sounds. */
    stopAllLoopingSounds() {
        this.stopAudio(this.backgroundMusic);
        this.stopAudio(this.runningSound);
        this.stopAudio(this.snoreSound);
    }
}