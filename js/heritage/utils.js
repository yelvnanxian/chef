export class GameState {
  constructor(init) {
    Object.assign(this, init);
  }
  addGold(amount) { this.gold += amount; if (this.gold < 0) this.gold = 0; }
  addFame(amount) { this.fame += amount; this.checkFameUnlocks(); }
  checkFameUnlocks() {
    if (this.fame >= 100 && !this.fameUnlocks[0]) {
      this.fameUnlocks[0] = true;
    }
  }
  addIngredient(name, count = 1) {
    if (!this.bag[name]) this.bag[name] = 0;
    this.bag[name] += count;
  }
  removeIngredient(name, count = 1) {
    if (!this.bag[name] || this.bag[name] < count) return false;
    this.bag[name] -= count;
    return true;
  }
}

export function drawRoundRect(ctx, x, y, w, h, r, fillColor, strokeColor) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = 2; ctx.stroke(); }
}

export function drawCard(ctx, x, y, w, h, emoji, label, borderColor = '#F0E8D8', quality = 'normal') {
  const colorMap = { normal: '#FFF8EE', rare: '#FFF3D6', perfect: '#FFF8D0' };
  drawRoundRect(ctx, x, y, w, h, 10, colorMap[quality] || '#FFF8EE');
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x + w / 2, y + h / 2 - 8);
  if (label) {
    ctx.fillStyle = '#3D2B1F';
    ctx.font = '10px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, x + w / 2, y + h - 4);
  }
}

export function hitTest(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}