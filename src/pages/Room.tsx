import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, UserPlus, BookOpen, MoreHorizontal,
  StickyNote, Clock, Shield, Skull, Swords, Moon, Sun
} from 'lucide-react';
import { useGameStore, type GamePhase, type GameLog } from '@/store/gameStore';
import GameEndOverlay from '@/components/game/GameEndOverlay';
import NoteDrawer from '@/components/game/NoteDrawer';
import PlayerSeat from '@/components/game/PlayerSeat';
import GameBulletin from '@/components/game/GameBulletin';

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
    gameResult, setGameResult, castVote
  } = useGameStore();
  const [message, setMessage] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<number | null>(null);

  const players = currentRoom?.players || [];
  const totalSeats = currentRoom?.maxPlayers || 9;

  // Fill empty seats for the circular layout
  const allSeats = Array.from({ length: totalSeats }, (_, i) => {
    return players[i] || null;
  });

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

  const getPhaseLabel = (phase: GamePhase) => {
    switch (phase) {
      case 'waiting': return '等待开始';
      case 'night': return '夜晚';
      case 'day': return '白天讨论';
      case 'voting': return '投票阶段';
      case 'ended': return '游戏结束';
    }
  };

  const getPhaseIcon = (phase: GamePhase) => {
    switch (phase) {
      case 'night': return <Moon className="w-4 h-4 text-accent" />;
      case 'day': return <Sun className="w-4 h-4 text-gold" />;
      case 'voting': return <Swords className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
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

        {/* Phase indicator in header */}
        {gamePhase !== 'waiting' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 ml-3 px-3 py-1 rounded-full border border-border bg-surface text-xs"
          >
            {getPhaseIcon(gamePhase)}
            <span className="text-foreground font-medium">{getPhaseLabel(gamePhase)}</span>
            {gamePhase !== 'ended' && (
              <span className="tabular-nums text-muted-foreground ml-1">02:30</span>
            )}
          </motion.div>
        )}

        <div className="flex-1" />
        <button onClick={() => setShowNotes(!showNotes)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <StickyNote className="w-3.5 h-3.5" /> 笔记
        </button>
        <button onClick={() => setShowInvite(!showInvite)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> 邀请
        </button>
        <button onClick={() => setShowRules(!showRules)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          <BookOpen className="w-3.5 h-3.5" /> 规则
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content: Seats + Bulletin */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Circular Seat Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4">
          {/* Seat circle container */}
          <div className="relative w-full max-w-[560px] aspect-square">
            {/* Ambient ring */}
            <motion.div
              className="absolute inset-[15%] rounded-full border border-border/30"
              animate={gamePhase === 'night' ? {
                borderColor: ['hsl(var(--accent) / 0.15)', 'hsl(var(--accent) / 0.35)', 'hsl(var(--accent) / 0.15)'],
                boxShadow: ['0 0 20px hsl(var(--accent) / 0.05)', '0 0 40px hsl(var(--accent) / 0.12)', '0 0 20px hsl(var(--accent) / 0.05)']
              } : gamePhase === 'voting' ? {
                borderColor: ['hsl(var(--werewolf) / 0.15)', 'hsl(var(--werewolf) / 0.4)', 'hsl(var(--werewolf) / 0.15)'],
                boxShadow: ['0 0 20px hsl(var(--werewolf) / 0.05)', '0 0 40px hsl(var(--werewolf) / 0.15)', '0 0 20px hsl(var(--werewolf) / 0.05)']
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {gamePhase === 'waiting' ? (
                <motion.div
                  className="text-center"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="text-5xl block mb-3">🐺</span>
                  <h2 className="display-title text-xl text-foreground mb-1">等待玩家</h2>
                  <p className="text-xs text-muted-foreground">
                    {players.length}/{totalSeats} 已就位
                  </p>
                </motion.div>
              ) : gamePhase === 'night' ? (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.span
                    className="text-4xl block mb-2"
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🌙
                  </motion.span>
                  <p className="display-title text-sm text-accent tracking-widest">夜幕降临</p>
                </motion.div>
              ) : gamePhase === 'voting' ? (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <motion.span
                    className="text-4xl block mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚔️
                  </motion.span>
                  <p className="display-title text-sm text-primary tracking-widest">公投审判</p>
                </motion.div>
              ) : gamePhase === 'day' ? (
                <div className="text-center">
                  <span className="text-4xl block mb-2">☀️</span>
                  <p className="display-title text-sm text-gold tracking-widest">自由讨论</p>
                </div>
              ) : null}
            </div>

            {/* Player seats */}
            {allSeats.map((player, i) =>
              player ? (
                <PlayerSeat
                  key={player.id}
                  player={player}
                  index={i}
                  total={totalSeats}
                  gamePhase={gamePhase}
                  isSelected={selectedTarget === player.number}
                  onVote={() => handleVote(player.number)}
                  onInspect={() => setInspectedPlayer(player.number)}
                />
              ) : (
                <EmptySeat key={`empty-${i}`} index={i} total={totalSeats} number={i + 1} />
              )
            )}
          </div>

          {/* Action Bar at bottom */}
          <div className="w-full max-w-[560px] mt-4">
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

        {/* Right: Game Bulletin */}
        <aside className="w-80 border-l border-border flex flex-col shrink-0 bg-card/50">
          <GameBulletin logs={gameLogs} className="flex-1" />
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

      {/* Game End */}
      {gameResult && <GameEndOverlay />}

      {/* Notes Drawer */}
      <AnimatePresence>
        {showNotes && <NoteDrawer onClose={() => setShowNotes(false)} />}
      </AnimatePresence>

      {/* Rules Dropdown */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowRules(false)}
          >
            <div className="absolute inset-0 bg-void/50" />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-20 glass-panel rounded-xl p-4 w-80 max-h-96 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
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

      {/* Invite Dropdown */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowInvite(false)}
          >
            <div className="absolute inset-0 bg-void/50" />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-40 glass-panel rounded-xl p-4 w-72"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="display-title text-lg text-foreground mb-3">邀请玩家</h3>
              <button className="btn-ritual w-full text-sm mb-2">邀请AI玩家</button>
              <button className="btn-ghost-moon w-full text-sm">复制房间链接</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Empty seat placeholder matching card style
const EmptySeat = ({ index, total, number }: { index: number; total: number; number: number }) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const x = 50 + 43 * Math.cos(angle);
  const y = 50 + 40 * Math.sin(angle);

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.3, scale: 1 }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="w-[72px] rounded-xl border-2 border-dashed border-border/30 bg-surface/30 overflow-hidden">
        <div className="h-1 w-full bg-border/20" />
        <div className="px-2 pt-3 pb-1 flex flex-col items-center">
          <div className="w-11 h-11 rounded-full border-2 border-dashed border-border/30 flex items-center justify-center">
            <span className="text-sm text-muted-foreground/30 tabular-nums font-bold">{number}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30 mt-1.5">空位</p>
        </div>
        <div className="flex items-center justify-center px-2 py-1.5 border-t border-border/20">
          <span className="text-[9px] text-muted-foreground/20">等待加入</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Room;
