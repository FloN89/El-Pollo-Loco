class Bottle extends DrawableObject {
    width = 70;
    height = 70;

    imagePaths = [
        'img/6_salsa_bottle/1_salsa_bottle_on_ground.png',
        'img/6_salsa_bottle/2_salsa_bottle_on_ground.png'
    ];

    /** Creates a bottle. */
    constructor(x, y) {
        super();
        this.loadImages(this.imagePaths);
        this.loadImage(this.getRandomImagePath());
        this.x = x;
        this.y = y;
    }

    /** Returns a random bottle image. */
    getRandomImagePath() {
        return this.imagePaths[Math.floor(Math.random() * this.imagePaths.length)];
    }
}