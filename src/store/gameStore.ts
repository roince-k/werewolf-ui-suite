import { create } from 'zustand';

export type Role = 'werewolf' | 'seer' | 'witch' | 'hunter' | 'villager';
export type GamePhase = 'waiting' | 'night' | 'day' | 'voting' | 'ended';
export type PlayerStatus = 'alive' | 'dead';

export interface Player {
  id: string;
  number: number;
  name: string;
  isAI: boolean;
  role?: Role;
  status: PlayerStatus;
  isReady: boolean;
  isOwner: boolean;
  emoji: string;
  personality?: string;
}

export interface Room {
  id: string;
  name: string;
  mode: string;
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'ended';
  ownerId: string;
}

export interface GameLog {
  id: string;
  type: 'phase' | 'speech' | 'system' | 'death' | 'execution' | 'vote_result' | 'game_end';
  content: string;
  playerNumber?: number;
  playerName?: string;
  timestamp: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gameStyle: string;
  personality: string;
  reasoning: string;
  languageStyle: string;
  prompt?: string;
  isCustom?: boolean;
}

// TODO: MOCK DATA — 预置 Agent 模板，未来可从后端加载或允许用户云端存储
const PRESET_AGENTS: AgentTemplate[] = [
  {
    id: 'aggressive',
    name: '暴风猎手',
    emoji: '🔥',
    description: '激进好战，善于通过强势发言逼迫对手露出破绽。',
    gameStyle: '极度激进，主动出击，喜欢第一个发言并引导节奏',
    personality: '自信、强势、有压迫感，不轻易退让',
    reasoning: '通过对比发言前后矛盾进行快速锁定，注重行为分析',
    languageStyle: '短句为主，语气坚定，常用反问和质疑',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"暴风猎手"。\n\n【游戏风格】极度激进，主动出击，喜欢第一个发言并引导节奏\n【角色性格】自信、强势、有压迫感，不轻易退让\n【推理方式】通过对比发言前后矛盾进行快速锁定，注重行为分析\n【语言风格】短句为主，语气坚定，常用反问和质疑\n\n请始终按照以上风格进行发言、推理和投票。',
  },
  {
    id: 'conservative',
    name: '静水深流',
    emoji: '🌊',
    description: '沉稳保守，善于隐藏自己的意图，后期发力。',
    gameStyle: '保守稳健，前期观察为主，后期精准出击',
    personality: '冷静、内敛、深思熟虑，不轻易表态',
    reasoning: '长线逻辑推理，善于梳理全局信息链条',
    languageStyle: '措辞谨慎，善用"我觉得"、"或许"等缓和用语，逻辑严密',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"静水深流"。\n\n【游戏风格】保守稳健，前期观察为主，后期精准出击\n【角色性格】冷静、内敛、深思熟虑，不轻易表态\n【推理方式】长线逻辑推理，善于梳理全局信息链条\n【语言风格】措辞谨慎，善用"我觉得"、"或许"等缓和用语，逻辑严密\n\n请始终按照以上风格进行发言、推理和投票。',
  },
  {
    id: 'trickster',
    name: '迷雾幻师',
    emoji: '🎭',
    description: '善于伪装和混淆视听，让人难以判断真实立场。',
    gameStyle: '诡诈多变，善于制造信息迷雾，引导错误投票',
    personality: '神秘、狡猾、善于表演，真假难辨',
    reasoning: '利用心理博弈和信息不对称，善于制造两难局面',
    languageStyle: '话术灵活，善用模棱两可的表述，偶尔抛出真话增加可信度',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"迷雾幻师"。\n\n【游戏风格】诡诈多变，善于制造信息迷雾，引导错误投票\n【角色性格】神秘、狡猾、善于表演，真假难辨\n【推理方式】利用心理博弈和信息不对称，善于制造两难局面\n【语言风格】话术灵活，善用模棱两可的表述，偶尔抛出真话增加可信度\n\n请始终按照以上风格进行发言、推理和投票。',
  },
  {
    id: 'analyst',
    name: '逻辑之眼',
    emoji: '🧠',
    description: '纯逻辑流派，依靠数据和概率进行精确推理。',
    gameStyle: '纯逻辑分析型，不受情绪影响，依据概率和信息做决策',
    personality: '理性、客观、冷淡，只关注事实和逻辑',
    reasoning: '概率分析、排除法、信息交叉验证，系统性推理',
    languageStyle: '条理分明，喜欢用"第一、第二"列举论点，数据化表述',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"逻辑之眼"。\n\n【游戏风格】纯逻辑分析型，不受情绪影响，依据概率和信息做决策\n【角色性格】理性、客观、冷淡，只关注事实和逻辑\n【推理方式】概率分析、排除法、信息交叉验证，系统性推理\n【语言风格】条理分明，喜欢用"第一、第二"列举论点，数据化表述\n\n请始终按照以上风格进行发言、推理和投票。',
  },
  {
    id: 'emotional',
    name: '月下诗人',
    emoji: '🌙',
    description: '感性直觉型，善于用情感共鸣来判断真伪。',
    gameStyle: '感性直觉型，相信第一印象，善于察言观色',
    personality: '感性、温暖、富有同理心，容易被真诚打动',
    reasoning: '直觉判断为主，关注微表情和语气变化，擅长读心',
    languageStyle: '文艺优雅，善用比喻和修辞，语言富有感染力',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"月下诗人"。\n\n【游戏风格】感性直觉型，相信第一印象，善于察言观色\n【角色性格】感性、温暖、富有同理心，容易被真诚打动\n【推理方式】直觉判断为主，关注微表情和语气变化，擅长读心\n【语言风格】文艺优雅，善用比喻和修辞，语言富有感染力\n\n请始终按照以上风格进行发言、推理和投票。',
  },
  {
    id: 'chaos',
    name: '混沌骰子',
    emoji: '🎲',
    description: '不按常理出牌，用混乱策略打乱所有人的节奏。',
    gameStyle: '混乱不可预测，故意制造混乱局面，享受混沌',
    personality: '疯狂、幽默、不可预测，喜欢打破常规',
    reasoning: '反常规思维，故意提出令人意外的观点来测试反应',
    languageStyle: '幽默搞怪，时而正经时而离谱，常常用梗和段子',
    prompt: '你是一个狼人杀游戏中的AI玩家，名字叫"混沌骰子"。\n\n【游戏风格】混乱不可预测，故意制造混乱局面，享受混沌\n【角色性格】疯狂、幽默、不可预测，喜欢打破常规\n【推理方式】反常规思维，故意提出令人意外的观点来测试反应\n【语言风格】幽默搞怪，时而正经时而离谱，常常用梗和段子\n\n请始终按照以上风格进行发言、推理和投票。',
  },
];

