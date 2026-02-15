import type { Location, TutorialStep, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types';

// ============================================================================
// MANDARIN HOME MODULE - Stub (not converted for mutation engine experiment)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: '卧室 (woshi)', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: '浴室 (yushi)', native: 'bathroom' } },
      { to: 'kitchen', name: { target: '厨房 (chufang)', native: 'kitchen' } },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: '浴室 (yushi)', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: '卧室 (woshi)', native: 'bedroom' } },
      { to: 'kitchen', name: { target: '厨房 (chufang)', native: 'kitchen' } },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: '厨房 (chufang)', native: 'kitchen' },
    exits: [
      { to: 'bedroom', name: { target: '卧室 (woshi)', native: 'bedroom' } },
      { to: 'bathroom', name: { target: '浴室 (yushi)', native: 'bathroom' } },
    ],
  },
};

const objects: WorldObject[] = [
  { id: 'bed', name: { target: '床 (chuang)', native: 'bed' }, location: 'bedroom', tags: [] },
  { id: 'alarm_clock', name: { target: '闹钟 (naozhong)', native: 'alarm clock' }, location: 'bedroom', tags: ['ringing', 'on'] },
  { id: 'lamp', name: { target: '台灯 (taideng)', native: 'lamp' }, location: 'bedroom', tags: ['off'] },
  { id: 'wardrobe', name: { target: '衣柜 (yigui)', native: 'wardrobe' }, location: 'bedroom', tags: ['closed'] },
  { id: 'toilet', name: { target: '马桶 (matong)', native: 'toilet' }, location: 'bathroom', tags: [] },
  { id: 'shower', name: { target: '淋浴 (linyu)', native: 'shower' }, location: 'bathroom', tags: ['off'] },
  { id: 'toothbrush', name: { target: '牙刷 (yashua)', native: 'toothbrush' }, location: 'bathroom', tags: [] },
  { id: 'mirror', name: { target: '镜子 (jingzi)', native: 'mirror' }, location: 'bathroom', tags: [] },
  { id: 'refrigerator', name: { target: '冰箱 (bingxiang)', native: 'refrigerator' }, location: 'kitchen', tags: ['closed', 'container'] },
  { id: 'stove', name: { target: '炉子 (luzi)', native: 'stove' }, location: 'kitchen', tags: ['off'] },
  { id: 'rice_cooker', name: { target: '电饭锅 (dianfanguo)', native: 'rice cooker' }, location: 'kitchen', tags: ['off'] },
  { id: 'eggs', name: { target: '鸡蛋 (jidan)', native: 'eggs' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 25 } },
  { id: 'milk', name: { target: '牛奶 (niunai)', native: 'milk' }, location: 'refrigerator', tags: ['takeable', 'consumable'], needsEffect: { hunger: 15 } },
  { id: 'bread', name: { target: '面包 (mianbao)', native: 'bread' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { hunger: 20 } },
  { id: 'water', name: { target: '水 (shui)', native: 'water' }, location: 'kitchen', tags: ['takeable', 'consumable'], needsEffect: { hunger: 5 } },
];

const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: '室友小明 (shiyou Xiao Ming)', native: 'roommate Xiao Ming' },
    location: 'kitchen',
    personality: 'Friendly and helpful roommate. Speaks simple Mandarin. Likes cooking and always offers to share food.',
  },
];

const tutorial: TutorialStep[] = [
  {
    id: 'wake_up',
    title: 'Wake up and get out of bed (起床 qichuang)',
    description: 'Get out of bed to begin your morning.',
    hint: 'Say "我起床" (wo qichuang - I get up)',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextStepId: 'brush_teeth',
  },
  {
    id: 'brush_teeth',
    title: 'Brush your teeth (刷牙 shuaya)',
    description: 'Practice good hygiene by brushing your teeth.',
    hint: 'Go to the bathroom and say "我刷牙" (wo shuaya)',
    checkComplete: (state: GameState) => state.completedSteps.includes('brush_teeth'),
    nextStepId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower (洗澡 xizao)',
    description: 'A shower will help you feel fresh and ready.',
    hint: 'Say "我洗澡" (wo xizao)',
    checkComplete: (state: GameState) => state.completedSteps.includes('take_shower'),
    nextStepId: 'make_breakfast',
  },
  {
    id: 'make_breakfast',
    title: 'Eat breakfast (吃早饭 chi zaofan)',
    description: 'Time to eat. Find something in the kitchen.',
    hint: 'Open the fridge (打开冰箱), and eat something',
    checkComplete: (state: GameState) => state.completedSteps.includes('make_breakfast'),
    nextStepId: 'greet_roommate',
  },
  {
    id: 'greet_roommate',
    title: 'Greet your roommate (打招呼 da zhaohu)',
    description: 'Say good morning to your roommate Xiao Ming.',
    hint: 'Say "你好小明" or "早上好"',
    checkComplete: (state: GameState) => state.completedSteps.includes('greet_roommate'),
  },
];

const vocabulary: VocabWord[] = [
  { target: '卧室', native: 'bedroom', category: 'noun', pinyin: 'woshi', tones: [4, 4] },
  { target: '浴室', native: 'bathroom', category: 'noun', pinyin: 'yushi', tones: [4, 4] },
  { target: '厨房', native: 'kitchen', category: 'noun', pinyin: 'chufang', tones: [2, 2] },
  { target: '床', native: 'bed', category: 'noun', pinyin: 'chuang', tones: [2] },
  { target: '闹钟', native: 'alarm clock', category: 'noun', pinyin: 'naozhong', tones: [4, 1] },
  { target: '冰箱', native: 'refrigerator', category: 'noun', pinyin: 'bingxiang', tones: [1, 1] },
  { target: '鸡蛋', native: 'eggs', category: 'noun', pinyin: 'jidan', tones: [1, 4] },
  { target: '牛奶', native: 'milk', category: 'noun', pinyin: 'niunai', tones: [2, 3] },
  { target: '面包', native: 'bread', category: 'noun', pinyin: 'mianbao', tones: [4, 1] },
  { target: '水', native: 'water', category: 'noun', pinyin: 'shui', tones: [3] },
  { target: '起床', native: 'get up', category: 'verb', pinyin: 'qichuang', tones: [3, 2] },
  { target: '刷牙', native: 'brush teeth', category: 'verb', pinyin: 'shuaya', tones: [1, 2] },
  { target: '洗澡', native: 'take a shower', category: 'verb', pinyin: 'xizao', tones: [3, 3] },
  { target: '吃', native: 'eat', category: 'verb', pinyin: 'chi', tones: [1] },
  { target: '打开', native: 'open', category: 'verb', pinyin: 'dakai', tones: [3, 1] },
  { target: '去', native: 'go', category: 'verb', pinyin: 'qu', tones: [4] },
  { target: '你好', native: 'hello', category: 'other', pinyin: 'nihao', tones: [3, 3] },
  { target: '早上好', native: 'good morning', category: 'other', pinyin: 'zaoshang hao', tones: [3, 4, 3] },
];

export const homeModule: ModuleDefinition = {
  name: 'home',
  displayName: 'Home',
  locations,
  objects,
  npcs,
  tutorial,
  quests: [],
  vocabulary,
  startLocationId: 'bedroom',
  firstStepId: 'wake_up',
  locationIds: ['bedroom', 'bathroom', 'kitchen'],
  unlockLevel: 1,
  guidance: `MANDARIN HOME (STUB):
Basic home environment for Mandarin learners.
Not fully implemented for the mutation engine experiment.`,
};
