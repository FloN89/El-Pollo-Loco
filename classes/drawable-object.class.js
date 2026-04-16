class DrawableObject {
    image;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    // Lädt ein einzelnes Bild.
    loadImage(path) {
        this.image = new Image();
        this.image.src = path;
    }

    // Lädt mehrere Bilder in den Cache.
    loadImages(paths) {
        paths.forEach(this.loadImageIntoCache.bind(this));
    }

    // Lädt ein Bild in den Cache.
    loadImageIntoCache(path) {
        const image = new Image();
        image.src = path;
        this.imageCache[path] = image;
    }

    // Zeichnet das Objekt auf das Canvas.
    draw(context) {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // Zeichnet optional den Rahmen.
    drawFrame() {}

    // Spielt eine Bildfolge ab.
    playAnimation(paths) {
        const path = paths[this.currentImage % paths.length];
        this.image = this.imageCache[path];
        this.currentImage++;
    }
}