export interface GameState {
  // Auth
  currentUser: { id: string; username: string } | null;
  isLoggedIn: boolean;

  // Lobby
  rooms: Room[];
  lobbyUsers: string[];
  roomFilter: 'all' | 'waiting' | 'playing' | 'mine';

  // Current room
  currentRoom: Room | null;
  myPlayerId: string | null;
  isReady: boolean;

  // Game
  gamePhase: GamePhase;
  currentDay: number;
  myRole: Role | null;
  gameLogs: GameLog[];
  votes: Record<string, number>;
  timer: number;
  showRoleReveal: boolean;
  gameResult: { winner: 'village' | 'werewolf'; mvp?: number } | null;

  // API settings
  apiProvider: string;
  apiKey: string;
  apiModel: string;

  // Notes
  notes: string;

  // Agent templates
  agentTemplates: AgentTemplate[];
  selectedAgentId: string | null;

  // Solo mode
  isSoloMode: boolean;

  // Actions
  login: (username: string) => void;
  logout: () => void;
  setRoomFilter: (filter: 'all' | 'waiting' | 'playing' | 'mine') => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  setGamePhase: (phase: GamePhase) => void;
  addGameLog: (log: Omit<GameLog, 'id' | 'timestamp'>) => void;
  setNotes: (notes: string) => void;
  setApiSettings: (provider: string, key: string, model: string) => void;
  setShowRoleReveal: (show: boolean) => void;
  setGameResult: (result: GameState['gameResult']) => void;
  castVote: (targetNumber: number) => void;
  addPlayerToRoom: (player: Player) => void;
  addAgentTemplate: (agent: Omit<AgentTemplate, 'id'>) => void;
  removeAgentTemplate: (id: string) => void;
  selectAgent: (id: string) => void;
  setSoloMode: (solo: boolean) => void;
}

