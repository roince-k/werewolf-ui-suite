# 荒诞推理 Charade — AI 社交博弈平台

一个可扩展的在线社交博弈平台，从狼人杀开始，未来将支持更多推理与阵营游戏。

## 技术栈

| 层       | 技术                                       |
| -------- | ------------------------------------------ |
| 前端框架 | React 18 + TypeScript + Vite               |
| 样式     | Tailwind CSS + shadcn/ui                   |
| 状态管理 | Zustand                                    |
| 路由     | React Router v6                            |
| 动画     | Framer Motion                              |
| 后端     | 待接入（当前为纯前端 Mock）                |

## 项目结构

```
src/
├── assets/                # 静态资源（背景图等）
├── components/
│   ├── game/              # 通用游戏组件
│   │   ├── ApiSettingsModal.tsx   # API 设置弹窗（LLM 配置）
│   │   ├── CreateRoomModal.tsx    # 创建房间弹窗
│   │   ├── GameBulletin.tsx       # 游戏公告/日志面板
│   │   ├── GameEndOverlay.tsx     # 游戏结束结算覆盖层
│   │   ├── InviteModal.tsx        # 邀请弹窗
│   │   ├── NightActionPanel.tsx   # 夜晚操作面板
│   │   ├── NoteDrawer.tsx         # 笔记抽屉
│   │   ├── PhaseBanner.tsx        # 阶段横幅
│   │   └── PlayerSeat.tsx         # 玩家座位组件
│   ├── games/
│   │   ├── WerewolfGame.tsx       # 狼人杀游戏主入口（Tab 切换）
│   │   ├── UndercoverGame.tsx     # 谁是卧底（占位）
│   │   └── werewolf/
│   │       ├── WerewolfAgents.tsx  # AI Agent 模板管理
│   │       ├── WerewolfGuide.tsx   # 游戏攻略/规则
│   │       └── WerewolfLobby.tsx   # 狼人杀大厅（房间列表）
│   ├── layout/
│   │   └── GameLayout.tsx         # 全局侧边栏布局
│   └── ui/                        # shadcn/ui 基础组件
├── hooks/                 # 自定义 Hooks
├── pages/
│   ├── Landing.tsx        # 首屏 Landing Page
│   ├── Auth.tsx           # 登录/注册页
│   ├── GameHub.tsx        # 游戏选择中心
│   ├── Lobby.tsx          # 大厅页（旧，保留兼容）
│   ├── Room.tsx           # 游戏房间页（核心对局界面）
│   ├── Settings.tsx       # 设置页
│   ├── Templates.tsx      # 攻略模板页
│   └── AgentTemplates.tsx # Agent 模板页
├── store/
│   └── gameStore.ts       # Zustand 全局状态（含类型定义）
└── lib/
    └── utils.ts           # 工具函数
```

## Mock 数据清单

以下为当前前端使用的 Mock 数据，均标注了 `// TODO: MOCK DATA`，需在后端对接时逐一替换：

| 文件 | Mock 数据 | 说明 | 对接方式 |
| --- | --- | --- | --- |
| `store/gameStore.ts` | `MOCK_ROOMS` | 房间列表 | `GET /api/rooms` |
| `store/gameStore.ts` | `lobbyUsers` | 大厅在线用户 | WebSocket 推送在线用户列表 |
| `store/gameStore.ts` | `PRESET_AGENTS` | AI Agent 预置模板 | `GET /api/agent-templates` 或本地保留 |
| `store/gameStore.ts` | `login()` | 登录（本地模拟 id='me'） | `POST /api/auth/login` 返回 JWT |
| `pages/Room.tsx` | `DEMO_LOGS` | 游戏日志 | WebSocket 实时推送游戏事件 |
| `components/game/GameEndOverlay.tsx` | `mockReveal` | 结算身份揭示 | 游戏结束时后端返回所有玩家身份 |

## 核心数据模型

### Player
```ts
interface Player {
  id: string;
  number: number;         // 座位号
  name: string;
  isAI: boolean;
  role?: Role;            // 'werewolf' | 'seer' | 'witch' | 'hunter' | 'villager'
  status: PlayerStatus;   // 'alive' | 'dead'
  isReady: boolean;
  isOwner: boolean;
  emoji: string;
  personality?: string;   // AI Agent 性格标签
}
```

### Room
```ts
interface Room {
  id: string;
  name: string;
  mode: string;           // 如 '9人标准局'
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'ended';
  ownerId: string;
}
```

### GameLog
```ts
interface GameLog {
  id: string;
  type: 'phase' | 'speech' | 'system' | 'death' | 'execution' | 'vote_result' | 'game_end';
  content: string;
  playerNumber?: number;
  playerName?: string;
  timestamp: number;
}
```

### AgentTemplate
```ts
interface AgentTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gameStyle: string;
  personality: string;
  reasoning: string;
  languageStyle: string;
  prompt?: string;        // 完整 system prompt
  isCustom?: boolean;     // 是否为用户自定义
}
```

## 后端对接接口建议

### REST API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/login` | 登录，返回 JWT + 用户信息 |
| `POST` | `/api/auth/register` | 注册 |
| `GET` | `/api/rooms` | 获取房间列表（支持 `?status=waiting` 筛选） |
| `POST` | `/api/rooms` | 创建房间 |
| `POST` | `/api/rooms/:id/join` | 加入房间 |
| `POST` | `/api/rooms/:id/leave` | 离开房间 |
| `POST` | `/api/rooms/:id/ready` | 准备/取消准备 |
| `POST` | `/api/rooms/:id/start` | 房主开始游戏 |
| `GET` | `/api/agent-templates` | 获取 Agent 模板列表 |
| `POST` | `/api/agent-templates` | 创建自定义 Agent 模板 |
| `DELETE` | `/api/agent-templates/:id` | 删除自定义 Agent 模板 |

### WebSocket 事件

| 事件名 | 方向 | 说明 |
| --- | --- | --- |
| `lobby:users` | Server→Client | 在线用户列表更新 |
| `room:update` | Server→Client | 房间状态变更（玩家加入/离开/准备） |
| `game:phase` | Server→Client | 游戏阶段切换（night/day/voting） |
| `game:log` | Server→Client | 游戏日志推送（发言/死亡/系统消息） |
| `game:role` | Server→Client | 分配角色通知（仅发给对应玩家） |
| `game:end` | Server→Client | 游戏结束，含胜方 + 全员身份揭示 |
| `game:vote` | Client→Server | 玩家投票 |
| `game:speech` | Client→Server | 玩家发言 |
| `night:action` | Client→Server | 夜晚操作（查验/救人/毒人/击杀） |

### AI Agent 调用

前端通过 `ApiSettingsModal` 配置 LLM API（OpenAI / DeepSeek / 自定义），支持：
- 自定义 Base URL
- 自定义模型名称
- 连接测试

建议后端统一代理 AI 调用，避免前端暴露 API Key：
```
POST /api/ai/chat
Body: { agentId, gameContext, messages }
```

## 本地开发

```bash
npm install
npm run dev
```

默认端口 `8080`，访问 `http://localhost:8080`。

## 游戏流程

```
Landing → Auth(登录) → GameHub(选择游戏) → Lobby(大厅/房间列表)
  → Room(房间)
    → waiting: 等待玩家 + 准备
    → night: 夜晚阶段（狼人击杀、预言家查验、女巫用药）
    → day: 白天讨论发言
    → voting: 投票放逐
    → ended: 结算（GameEndOverlay 身份揭示）
```
