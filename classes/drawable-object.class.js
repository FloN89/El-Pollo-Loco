class DrawableObject {
    image;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    /** Loads a single image. */
    loadImage(path) {
        this.image = new Image();
        this.image.src = path;
    }

    /** Loads multiple images into the cache. */
    loadImages(paths) {
        paths.forEach(this.loadImageIntoCache.bind(this));
    }

    /** Loads an image into the cache. */
    loadImageIntoCache(path) {
        const image = new Image();
        image.src = path;
        this.imageCache[path] = image;
    }

    /** Draws the object on the canvas. */
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    /** Draws the frame optionally. */
    drawFrame() {}

    /** Plays an animation sequence. */
    playAnimation(paths) {
        const path = paths[this.currentImage % paths.length];
        this.image = this.imageCache[path];
        this.currentImage++;
    }
}