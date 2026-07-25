import { drawRoundRect } from './utils.js';

export class MapPage {
  constructor(ctx, SW, SH, state, safeTop, safeBottom) {
    this.ctx = ctx; this.SW = SW; this.SH = SH; this.state = state;
    this.safeTop = safeTop; this.safeBottom = safeBottom;
    this.navY = SH - 56 - safeBottom; this.navH = 56 + safeBottom;
    this._gardenInit = false; this._lastCollect = 0;
  }
  onEnter() {
    if (!this._gardenInit) { this._gardenInit = true; this._lastCollect = Date.now(); }
  }
  update() {
    if (Date.now() - this._lastCollect > 1200000) {
      this.state.addIngredient('vegetable', 1);
      this._lastCollect = Date.now();
    }
  }
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#F0F5E8'; ctx.fillRect(0, 0, this.SW, this.SH);
    ctx.fillStyle = '#3D2B1F';
    ctx.font = '20px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🗺 爷爷走过的地方', 10, this.safeTop + 30);
    ctx.font = '14px sans-serif'; ctx.fillStyle = '#8B7355';
    ctx.fillText('全部  |  家乡菜园  |  成都  |  沿海…', 10, this.safeTop + 55);
    ctx.fillStyle = '#D4C9B8';
    ctx.fillRect(10, this.safeTop + 65, this.SW - 20, 120);
    ctx.fillStyle = '#3D2B1F'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🏡 家乡菜园（已解锁）', this.SW/2, this.safeTop + 120);
    ctx.fillText('🏮 成都·市井烟火（完成第一章解锁）', this.SW/2, this.safeTop + 150);
    const cardY = this.safeTop + 200;
    ctx.fillStyle = '#FFF8EE';
    drawRoundRect(ctx, 10, cardY, (this.SW-30)/2, 80, 8, '#FFF8EE');
    ctx.fillStyle = '#3D2B1F'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🌱 菜地', (this.SW-30)/4 + 10, cardY + 35);
    ctx.font = '12px sans-serif';
    ctx.fillText('产出: 蔬菜', (this.SW-30)/4 + 10, cardY + 55);
    ctx.fillText('下一批: 20min', (this.SW-30)/4 + 10, cardY + 70);
    drawRoundRect(ctx, (this.SW-30)/2 + 20, cardY, (this.SW-30)/2, 80, 8, '#FFF8EE');
    ctx.fillStyle = '#3D2B1F'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🐔 鸡窝', this.SW - (this.SW-30)/4 - 10, cardY + 35);
    ctx.font = '12px sans-serif';
    ctx.fillText('产出: 鸡蛋', this.SW - (this.SW-30)/4 - 10, cardY + 55);
    ctx.fillText('下一批: 30min', this.SW - (this.SW-30)/4 - 10, cardY + 70);
    const travelY = cardY + 100;
    ctx.fillStyle = '#F4A85D';
    drawRoundRect(ctx, 10, travelY, this.SW-20, 50, 8, '#F4A85D');
    ctx.fillStyle = '#FFF'; ctx.font = '18px sans-serif';
    ctx.fillText('✈️ 前往成都探索（1h）', this.SW/2, travelY + 32);
    this.drawBottomNav(ctx, 1);
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
  onTouchStart() {}
  onTouchMove() {}
  onTouchEnd() {}
}