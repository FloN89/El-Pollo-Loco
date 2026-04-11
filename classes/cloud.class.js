class Cloud extends movableObject {

    constructor() {
        super();
        this.loadImage('/img/5_background/layers/4_clouds/1.png');  

        this.x = 200 + Math.random() * 500; // Random x position between 200 and 700
        this.y = 50 + Math.random() * 100; // Random y position between 50 and 150  
    }
    
}