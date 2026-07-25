import { drawRoundRect, drawCard, hitTest } from './utils.js';
import { RECIPES, findRecipe } from './recipeData.js';
import { Card } from './card.js';

export class Kitchen {
  constructor(ctx, SW, SH, state, safeTop, safeBottom) {
    this.ctx = ctx;
    this.SW = SW; this.SH = SH;
    this.state = state;
    this.safeTop = safeTop; this.safeBottom = safeBottom;
    this.toolBarY = safeTop + 44;
    this.toolBarH = 80;
    this.navY = SH - 56 - safeBottom;
    this.navH = 56 + safeBottom;
    this.cardAreaY = this.toolBarY + this.toolBarH + 8;
    this.cardAreaH = this.navY - this.cardAreaY - 8;
    this.COLS = 4; this.GAP = 6; this.MARGIN = 8;
    this.CELL_SIZE = (SW - this.MARGIN * 2 - this.GAP * (this.COLS - 1)) / this.COLS;
    this.ROWS = Math.floor(this.cardAreaH / (this.CELL_SIZE + this.GAP));
    if (this.ROWS < 3) this.ROWS = 3;
    this.cards = [];
    this.nextId = 0;
    this.tools = [
      { name: '灶台', key: 'stove', emoji: '🔥', x: 0, y: this.toolBarY, w: this.CELL_SIZE, h: this.toolBarH - 10, active: true },
      { name: '砧板', key: 'board', emoji: '🔪', x: this.CELL_SIZE + this.GAP, y: this.toolBarY, w: this.CELL_SIZE, h: this.toolBarH - 10, active: true },
      { name: '水池', key: 'sink', emoji: '💧', x: (this.CELL_SIZE + this.GAP) * 2, y: this.toolBarY, w: this.CELL_SIZE, h: this.toolBarH - 10, active: true },
    ];
    this.orderPanelOpen = false;
    this.selectedCards = [];
    this.selectedTool = null;
    this.touchState = { dragging: false, dragCard: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0 };
    this.tutorialStep = 0;
    this.tutorialActive = false;
    this._tutorialStarted = false;  // 由外部第一次 draw 时设为 true
    this.initCards();
  }

  initCards() {
    this.spawnCard('ingredient', '番茄', '🍅', 'normal');
    this.spawnCard('ingredient', '鸡蛋', '🥚', 'normal');
    this.spawnCard('ingredient', '大米', '🍚', 'normal');
    this.spawnCard('ingredient', '面粉', '🌾', 'normal');
  }

