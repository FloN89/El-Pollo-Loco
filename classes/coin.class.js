class Coin extends DrawableObject {
    width = 120;
    height = 120;

    imagePaths = [
        'img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png'
    ];

    // Erstellt eine Münze.
    constructor(x, y) {
        super();
        this.loadImages(this.imagePaths);
        this.loadImage(this.imagePaths[0]);
        this.x = x;
        this.y = y;
        this.animate();
    }

    // Startet die Münzanimation.
    animate() {
        setInterval(this.updateAnimation.bind(this), 250);
    }

    // Aktualisiert das Münzbild.
    updateAnimation() {
        this.playAnimation(this.imagePaths);
    }
}