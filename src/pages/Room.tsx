import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, UserPlus, BookOpen, MoreHorizontal,
  StickyNote, Clock, Shield, Skull, Swords, Moon, Sun, Eye
} from 'lucide-react';
import { AutoGrowTextarea } from '@/components/ui/auto-grow-textarea';

import { useGameStore, type GamePhase, type GameLog, type Role, type AgentTemplate } from '@/store/gameStore';
import { ROLE_DATA, WOLF_ROLES } from '@/lib/roleData';
import GameEndOverlay from '@/components/game/GameEndOverlay';
import PlayerSeat from '@/components/game/PlayerSeat';
import GameBulletin from '@/components/game/GameBulletin';
import PhaseBanner from '@/components/game/PhaseBanner';
import type { NightAction } from '@/components/game/NightActionPanel';
import InviteModal from '@/components/game/InviteModal';
import WolfExplodeButton from '@/components/game/WolfExplodeButton';
import ActionDrawer from '@/components/game/ActionDrawer';
import { useGameEngine } from '@/hooks/useGameEngine';

// TODO: MOCK DATA — 替换为真实游戏日志（从游戏引擎/后端获取）
const DEMO_LOGS: Omit<GameLog, 'id' | 'timestamp'>[] = [
  { type: 'phase', content: '—— 第1夜 ——' },
  { type: 'system', content: '天黑请闭眼，狼人请睁眼...' },
  { type: 'system', content: '狼人请闭眼，预言家请睁眼...' },
  { type: 'phase', content: '—— 第1天 ——' },
  { type: 'death', content: '† 昨晚 5号玩家 被狼人杀害' },
  { type: 'system', content: '请从1号玩家开始依次发言' },
  { type: 'speech', content: '我觉得3号很可疑，昨天他的发言逻辑有问题', playerNumber: 1, playerName: '月光猎手' },
  { type: 'speech', content: '我同意1号的观点，3号确实值得怀疑', playerNumber: 2, playerName: 'AI·暗影' },
  { type: 'speech', content: '你们凭什么怀疑我？我是好人！', playerNumber: 3, playerName: 'AI·迷雾' },
  { type: 'phase', content: '—— 投票阶段 ——' },
  { type: 'vote_result', content: '投票结果：1号→3号，2号→3号，4号→3号，3号→1号' },
  { type: 'execution', content: '✗ 3号 AI·迷雾 出局，身份是 狼人' },
];

