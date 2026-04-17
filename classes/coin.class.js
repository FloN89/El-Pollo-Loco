class Coin extends DrawableObject {
    width = 120;
    height = 120;

    imagePaths = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    /** Creates a coin. */
    constructor(x, y) {
        super();
        this.loadImages(this.imagePaths);
        this.loadImage(this.imagePaths[0]);
        this.x = x;
        this.y = y;
        this.animate();
    }

    /** Starts the coin animation. */
    animate() {
        setInterval(this.updateAnimation.bind(this), 250);
    }

    /** Updates the coin image. */
    updateAnimation() {
        this.playAnimation(this.imagePaths);
    }
}