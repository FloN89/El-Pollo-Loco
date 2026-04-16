class StatusBar extends DrawableObject {
    x = 0;
    y = 0;
    width = 200;
    height = 60;
    percentage = 100;
    imagePaths = [];

    // Erstellt eine Statusleiste.
    constructor(configuration) {
        super();
        this.applyConfiguration(configuration);
        this.loadImages(this.imagePaths);
        this.setPercentage(this.percentage);
    }

    // Übernimmt die Konfiguration.
    applyConfiguration(configuration) {
        this.x = configuration.x;
        this.y = configuration.y;
        this.percentage = configuration.percentage;
        this.imagePaths = configuration.imagePaths;
    }

    // Setzt den Prozentwert und das Bild.
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        this.image = this.imageCache[this.getImagePathForPercentage()];
    }

    // Liefert das Bild passend zum Prozentwert.
    getImagePathForPercentage() {
        return this.imagePaths[this.getImageIndexForPercentage()];
    }

    // Liefert den passenden Bildindex.
    getImageIndexForPercentage() {
        if (this.percentage === 100) {
            return 5;
        }

        if (this.percentage >= 80) {
            return 4;
        }

        if (this.percentage >= 60) {
            return 3;
        }

        if (this.percentage >= 40) {
            return 2;
        }

        if (this.percentage >= 20) {
            return 1;
        }

        return 0;
    }
}