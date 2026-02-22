import type { Location, TutorialStep, Quest, VocabWord, GameState, NPC, WorldObject, ModuleDefinition } from '../../../engine/types';

// ============================================================================
// LOCATIONS (exits only — objects are in the flat list below)
// ============================================================================

const locations: Record<string, Location> = {
  bedroom: {
    id: 'bedroom',
    name: { target: '卧室 (wòshì)', native: 'bedroom' },
    exits: [
      { to: 'bathroom', name: { target: '浴室 (yùshì)', native: 'bathroom' } },
      { to: 'living_room', name: { target: '客厅 (kètīng)', native: 'living room' } },
    ],
    verbs: [
      { target: '起床 (qǐchuáng)', native: 'I get up' },
      { target: '关 (guān)', native: 'I turn off' },
      { target: '开 (kāi)', native: 'I turn on' },
      { target: '去 (qù)', native: 'I go to' },
    ],
  },
  bathroom: {
    id: 'bathroom',
    name: { target: '浴室 (yùshì)', native: 'bathroom' },
    exits: [
      { to: 'bedroom', name: { target: '卧室 (wòshì)', native: 'bedroom' } },
      { to: 'living_room', name: { target: '客厅 (kètīng)', native: 'living room' } },
    ],
    verbs: [
      { target: '洗澡 (xǐzǎo)', native: 'I shower' },
      { target: '洗 (xǐ)', native: 'I wash' },
      { target: '刷牙 (shuāyá)', native: 'I brush teeth' },
      { target: '用 (yòng)', native: 'I use' },
    ],
  },
  kitchen: {
    id: 'kitchen',
    name: { target: '厨房 (chúfáng)', native: 'kitchen' },
    exits: [
      { to: 'living_room', name: { target: '客厅 (kètīng)', native: 'living room' } },
    ],
    verbs: [
      { target: '打开 (dǎkāi)', native: 'I open' },
      { target: '做饭 (zuòfàn)', native: 'I cook' },
      { target: '吃 (chī)', native: 'I eat' },
      { target: '喝 (hē)', native: 'I drink' },
      { target: '给 (gěi)', native: 'I give' },
      { target: '摸 (mō)', native: 'I pet' },
    ],
  },
  living_room: {
    id: 'living_room',
    name: { target: '客厅 (kètīng)', native: 'living room' },
    exits: [
      { to: 'bedroom', name: { target: '卧室 (wòshì)', native: 'bedroom' } },
      { to: 'bathroom', name: { target: '浴室 (yùshì)', native: 'bathroom' } },
      { to: 'kitchen', name: { target: '厨房 (chúfáng)', native: 'kitchen' } },
      { to: 'module_exit', name: { target: '出口 (chūkǒu)', native: 'exit' } },
    ],
    verbs: [
      { target: '跟...说话 (gēn...shuōhuà)', native: 'I talk to' },
      { target: '坐下 (zuòxià)', native: 'I sit down' },
      { target: '开 (kāi)', native: 'I turn on' },
      { target: '看 (kàn)', native: 'I look at' },
    ],
  },
  module_exit: {
    id: 'module_exit',
    name: { target: '出口 (chūkǒu)', native: 'exit' },
    exits: [],
    verbs: [],
  },
};

// ============================================================================
// OBJECTS (flat list — each knows its own location)
// ============================================================================

