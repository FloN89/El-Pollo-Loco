class ThrowableObjects extends MovableObject {

    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
    }           

    throw() {
        this.speedY = 10;
        this.speed = 5;
        this.applyGravity();
    }                       
                    
}


        








