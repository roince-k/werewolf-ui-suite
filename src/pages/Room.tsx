import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, UserPlus, BookOpen, MoreHorizontal,
  StickyNote, Clock, Shield, Skull, Swords, Moon, Sun
} from 'lucide-react';

import { useGameStore, type GamePhase, type GameLog, type Role, type AgentTemplate } from '@/store/gameStore';
import GameEndOverlay from '@/components/game/GameEndOverlay';
import NoteDrawer from '@/components/game/NoteDrawer';
import PlayerSeat from '@/components/game/PlayerSeat';
import GameBulletin from '@/components/game/GameBulletin';
import PhaseBanner from '@/components/game/PhaseBanner';
import NightActionPanel, { type NightAction } from '@/components/game/NightActionPanel';
import InviteModal from '@/components/game/InviteModal';

// Demo game logs
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
    gameResult, setGameResult, castVote, notes, setNotes, isSoloMode
  } = useGameStore();
  const [message, setMessage] = useState('');
  const [showNotes, setShowNotes] = useState(false); // keep for header toggle if needed
  const [showInvite, setShowInvite] = useState(false);
  const [inviteSeatNumber, setInviteSeatNumber] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<number | null>(null);
  const [tempRoles, setTempRoles] = useState<Record<string, Role | null>>({});

  const players = currentRoom?.players || [];
  const totalSeats = currentRoom?.maxPlayers || 9;

  const allSeats = Array.from({ length: totalSeats }, (_, i) => players[i] || null);

  // Split seats into two rows
  const midpoint = Math.ceil(totalSeats / 2);
  const topRow = allSeats.slice(0, midpoint);
  const bottomRow = allSeats.slice(midpoint);

  const handleStartGame = () => {
    setGamePhase('night');
    setShowRoleReveal(true);
    DEMO_LOGS.forEach((log, i) => {
      setTimeout(() => addGameLog(log), i * 800);
    });
    setTimeout(() => setGamePhase('day'), 3000);
    setTimeout(() => setGamePhase('voting'), 8000);
    setTimeout(() => {
      setGameResult({ winner: 'village', mvp: 1 });
      setGamePhase('ended');
    }, 12000);
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

  const handleSetTempRole = (playerId: string, role: Role | null) => {
    setTempRoles(prev => ({ ...prev, [playerId]: role }));
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
    }
  };

  const handleSkipNight = () => {
    addGameLog({ type: 'system', content: '你选择了跳过本轮行动' });
  };

  const handleInviteAgent = (agent: AgentTemplate) => {
    if (inviteSeatNumber === null) return;
    const newPlayer = {
      id: crypto.randomUUID(),
      number: inviteSeatNumber,
      name: agent.name,
      isAI: true,
      status: 'alive' as const,
      isReady: true,
      isOwner: false,
      emoji: agent.emoji,
      personality: agent.personality,
    };
    // In a real app this would update the room via backend
    addGameLog({ type: 'system', content: `🤖 ${agent.name} 加入了 ${inviteSeatNumber}号位` });
    setInviteSeatNumber(null);
    toast.success(`${agent.name} 已加入 ${inviteSeatNumber}号位`);
  };

  const handleInviteLobbyUser = (username: string) => {
    if (inviteSeatNumber === null) return;
    addGameLog({ type: 'system', content: `📨 已向 ${username} 发送邀请` });
    setInviteSeatNumber(null);
    toast.success(`已邀请 ${username}`);
  };

  const renderSeat = (player: typeof allSeats[number], i: number) => {
    if (player) {
      return (
        <PlayerSeat
          key={player.id}
          player={player}
          index={i}
          gamePhase={gamePhase}
          isSelected={selectedTarget === player.number}
          tempRole={tempRoles[player.id] || null}
          onVote={() => handleVote(player.number)}
          onInspect={() => setInspectedPlayer(player.number)}
          onSetTempRole={(role) => handleSetTempRole(player.id, role)}
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

        <div className="flex-1" />
        <button onClick={() => setShowNotes(!showNotes)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <StickyNote className="w-3.5 h-3.5" /> 笔记
        </button>
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
            {topRow.map((player, i) => renderSeat(player, i))}
          </div>

          {/* Phase banner in the middle */}
          <PhaseBanner phase={gamePhase} playerCount={players.length} totalSeats={totalSeats} />

          {/* Bottom row */}
          <div className="flex items-start justify-center gap-[1.5vw] flex-wrap">
            {bottomRow.map((player, i) => renderSeat(player, midpoint + i))}
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
            ) : gamePhase !== 'ended' ? (
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={gamePhase === 'day' ? '发表你的看法...' : '夜晚静默中...'}
                  disabled={gamePhase === 'night' || gamePhase === 'voting'}
                  className="input-ritual flex-1 text-sm py-2.5"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={gamePhase !== 'day'}
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
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="记录你的推理和怀疑对象..."
              className="flex-1 input-ritual text-sm resize-none border-0 rounded-none bg-transparent focus:ring-0 px-4 py-3"
            />
          </div>
        </aside>
      </div>

      {/* Role Reveal */}
      <AnimatePresence>
        {showRoleReveal && (
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
              className="surface-elevated rounded-2xl p-8 text-center max-w-xs"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-sm text-muted-foreground mb-4">你的身份</p>
              <span className="text-6xl block mb-4">🔮</span>
              <h2 className="display-title text-3xl text-foreground mb-2">预言家</h2>
              <p className="text-sm text-accent mb-6">Seer · 神职阵营</p>
              <p className="text-sm text-muted-foreground mb-6">每晚可以查验一名玩家的身份</p>
              <button onClick={() => setShowRoleReveal(false)} className="btn-ritual text-sm">
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night Action Panel */}
      <AnimatePresence>
        {gamePhase === 'night' && (
          <NightActionPanel
            myRole={myRole || 'seer'}
            players={players}
            onAction={handleNightAction}
            onSkip={handleSkipNight}
          />
        )}
      </AnimatePresence>

      {/* Game End */}
      {gameResult && <GameEndOverlay />}

      {/* Notes Drawer */}
      <AnimatePresence>
        {showNotes && <NoteDrawer onClose={() => setShowNotes(false)} />}
      </AnimatePresence>

      {/* Rules Dropdown */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowRules(false)}>
            <div className="absolute inset-0 bg-void/50" />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 right-20 glass-panel rounded-xl p-4 w-80 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="display-title text-lg text-foreground mb-3">游戏规则</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 4狼人 + 1预言家 + 1女巫 + 1猎人 + 5平民</p>
                <p>• 狼人夜间刀人，预言家查验身份</p>
                <p>• 女巫有解药和毒药各一瓶</p>
                <p>• 猎人被淘汰时可开枪带走一人</p>
                <p>• 白天讨论后公投放逐一名玩家</p>
                <p>• 狼全灭→好人胜；神/民全灭→狼人胜</p>
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
