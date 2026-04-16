class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.1;
    wrapX = 3600;

    // Erstellt eine Wolke.
    constructor(x = 0, y = 20, speed = 0.1, wrapX = 3600) {
        super();
        this.loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.wrapX = wrapX;
        this.animate();
    }

    // Startet die Wolkenbewegung.
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
    }

    // Bewegt die Wolke.
    updateMovement() {
        this.x -= this.speed;
        this.wrapToRightSideIfNeeded();
    }

    // Setzt die Wolke rechts neu ein.
    wrapToRightSideIfNeeded() {
        if (this.x + this.width < -400) {
            this.x = this.wrapX;
        }
    }
}