class Coin extends MovableObject {
    width = 60;
    height = 60;

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage('img/8_coin/coin_1.png');
    }
}