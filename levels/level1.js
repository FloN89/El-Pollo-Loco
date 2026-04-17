/** Distributes X positions evenly with randomness. */
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

/** Creates random bottles. */
function createRandomBottles(amount, startX = 250, endX = 2950) {
    return createDistributedPositions(amount, startX, endX).map(createBottleAtPosition);
}

/** Builds a bottle at a position. */
function createBottleAtPosition(x) {
    return new Bottle(x, 360);
}

/** Creates random coins. */
function createRandomCoins(amount, startX = 350, endX = 3000) {
    const coinHeights = [140, 180, 220, 260, 300];
    const positions = createDistributedPositions(amount, startX, endX);
    return positions.map((x, index) => new Coin(x, coinHeights[index % coinHeights.length]));
}

/** Creates regular chickens. */
function createRandomChickens(amount, startX = 650, endX = 2850) {
    return createDistributedPositions(amount, startX, endX).map(createChickenAtPosition);
}

/** Builds a regular chicken. */
function createChickenAtPosition(x) {
    return new Chicken(x);
}

/** Creates small chickens. */
function createRandomSmallChickens(amount, startX = 900, endX = 3000) {
    return createDistributedPositions(amount, startX, endX).map(createSmallChickenAtPosition);
}

/** Builds a small chicken. */
function createSmallChickenAtPosition(x) {
    return new SmallChicken(x);
}

/** Creates random clouds. */
function createRandomClouds(amount, startX = -300, endX = 3200) {
    const positions = createDistributedPositions(amount, startX, endX);
    return positions.map(createCloudAtPosition);
}

/** Builds a cloud from a position and index. */
function createCloudAtPosition(x, index) {
    const y = 20 + index % 3 * 20;
    const speed = 0.04 + index % 4 * 0.015;
    return new Cloud(x, y, speed, 3600);
}

/** Creates all background objects. */
function createBackgroundObjects() {
    const layerGroups = [
        ['img/5_background/layers/air.png', 'img/5_background/layers/3_third_layer/2.png', 'img/5_background/layers/2_second_layer/2.png', 'img/5_background/layers/1_first_layer/2.png'],
        ['img/5_background/layers/air.png', 'img/5_background/layers/3_third_layer/1.png', 'img/5_background/layers/2_second_layer/1.png', 'img/5_background/layers/1_first_layer/1.png']
    ];

    return Array.from({ length: 6 }, (_, index) => createBackgroundSegment(index, layerGroups)).flat();
}

/** Creates a background segment. */
function createBackgroundSegment(index, layerGroups) {
    const group = layerGroups[index % layerGroups.length];
    const x = index * 720 - 719;
    return group.map((imagePath) => new BackgroundObject(imagePath, x, 0));
}

/** Builds all enemies for level one. */
function createLevelEnemies() {
    return [...createRandomChickens(8), ...createRandomSmallChickens(6)];
}

/** Builds level one. */
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

/** Creates the end boss for level one. */
function createEndbossForLevel1() {
    return new Endboss(3200, 2740, 3340);
}