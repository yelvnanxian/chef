import { drawCard } from './utils.js';

export class Card {
  constructor({ id, type, name, emoji, quality = 'normal', expiry = 0 }) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.emoji = emoji;
    this.quality = quality;
    this.expiry = expiry;
    this.x = 0; this.y = 0;
    this.w = 77; this.h = 77;
    this.alpha = 1; this.scale = 1;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x + this.w/2, this.y + this.h/2);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.w/2, -this.h/2);
    const borderColor = this.quality === 'rare' ? '#F0D060' : 
                        this.quality === 'perfect' ? '#FFD700' : '#F0E8D8';
    drawCard(ctx, this.x, this.y, this.w, this.h, this.emoji, this.name, borderColor, this.quality);
    ctx.restore();
  }
  contains(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }
}