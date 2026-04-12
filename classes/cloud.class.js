class Cloud extends MovableObject {
    y = 40;     
    height = 250;
    width = 500;    

    constructor() {
        super();
        this.loadImage('/img/5_background/layers/4_clouds/1.png');  
        this.x = Math.random() * 500; // Start position between 500 and 1000 
        this.animate(); // Start animation immediately 
           

    }
    
    animate() {
        setInterval(() => {
            this.x -= 0.15;
            
        }, 1000 / 60); // Move left at 60 frames per second
    }
}