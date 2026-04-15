function createRandomBottles(amount) {
    let bottles = [];

    for (let i = 0; i < amount; i++) {
        let x = 300 + Math.random() * 2300;
        bottles.push(new Bottle(x, 360));
    }

    return bottles;
}

const level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new Endboss(),
    ],

    [
        new Cloud(),
        new Cloud(),
        new Cloud(),
    ],

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

    createRandomBottles(10)
);