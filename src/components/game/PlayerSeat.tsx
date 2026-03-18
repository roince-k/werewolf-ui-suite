import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Shield, Skull, Eye, MessageCircle } from 'lucide-react';
import type { Player, GamePhase } from '@/store/gameStore';

interface PlayerSeatProps {
  player: Player;
  index: number;
  total: number;
  gamePhase: GamePhase;
  isSelected: boolean;
  isSpeaking?: boolean;
  onVote: () => void;
  onInspect: () => void;
}

const PlayerSeat = ({
  player, index, total, gamePhase, isSelected, isSpeaking, onVote, onInspect
}: PlayerSeatProps) => {
  const [hovered, setHovered] = useState(false);
  const isDead = player.status === 'dead';
  const isVoting = gamePhase === 'voting';

  // Calculate position in an elliptical layout
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 42; // % of container width
  const radiusY = 38; // % of container height
  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 + radiusY * Math.sin(angle);

  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
    >
      {/* Voting highlight ring */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-[-6px] rounded-full border-2 border-primary"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            style={{ boxShadow: '0 0 16px hsl(var(--werewolf) / 0.5)' }}
          />
        )}
      </AnimatePresence>

      {/* Speaking pulse */}
      <AnimatePresence>
        {isSpeaking && !isDead && (
          <motion.div
            className="absolute inset-[-8px] rounded-full border border-alive/50"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Main seat circle */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onInspect}
        whileHover={isDead ? {} : { scale: 1.12, y: -3 }}
        whileTap={isDead ? {} : { scale: 0.95 }}
        className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDead
            ? 'bg-destructive/10 border border-destructive/30 grayscale opacity-50'
            : isSelected
            ? 'bg-primary/20 border-2 border-primary glow-werewolf'
            : 'bg-surface-elevated border border-border hover:border-accent/50'
        }`}
        style={!isDead && !isSelected ? {
          boxShadow: hovered
            ? '0 8px 24px rgba(0,0,0,0.4), 0 0 12px hsl(var(--moonlight) / 0.15)'
            : '0 4px 12px rgba(0,0,0,0.3)'
        } : undefined}
      >
        {/* Player number badge */}
        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-background border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground tabular-nums">
          {player.number}
        </span>

        {/* Emoji / Death marker */}
        {isDead ? (
          <Skull className="w-5 h-5 text-destructive" />
        ) : (
          <span className="text-xl leading-none">{player.emoji}</span>
        )}

        {/* Ready indicator dot */}
        {gamePhase === 'waiting' && !isDead && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
            player.isReady ? 'bg-alive' : 'bg-muted-foreground/30'
          }`} />
        )}

        {/* AI badge */}
        {player.isAI && !isDead && (
          <span className="absolute -top-1 -right-1 text-[8px] bg-accent/20 text-accent px-1 rounded font-medium">
            AI
          </span>
        )}
      </motion.div>

      {/* Player name */}
      <motion.p
        className={`text-[11px] text-center mt-1.5 max-w-[80px] truncate ${
          isDead ? 'text-destructive/50 line-through' : 'text-muted-foreground'
        }`}
        animate={isSpeaking ? { color: 'hsl(var(--alive))' } : {}}
      >
        {player.name}
      </motion.p>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !isDead && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute top-full mt-3 z-30 glass-panel rounded-lg px-3 py-2 min-w-[120px] text-center pointer-events-none"
          >
            <p className="text-xs font-medium text-foreground">{player.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {player.isAI ? (player.personality || 'AI 玩家') : '真人玩家'}
            </p>
            {isVoting && (
              <p className="text-[10px] text-primary mt-1">点击投票</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vote button overlay */}
      {isVoting && !isDead && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={(e) => { e.stopPropagation(); onVote(); }}
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Vote className="w-3 h-3" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default PlayerSeat;
