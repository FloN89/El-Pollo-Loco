class EndbossStatusBar extends DrawableObject {
    x = 470;
    y = 10;
    width = 220;
    height = 26;
    percentage = 100;

    setPercentage(percentage) {
        this.percentage = Math.max(0, Math.min(100, percentage));
    }

    draw(ctx) {
        ctx.font = '18px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Endboss', this.x, this.y - 6);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(this.x, this.y, this.width * (this.percentage / 100), this.height);

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}