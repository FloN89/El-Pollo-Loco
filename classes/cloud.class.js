class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.1;
    wrapX = 3600;

    /** Creates a cloud. */
    constructor(x = 0, y = 20, speed = 0.1, wrapX = 3600) {
        super();
        this.loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.wrapX = wrapX;
        this.animate();
    }

    /** Starts the cloud movement. */
    animate() {
        setInterval(this.updateMovement.bind(this), 1000 / 60);
    }

    /** Moves the cloud. */
    updateMovement() {
        this.x -= this.speed;
        this.wrapToRightSideIfNeeded();
    }

    /** Repositions the cloud on the right side. */
    wrapToRightSideIfNeeded() {
        if (this.x + this.width < -400) {
            this.x = this.wrapX;
        }
    }
}