  spawnCard(type, name, emoji, quality = 'normal') {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const x = this.MARGIN + col * (this.CELL_SIZE + this.GAP);
        const y = this.cardAreaY + row * (this.CELL_SIZE + this.GAP);
        if (!this.cards.some(c => Math.abs(c.x - x) < 5 && Math.abs(c.y - y) < 5)) {
          const card = new Card({ id: this.nextId++, type, name, emoji, quality });
          card.x = x; card.y = y; card.w = this.CELL_SIZE; card.h = this.CELL_SIZE;
          this.cards.push(card);
          return card;
        }
      }
    }
    return null;
  }

  onTouchStart(e) {
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!t) return;
    const px = t.x ?? t.clientX ?? t.pageX ?? 0;
    const py = t.y ?? t.clientY ?? t.pageY ?? 0;

    // 新手引导跳过按钮
    if (this.tutorialActive && hitTest(px, py, { x: this.SW - 30, y: this.safeTop, w: 30, h: 30 })) {
      this.tutorialActive = false;
      return;
    }

    // 工具按钮
    for (let tool of this.tools) {
      if (hitTest(px, py, { x: tool.x, y: tool.y, w: tool.w, h: tool.h })) {
        this.selectedTool = (this.selectedTool && this.selectedTool.key === tool.key) ? null : tool;
        return;
      }
    }
    // 订单按钮
    if (hitTest(px, py, { x: this.SW - 40, y: this.toolBarY, w: 40, h: this.toolBarH })) {
      this.orderPanelOpen = !this.orderPanelOpen;
      return;
    }
    // 点击订单面板外部关闭
    if (this.orderPanelOpen) {
      const panelW = this.SW * 0.65, panelX = this.SW - panelW;
      if (!hitTest(px, py, { x: panelX, y: this.toolBarY, w: panelW, h: this.navY - this.toolBarY })) {
        this.orderPanelOpen = false;
        // 不 return，继续检测卡牌
      }
    }
    // 卡牌
    for (let i = this.cards.length - 1; i >= 0; i--) {
      const card = this.cards[i];
      if (card.contains(px, py)) {
        this.touchState.dragging = true;
        this.touchState.dragCard = card;
        this.touchState.offsetX = px - card.x;
        this.touchState.offsetY = py - card.y;
        this.cards.splice(i, 1);
        this.cards.push(card);
        break;
      }
    }
  }

  onTouchMove(e) {
    if (!this.touchState.dragging || !this.touchState.dragCard) return;
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
    if (!t) return;
    const card = this.touchState.dragCard;
    card.x = (t.x ?? t.clientX ?? 0) - this.touchState.offsetX;
    card.y = (t.y ?? t.clientY ?? 0) - this.touchState.offsetY;
  }

  onTouchEnd(e) {
    if (!this.touchState.dragging || !this.touchState.dragCard) return;
    const card = this.touchState.dragCard;
    let targetTool = null;
    for (let tool of this.tools) {
      if (hitTest(card.x + card.w/2, card.y + card.h/2, { x: tool.x, y: tool.y, w: tool.w, h: tool.h })) {
        targetTool = tool;
        break;
      }
    }
    if (targetTool) {
      this.doCook(card, targetTool);
    } else {
      let targetCard = null;
      for (let other of this.cards) {
        if (other.id !== card.id && other.contains(card.x + card.w/2, card.y + card.h/2)) {
          targetCard = other;
          break;
        }
      }
      if (targetCard) {
        this.doCombine(card, targetCard);
      } else {
        this.snapToGrid(card);
      }
    }
    this.touchState.dragging = false;
    this.touchState.dragCard = null;
  }

  doCombine(cardA, cardB) {
    const ingredients = [cardA.name, cardB.name];
    const recipe = findRecipe(ingredients, []);
    if (recipe) {
      this.showNewRecipe(recipe, cardA, cardB);
    } else {
      wx.showToast({ title: '好像差了点什么', icon: 'none', duration: 1000 });
      this.snapToGrid(cardA);
    }
  }

  doCook(card, tool) {
    const ingredients = [card.name];
    const tools = [tool.key];
    const recipe = findRecipe(ingredients, tools);
    if (recipe) {
      this.showNewRecipe(recipe, card, null);
      this.state.fuel -= 1;
    } else if (card.name === '大米' && tool.key === 'stove') {
      const r = RECIPES['大米'];
      if (r) { this.showNewRecipe(r, card, null); this.state.fuel -= 1; }
    } else {
      wx.showToast({ title: '没法一起处理', icon: 'none', duration: 1000 });
      this.snapToGrid(card);
    }
  }

  showNewRecipe(recipe, cardA, cardB) {
    wx.showModal({
      title: '✨ 新发现！',
      content: `${recipe.emoji} ${recipe.name}\n${recipe.story}`,
      showCancel: false,
      success: () => {
        if (!this.state.recipes[recipe.name]) {
          this.state.recipes[recipe.name] = true;
          this.state.addFame(5);
        }
        this.spawnCard('recipe', recipe.name, recipe.emoji, recipe.quality);
        if (cardA) { const idx = this.cards.indexOf(cardA); if (idx > -1) this.cards.splice(idx, 1); }
        if (cardB) { const idx = this.cards.indexOf(cardB); if (idx > -1) this.cards.splice(idx, 1); }
        if (this.tutorialActive) this.advanceTutorial();
      }
    });
  }

  snapToGrid(card) {
    const col = Math.round((card.x - this.MARGIN) / (this.CELL_SIZE + this.GAP));
    const row = Math.round((card.y - this.cardAreaY) / (this.CELL_SIZE + this.GAP));
    const finalCol = Math.max(0, Math.min(this.COLS - 1, col));
    const finalRow = Math.max(0, Math.min(this.ROWS - 1, row));
    card.x = this.MARGIN + finalCol * (this.CELL_SIZE + this.GAP);
    card.y = this.cardAreaY + finalRow * (this.CELL_SIZE + this.GAP);
  }

  startTutorial() {
    this.tutorialActive = true;
    this.tutorialStep = 0;
  }

  advanceTutorial() {
    this.tutorialStep++;
    if (this.tutorialStep === 1) {
      wx.showToast({ title: '把菜拖到神龛（食灵页）上供吧！', icon: 'none', duration: 3000 });
    } else if (this.tutorialStep >= 2) {
      wx.showToast({ title: '打开菜谱看看爷爷的故事吧', icon: 'none', duration: 2000 });
      this.tutorialActive = false;
    }
  }

  update(timestamp) {}

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, 0, this.SW, this.SH);

    this.drawTopBar(ctx);
    this.drawToolBar(ctx);
    this.drawOrderButton(ctx);
    this.drawCardArea(ctx);
    if (this.orderPanelOpen) this.drawOrderPanel(ctx);
    this.drawBottomNav(ctx);

    // 新手引导：顶部提示条（不遮挡卡牌）
    if (this.tutorialActive) {
      ctx.fillStyle = 'rgba(244,168,93,0.85)';
      ctx.fillRect(0, 0, this.SW, 50 + this.safeTop);
      ctx.fillStyle = '#FFF';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let tip = '';
      if (this.tutorialStep === 0) tip = '👆 拖动番茄到鸡蛋上，试试合成！';
      else if (this.tutorialStep === 1) tip = '🏠 点击底部「食灵」页，上供菜品';
      else tip = '📖 看看菜谱里爷爷的故事吧';
      ctx.fillText(tip, this.SW / 2, 25 + this.safeTop);

      // 跳过按钮 ✕
      ctx.fillStyle = '#FFF';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('✕', this.SW - 10, 18 + this.safeTop);
    }
  }

  drawTopBar(ctx) {
    const y = this.safeTop;
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, y, this.SW, 44);
    ctx.fillStyle = '#3D2B1F';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🪙 ' + this.state.gold, 10, y + 30);
    ctx.fillText('声望 ' + this.state.fame, 120, y + 30);
    ctx.textAlign = 'right';
    ctx.fillText('Lv.' + this.state.level, this.SW - 10, y + 30);
  }

  drawToolBar(ctx) {
    const y = this.safeTop + 44;
    ctx.fillStyle = '#F5EDE0';
    ctx.fillRect(0, y, this.SW, this.toolBarH);
    for (let tool of this.tools) {
      const isSelected = this.selectedTool && this.selectedTool.key === tool.key;
      const bgColor = isSelected ? '#F0D060' : '#D4C9B8';
      drawCard(ctx, tool.x, tool.y, tool.w, tool.h, tool.emoji, tool.name, bgColor);
    }
  }

  drawOrderButton(ctx) {
    const btnX = this.SW - 40, btnY = this.safeTop + 44;
    ctx.fillStyle = '#F4A85D';
    ctx.beginPath();
    ctx.arc(btnX + 20, btnY + 40, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📋', btnX + 20, btnY + 45);
  }

  drawCardArea(ctx) {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const x = this.MARGIN + col * (this.CELL_SIZE + this.GAP);
        const y = this.cardAreaY + row * (this.CELL_SIZE + this.GAP);
        ctx.fillStyle = '#F0E8D8';
        drawRoundRect(ctx, x, y, this.CELL_SIZE, this.CELL_SIZE, 8, '#F0E8D8');
      }
    }
    for (let card of this.cards) {
      if (this.touchState.dragCard && this.touchState.dragCard.id === card.id) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        drawCard(ctx, card.x, card.y, this.CELL_SIZE, this.CELL_SIZE, card.emoji, card.name, '#F0D060');
        ctx.restore();
      } else {
        drawCard(ctx, card.x, card.y, this.CELL_SIZE, this.CELL_SIZE, card.emoji, card.name);
      }
    }
  }

  drawOrderPanel(ctx) {
    const panelW = this.SW * 0.65, panelX = this.SW - panelW;
    ctx.fillStyle = '#FFF8EE';
    ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 10;
    ctx.fillRect(panelX, this.toolBarY, panelW, this.navY - this.toolBarY);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
    ctx.strokeStyle = '#D4C9B8'; ctx.lineWidth = 1;
    ctx.strokeRect(panelX, this.toolBarY, panelW, this.navY - this.toolBarY);
    ctx.fillStyle = '#3D2B1F';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 今日黑板', panelX + 10, this.toolBarY + 30);
    const orders = [
      { name: '番茄炒蛋×1', reward: '30💰', from: '路人', time: '3h', color: '#FFFFFF' },
      { name: '红烧肉盖饭', reward: '80💰', from: '王大妈', time: '2h', color: '#C8F7C8' },
      { name: '便当套餐', reward: '150💰', from: '爷爷朋友', time: '1h⚠️', color: '#C8D8FF' },
    ];
    let yOff = this.toolBarY + 45;
    for (let order of orders) {
      ctx.fillStyle = order.color;
      ctx.fillRect(panelX + 5, yOff, panelW - 10, 60);
      ctx.fillStyle = '#3D2B1F';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${order.dot || '●'} ${order.name}`, panelX + 12, yOff + 22);
      ctx.font = '12px sans-serif';
      ctx.fillText(`${order.from} | 剩余${order.time}`, panelX + 12, yOff + 42);
      ctx.textAlign = 'right';
      ctx.fillText(order.reward, panelX + panelW - 12, yOff + 22);
      yOff += 65;
    }
  }

  drawBottomNav(ctx) {
    const y = this.navY;
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, y, this.SW, this.navH);
    const items = ['🏠 厨房', '🗺 地图', '📖 菜谱', '✨ 食灵'];
    const itemW = this.SW / items.length;
    for (let i = 0; i < items.length; i++) {
      ctx.fillStyle = '#3D2B1F';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(items[i], i * itemW + itemW / 2, y + this.navH / 2 + 5);
      if (i === 0) {
        ctx.fillStyle = '#F4A85D';
        ctx.fillRect(i * itemW + itemW / 2 - 20, y + 2, 40, 3);
      }
    }
  }
}