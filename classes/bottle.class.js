class bottle extends MovableObject {

    

    constructor(x, y) {     
        super();
        this.x = x;
        this.y = y; 
        this.loadImage('img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png');
    }   

    throw() {
        this.speedY = 10;
        this.speed = 5;
        this.applyGravity();
    }   

}

