import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, UserPlus, BookOpen, MoreHorizontal,
  StickyNote, Clock, Shield, Skull, Eye as EyeIcon, Swords, Vote
} from 'lucide-react';
import { useGameStore, type GamePhase, type Player, type GameLog } from '@/store/gameStore';
import GameEndOverlay from '@/components/game/GameEndOverlay';
import NoteDrawer from '@/components/game/NoteDrawer';

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
  const logRef = useRef<HTMLDivElement>(null);

  const players = currentRoom?.players || [];

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLogs]);

  const handleStartGame = () => {
    setGamePhase('night');
    setShowRoleReveal(true);

    // Simulate game logs
    DEMO_LOGS.forEach((log, i) => {
      setTimeout(() => addGameLog(log), i * 800);
    });

    // Simulate phase transitions
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
      case 'night': return '🌙';
      case 'day': return '☀️';
      case 'voting': return '🗳️';
      default: return '⏳';
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
        <div className="flex-1" />
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Player List */}
        <aside className="w-60 border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              玩家席位 ({players.length}/{currentRoom?.maxPlayers || 9})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {players.map((p, i) => (
              <PlayerListCard
                key={p.id}
                player={p}
                index={i}
                isGamePhase={gamePhase !== 'waiting'}
                isVoting={gamePhase === 'voting'}
                isSelected={selectedTarget === p.number}
                onVote={() => handleVote(p.number)}
              />
            ))}
            {/* Empty seats */}
            {Array.from({ length: (currentRoom?.maxPlayers || 9) - players.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border/50 text-muted-foreground">
                <span className="text-xs tabular-nums w-5">{players.length + i + 1}</span>
                <span className="text-sm">空位</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="m-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
          >
            <StickyNote className="w-4 h-4" /> 笔记
          </button>
        </aside>

        {/* Center: Game Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Phase Banner */}
          {gamePhase !== 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="phase-banner flex items-center justify-center gap-3"
            >
              <span>{getPhaseIcon(gamePhase)}</span>
              <span className="text-sm">{getPhaseLabel(gamePhase)}</span>
              {gamePhase !== 'ended' && (
                <span className="text-sm tabular-nums flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 02:30
                </span>
              )}
            </motion.div>
          )}

          {/* Game Log / Waiting Screen */}
          <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {gamePhase === 'waiting' ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-6"
                >
                  🐺
                </motion.div>
                <h2 className="display-title text-2xl text-foreground mb-2">等待玩家加入</h2>
                <p className="text-muted-foreground text-sm">
                  {players.length}/{currentRoom?.maxPlayers || 9} 名玩家已就位
                </p>
              </div>
            ) : (
              gameLogs.map(log => <GameLogEntry key={log.id} log={log} />)
            )}
          </div>

          {/* Action Bar */}
          <div className="border-t border-border p-3">
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
        </main>
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

// Player List Card
const PlayerListCard = ({
  player, index, isGamePhase, isVoting, isSelected, onVote
}: {
  player: Player; index: number; isGamePhase: boolean;
  isVoting: boolean; isSelected: boolean; onVote: () => void;
}) => {
  const isDead = player.status === 'dead';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
        isDead
          ? 'player-dead'
          : isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-accent/30 hover:bg-secondary/50'
      }`}
    >
      <span className="text-xs tabular-nums text-muted-foreground w-5">{player.number}</span>
      <span className="text-lg">{player.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          {isDead ? '已死亡' : player.isAI ? (player.personality || 'AI') : player.isReady ? '已准备' : '未准备'}
        </p>
      </div>
      {isVoting && !isDead && (
        <button
          onClick={onVote}
          className={`p-1 rounded transition-colors ${
            isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Vote className="w-4 h-4" />
        </button>
      )}
      {isDead && (
        <span className="text-destructive text-sm font-bold">✕</span>
      )}
    </motion.div>
  );
};

// Game Log Entry
const GameLogEntry = ({ log }: { log: GameLog }) => {
  if (log.type === 'phase') {
    return (
      <div className="phase-banner text-xs my-3 rounded-md">
        {log.content}
      </div>
    );
  }

  if (log.type === 'speech') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs shrink-0 mt-0.5">
          {log.playerNumber}
        </div>
        <div>
          <span className="text-xs text-accent">{log.playerName}</span>
          <div className="surface-elevated rounded-lg px-3 py-2 mt-1 text-sm text-secondary-foreground max-w-md">
            {log.content}
          </div>
        </div>
      </motion.div>
    );
  }

  const icon = log.type === 'death' || log.type === 'execution' ? '†'
    : log.type === 'vote_result' ? '✗'
    : log.type === 'game_end' ? '◉' : '系统';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-sm px-3 py-2 rounded-md ${
        log.type === 'death' || log.type === 'execution'
          ? 'bg-destructive/5 text-destructive border border-destructive/20'
          : log.type === 'game_end'
          ? 'bg-gold/5 text-gold border border-gold/20 text-center display-title text-base'
          : 'text-muted-foreground'
      }`}
    >
      {icon} {log.content}
    </motion.div>
  );
};

export default Room;
