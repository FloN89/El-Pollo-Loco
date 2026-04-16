const ENDBOSS_STATUS_BAR_IMAGES = [
    'img/7_statusbars/2_statusbar_endboss/orange/orange0.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange20.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange40.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange60.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange80.png',
    'img/7_statusbars/2_statusbar_endboss/orange/orange100.png'
];

class EndbossStatusBar extends StatusBar {
    // Erstellt die Endboss-Leiste.
    constructor() {
        super({ x: 500, y: 10, percentage: 100, imagePaths: ENDBOSS_STATUS_BAR_IMAGES });
    }
}