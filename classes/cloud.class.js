class Cloud extends MovableObject {
    y = 20;
    height = 250;
    width = 500;

    constructor(x = 0, y = 20, speed = 0.08, levelEndX = 3600) {
        super();
        this.loadImage('img/5_background/layers/4_clouds/1.png');
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.levelEndX = levelEndX;
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();

            if (this.x + this.width < -200) {
                this.x = this.levelEndX + 200;
            }
        }, 1000 / 60);
    }
}