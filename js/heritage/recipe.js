export class RecipePage {
  constructor(ctx, SW, SH, state, safeTop, safeBottom) {
    this.ctx = ctx; this.SW = SW; this.SH = SH; this.state = state;
    this.safeTop = safeTop; this.safeBottom = safeBottom;
    this.navY = SH - 56 - safeBottom; this.navH = 56 + safeBottom;
  }
  update() {}
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFF8EE'; ctx.fillRect(0, 0, this.SW, this.SH);
    ctx.fillStyle = '#3D2B1F'; ctx.font = '20px sans-serif'; ctx.textAlign = 'left';
    const total = Object.keys(this.state.recipes).length;
    ctx.fillText(`📖 爷爷的菜谱  ${total}/130`, 10, this.safeTop + 30);
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#8B7355';
    ctx.fillText('全部  |  第一章  |  邻居  |  节气  |  失传', 10, this.safeTop + 55);
    const startY = this.safeTop + 70;
    const ITEM_SIZE = 60, GAP = 6, COLS = 5, MARGIN = 8;
    let col = 0, row = 0;
    for (let name of Object.keys(this.state.recipes)) {
      const x = MARGIN + col * (ITEM_SIZE + GAP);
      const y = startY + row * (ITEM_SIZE + GAP);
      ctx.fillStyle = '#F0E8D8'; ctx.fillRect(x, y, ITEM_SIZE, ITEM_SIZE);
      ctx.fillStyle = '#3D2B1F'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(name.slice(0,4), x + ITEM_SIZE/2, y + ITEM_SIZE/2 + 5);
      col++; if (col >= COLS) { col = 0; row++; }
    }
    this.drawBottomNav(ctx, 2);
  }
  drawBottomNav(ctx, activeIndex) {
    const y = this.navY;
    ctx.fillStyle = '#FFF8EE'; ctx.fillRect(0, y, this.SW, this.navH);
    const items = ['🏠 厨房', '🗺 地图', '📖 菜谱', '✨ 食灵'];
    const itemW = this.SW / items.length;
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = '#3D2B1F'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(items[i], i * itemW + itemW / 2, y + this.navH / 2 + 5);
      if (i === activeIndex) { ctx.fillStyle = '#F4A85D'; ctx.fillRect(i * itemW + itemW / 2 - 20, y + 2, 40, 3); }
    }
  }
}