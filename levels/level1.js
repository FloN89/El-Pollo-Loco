/** Verteilt X-Positionen gleichmäßig mit Zufall. */
function createDistributedPositions(amount, startX, endX) {
    const positions = [];
    const distance = (endX - startX) / amount;

    for (let index = 0; index < amount; index++) {
        const baseX = startX + index * distance;
        const randomOffset = Math.random() * Math.max(80, distance - 120);
        positions.push(Math.round(baseX + randomOffset));
    }

    return positions;
}

/** Erstellt zufällige Flaschen. */
function createRandomBottles(amount, startX = 250, endX = 2950) {
    return createDistributedPositions(amount, startX, endX).map(createBottleAtPosition);
}

/** Baut eine Flasche an einer Position. */
function createBottleAtPosition(x) {
    return new Bottle(x, 360);
}

/** Erstellt zufällige Münzen. */
function createRandomCoins(amount, startX = 350, endX = 3000) {
    const coinHeights = [140, 180, 220, 260, 300];
    const positions = createDistributedPositions(amount, startX, endX);
    return positions.map((x, index) => new Coin(x, coinHeights[index % coinHeights.length]));
}

/** Erstellt normale Hühner. */
function createRandomChickens(amount, startX = 650, endX = 2850) {
    return createDistributedPositions(amount, startX, endX).map(createChickenAtPosition);
}

/** Baut ein normales Huhn. */
function createChickenAtPosition(x) {
    return new Chicken(x);
}

/** Erstellt kleine Hühner. */
function createRandomSmallChickens(amount, startX = 900, endX = 3000) {
    return createDistributedPositions(amount, startX, endX).map(createSmallChickenAtPosition);
}

/** Baut ein kleines Huhn. */
function createSmallChickenAtPosition(x) {
    return new SmallChicken(x);
}

/** Erstellt zufällige Wolken. */
function createRandomClouds(amount, startX = -300, endX = 3200) {
    const positions = createDistributedPositions(amount, startX, endX);
    return positions.map(createCloudAtPosition);
}

/** Baut eine Wolke aus Position und Index. */
function createCloudAtPosition(x, index) {
    const y = 20 + index % 3 * 20;
    const speed = 0.04 + index % 4 * 0.015;
    return new Cloud(x, y, speed, 3600);
}

/** Erstellt alle Hintergrundelemente. */
function createBackgroundObjects() {
    const layerGroups = [
        ['./img/5_background/layers/air.png', './img/5_background/layers/3_third_layer/2.png', './img/5_background/layers/2_second_layer/2.png', './img/5_background/layers/1_first_layer/2.png'],
        ['./img/5_background/layers/air.png', './img/5_background/layers/3_third_layer/1.png', './img/5_background/layers/2_second_layer/1.png', './img/5_background/layers/1_first_layer/1.png']
    ];

    return Array.from({ length: 6 }, (_, index) => createBackgroundSegment(index, layerGroups)).flat();
}

/** Erstellt einen Hintergrundabschnitt. */
function createBackgroundSegment(index, layerGroups) {
    const group = layerGroups[index % layerGroups.length];
    const x = index * 720 - 719;
    return group.map((imagePath) => new BackgroundObject(imagePath, x, 0));
}

/** Baut alle Gegner für Level eins. */
function createLevelEnemies() {
    return [...createRandomChickens(8), ...createRandomSmallChickens(6)];
}

/** Baut das erste Level. */
function createLevel1() {
    const level = new Level(
        createLevelEnemies(),
        createRandomClouds(8),
        createBackgroundObjects(),
        createRandomBottles(14),
        createRandomCoins(16),
        3400
    );

    level.endbossSpawnX = 2550;
    level.endbossFactory = createEndbossForLevel1;
    return level;
}

/** Erstellt den Endboss für Level eins. */
function createEndbossForLevel1() {
    return new Endboss(3200, 2880, 3280);
}