const BOTTLE_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
    'img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png'
];

class BottleStatusBar extends StatusBar {
    // Erstellt die Flaschenleiste.
    constructor() {
        super({ x: 10, y: 50, percentage: 0, imagePaths: BOTTLE_STATUS_BAR_IMAGES });
    }
}