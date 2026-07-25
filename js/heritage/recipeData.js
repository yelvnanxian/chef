export const RECIPES = {
  // 番茄炒蛋 — 拖动合成 或 灶台烹饪
  '番茄,鸡蛋': {
    name: '番茄炒蛋', emoji: '🍳', chapter: 1, type: 'main',
    story: '番茄炒蛋——你妈第一次来家里吃饭，我做的就是这道菜。火要大，蛋要嫩，番茄要软。',
    quality: 'normal', value: 30
  },
  'stove,番茄,鸡蛋': {
    name: '番茄炒蛋', emoji: '🍳', chapter: 1, type: 'main',
    story: '番茄炒蛋——你妈第一次来家里吃饭，我做的就是这道菜。火要大，蛋要嫩，番茄要软。',
    quality: 'normal', value: 30
  },
  // 蛋炒饭
  '大米,鸡蛋': {
    name: '蛋炒饭', emoji: '🍚', chapter: 1, type: 'main',
    story: '蛋炒饭是最简单的，也是最难的。粒粒分明，才是功力。',
    quality: 'normal', value: 40
  },
  'stove,大米,鸡蛋': {
    name: '蛋炒饭', emoji: '🍚', chapter: 1, type: 'main',
    story: '蛋炒饭是最简单的，也是最难的。粒粒分明，才是功力。',
    quality: 'normal', value: 40
  },
  // 青菜炒蛋
  '蔬菜,鸡蛋': {
    name: '青菜炒蛋', emoji: '🥗', chapter: 1, type: 'main',
    story: '青菜要大火快炒，才能又脆又绿。',
    quality: 'normal', value: 25
  },
  'stove,蔬菜,鸡蛋': {
    name: '青菜炒蛋', emoji: '🥗', chapter: 1, type: 'main',
    story: '青菜要大火快炒，才能又脆又绿。',
    quality: 'normal', value: 25
  },
  // 青菜蛋汤
  'sink,stove,蔬菜,鸡蛋': {
    name: '青菜蛋汤', emoji: '🥣', chapter: 1, type: 'soup',
    story: '汤要清，心才静。——王婆婆',
    quality: 'normal', value: 20
  },
  // 白米饭
  '大米': {
    name: '白米饭', emoji: '🍚', chapter: 1, type: 'staple',
    story: '会煮饭，才算会生活。',
    quality: 'normal', value: 10
  },
  'stove,大米': {
    name: '白米饭', emoji: '🍚', chapter: 1, type: 'staple',
    story: '会煮饭，才算会生活。',
    quality: 'normal', value: 10
  },
  // 面团
  'board,sink,面粉': {
    name: '面团', emoji: '🥟', chapter: 1, type: 'prep',
    story: '面团要揉三遍，醒三遍。',
    quality: 'normal', value: 5
  },
  // 葱花饼
  'board,sink,stove,面粉': {
    name: '葱花饼', emoji: '🫓', chapter: 1, type: 'main',
    story: '葱花饼，葱要多，油要热。',
    quality: 'normal', value: 15
  },
};

export function findRecipe(ingredients, tools) {
  const all = [...ingredients, ...tools].sort();
  const fullKey = all.join(',');
  if (RECIPES[fullKey]) return RECIPES[fullKey];
  const ingredientKey = [...ingredients].sort().join(',');
  if (RECIPES[ingredientKey]) return RECIPES[ingredientKey];
  return null;
}