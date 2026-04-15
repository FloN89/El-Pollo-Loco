class Level {
    enemies;
    clouds;
    backgroundObjects;
    bottles;
    level_end_x = 2900;

    constructor(enemies, clouds, backgroundObjects, bottles) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.bottles = bottles;
    }
}