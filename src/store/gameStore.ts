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
}

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
  lobbyUsers: ['月光猎手', '暗夜行者', '银色子弹', '沉默观察', '迷雾森林'],
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
}));