const Room = () => {
  const navigate = useNavigate();
  const {
    currentRoom, isReady, setReady, gamePhase, setGamePhase,
    gameLogs, addGameLog, myRole, showRoleReveal, setShowRoleReveal,
    gameResult, setGameResult, castVote, notes, setNotes, isSoloMode,
    addPlayerToRoom, removePlayerFromRoom, localGuesses, setLocalGuess,
    sheriffId, myPlayerId, isSpectator,
  } = useGameStore();
  const { startGame, clearTimers } = useGameEngine();
  const [message, setMessage] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSeatNumber, setInviteSeatNumber] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<number | null>(null);
  // Sheriff election local state (F5)
  const [sheriffPhase, setSheriffPhase] = useState<'nominate' | 'speech' | 'vote' | 'transfer' | null>(null);
  const [candidates, setCandidates] = useState<number[]>([]);
  const [withdrawnCandidates, setWithdrawnCandidates] = useState<number[]>([]);

  const players = currentRoom?.players || [];
  const totalSeats = currentRoom?.maxPlayers || 9;
  const is12Player = totalSeats === 12;

  const allSeats = Array.from({ length: totalSeats }, (_, i) => players[i] || null);

  // Split seats into two rows
  const midpoint = Math.ceil(totalSeats / 2);
  const topRow = allSeats.slice(0, midpoint);
  const bottomRow = allSeats.slice(midpoint);

  // Is the current phase a night phase?
  const isNightPhase = gamePhase === 'night' || gamePhase === 'night_werewolf' || gamePhase === 'night_seer' || gamePhase === 'night_witch' || gamePhase === 'night_guard';
  // Is the current phase a day/discussion phase?
  const isDayPhase = gamePhase === 'day' || gamePhase === 'day_discussion' || gamePhase === 'day_wolf_explode_available';
  // Can send messages?
  const canSendMessage = isDayPhase;
  // Show wolf explode button?
  const showExplodeButton = gamePhase === 'day_wolf_explode_available' || isDayPhase;

  const handleStartGame = () => {
    const filledSeats = players.length;
    if (filledSeats < totalSeats) {
      toast.error(`需要 ${totalSeats} 名玩家才能开始游戏（当前 ${filledSeats}/${totalSeats}）`);
      return;
    }
    startGame();
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    addGameLog({ type: 'speech', content: message, playerNumber: 1, playerName: '我' });
    setMessage('');
  };

  const handleVote = (targetNum: number) => {
    setSelectedTarget(targetNum);
    castVote(targetNum);
  };

  const handleNightAction = (action: NightAction) => {
    const target = players.find(p => p.id === action.targetId);
    const targetLabel = target ? `${target.number}号 ${target.name}` : '';
    switch (action.type) {
      case 'werewolf_kill':
        addGameLog({ type: 'system', content: `🐺 你选择了袭击 ${targetLabel}` });
        break;
      case 'seer_check':
        addGameLog({ type: 'system', content: `🔮 你查验了 ${targetLabel} 的身份` });
        break;
      case 'witch_save':
        addGameLog({ type: 'system', content: '💊 你使用了解药' });
        break;
      case 'witch_poison':
        addGameLog({ type: 'system', content: `☠️ 你对 ${targetLabel} 使用了毒药` });
        break;
      case 'guard_protect':
        addGameLog({ type: 'system', content: `🛡️ 你守护了 ${targetLabel}` });
        break;
    }
  };

  const handleSkipNight = () => {
    addGameLog({ type: 'system', content: '你选择了跳过本轮行动' });
  };

  const handleWolfExplode = (targetNumber?: number) => {
    if (targetNumber) {
      const target = players.find(p => p.number === targetNumber);
      addGameLog({ type: 'explode', content: `💥 你自爆了！并带走了 ${target?.number}号 ${target?.name}` });
    } else {
      addGameLog({ type: 'explode', content: '💥 你自爆了！' });
    }
    // TODO: Send WOLF_EXPLODE socket event
  };

  // Sheriff election handlers (F5)
  const handleSheriffNominate = () => {
    // TODO: Send SHERIFF_NOMINATE socket event
    const myNumber = players.find(p => p.id === myPlayerId)?.number;
    if (myNumber) setCandidates(prev => [...prev, myNumber]);
    addGameLog({ type: 'sheriff', content: `🎖️ 你申请了上警` });
  };

  const handleSheriffWithdraw = () => {
    const myNumber = players.find(p => p.id === myPlayerId)?.number;
    if (myNumber) setWithdrawnCandidates(prev => [...prev, myNumber]);
    addGameLog({ type: 'sheriff', content: `🎖️ 你退水了` });
  };

  const handleSheriffVote = (targetNumber: number) => {
    addGameLog({ type: 'sheriff', content: `🎖️ 你投票给了 ${targetNumber}号` });
  };

  const handleSheriffTransfer = (targetNumber: number) => {
    addGameLog({ type: 'sheriff', content: `🎖️ 你将警徽移交给了 ${targetNumber}号` });
  };

  const handleSheriffDestroy = () => {
    addGameLog({ type: 'sheriff', content: `🎖️ 你撕毁了警徽` });
  };

  const handleInviteAgent = (agent: AgentTemplate) => {
    if (inviteSeatNumber === null) return;
    const seatNum = inviteSeatNumber === -1 ? (allSeats.findIndex(s => !s) + 1 || 1) : inviteSeatNumber;
    const newPlayer: import('@/store/gameStore').Player = {
      id: crypto.randomUUID(),
      number: seatNum,
      name: agent.name,
      isAI: true,
      status: 'alive',
      isReady: true,
      isOwner: false,
      emoji: agent.emoji,
      personality: agent.personality,
    };
    addPlayerToRoom(newPlayer);
    addGameLog({ type: 'system', content: `🤖 ${agent.name} 加入了 ${seatNum}号位` });
    setInviteSeatNumber(null);
    toast.success(`${agent.name} 已加入 ${seatNum}号位`);
  };

  const handleFillAllAI = () => {
    const { agentTemplates } = useGameStore.getState();
    const emptySeats = allSeats
      .map((s, i) => (s ? null : i + 1))
      .filter((n): n is number => n !== null);
    if (emptySeats.length === 0) {
      toast.info('所有座位已满');
      return;
    }
    const shuffled = [...agentTemplates].sort(() => Math.random() - 0.5);
    emptySeats.forEach((seatNum, idx) => {
      const agent = shuffled[idx % shuffled.length];
      const newPlayer: import('@/store/gameStore').Player = {
        id: crypto.randomUUID(),
        number: seatNum,
        name: agent.name,
        isAI: true,
        status: 'alive',
        isReady: true,
        isOwner: false,
        emoji: agent.emoji,
        personality: agent.personality,
      };
      addPlayerToRoom(newPlayer);
    });
    addGameLog({ type: 'system', content: `🤖 已随机邀请 ${emptySeats.length} 个AI智能体` });
    toast.success(`已填满 ${emptySeats.length} 个空座位`);
  };

  const handleInviteLobbyUser = (username: string) => {
    if (inviteSeatNumber === null) return;
    addGameLog({ type: 'system', content: `📨 已向 ${username} 发送邀请` });
    setInviteSeatNumber(null);
    toast.success(`已邀请 ${username}`);
  };

  const handleKickPlayer = (playerId: string) => {
    const target = players.find(p => p.id === playerId);
    removePlayerFromRoom(playerId);
    addGameLog({ type: 'system', content: `🚫 ${target?.name || '玩家'} 已被移出房间` });
    toast.success(`已移出 ${target?.name || '玩家'}`);
  };

  const isRoomOwner = currentRoom?.ownerId === myPlayerId;

  const renderSeat = (player: typeof allSeats[number], i: number, isTopRow: boolean) => {
    if (player) {
      const isSelf = player.id === myPlayerId;
      return (
        <PlayerSeat
          key={player.id}
          player={player}
          index={i}
          gamePhase={gamePhase}
          isSelected={selectedTarget === player.number}
          isSelf={isSelf}
          selfRole={isSelf ? myRole : null}
          localGuess={localGuesses[player.id] || null}
          gameEnded={gamePhase === 'ended'}
          pickerDirection={isTopRow ? 'down' : 'up'}
          isOwner={isRoomOwner}
          onVote={() => handleVote(player.number)}
          onInspect={() => setInspectedPlayer(player.number)}
          onSetLocalGuess={(role) => setLocalGuess(player.id, role)}
          onKick={handleKickPlayer}
        />
      );
    }
    return (
      <EmptySeat
        key={`empty-${i}`}
        number={i + 1}
        index={i}
        onClick={() => setInviteSeatNumber(i + 1)}
      />
    );
  };

  // Role reveal info from centralized data
  const roleRevealInfo = myRole ? {
    ...ROLE_DATA[myRole],
    factionLabel: ROLE_DATA[myRole].factionLabel,
  } : null;

  // Find wolf teammates for wolf players
  const wolfTeammates = myRole && WOLF_ROLES.includes(myRole)
    ? players.filter(p => p.role && WOLF_ROLES.includes(p.role) && p.id !== myPlayerId)
    : [];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0">
        <button onClick={() => navigate('/lobby')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回大厅</span>
        </button>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm font-medium text-foreground">{currentRoom?.name || '房间'}</span>
        <span className="text-xs text-muted-foreground">· {currentRoom?.mode || '9人标准局'}</span>
        {isSoloMode && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
            单人模式 · 无限时
          </span>
        )}
        {sheriffId && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
            ⭐ 警长: {sheriffId}号
          </span>
        )}
        {isSpectator && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border font-medium flex items-center gap-1">
            <Eye className="w-3 h-3" /> 观战中
          </span>
        )}
        <div className="flex-1" />
        <button onClick={() => setInviteSeatNumber(-1)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> 邀请
        </button>
        <button onClick={() => setShowRules(!showRules)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <BookOpen className="w-3.5 h-3.5" /> 规则
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Two-row seat layout */}
        <div className="flex-1 flex flex-col items-center justify-between relative px-4 py-3">
          {/* Top row */}
          <div className="flex items-end justify-center gap-[1.5vw] flex-wrap">
            {topRow.map((player, i) => renderSeat(player, i, true))}
          </div>

          {/* Phase banner in the middle */}
          <PhaseBanner phase={gamePhase} playerCount={players.length} totalSeats={totalSeats} />

          {/* Bottom row */}
          <div className="flex items-start justify-center gap-[1.5vw] flex-wrap">
            {bottomRow.map((player, i) => renderSeat(player, midpoint + i, false))}
          </div>

          {/* Action Bar */}
          <div className="w-full max-w-[640px] mt-6">
            {gamePhase === 'waiting' ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setReady(!isReady)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isReady
                      ? 'bg-alive/10 text-alive border border-alive/30'
                      : 'btn-ghost-moon'
                  }`}
                >
                  {isReady ? '✓ 已准备' : '准备'}
                </button>
                <button onClick={handleStartGame} className="btn-ritual flex-1 py-2.5 text-sm">
                  开始游戏
                </button>
              </div>
            ) : gamePhase === 'last_words' ? (
              /* F3: Last words input for eliminated player */
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="发表你的遗言..."
                  className="input-ritual flex-1 text-sm py-2.5"
                />
                <button onClick={handleSendMessage} className="btn-ritual px-4 py-2.5">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : gamePhase !== 'ended' ? (
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isDayPhase ? '发表你的看法...' : '夜晚静默中...'}
                  disabled={!canSendMessage}
                  className="input-ritual flex-1 text-sm py-2.5"
                />
                {/* F4: Wolf explode button during day phase */}
                {showExplodeButton && (
                  <WolfExplodeButton
                    myRole={myRole}
                    players={players}
                    onExplode={handleWolfExplode}
                  />
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={!canSendMessage}
                  className="btn-ritual px-4 py-2.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Bulletin + Notes */}
        <aside className="w-[300px] border-l border-border flex flex-col shrink-0 bg-card/50">
          <GameBulletin logs={gameLogs} className="flex-[2] min-h-0" />
          <div className="flex-1 border-t border-border/40 flex flex-col bg-surface/30">
            <div className="px-4 py-2.5 flex items-center gap-2 border-b border-border/30">
              <StickyNote className="w-3.5 h-3.5 text-gold" />
              <span className="display-title text-xs text-gold tracking-wider">推理笔记</span>
            </div>
            <AutoGrowTextarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="记录你的推理和怀疑对象..."
              className="flex-1 input-ritual text-sm border-0 rounded-none bg-transparent focus:ring-0 px-4 py-3 min-h-[80px]"
            />
          </div>
        </aside>
      </div>

      {/* Role Reveal — immersive with abilities & teammates */}
      <AnimatePresence>
        {showRoleReveal && roleRevealInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-md"
            onClick={() => setShowRoleReveal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
              className={`surface-elevated rounded-2xl p-8 text-center max-w-sm border-2 ${roleRevealInfo.bg}`}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm text-muted-foreground mb-3">你的身份</p>
              <motion.span
                className="text-6xl block mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
              >
                {roleRevealInfo.emoji}
              </motion.span>
              <h2 className={`display-title text-3xl mb-2 ${roleRevealInfo.color}`}>{roleRevealInfo.label}</h2>
              <p className="text-sm text-accent mb-2">{roleRevealInfo.factionLabel}</p>
              <p className="text-sm text-muted-foreground mb-4">{roleRevealInfo.desc}</p>

              {/* Abilities */}
              {roleRevealInfo.abilities && roleRevealInfo.abilities.length > 0 && (
                <div className="text-left mb-4 px-2">
                  <p className="text-[10px] text-accent font-medium mb-1.5 uppercase tracking-wider">技能</p>
                  <ul className="space-y-1">
                    {roleRevealInfo.abilities.map((a, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wolf teammates */}
              {wolfTeammates.length > 0 && (
                <div className="mb-4 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-[10px] text-destructive font-medium mb-1">🐺 你的狼人队友</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {wolfTeammates.map(t => (
                      <span key={t.id} className="text-xs text-destructive/80">
                        {t.number}号 {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setShowRoleReveal(false)} className="btn-ritual text-sm w-full">
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Action Drawer */}
      <ActionDrawer
        gamePhase={gamePhase}
        myRole={myRole}
        players={players}
        onNightAction={handleNightAction}
        onSkipNight={handleSkipNight}
        sheriffPhase={sheriffPhase}
        candidates={candidates}
        withdrawnCandidates={withdrawnCandidates}
        isSelfCandidate={candidates.includes(players.find(p => p.id === myPlayerId)?.number ?? -1)}
        isSelfSheriff={sheriffPhase === 'transfer'}
        onSheriffNominate={handleSheriffNominate}
        onSheriffWithdraw={handleSheriffWithdraw}
        onSheriffVote={handleSheriffVote}
        onSheriffTransfer={handleSheriffTransfer}
        onSheriffDestroy={handleSheriffDestroy}
        onWolfExplode={handleWolfExplode}
      />

      {/* Game End */}
      {gameResult && <GameEndOverlay />}

      {/* Rules Dropdown */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowRules(false)}>
            <div className="absolute inset-0 bg-void/50" />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 right-20 glass-panel rounded-xl p-4 w-80 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="display-title text-lg text-foreground mb-3">游戏规则</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground/80 mb-1">角色配置</p>
                  {is12Player ? (
                    <p>• 3狼人 + 1白狼王 + 1预言家 + 1女巫 + 1猎人 + 1守卫 + 4平民</p>
                  ) : (
                    <p>• 4狼人 + 1预言家 + 1女巫 + 1猎人 + 5平民</p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground/80 mb-1">基本规则</p>
                  <p>• 狼人夜间刀人，预言家查验身份</p>
                  <p>• 女巫有解药和毒药各一瓶</p>
                  <p>• 猎人被淘汰时可开枪带走一人</p>
                  {is12Player && <p>• 守卫每晚可守护一名玩家</p>}
                  <p>• 白天讨论后公投放逐一名玩家</p>
                </div>
                <div>
                  <p className="font-medium text-foreground/80 mb-1">胜利条件</p>
                  <p>• 狼全灭→好人胜</p>
                  <p>• 神/民全灭（屠边）→狼人胜</p>
                  <p>• 存活狼人≥存活非狼→狼人胜</p>
                </div>
                <div>
                  <p className="font-medium text-foreground/80 mb-1">遗言规则</p>
                  <p>• 首夜死亡→有遗言</p>
                  <p>• 非首夜夜晚死亡→无遗言</p>
                  <p>• 白天出局→有遗言</p>
                  <p>• 被白狼王自爆带走→无遗言</p>
                </div>
                {is12Player && (
                  <>
                    <div>
                      <p className="font-medium text-foreground/80 mb-1">白狼王</p>
                      <p>• 白天可自爆并带走一名玩家</p>
                      <p>• 被毒杀或枪击时不可自爆</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground/80 mb-1">警长系统</p>
                      <p>• 仅首日白天触发竞选</p>
                      <p>• 警长投票权重1.5票</p>
                      <p>• 死亡时可移交或撕毁警徽</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground/80 mb-1">特殊规则</p>
                      <p>• 同守同救→奶穿（玩家死亡）</p>
                      <p>• 狼刀在先：同时满足时狼人胜</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteSeatNumber !== null && (
          <InviteModal
            seatNumber={inviteSeatNumber === -1 ? (allSeats.findIndex(s => !s) + 1 || 1) : inviteSeatNumber}
            onClose={() => setInviteSeatNumber(null)}
            onInviteAgent={handleInviteAgent}
            onInviteLobbyUser={handleInviteLobbyUser}
            onFillAllAI={handleFillAllAI}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Empty seat placeholder - clickable
const EmptySeat = ({ number, index, onClick }: { number: number; index: number; onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 0.6, scale: 1 }}
    transition={{ delay: index * 0.04 }}
    whileHover={{ opacity: 1, scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <div className="w-[clamp(108px,10vw,150px)] rounded-2xl border-2 border-dashed border-primary/20 bg-primary/[0.03] overflow-hidden hover:border-primary/40 hover:bg-primary/[0.06] transition-all">
      <div className="pt-6 pb-2 flex flex-col items-center px-2">
        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-primary/20 flex items-center justify-center bg-primary/5">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg text-primary/40 tabular-nums font-black">{number}</span>
            <UserPlus className="w-3.5 h-3.5 text-primary/30" />
          </div>
        </div>
        <p className="text-[11px] text-primary/40 mt-2.5 font-semibold">等待加入</p>
        <p className="text-[9px] text-muted-foreground/30 mt-0.5">点击邀请</p>
      </div>
      <div className="px-2.5 pb-2.5">
        <div className="w-full py-1.5 rounded-lg border border-dashed border-primary/15 flex items-center justify-center">
          <span className="text-[10px] text-primary/30 font-medium">+ 邀请</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default Room;
