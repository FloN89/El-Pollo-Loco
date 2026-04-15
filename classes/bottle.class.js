class Bottle extends MovableObject {
    width = 60;
    height = 70;

    constructor(x, y = 360) {
        super();
        this.loadImage('img/6_salsa_bottle/salsa_bottle.png');
        this.x = x;
        this.y = y;
    }
}