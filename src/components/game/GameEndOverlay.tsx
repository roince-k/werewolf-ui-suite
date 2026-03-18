import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

const GameEndOverlay = () => {
  const navigate = useNavigate();
  const { gameResult, setGameResult, setGamePhase, leaveRoom } = useGameStore();

  if (!gameResult) return null;

  const isVillageWin = gameResult.winner === 'village';

  const mockReveal = [
    { number: 1, name: '月光猎手', role: '预言家' },
    { number: 2, name: 'AI·暗影', role: '狼人' },
    { number: 3, name: 'AI·迷雾', role: '狼人' },
    { number: 4, name: '玩家4', role: '女巫' },
    { number: 5, name: '玩家5', role: '平民' },
    { number: 6, name: '玩家6', role: '猎人' },
    { number: 7, name: '玩家7', role: '狼人' },
    { number: 8, name: '玩家8', role: '平民' },
    { number: 9, name: '玩家9', role: '狼人' },
  ];

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
        className="text-center max-w-lg w-full mx-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`display-title text-4xl md:text-5xl mb-2 ${
            isVillageWin ? 'text-alive text-glow-moonlight' : 'text-destructive text-glow-werewolf'
          }`}
        >
          {isVillageWin ? 'VILLAGE WINS!' : 'WOLVES WIN!'}
        </motion.h1>
        <p className="text-muted-foreground mb-8">
          {isVillageWin ? '好人阵营胜利！狼人已被消灭。' : '狼人阵营胜利！村庄已沦陷。'}
        </p>

        {/* Identity Reveal */}
        <div className="surface-elevated rounded-xl p-4 mb-6 text-left">
          <h3 className="text-sm font-medium text-accent mb-3 text-center">身份揭示</h3>
          <div className="grid grid-cols-3 gap-2">
            {mockReveal.map(p => (
              <div key={p.number} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-background/50">
                <span className="text-xs tabular-nums text-muted-foreground">{p.number}号</span>
                <span className="text-sm text-foreground truncate flex-1">{p.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  p.role === '狼人' ? 'bg-destructive/10 text-destructive' : 'bg-alive/10 text-alive'
                }`}>
                  {p.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MVP */}
        {gameResult.mvp && (
          <p className="text-gold display-title text-lg mb-8">
            🏆 MVP: {gameResult.mvp}号玩家
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={handlePlayAgain} className="btn-ritual">再来一局</button>
          <button onClick={handleBackToLobby} className="btn-ghost-moon">返回大厅</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameEndOverlay;
