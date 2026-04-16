const COIN_STATUS_BAR_IMAGES = [
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
    'img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png'
];

class CoinStatusBar extends StatusBar {
    // Erstellt die Münzleiste.
    constructor() {
        super({ x: 10, y: 90, percentage: 0, imagePaths: COIN_STATUS_BAR_IMAGES });
    }
}