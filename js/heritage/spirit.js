import { drawRoundRect } from './utils.js';

export class SpiritPage {
  constructor(ctx, SW, SH, state, safeTop, safeBottom) {
    this.ctx = ctx; this.SW = SW; this.SH = SH; this.state = state;
    this.safeTop = safeTop; this.safeBottom = safeBottom;
    this.navY = SH - 56 - safeBottom; this.navH = 56 + safeBottom;
  }
  update() {}
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFF8EE'; ctx.fillRect(0, 0, this.SW, this.SH);
    ctx.font = '80px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✨', this.SW/2, this.safeTop + 100);
    ctx.fillStyle = '#3D2B1F'; ctx.font = '14px sans-serif';
    ctx.fillText(`好感度: ${this.state.spiritFavor} / 1000`, this.SW/2, this.safeTop + 130);
    const barW = this.SW - 40, barH = 12, barX = 20, barY = this.safeTop + 140;
    ctx.fillStyle = '#D4C9B8';
    drawRoundRect(ctx, barX, barY, barW, barH, 6, '#D4C9B8');
    const fillW = Math.min(barW, (this.state.spiritFavor / 1000) * barW);
    ctx.fillStyle = '#F0D060';
    drawRoundRect(ctx, barX, barY, fillW, barH, 6, '#F0D060');
    let dialog = '哟，新来的。';
    if (this.state.spiritFavor > 100) dialog = '今天的菜不错，有那老头子的味道了。';
    if (this.state.spiritFavor > 300) dialog = '你爷爷当年第一次做这道菜，也是这个水平。';
    ctx.fillStyle = '#8B7355'; ctx.font = '16px sans-serif';
    ctx.fillText(`💬 "${dialog}"`, this.SW/2, this.safeTop + 180);
    const offerY = this.safeTop + 210;
    ctx.fillStyle = '#F0E8D8'; ctx.setLineDash([5, 5]);
    drawRoundRect(ctx, 20, offerY, this.SW - 40, 80, 8, '#F0E8D8', '#D4C9B8');
    ctx.setLineDash([]);
    ctx.fillStyle = '#8B7355'; ctx.font = '16px sans-serif';
    ctx.fillText('将菜品拖到这里供奉', this.SW/2, offerY + 45);
    ctx.fillText('✨ 上供 ✨', this.SW/2, offerY + 65);
    ctx.font = '12px sans-serif';
    ctx.fillText('今日供奉记录：', 20, offerY + 110);
    ctx.fillText('◉ 番茄炒蛋（精品）→ 碎片', 20, offerY + 130);
    ctx.fillText('📜 食灵的记忆  3 / 12', this.SW/2, offerY + 170);
    ctx.fillStyle = '#F4A85D';
    drawRoundRect(ctx, this.SW/2 - 60, offerY + 180, 120, 30, 15, '#F4A85D');
    ctx.fillStyle = '#FFF'; ctx.font = '14px sans-serif';
    ctx.fillText('查看记忆', this.SW/2, offerY + 200);
    this.drawBottomNav(ctx, 3);
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