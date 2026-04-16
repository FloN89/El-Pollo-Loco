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

    /** Erstellt die Audioverwaltung. */
    constructor(canvas, keyboard) {
        super(canvas, keyboard);
        this.loadSoundSetting();
        this.setupAudio();
        this.synchronizeAudioState();
    }

    /** Liest die gespeicherte Soundeinstellung. */
    loadSoundSetting() {
        const value = localStorage.getItem(this.soundStorageKey);

        if (value !== null) {
            this.soundEnabled = value === 'true';
        }
    }

    /** Speichert die aktuelle Soundeinstellung. */
    saveSoundSetting() {
        localStorage.setItem(this.soundStorageKey, String(this.soundEnabled));
    }

    /** Richtet alle Audiodateien ein. */
    setupAudio() {
        this.backgroundMusic = this.createLoopingAudio(this.audioPaths.backgroundMusic, 0.22);
        this.runningSound = this.createLoopingAudio(this.audioPaths.running, 0.35);
        this.snoreSound = this.createLoopingAudio(this.audioPaths.snore, 0.28);
        this.attemptAutomaticAudioStart();
    }

    /** Erstellt ein wiederholtes Audioelement. */
    createLoopingAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = volume;
        return audio;
    }

    /** Erstellt ein einmaliges Effektgeräusch. */
    createEffectAudio(source, volume = 1) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = volume;
        return audio;
    }

    /** Versucht den Ton direkt beim Laden zu starten. */
    attemptAutomaticAudioStart() {
        this.playLoopingAudio(this.backgroundMusic);
        this.stopAudio(this.runningSound);
        this.stopAudio(this.snoreSound);
    }

    /** Reagiert auf eine echte Nutzerinteraktion. */
    handleUserInteraction() {
        this.synchronizeAudioState();
    }

    /** Synchronisiert alle laufenden Sounds. */
    synchronizeAudioState() {
        this.synchronizeBackgroundMusic();
        this.synchronizeRunningSound();
        this.synchronizeSnoreSound();
        this.stopAllEffectSoundsIfMuted();
    }

    /** Hält die Hintergrundmusik aktuell. */
    synchronizeBackgroundMusic() {
        if (!this.soundEnabled) {
            this.stopAudio(this.backgroundMusic);
            return;
        }

        this.playLoopingAudio(this.backgroundMusic);
    }

    /** Hält das Laufgeräusch aktuell. */
    synchronizeRunningSound() {
        const shouldPlay = this.soundEnabled && this.isRunningSoundActive;
        shouldPlay ? this.playLoopingAudio(this.runningSound) : this.stopAudio(this.runningSound);
    }

    /** Hält das Schnarchen aktuell. */
    synchronizeSnoreSound() {
        const shouldPlay = this.soundEnabled && this.gameStarted && this.character?.isSleeping;
        shouldPlay ? this.playLoopingAudio(this.snoreSound) : this.stopAudio(this.snoreSound);
    }

    /** Stoppt Effekt-Sounds beim Stummschalten. */
    stopAllEffectSoundsIfMuted() {
        if (!this.soundEnabled) {
            this.stopAllEffectSounds();
        }
    }

    /** Startet oder stoppt das Laufgeräusch. */
    updateRunningSound(isRunning) {
        this.isRunningSoundActive = isRunning;
        this.synchronizeRunningSound();
    }

    /** Startet ein Loop-Audio sicher. */
    playLoopingAudio(audio) {
        if (!audio || !audio.paused) {
            return;
        }

        audio.play().catch(() => {});
    }

    /** Stoppt ein Audioelement komplett. */
    stopAudio(audio) {
        if (!audio) {
            return;
        }

        audio.pause();
        audio.currentTime = 0;
    }

    /** Spielt einen benannten Effekt ab. */
    playNamedEffect(name) {
        if (!this.soundEnabled) {
            return;
        }

        const audio = this.createEffectAudio(this.audioPaths[name], this.effectVolume[name]);
        this.registerEffectAudio(audio);
        audio.play().catch(() => {});
    }

    /** Merkt sich einen laufenden Effekt-Sound. */
    registerEffectAudio(audio) {
        this.activeEffectSounds.push(audio);
        audio.addEventListener('ended', () => this.removeFinishedEffect(audio));
    }

    /** Entfernt einen beendeten Effekt-Sound. */
    removeFinishedEffect(audio) {
        this.activeEffectSounds = this.activeEffectSounds.filter((sound) => sound !== audio);
    }

    /** Stoppt alle Effekt-Sounds. */
    stopAllEffectSounds() {
        this.activeEffectSounds.forEach((audio) => this.stopAudio(audio));
        this.activeEffectSounds = [];
    }

    /** Schaltet Ton an oder aus und speichert ihn. */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundSetting();
        this.synchronizeAudioState();
    }

    /** Spielt das Münzgeräusch. */
    playCoinSound() {
        this.playNamedEffect('coin');
    }

    /** Spielt das Flaschenwurfgeräusch. */
    playBottleThrowSound() {
        this.playNamedEffect('bottle');
    }

    /** Spielt das Treffergeräusch. */
    playHitSound() {
        this.playNamedEffect('hit');
    }

    /** Spielt das Sprunggeräusch. */
    playJumpSound() {
        this.playNamedEffect('jump');
    }

    /** Spielt das Sieggeräusch. */
    playWinningSound() {
        this.playNamedEffect('winning');
    }

    /** Spielt das Game-Over-Geräusch. */
    playGameOverSound() {
        this.playNamedEffect('gameOver');
    }

    /** Stoppt alle Dauersounds. */
    stopAllLoopingSounds() {
        this.stopAudio(this.backgroundMusic);
        this.stopAudio(this.runningSound);
        this.stopAudio(this.snoreSound);
    }
}