class Level {
    enemies = [];
    clouds = [];
    backgroundObjects = [];
    bottles = [];
    coins = [];
    levelEndX = 3400;
    endbossSpawnX = Infinity;
    endbossFactory = null;

    // Erstellt ein Level mit allen Spielobjekten.
    constructor(enemies, clouds, backgroundObjects, bottles, coins, levelEndX) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.bottles = bottles;
        this.coins = coins;
        this.levelEndX = levelEndX;
    }
}