// TODO: MOCK DATA — 替换为真实房间数据（从后端/数据库获取）
const MOCK_ROOMS: Room[] = [
  {
    id: '1', name: '新手房间', mode: '9人标准局', maxPlayers: 9,
    status: 'waiting', ownerId: 'u1',
    players: [
      { id: 'u1', number: 1, name: '月光猎手', isAI: false, status: 'alive', isReady: true, isOwner: true, emoji: '🐺' },
      { id: 'a1', number: 2, name: 'AI·暗影', isAI: true, status: 'alive', isReady: true, isOwner: false, emoji: '🤖', personality: '激进型' },
      { id: 'a2', number: 3, name: 'AI·迷雾', isAI: true, status: 'alive', isReady: true, isOwner: false, emoji: '🤖', personality: '保守型' },
    ],
  },
  {
    id: '2', name: '高手对决', mode: '12人标准局', maxPlayers: 12,
    status: 'playing', ownerId: 'u2',
    players: Array.from({ length: 10 }, (_, i) => ({
      id: `p${i}`, number: i + 1, name: `玩家${i + 1}`, isAI: i > 1, status: 'alive' as const,
      isReady: true, isOwner: i === 0, emoji: i > 1 ? '🤖' : '👤',
    })),
  },
  {
    id: '3', name: '策略研究室', mode: '9人标准局', maxPlayers: 9,
    status: 'waiting', ownerId: 'u3',
    players: Array.from({ length: 5 }, (_, i) => ({
      id: `q${i}`, number: i + 1, name: `策略家${i + 1}`, isAI: i > 0, status: 'alive' as const,
      isReady: i < 3, isOwner: i === 0, emoji: i > 0 ? '🤖' : '👤',
    })),
  },
  {
    id: '4', name: '休闲娱乐', mode: '9人标准局', maxPlayers: 9,
    status: 'waiting', ownerId: 'u4',
    players: [
      { id: 'u4', number: 1, name: '悠闲村民', isAI: false, status: 'alive', isReady: false, isOwner: true, emoji: '🌙' },
    ],
  },
];

export const useGameStore = create<GameState>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  rooms: MOCK_ROOMS,
  lobbyUsers: ['月光猎手', '暗夜行者', '银色子弹', '沉默观察', '迷雾森林'], // TODO: MOCK DATA — 替换为真实在线用户列表
  roomFilter: 'all',
  currentRoom: null,
  myPlayerId: null,
  isReady: false,
  gamePhase: 'waiting',
  currentDay: 1,
  myRole: null,
  gameLogs: [],
  votes: {},
  timer: 0,
  showRoleReveal: false,
  gameResult: null,
  apiProvider: 'OPENAI',
  apiKey: '',
  apiModel: 'gpt-4o-mini',
  notes: '',
  agentTemplates: PRESET_AGENTS,
  selectedAgentId: 'aggressive',
  isSoloMode: false,

  login: (username) => set({
    currentUser: { id: 'me', username },
    isLoggedIn: true,
  }),
  logout: () => set({
    currentUser: null,
    isLoggedIn: false,
    currentRoom: null,
  }),
  setRoomFilter: (filter) => set({ roomFilter: filter }),
  joinRoom: (roomId) => set((state) => {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return {};
    return { currentRoom: room, myPlayerId: state.currentUser?.id || null };
  }),
  leaveRoom: () => set({ currentRoom: null, myPlayerId: null, isReady: false, gamePhase: 'waiting', gameLogs: [], myRole: null }),
  setReady: (ready) => set({ isReady: ready }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  addGameLog: (log) => set((state) => ({
    gameLogs: [...state.gameLogs, { ...log, id: crypto.randomUUID(), timestamp: Date.now() }],
  })),
  setNotes: (notes) => set({ notes }),
  setApiSettings: (provider, key, model) => set({ apiProvider: provider, apiKey: key, apiModel: model }),
  setShowRoleReveal: (show) => set({ showRoleReveal: show }),
  setGameResult: (result) => set({ gameResult: result }),
  castVote: (targetNumber) => set((state) => ({
    votes: { ...state.votes, [state.currentUser?.id || 'me']: targetNumber },
  })),
  addPlayerToRoom: (player) => set((state) => {
    if (!state.currentRoom) return {};
    const exists = state.currentRoom.players.some(p => p.number === player.number);
    if (exists) return {};
    return {
      currentRoom: {
        ...state.currentRoom,
        players: [...state.currentRoom.players, player].sort((a, b) => a.number - b.number),
      },
    };
  }),
  addAgentTemplate: (agent) => set((state) => ({
    agentTemplates: [...state.agentTemplates, { ...agent, id: crypto.randomUUID() }],
  })),
  removeAgentTemplate: (id) => set((state) => ({
    agentTemplates: state.agentTemplates.filter(a => a.id !== id),
  })),
  selectAgent: (id) => set({ selectedAgentId: id }),
  setSoloMode: (solo) => set({ isSoloMode: solo }),
}));