const objects: WorldObject[] = [
  // Bedroom
  { id: 'bed', name: { target: '床 (chuáng)', native: 'bed' }, location: 'bedroom', tags: [] },
  { id: 'alarm_clock', name: { target: '闹钟 (nàozhōng)', native: 'alarm clock' }, location: 'bedroom', tags: ['ringing', 'on'] },
  { id: 'window', name: { target: '窗户 (chuānghu)', native: 'window' }, location: 'bedroom', tags: ['closed'] },
  { id: 'lamp', name: { target: '台灯 (táidēng)', native: 'lamp' }, location: 'bedroom', tags: ['off'] },
  { id: 'closet', name: { target: '衣柜 (yīguì)', native: 'closet' }, location: 'bedroom', tags: ['closed'] },

  // Bathroom
  { id: 'sink', name: { target: '洗手池 (xǐshǒuchí)', native: 'sink' }, location: 'bathroom', tags: [] },
  { id: 'mirror', name: { target: '镜子 (jìngzi)', native: 'mirror' }, location: 'bathroom', tags: [] },
  { id: 'toilet', name: { target: '马桶 (mǎtǒng)', native: 'toilet' }, location: 'bathroom', tags: [] },
  { id: 'shower', name: { target: '淋浴 (línyù)', native: 'shower' }, location: 'bathroom', tags: ['off'] },
  { id: 'toothbrush', name: { target: '牙刷 (yáshuā)', native: 'toothbrush' }, location: 'bathroom', tags: [] },
  { id: 'towel', name: { target: '毛巾 (máojīn)', native: 'towel' }, location: 'bathroom', tags: ['takeable'] },
  { id: 'soap', name: { target: '肥皂 (féizào)', native: 'soap' }, location: 'bathroom', tags: [] },

  // Kitchen
  { id: 'refrigerator', name: { target: '冰箱 (bīngxiāng)', native: 'refrigerator' }, location: 'kitchen', tags: ['closed', 'container'] },
  { id: 'stove', name: { target: '炉子 (lúzi)', native: 'stove' }, location: 'kitchen', tags: ['off'] },
  { id: 'table', name: { target: '桌子 (zhuōzi)', native: 'table' }, location: 'kitchen', tags: [] },
  { id: 'chair', name: { target: '椅子 (yǐzi)', native: 'chair' }, location: 'kitchen', tags: [] },
  { id: 'coffee_maker', name: { target: '咖啡机 (kāfēijī)', native: 'coffee maker' }, location: 'kitchen', tags: ['off'] },
  { id: 'kitchen_sink', name: { target: '水槽 (shuǐcáo)', native: 'kitchen sink' }, location: 'kitchen', tags: [] },
  { id: 'cup', name: { target: '杯子 (bēizi)', native: 'cup' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'plate', name: { target: '盘子 (pánzi)', native: 'plate' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pan', name: { target: '锅 (guō)', native: 'pan' }, location: 'kitchen', tags: ['takeable'] },
  { id: 'pet_food', name: { target: '宠物食品 (chǒngwù shípǐn)', native: 'pet food' }, location: 'kitchen', tags: ['takeable'] },

  // Food (inside fridge — location is the container ID)
  { id: 'milk', name: { target: '牛奶 (niúnǎi)', native: 'milk' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },
  { id: 'eggs', name: { target: '鸡蛋 (jīdàn)', native: 'eggs' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },
  { id: 'butter', name: { target: '黄油 (huángyóu)', native: 'butter' }, location: 'refrigerator', tags: ['takeable'] },
  { id: 'juice', name: { target: '果汁 (guǒzhī)', native: 'juice' }, location: 'refrigerator', tags: ['takeable', 'consumable'] },

  // Food (on counter)
  { id: 'bread', name: { target: '面包 (miànbāo)', native: 'bread' }, location: 'kitchen', tags: ['takeable', 'consumable'] },
  { id: 'coffee', name: { target: '咖啡 (kāfēi)', native: 'coffee' }, location: 'kitchen', tags: ['takeable', 'consumable'] },
  { id: 'water', name: { target: '水 (shuǐ)', native: 'water' }, location: 'kitchen', tags: ['consumable'] },

  // Living room
  { id: 'couch', name: { target: '沙发 (shāfā)', native: 'couch' }, location: 'living_room', tags: [] },
  { id: 'tv', name: { target: '电视 (diànshì)', native: 'TV' }, location: 'living_room', tags: ['off'] },
  { id: 'coffee_table', name: { target: '茶几 (chájī)', native: 'coffee table' }, location: 'living_room', tags: [] },
  { id: 'bookshelf', name: { target: '书架 (shūjià)', native: 'bookshelf' }, location: 'living_room', tags: [] },
  { id: 'remote', name: { target: '遥控器 (yáokòngqì)', native: 'remote control' }, location: 'living_room', tags: ['takeable'] },

  // Street
];

// ============================================================================
// NPCs (pets are NPCs with isPet: true)
// ============================================================================

const npcs: NPC[] = [
  {
    id: 'roommate',
    name: { target: '小明 (Xiǎo Míng)', native: 'Xiao Ming' },
    location: 'living_room',
    personality: 'Very sleepy roommate. Just woke up, sitting on the couch, barely awake. Will ask the player for coffee when they talk to him. After getting coffee, mentions being hungry. Grateful and casual.',
    gender: 'male',
    appearance: 'A friendly young man in his mid-20s with black hair and glasses. Gray hoodie, warm smile.',
  },
  {
    id: 'cat',
    name: { target: '小花 (Xiǎohuā)', native: 'Xiaohua (cat)' },
    location: 'kitchen',
    personality: 'Independent and aloof cat. Occasionally affectionate. Purrs when petted, ignores most commands.',
    isPet: true,
    appearance: 'A calico cat with patches of orange, black, and white. Slightly aloof with half-closed eyes. Elegant and independent.',
  },
  {
    id: 'dog',
    name: { target: '旺财 (Wàngcái)', native: 'Wangcai (dog)' },
    location: 'kitchen',
    personality: 'Excited and hungry dog. Always wants attention and food. Wags tail enthusiastically.',
    isPet: true,
    appearance: 'A golden retriever with bright eyes and an eager expression. Tongue slightly out, tail always mid-wag. Joyful energy.',
  },
];

// ============================================================================
// TUTORIAL STEPS
// ============================================================================

const tutorial: TutorialStep[] = [
  {
    id: 'wake_up',
    title: 'Get out of bed',
    description: 'You just woke up. Get out of bed to start your day.',
    hint: 'Say "我起床 (wǒ qǐchuáng)" — I get up',
    checkComplete: (state: GameState) => state.playerTags.includes('standing'),
    nextStepId: 'turn_off_alarm',
  },
  {
    id: 'turn_off_alarm',
    title: 'Turn off the alarm',
    description: 'The alarm clock is ringing! Turn it off.',
    hint: 'Say "关闹钟 (guān nàozhōng)" — turn off the alarm',
    checkComplete: (state: GameState) => {
      const alarm = state.objects.find(o => o.id === 'alarm_clock');
      return alarm ? !alarm.tags.includes('ringing') : false;
    },
    nextStepId: 'go_to_bathroom',
  },
  {
    id: 'go_to_bathroom',
    title: 'Go to the bathroom',
    description: 'Time to get ready for the day.',
    hint: 'Say "去浴室 (qù yùshì)" — go to the bathroom',
    checkComplete: (state: GameState) => state.currentLocation === 'bathroom',
    nextStepId: 'use_toilet',
  },
  {
    id: 'use_toilet',
    title: 'Use the toilet',
    description: 'You need to use the bathroom.',
    hint: 'Say "上厕所 (shàng cèsuǒ)" or "用马桶 (yòng mǎtǒng)"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('use_toilet'),
    nextStepId: 'take_shower',
  },
  {
    id: 'take_shower',
    title: 'Take a shower',
    description: 'Freshen up with a nice shower.',
    hint: 'Say "我洗澡 (wǒ xǐzǎo)" — I take a shower',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('take_shower'),
    nextStepId: 'go_to_living_room',
  },
  {
    id: 'go_to_living_room',
    title: 'Go to the living room',
    description: 'Head to the living room to see your roommate.',
    hint: 'Say "去客厅 (qù kètīng)" — go to the living room',
    checkComplete: (state: GameState) => state.currentLocation === 'living_room',
    nextStepId: 'talk_to_xiao_ming',
  },
  {
    id: 'talk_to_xiao_ming',
    title: 'Talk to Xiao Ming',
    description: 'Your roommate Xiao Ming is on the couch. Say hi and chat with him.',
    hint: 'Say "你好小明 (nǐhǎo Xiǎo Míng)" or "早上好 (zǎoshàng hǎo)"',
    checkComplete: (state: GameState) =>
      state.completedSteps.includes('talk_to_xiao_ming'),
    nextStepId: 'go_to_kitchen',
  },
  {
    id: 'go_to_kitchen',
    title: 'Go to the kitchen',
    description: 'Xiao Ming asked for coffee. Head to the kitchen to grab one.',
    hint: 'Say "去厨房 (qù chúfáng)" — go to the kitchen',
    checkComplete: (state: GameState) => state.currentLocation === 'kitchen',
    nextStepId: 'grab_coffee',
  },
  {
    id: 'grab_coffee',
    title: 'Grab a coffee',
    description: 'Pick up the coffee from the counter.',
    hint: 'Say "拿咖啡 (ná kāfēi)" — take the coffee',
    checkComplete: (state: GameState) => {
      const coffee = state.objects.find(o => o.id === 'coffee');
      return coffee?.location === 'inventory';
    },
    nextStepId: 'give_xiao_ming_coffee',
  },
  {
    id: 'give_xiao_ming_coffee',
    title: 'Bring Xiao Ming his coffee',
    description: 'Bring the coffee to Xiao Ming in the living room.',
    hint: 'Go to the living room and say "给小明咖啡 (gěi Xiǎo Míng kāfēi)"',
    checkComplete: (state: GameState) =>
      state.completedQuests.includes('xiao_ming_coffee'),
  },
];

// ============================================================================
// QUESTS
// ============================================================================

const quests: Quest[] = [
  {
    id: 'xiao_ming_coffee',
    title: { target: '小明的咖啡 (Xiǎo Míng de kāfēi)', native: "Xiao Ming's Coffee" },
    description: 'Bring Xiao Ming a coffee so he can wake up.',
    completionHint: 'Player explicitly says they are giving coffee to Xiao Ming (e.g., "给小明咖啡"). Just being near Xiao Ming with coffee is NOT enough — the player must say it.',
    hint: 'Grab the coffee from the kitchen and give it to Xiao Ming.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedSteps.includes('talk_to_xiao_ming'),
    reward: { points: 100 },
  },
  {
    id: 'xiao_ming_breakfast',
    title: { target: '小明的早饭 (Xiǎo Míng de zǎofàn)', native: "Xiao Ming's Breakfast" },
    description: 'Xiao Ming is hungry. Make him some breakfast — anything will do.',
    completionHint: 'Player explicitly says they are giving food to Xiao Ming. Just having food near him is NOT enough — the player must say it.',
    hint: 'Open the fridge, cook something, and bring it to Xiao Ming.',
    source: 'npc',
    sourceId: 'roommate',
    module: 'home',
    triggerCondition: (state: GameState) =>
      state.completedQuests.includes('xiao_ming_coffee'),
    reward: {
      points: 150,
      badge: { id: 'xin_shou_chu_shi', name: '新手厨师 (Beginner Chef)' },
    },
    prereqs: ['xiao_ming_coffee'],
  },
];

// ============================================================================
// VOCABULARY
// ============================================================================

const vocabulary: VocabWord[] = [
  // Rooms
  { target: '卧室', native: 'bedroom', category: 'noun', pinyin: 'wòshì', tones: [4, 4] },
  { target: '浴室', native: 'bathroom', category: 'noun', pinyin: 'yùshì', tones: [4, 4] },
  { target: '厨房', native: 'kitchen', category: 'noun', pinyin: 'chúfáng', tones: [2, 2] },
  { target: '客厅', native: 'living room', category: 'noun', pinyin: 'kètīng', tones: [4, 1] },

  // Bedroom objects
  { target: '床', native: 'bed', category: 'noun', pinyin: 'chuáng', tones: [2] },
  { target: '窗户', native: 'window', category: 'noun', pinyin: 'chuānghu', tones: [1, 0] },
  { target: '台灯', native: 'lamp', category: 'noun', pinyin: 'táidēng', tones: [2, 1] },
  { target: '衣柜', native: 'closet', category: 'noun', pinyin: 'yīguì', tones: [1, 4] },
  { target: '闹钟', native: 'alarm clock', category: 'noun', pinyin: 'nàozhōng', tones: [4, 1] },

  // Bathroom objects
  { target: '洗手池', native: 'sink', category: 'noun', pinyin: 'xǐshǒuchí', tones: [3, 3, 2] },
  { target: '镜子', native: 'mirror', category: 'noun', pinyin: 'jìngzi', tones: [4, 0] },
  { target: '淋浴', native: 'shower', category: 'noun', pinyin: 'línyù', tones: [2, 4] },
  { target: '牙刷', native: 'toothbrush', category: 'noun', pinyin: 'yáshuā', tones: [2, 1] },
  { target: '毛巾', native: 'towel', category: 'noun', pinyin: 'máojīn', tones: [2, 1] },
  { target: '肥皂', native: 'soap', category: 'noun', pinyin: 'féizào', tones: [2, 4] },
  { target: '马桶', native: 'toilet', category: 'noun', pinyin: 'mǎtǒng', tones: [3, 3] },

  // Kitchen objects
  { target: '冰箱', native: 'refrigerator', category: 'noun', pinyin: 'bīngxiāng', tones: [1, 1] },
  { target: '炉子', native: 'stove', category: 'noun', pinyin: 'lúzi', tones: [2, 0] },
  { target: '桌子', native: 'table', category: 'noun', pinyin: 'zhuōzi', tones: [1, 0] },
  { target: '椅子', native: 'chair', category: 'noun', pinyin: 'yǐzi', tones: [3, 0] },
  { target: '杯子', native: 'cup', category: 'noun', pinyin: 'bēizi', tones: [1, 0] },
  { target: '盘子', native: 'plate', category: 'noun', pinyin: 'pánzi', tones: [2, 0] },
  { target: '锅', native: 'pan', category: 'noun', pinyin: 'guō', tones: [1] },
  { target: '咖啡机', native: 'coffee maker', category: 'noun', pinyin: 'kāfēijī', tones: [1, 1, 1] },
  { target: '水槽', native: 'kitchen sink', category: 'noun', pinyin: 'shuǐcáo', tones: [3, 2] },
  { target: '宠物食品', native: 'pet food', category: 'noun', pinyin: 'chǒngwù shípǐn', tones: [3, 4, 2, 3] },

  // Food
  { target: '牛奶', native: 'milk', category: 'noun', pinyin: 'niúnǎi', tones: [2, 3] },
  { target: '鸡蛋', native: 'eggs', category: 'noun', pinyin: 'jīdàn', tones: [1, 4] },
  { target: '面包', native: 'bread', category: 'noun', pinyin: 'miànbāo', tones: [4, 1] },
  { target: '黄油', native: 'butter', category: 'noun', pinyin: 'huángyóu', tones: [2, 2] },
  { target: '咖啡', native: 'coffee', category: 'noun', pinyin: 'kāfēi', tones: [1, 1] },
  { target: '水', native: 'water', category: 'noun', pinyin: 'shuǐ', tones: [3] },
  { target: '果汁', native: 'juice', category: 'noun', pinyin: 'guǒzhī', tones: [3, 1] },

  // Verbs
  { target: '起床', native: 'get up', category: 'verb', pinyin: 'qǐchuáng', tones: [3, 2] },
  { target: '刷牙', native: 'brush teeth', category: 'verb', pinyin: 'shuāyá', tones: [1, 2] },
  { target: '洗澡', native: 'take a shower', category: 'verb', pinyin: 'xǐzǎo', tones: [3, 3] },
  { target: '吃', native: 'eat', category: 'verb', pinyin: 'chī', tones: [1] },
  { target: '喝', native: 'drink', category: 'verb', pinyin: 'hē', tones: [1] },
  { target: '打开', native: 'open', category: 'verb', pinyin: 'dǎkāi', tones: [3, 1] },
  { target: '关', native: 'close/turn off', category: 'verb', pinyin: 'guān', tones: [1] },
  { target: '开', native: 'open/turn on', category: 'verb', pinyin: 'kāi', tones: [1] },
  { target: '去', native: 'go', category: 'verb', pinyin: 'qù', tones: [4] },
  { target: '拿', native: 'take/pick up', category: 'verb', pinyin: 'ná', tones: [2] },
  { target: '做饭', native: 'cook', category: 'verb', pinyin: 'zuòfàn', tones: [4, 4] },
  { target: '洗', native: 'wash', category: 'verb', pinyin: 'xǐ', tones: [3] },
  { target: '放', native: 'put/place', category: 'verb', pinyin: 'fàng', tones: [4] },
  { target: '用', native: 'use', category: 'verb', pinyin: 'yòng', tones: [4] },

  // Living room
  { target: '沙发', native: 'couch', category: 'noun', pinyin: 'shāfā', tones: [1, 1] },
  { target: '电视', native: 'TV', category: 'noun', pinyin: 'diànshì', tones: [4, 4] },
  { target: '茶几', native: 'coffee table', category: 'noun', pinyin: 'chájī', tones: [2, 1] },
  { target: '书架', native: 'bookshelf', category: 'noun', pinyin: 'shūjià', tones: [1, 4] },
  { target: '遥控器', native: 'remote control', category: 'noun', pinyin: 'yáokòngqì', tones: [2, 4, 4] },

  // Street
  { target: '长椅', native: 'bench', category: 'noun', pinyin: 'chángyǐ', tones: [2, 3] },

  // Pets
  { target: '猫', native: 'cat', category: 'noun', pinyin: 'māo', tones: [1] },
  { target: '狗', native: 'dog', category: 'noun', pinyin: 'gǒu', tones: [3] },
  { target: '宠物', native: 'pet', category: 'noun', pinyin: 'chǒngwù', tones: [3, 4] },

  // Conversation verbs
  { target: '说话', native: 'talk/speak', category: 'verb', pinyin: 'shuōhuà', tones: [1, 4] },
  { target: '问', native: 'ask', category: 'verb', pinyin: 'wèn', tones: [4] },
  { target: '给', native: 'give', category: 'verb', pinyin: 'gěi', tones: [3] },
  { target: '摸', native: 'pet/touch', category: 'verb', pinyin: 'mō', tones: [1] },
  { target: '玩', native: 'play', category: 'verb', pinyin: 'wán', tones: [2] },
  { target: '看', native: 'look at', category: 'verb', pinyin: 'kàn', tones: [4] },
  { target: '坐', native: 'sit', category: 'verb', pinyin: 'zuò', tones: [4] },

  // Greetings
  { target: '你好', native: 'hello', category: 'other', pinyin: 'nǐhǎo', tones: [3, 3] },
  { target: '早上好', native: 'good morning', category: 'other', pinyin: 'zǎoshàng hǎo', tones: [3, 4, 3] },
  { target: '你要什么', native: 'what do you want?', category: 'other', pinyin: 'nǐ yào shénme', tones: [3, 4, 2, 0] },

  // Common words
  { target: '我', native: 'I/me', category: 'other', pinyin: 'wǒ', tones: [3] },
  { target: '你', native: 'you', category: 'other', pinyin: 'nǐ', tones: [3] },
  { target: '的', native: 'of/possessive', category: 'other', pinyin: 'de', tones: [0] },
  { target: '在', native: 'at/in', category: 'other', pinyin: 'zài', tones: [4] },
  { target: '和', native: 'and', category: 'other', pinyin: 'hé', tones: [2] },
  { target: '想', native: 'want to', category: 'other', pinyin: 'xiǎng', tones: [3] },
  { target: '要', native: 'want/need', category: 'other', pinyin: 'yào', tones: [4] },
];

// ============================================================================
// MODULE EXPORT
// ============================================================================

export const homeModule: ModuleDefinition = {
  name: 'home',
  displayName: 'Home',
  locations,
  objects,
  npcs,
  tutorial,
  quests,
  vocabulary,
  startLocationId: 'bedroom',
  firstStepId: 'wake_up',
  locationIds: Object.keys(locations).filter(id => id !== 'module_exit'),
  unlockLevel: 1,

  guidance: `HOME ENVIRONMENT:
A cozy apartment shared with roommate Xiao Ming (小明) and two pets (Xiaohua the cat 小花, Wangcai the dog 旺财).
The player is learning daily routine vocabulary in Mandarin.

OBJECTS:
- alarm_clock: Digital alarm in bedroom, starts ringing. Turn off = remove "ringing" and "on" tags.
- bed: Player starts here in_bed. Getting up = playerTag add "standing", remove "in_bed".
- window, lamp, closet: Can be opened/closed or turned on/off via tag changes.
- refrigerator: Container in kitchen. Must have "open" tag (remove "closed") to access items inside.
  Items inside have location="refrigerator". When fridge is open, they're accessible.
- eggs: In fridge. Can be cooked (add "cooked" tag), taken to inventory, eaten, or given to Xiao Ming.
- milk, butter, juice: In fridge. Takeable, some consumable.
- bread, coffee, water: On counter in kitchen. Consumable.
- stove: Must have "on" tag to cook. Turn on = tag add "on", remove "off".
- coffee_maker: Turn on to make coffee available.
- kitchen_sink: Kitchen sink. Can be used to wash dishes or hands.
- toilet: Using it relieves the player. Emit status mutation: { "type": "status", "remove": ["needs_bathroom", "urgent_bathroom", "desperate_bathroom"] }
- shower: Using it cleans the player. Emit status mutation: { "type": "status", "remove": ["needs_shower", "dirty", "very_dirty"] }
- toothbrush, sink: Bathroom fixtures. Using them improves hygiene slightly.
- tv: Living room. Can be turned on/off.
- pet_food: In kitchen. Takeable, used to feed pets.

COOKING FLOW:
When the player cooks something, add "cooked" tag to the food item. The stove should get "on" tag.
If the player wants to take cooked food elsewhere, they move it to "inventory" after cooking.
Consuming food = "remove" mutation + status mutation: { "type": "status", "remove": ["hungry", "very_hungry", "starving"] }. Coffee also removes tiredness: { "type": "status", "remove": ["tired", "very_tired", "exhausted"] }

NPCs:
- Xiao Ming 小明 (roommate): In living_room. Very sleepy, barely awake. Simple Mandarin.
  When the player first talks to him, he asks for coffee ("我需要咖啡..." / "帮我拿杯咖啡好吗？").
  Giving coffee to Xiao Ming = move coffee to "removed" (he drinks it). He wakes up and thanks them.
  After coffee, if the player talks to him again, he mentions being hungry.
  Giving food to Xiao Ming = move food to "removed" (he eats it). He thanks them warmly.
- Xiaohua 小花 (cat, isPet): In kitchen. Independent, aloof. Purrs when petted, ignores commands.
  Responds in English (no Mandarin dialogue). Use npcResponse with just english field.
- Wangcai 旺财 (dog, isPet): In kitchen. Excited, eager. Wags tail, barks happily.
  Responds in English. Loves pet_food. Use npcResponse with just english field.

STEP COMPLETION (lax — complete as soon as the intent is clear):
- wake_up: Player has "standing" in playerTags
- turn_off_alarm: alarm_clock no longer has "ringing" tag
- go_to_bathroom: Player is in bathroom
- use_toilet: Player uses the toilet
- take_shower: Player takes a shower
- go_to_living_room: Player is in living_room
- talk_to_xiao_ming: Player talks to Xiao Ming. Xiao Ming should ask for coffee (he's very sleepy).
- go_to_kitchen: Player is in kitchen
- grab_coffee: Player takes coffee to inventory
- give_xiao_ming_coffee: Completed when xiao_ming_coffee quest completes (player must explicitly give coffee)`,
};
