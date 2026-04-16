const HEALTH_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png'
];

const BOTTLE_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
];

const COIN_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
];

const ENDBOSS_STATUS_BAR_IMAGES = [
    'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
];

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

class BottleStatusBar extends StatusBar {
    // Erstellt die Flaschenleiste.
    constructor() {
        super({ x: 10, y: 50, percentage: 0, imagePaths: BOTTLE_STATUS_BAR_IMAGES });
    }
}

class CoinStatusBar extends StatusBar {
    // Erstellt die Münzleiste.
    constructor() {
        super({ x: 10, y: 90, percentage: 0, imagePaths: COIN_STATUS_BAR_IMAGES });
    }
}

class EndbossStatusBar extends StatusBar {
    // Erstellt die Endboss-Leiste.
    constructor() {
        super({ x: 500, y: 10, percentage: 100, imagePaths: ENDBOSS_STATUS_BAR_IMAGES });
    }
}