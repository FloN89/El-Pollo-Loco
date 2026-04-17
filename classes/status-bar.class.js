const HEALTH_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
    'img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
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
    'img/7_statusbars/2_statusbar_endboss/green/green0.png',
    'img/7_statusbars/2_statusbar_endboss/green/green20.png',
    'img/7_statusbars/2_statusbar_endboss/green/green40.png',
    'img/7_statusbars/2_statusbar_endboss/green/green60.png',
    'img/7_statusbars/2_statusbar_endboss/green/green80.png',
    'img/7_statusbars/2_statusbar_endboss/green/green100.png'
];

class StatusBar extends DrawableObject {
    percentage = 100;
    width = 180;
    height = 48;
    imagePaths = [];

    /** Creates a status bar. */
    constructor(config) {
        super();
        this.applyConfiguration(config);
        this.loadImages(this.imagePaths);
        this.setPercentage(this.percentage);
    }

    /** Applies the configuration. */
    applyConfiguration(config) {
        this.x = config.x;
        this.y = config.y;
        this.percentage = config.percentage;
        this.imagePaths = config.imagePaths;
    }

    /** Sets the percentage value and image. */
    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
        this.image = this.imageCache[this.getImagePathForPercentage()];
    }

    /** Returns the image that matches the percentage. */
    getImagePathForPercentage() {
        return this.imagePaths[this.getImageIndexForPercentage()];
    }

    /** Returns the matching image index. */
    getImageIndexForPercentage() {
        if (this.percentage === 100) {
            return 5;
        }

        return this.getRoundedImageIndex();
    }

    /** Rounds the percentage value to an image index. */
    getRoundedImageIndex() {
        return Math.max(0, Math.ceil(this.percentage / 20));
    }
}

class BottleStatusBar extends StatusBar {
    /** Creates the bottle bar. */
    constructor() {
        super({ x: 10, y: 50, percentage: 0, imagePaths: BOTTLE_STATUS_BAR_IMAGES });
    }
}

class CoinStatusBar extends StatusBar {
    /** Creates the coin bar. */
    constructor() {
        super({ x: 10, y: 90, percentage: 0, imagePaths: COIN_STATUS_BAR_IMAGES });
    }
}

class EndbossStatusBar extends StatusBar {
    /** Creates the endboss bar. */
    constructor() {
        super({ x: 520, y: 10, percentage: 100, imagePaths: ENDBOSS_STATUS_BAR_IMAGES });
    }
}