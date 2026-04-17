class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;

    /** Creates a background object. */
    constructor(imagePath, x, y) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = y;
    }
}