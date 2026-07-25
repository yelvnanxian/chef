// game.js - 百味小厨主入口（修复触摸注册时机）
import { Kitchen } from './js/heritage/kitchen.js';
import { MapPage } from './js/heritage/map.js';
import { RecipePage } from './js/heritage/recipe.js';
import { SpiritPage } from './js/heritage/spirit.js';
import { GameState } from './js/heritage/utils.js';

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const sysInfo = wx.getSystemInfoSync();
const SW = sysInfo.windowWidth;
const SH = sysInfo.windowHeight;
const SAFE_TOP = sysInfo.statusBarHeight || 44;
const SAFE_BOTTOM = Math.max(0, SH - sysInfo.safeArea.bottom);
canvas.width = SW;
canvas.height = SH;

const state = new GameState({
  gold: 0, diamond: 0, fame: 0, level: 1, chefCount: 1, chefEnergy: [100], fuel: 100,
  recipes: {}, discovered: new Set(), chapter: 1, progress: { totalDishes: 0, chapter1: 0 },
  spiritFavor: 0, fameUnlocks: [false], orders: [], completedOrders: 0,
  bag: { vegetable: 3, egg: 3, rice: 2, flour: 1 }, kitchenSlots: 12,
  toolLevel: { stove: 1, board: 1, sink: 1 }, lastLogin: Date.now(),
  gardenTimer: 0, gardenYield: 1, travel: { chefIndex: -1, dest: null, endTime: 0 },
});

let currentScene = 'kitchen';
const scenes = {};

function initScenes() {
  scenes.kitchen = new Kitchen(ctx, SW, SH, state, SAFE_TOP, SAFE_BOTTOM);
  scenes.map = new MapPage(ctx, SW, SH, state, SAFE_TOP, SAFE_BOTTOM);
  scenes.recipe = new RecipePage(ctx, SW, SH, state, SAFE_TOP, SAFE_BOTTOM);
  scenes.spirit = new SpiritPage(ctx, SW, SH, state, SAFE_TOP, SAFE_BOTTOM);

  // 场景创建完成后注册触摸事件（确保 scenes 已就绪）
  wx.onTouchStart((e) => {
    const scene = scenes[currentScene];
    if (scene && scene.onTouchStart) scene.onTouchStart(e);
  });
  wx.onTouchMove((e) => {
    const scene = scenes[currentScene];
    if (scene && scene.onTouchMove) scene.onTouchMove(e);
  });
  wx.onTouchEnd((e) => {
    const scene = scenes[currentScene];
    if (scene && scene.onTouchEnd) scene.onTouchEnd(e);
  });
}

function switchScene(name) {
  currentScene = name;
  const scene = scenes[name];
  if (scene && scene.onEnter) scene.onEnter();
}

// ====== 启动画面 ======
const splashStart = Date.now();

function drawSplash() {
  ctx.fillStyle = '#FFF8EE';
  ctx.fillRect(0, 0, SW, SH);
  ctx.fillStyle = '#3D2B1F';
  ctx.font = '36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🥘 百味小厨', SW / 2, SH / 2 - 40);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#8B7355';
  ctx.fillText('卡牌堆叠 · 烹饪探索', SW / 2, SH / 2 + 10);
  ctx.fillStyle = '#C0B090';
  ctx.font = '12px sans-serif';
  ctx.fillText('加载中……', SW / 2, SH / 2 + 60);
}

function checkSplash() {
  if (Date.now() - splashStart >= 2000) {
    initScenes();  // initScenes 内部注册了触摸事件
    requestAnimationFrame(gameLoop);
  } else {
    drawSplash();
    requestAnimationFrame(checkSplash);
  }
}

checkSplash();

function gameLoop(timestamp) {
  ctx.clearRect(0, 0, SW, SH);
  const scene = scenes[currentScene];
  if (scene) {
    scene.update(timestamp);
    if (scene === scenes.kitchen && !scene._tutorialStarted) {
      scene._tutorialStarted = true;
      scene.startTutorial();
    }
    scene.draw();
  }
  requestAnimationFrame(gameLoop);
}