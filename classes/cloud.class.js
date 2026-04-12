class Cloud extends MovableObject {
    y = 40;
    height = 250;
    width = 500;

    constructor() {
        super();
        this.loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = Math.random() * 500;
        this.speed = 0.15;
        this.animate();
    }

    animate() {
        this.moveLeft();
    }
}