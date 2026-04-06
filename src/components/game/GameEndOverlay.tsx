import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore, type VictoryCondition } from '@/store/gameStore';
import { ROLE_DATA, WOLF_ROLES, FACTION_COLORS, type Faction } from '@/lib/roleData';

const VICTORY_LABELS: Record<VictoryCondition, string> = {
  village_win: '好人阵营胜利！所有狼人已被消灭。',
  werewolf_win: '狼人阵营胜利！村庄已沦陷。',
  werewolf_slaughter_civilians: '狼人阵营胜利！屠民成功——所有平民已死亡。',
  werewolf_slaughter_gods: '狼人阵营胜利！屠神成功——所有神职已死亡。',
};

const GameEndOverlay = () => {
  const navigate = useNavigate();
  const { gameResult, setGameResult, setGamePhase, leaveRoom, currentRoom, localGuesses } = useGameStore();

  if (!gameResult) return null;

  const isVillageWin = gameResult.winner === 'village';

  const players = currentRoom?.players || [];
  const revealData = players.map(p => {
    const roleKey = p.role;
    const roleInfo = roleKey ? ROLE_DATA[roleKey] : null;
    return {
      number: p.number,
      name: p.name,
      role: roleKey,
      roleLabel: roleInfo?.label || '未知',
      roleEmoji: roleInfo?.emoji || '❓',
      roleFaction: roleInfo?.faction || 'village' as Faction,
      roleFactionLabel: roleInfo?.factionLabel || '未知',
      status: p.status,
      localGuess: localGuesses[p.id] || null,
      isSheriff: p.isSheriff,
    };
  });

  const victoryText = gameResult.victoryCondition
    ? VICTORY_LABELS[gameResult.victoryCondition]
    : isVillageWin ? '好人阵营胜利！' : '狼人阵营胜利！';

  // Stats
  const wolfCount = revealData.filter(p => p.role && WOLF_ROLES.includes(p.role)).length;
  const correctGuesses = revealData.filter(p => p.localGuess && p.localGuess === p.role).length;
  const totalGuesses = revealData.filter(p => p.localGuess).length;

  const handlePlayAgain = () => {
    setGameResult(null);
    setGamePhase('waiting');
  };

  const handleBackToLobby = () => {
    setGameResult(null);
    leaveRoom();
    navigate('/lobby');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-lg"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="text-center max-w-xl w-full mx-4"
      >
        {/* Victory banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <motion.span
            className="text-5xl block mb-3"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {isVillageWin ? '🎉' : '🐺'}
          </motion.span>
          <h1 className={`display-title text-4xl md:text-5xl mb-2 ${
            isVillageWin ? 'text-alive text-glow-moonlight' : 'text-destructive text-glow-werewolf'
          }`}>
            {isVillageWin ? 'VILLAGE WINS!' : 'WOLVES WIN!'}
          </h1>
          <p className="text-muted-foreground">{victoryText}</p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mb-6 text-xs text-muted-foreground"
        >
          <span>🐺 狼人 ×{wolfCount}</span>
          {totalGuesses > 0 && (
            <span>🎯 猜测准确率 {correctGuesses}/{totalGuesses} ({Math.round(correctGuesses / totalGuesses * 100)}%)</span>
          )}
        </motion.div>

        {/* Identity Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="surface-elevated rounded-xl p-4 mb-6 text-left"
        >
          <h3 className="text-sm font-medium text-accent mb-3 text-center">🎭 身份揭示</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {revealData.map((p, i) => {
              const isWolf = p.role && WOLF_ROLES.includes(p.role);
              const guessCorrect = p.localGuess && p.localGuess === p.role;
              const guessWrong = p.localGuess && p.localGuess !== p.role;
              const guessLabel = p.localGuess ? ROLE_DATA[p.localGuess]?.label : null;

              return (
                <motion.div
                  key={p.number}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg bg-background/50 border ${
                    guessCorrect ? 'border-alive/40' : guessWrong ? 'border-destructive/40' : 'border-border/20'
                  }`}
                >
                  <span className="text-xs tabular-nums text-muted-foreground font-bold w-5">{p.number}</span>
                  <span className="text-base leading-none">{p.roleEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {p.name}
                      {p.isSheriff && <span className="text-gold ml-1">⭐</span>}
                    </p>
                    <p className={`text-[10px] ${isWolf ? 'text-destructive' : 'text-alive'}`}>
                      {p.roleLabel}
                      <span className="text-muted-foreground/50 ml-1">· {p.roleFactionLabel}</span>
                    </p>
                  </div>
                  {/* Guess result */}
                  {guessCorrect && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-alive/10 text-alive font-bold">✓</span>
                  )}
                  {guessWrong && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-bold" title={`猜测：${guessLabel}`}>
                      ✗
                    </span>
                  )}
                  {p.status === 'dead' && (
                    <span className="text-[9px] text-muted-foreground/40">💀</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* MVP */}
        {gameResult.mvp && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gold display-title text-lg mb-8"
          >
            🏆 MVP: {gameResult.mvp}号玩家
          </motion.p>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-3 justify-center"
        >
          <button onClick={handlePlayAgain} className="btn-ritual">再来一局</button>
          <button onClick={handleBackToLobby} className="btn-ghost-moon">返回大厅</button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GameEndOverlay;
