function createDistributedXPositions(amount, startX, endX) {
    let positions = [];
    let distance = (endX - startX) / amount;

    for (let i = 0; i < amount; i++) {
        let baseX = startX + i * distance;
        let randomOffset = Math.random() * Math.max(80, distance - 120);
        positions.push(Math.round(baseX + randomOffset));
    }

    return positions;
}

function createRandomBottles(amount, startX = 250, endX = 2950) {
    return createDistributedXPositions(amount, startX, endX).map((x) => new Bottle(x, 360));
}

function createRandomCoins(amount, startX = 350, endX = 3000) {
    const coinHeights = [140, 180, 220, 260, 300];

    return createDistributedXPositions(amount, startX, endX).map((x, index) => {
        let y = coinHeights[index % coinHeights.length];
        return new Coin(x, y);
    });
}

function createRandomChickens(amount, startX = 500, endX = 2850) {
    return createDistributedXPositions(amount, startX, endX).map((x) => new Chicken(x));
}

function createRandomClouds(amount, startX = -300, endX = 3200) {
    return createDistributedXPositions(amount, startX, endX).map((x, index) => {
        let y = 20 + (index % 3) * 20;
        let speed = 0.04 + (index % 4) * 0.015;
        return new Cloud(x, y, speed, 3600);
    });
}

function createLevel1() {
    const level = new Level(
        [
            ...createRandomChickens(12),
        ],

        createRandomClouds(8),

        [
            new BackgroundObject('img/5_background/layers/air.png', -719),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', -719),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', -719),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', -719),

            new BackgroundObject('img/5_background/layers/air.png', 0),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 0),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 0),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 0),

            new BackgroundObject('img/5_background/layers/air.png', 720),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720),

            new BackgroundObject('img/5_background/layers/air.png', 720 * 2),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720 * 2),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720 * 2),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 720 * 2),

            new BackgroundObject('img/5_background/layers/air.png', 720 * 3),
            new BackgroundObject('img/5_background/layers/3_third_layer/2.png', 720 * 3),
            new BackgroundObject('img/5_background/layers/2_second_layer/2.png', 720 * 3),
            new BackgroundObject('img/5_background/layers/1_first_layer/2.png', 720 * 3),

            new BackgroundObject('img/5_background/layers/air.png', 720 * 4),
            new BackgroundObject('img/5_background/layers/3_third_layer/1.png', 720 * 4),
            new BackgroundObject('img/5_background/layers/2_second_layer/1.png', 720 * 4),
            new BackgroundObject('img/5_background/layers/1_first_layer/1.png', 720 * 4),
        ],

        createRandomBottles(14),
        createRandomCoins(16),
        3400
    );

    level.endbossSpawnX = 2550;
    level.endbossFactory = () => new Endboss(3200, 2880, 3280);

    return level;
}

const level1 = createLevel1();