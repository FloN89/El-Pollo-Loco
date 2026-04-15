class CoinStatusBar extends StatusBar {
    width = 200;
    height = 60;
    x = 10;
    y = 10; 

    IMAGES = [
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/0.png',
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/20.png',  
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/40.png',
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/60.png',
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/80.png',
        'img/7_statusbars/1_statusbar/2_statusbar_coin/orange/100.png'
    ];  

    percentage = 0;

    constructor() {
        super().loadImage(this.IMAGES[0]);
        this.loadImages(this.IMAGES);
    }   

    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    resolveImageIndex() {
        if (this.percentage == 100) {
            return 5;   
        } else if (this.percentage > 80) {
            return 4;
        } else if (this.percentage > 60) {
            return 3;
        }   else if (this.percentage > 40) {        
            return 2;
        } else if (this.percentage > 20) {
            return 1;
        } else {
            return 0;
        }   
    }
}   

