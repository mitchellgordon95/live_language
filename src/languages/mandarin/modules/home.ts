import type { Location, Goal, VocabWord, GameState, NPC, ModuleDefinition } from '../../../engine/types.js';

// ============================================================================
// MANDARIN HOME MODULE - Simplified starter module
// ============================================================================

// --- Locations ---

const bedroom: Location = {
  id: 'bedroom',
  name: { target: '卧室 (woshi)', native: 'bedroom' },
  objects: [
    {
      id: 'bed',
      name: { target: '床 (chuang)', native: 'bed' },
      state: { made: false },
      actions: ['USE'],
    },
    {
      id: 'alarm_clock',
      name: { target: '闹钟 (naozhong)', native: 'alarm clock' },
      state: { ringing: true, on: true },
      actions: ['TURN_OFF'],
    },
    {
      id: 'lamp',
      name: { target: '台灯 (taideng)', native: 'lamp' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'wardrobe',
      name: { target: '衣柜 (yigui)', native: 'wardrobe' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
  ],
  exits: [
    { to: 'bathroom', name: { target: '浴室 (yushi)', native: 'bathroom' } },
    { to: 'kitchen', name: { target: '厨房 (chufang)', native: 'kitchen' } },
  ],
};

const bathroom: Location = {
  id: 'bathroom',
  name: { target: '浴室 (yushi)', native: 'bathroom' },
  objects: [
    {
      id: 'toilet',
      name: { target: '马桶 (matong)', native: 'toilet' },
      state: {},
      actions: ['USE'],
      needsEffect: { bladder: 40 },
    },
    {
      id: 'shower',
      name: { target: '淋浴 (linyu)', native: 'shower' },
      state: {},
      actions: ['USE'],
      needsEffect: { hygiene: 50, energy: 10 },
    },
    {
      id: 'toothbrush',
      name: { target: '牙刷 (yashua)', native: 'toothbrush' },
      state: {},
      actions: ['USE'],
      needsEffect: { hygiene: 10 },
    },
    {
      id: 'mirror',
      name: { target: '镜子 (jingzi)', native: 'mirror' },
      state: {},
      actions: ['LOOK'],
    },
  ],
  exits: [
    { to: 'bedroom', name: { target: '卧室 (woshi)', native: 'bedroom' } },
    { to: 'kitchen', name: { target: '厨房 (chufang)', native: 'kitchen' } },
  ],
};

const kitchen: Location = {
  id: 'kitchen',
  name: { target: '厨房 (chufang)', native: 'kitchen' },
  objects: [
    {
      id: 'refrigerator',
      name: { target: '冰箱 (bingxiang)', native: 'refrigerator' },
      state: { open: false },
      actions: ['OPEN', 'CLOSE'],
    },
    {
      id: 'stove',
      name: { target: '炉子 (luzi)', native: 'stove' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF'],
    },
    {
      id: 'rice_cooker',
      name: { target: '电饭锅 (dianfanguo)', native: 'rice cooker' },
      state: { on: false },
      actions: ['TURN_ON', 'TURN_OFF', 'USE'],
    },
    {
      id: 'eggs',
      name: { target: '鸡蛋 (jidan)', native: 'eggs' },
      state: { inFridge: true },
      actions: ['TAKE', 'COOK', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 25 },
    },
    {
      id: 'milk',
      name: { target: '牛奶 (niunai)', native: 'milk' },
      state: { inFridge: true },
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 15 },
    },
    {
      id: 'bread',
      name: { target: '面包 (mianbao)', native: 'bread' },
      state: {},
      actions: ['TAKE', 'EAT'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 20 },
    },
    {
      id: 'water',
      name: { target: '水 (shui)', native: 'water' },
      state: {},
      actions: ['TAKE', 'DRINK'],
      takeable: true,
      consumable: true,
      needsEffect: { hunger: 5 },
    },
  ],
  exits: [
    { to: 'bedroom', name: { target: '卧室 (woshi)', native: 'bedroom' } },
    { to: 'bathroom', name: { target: '浴室 (yushi)', native: 'bathroom' } },
  ],
};

// --- NPC ---

const roommate: NPC = {
  id: 'roommate',
  name: { target: '室友小明 (shiyou Xiao Ming)', native: 'roommate Xiao Ming' },
  location: 'kitchen',
  personality: 'Friendly and helpful roommate. Speaks simple Mandarin. Likes cooking and always offers to share food. Encourages the player to practice their Chinese.',
};

const mandarinNPCs: NPC[] = [roommate];

// --- Goals ---

const mandarinGoals: Goal[] = [
  {
    id: 'wake_up',
    title: 'Wake up and get out of bed (起床 qichuang)',
    description: 'Get out of bed to begin your morning.',
    hint: 'Say "我起床" (wo qichuang - I get up) or "起来" (qilai - get up)',
    checkComplete: (state: GameState) => state.playerPosition === 'standing',
    nextGoalId: 'brush_teeth',
  },
  {
    id: 'brush_teeth',
    title: 'Brush your teeth (刷牙 shuaya)',
    description: 'Practice good hygiene by brushing your teeth.',
    hint: 'Go to the bathroom and say "我刷牙" (wo shuaya)',
    checkComplete: (state: GameState) => state.completedGoals.includes('brush_teeth'),
    nextGoalId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower (洗澡 xizao)',
    description: 'A shower will help you feel fresh and ready.',
    hint: 'Say "我洗澡" (wo xizao - I take a shower)',
    checkComplete: (state: GameState) => state.completedGoals.includes('take_shower'),
    nextGoalId: 'make_breakfast',
  },
  {
    id: 'make_breakfast',
    title: 'Eat breakfast (吃早饭 chi zaofan)',
    description: 'Time to eat. Find something in the kitchen.',
    hint: 'Go to the kitchen, open the fridge (打开冰箱 dakai bingxiang), and eat something',
    checkComplete: (state: GameState) => state.completedGoals.includes('make_breakfast'),
    nextGoalId: 'greet_roommate',
  },
  {
    id: 'greet_roommate',
    title: 'Greet your roommate (打招呼 da zhaohu)',
    description: 'Say good morning to your roommate Xiao Ming.',
    hint: 'Say "你好小明" (nihao Xiao Ming) or "早上好" (zaoshang hao - good morning)',
    checkComplete: (state: GameState) => state.completedGoals.includes('greet_roommate'),
  },
];

// --- Vocabulary ---

const mandarinVocabulary: VocabWord[] = [
  // Rooms
  { target: '卧室', native: 'bedroom', category: 'noun', pinyin: 'woshi', tones: [4, 4] },
  { target: '浴室', native: 'bathroom', category: 'noun', pinyin: 'yushi', tones: [4, 4] },
  { target: '厨房', native: 'kitchen', category: 'noun', pinyin: 'chufang', tones: [2, 2] },

  // Furniture & Objects
  { target: '床', native: 'bed', category: 'noun', pinyin: 'chuang', tones: [2] },
  { target: '闹钟', native: 'alarm clock', category: 'noun', pinyin: 'naozhong', tones: [4, 1] },
  { target: '台灯', native: 'lamp', category: 'noun', pinyin: 'taideng', tones: [2, 1] },
  { target: '衣柜', native: 'wardrobe', category: 'noun', pinyin: 'yigui', tones: [1, 4] },
  { target: '冰箱', native: 'refrigerator', category: 'noun', pinyin: 'bingxiang', tones: [1, 1] },
  { target: '炉子', native: 'stove', category: 'noun', pinyin: 'luzi', tones: [2, 5] },
  { target: '镜子', native: 'mirror', category: 'noun', pinyin: 'jingzi', tones: [4, 5] },

  // Food & Drink
  { target: '鸡蛋', native: 'eggs', category: 'noun', pinyin: 'jidan', tones: [1, 4] },
  { target: '牛奶', native: 'milk', category: 'noun', pinyin: 'niunai', tones: [2, 3] },
  { target: '面包', native: 'bread', category: 'noun', pinyin: 'mianbao', tones: [4, 1] },
  { target: '水', native: 'water', category: 'noun', pinyin: 'shui', tones: [3] },
  { target: '早饭', native: 'breakfast', category: 'noun', pinyin: 'zaofan', tones: [3, 4] },

  // Verbs
  { target: '起床', native: 'get up', category: 'verb', pinyin: 'qichuang', tones: [3, 2] },
  { target: '刷牙', native: 'brush teeth', category: 'verb', pinyin: 'shuaya', tones: [1, 2] },
  { target: '洗澡', native: 'take a shower', category: 'verb', pinyin: 'xizao', tones: [3, 3] },
  { target: '吃', native: 'eat', category: 'verb', pinyin: 'chi', tones: [1] },
  { target: '喝', native: 'drink', category: 'verb', pinyin: 'he', tones: [1] },
  { target: '打开', native: 'open', category: 'verb', pinyin: 'dakai', tones: [3, 1] },
  { target: '关', native: 'close', category: 'verb', pinyin: 'guan', tones: [1] },
  { target: '去', native: 'go', category: 'verb', pinyin: 'qu', tones: [4] },
  { target: '用', native: 'use', category: 'verb', pinyin: 'yong', tones: [4] },
  { target: '做饭', native: 'cook', category: 'verb', pinyin: 'zuofan', tones: [4, 4] },

  // Greetings
  { target: '你好', native: 'hello', category: 'other', pinyin: 'nihao', tones: [3, 3] },
  { target: '早上好', native: 'good morning', category: 'other', pinyin: 'zaoshang hao', tones: [3, 4, 3] },
  { target: '谢谢', native: 'thank you', category: 'other', pinyin: 'xiexie', tones: [4, 4] },
];

// --- Module Definition ---

export const homeModule: ModuleDefinition = {
  name: 'home',
  displayName: 'Home',
  locations: { bedroom, bathroom, kitchen },
  npcs: mandarinNPCs,
  goals: mandarinGoals,
  vocabulary: mandarinVocabulary,
  startLocationId: 'bedroom',
  startGoalId: 'wake_up',
  locationIds: ['bedroom', 'bathroom', 'kitchen'],
  unlockLevel: 1,
  promptInstructions: `MANDARIN HOME MODULE:
NPCs: 室友小明 (Xiao Ming, the roommate) is in the kitchen. He's friendly and speaks simple Mandarin.

GOAL COMPLETION:
- "wake_up" - when player gets out of bed (起床 qichuang)
- "brush_teeth" - when player brushes teeth (刷牙 shuaya)
- "take_shower" - when player showers (洗澡 xizao)
- "make_breakfast" - when player eats food (吃早饭 chi zaofan)
- "greet_roommate" - when player greets Xiao Ming (你好/早上好)

GRAMMAR TO TEACH:
- Basic SVO word order: 我打开冰箱 (wo dakai bingxiang)
- Measure words: 一杯水 (yi bei shui), 一个鸡蛋 (yi ge jidan)
- 了 particle for completed actions: 我吃了早饭 (wo chi le zaofan)
- Location with 在: 我在厨房 (wo zai chufang)
- Going with 去: 我去浴室 (wo qu yushi)`,
};
