class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;

    statusBar = new StatusBar();
    bottleBar = new BottleStatusBar();
    endbossBar = new EndbossStatusBar();

    throwableObjects = [];
    throwKeyWasPressed = false;
    collectedBottles = 0;
    maxBottles = 5;

    constructor(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keyboard = keyboard;
        this.setWorld();
        this.draw();
        this.run();
    }

    setWorld() {
        this.character.world = this;
        this.character.animate();
        this.bottleBar.setPercentage(0);
        this.endbossBar.setPercentage(100);
    }

    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkBottleCollisions();
            this.checkThrowObjects();
            this.checkThrowableCollisions();
            this.removeFinishedThrowableObjects();
        }, 1000 / 60);
    }

    checkBottleCollisions() {
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            let bottle = this.level.bottles[i];

            if (this.character.iscolliding(bottle) && this.collectedBottles < this.maxBottles) {
                this.level.bottles.splice(i, 1);
                this.collectedBottles++;
                this.bottleBar.setPercentage(this.collectedBottles * 20);
            }
        }
    }

    checkThrowObjects() {
        if (this.keyboard.D && !this.throwKeyWasPressed && this.collectedBottles > 0) {
            let bottle = new ThrowableObjects(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);

            this.collectedBottles--;
            this.bottleBar.setPercentage(this.collectedBottles * 20);
        }

        this.throwKeyWasPressed = this.keyboard.D;
    }

    checkThrowableCollisions() {
        for (let i = 0; i < this.throwableObjects.length; i++) {
            let bottle = this.throwableObjects[i];

            if (bottle.isBroken) {
                continue;
            }

            for (let j = 0; j < this.level.enemies.length; j++) {
                let enemy = this.level.enemies[j];

                if (bottle.iscolliding(enemy)) {
                    bottle.splash();

                    if (enemy instanceof Endboss) {
                        enemy.takeDamage(20);
                        this.endbossBar.setPercentage(enemy.energy);
                    }

                    break;
                }
            }
        }
    }

    removeFinishedThrowableObjects() {
        this.throwableObjects = this.throwableObjects.filter((bottle) => !bottle.isFinished);
    }

    checkCollisions() {
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
            let enemy = this.level.enemies[i];

            if (!this.character.iscolliding(enemy)) {
                continue;
            }

            if (enemy instanceof Chicken && !enemy.isDeadChicken && this.isJumpingOnChicken(enemy)) {
                enemy.die();
                this.character.speedY = 15;

                setTimeout(() => {
                    let index = this.level.enemies.indexOf(enemy);
                    if (index > -1) {
                        this.level.enemies.splice(index, 1);
                    }
                }, 500);
            } else if (!(enemy instanceof Chicken && enemy.isDeadChicken) && !this.character.isHurt()) {
                this.character.hit();
                this.statusBar.setPercentage(this.character.energy);
            }
        }
    }

    isJumpingOnChicken(chicken) {
        return this.character.speedY < 0 &&
               this.character.x + this.character.width > chicken.x &&
               this.character.x < chicken.x + chicken.width &&
               this.character.y + this.character.height > chicken.y &&
               this.character.y + this.character.height < chicken.y + 40;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);

        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.endbossBar);
        this.ctx.translate(this.camera_x, 0);

        this.addObjectsToMap(this.level.bottles);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.camera_x, 0);

        requestAnimationFrame(() => this.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addToMap(object);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }

        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack();
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.x + mo.width / 2, 0);
        this.ctx.scale(-1, 1);
        this.ctx.translate(-mo.x - mo.width / 2, 0);
    }

    flipImageBack() {
        this.ctx.restore();
    }
}