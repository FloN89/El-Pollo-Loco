class Level {
    enemies;
    clouds;
    backgroundObjects;
    bottles;
    coins;
    level_end_x = 3400;

    constructor(enemies, clouds, backgroundObjects, bottles, coins, level_end_x = 3400) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.bottles = bottles;
        this.coins = coins;
        this.level_end_x = level_end_x;
    }
}