import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Skull, Crown, Bot, Mic, Eye } from 'lucide-react';
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

/* ── Colour palette per seat position ── */
const SEAT_ACCENTS = [
  { gradient: 'from-red-900/40 to-red-950/20', ring: 'border-red-700/40' },
  { gradient: 'from-blue-900/40 to-blue-950/20', ring: 'border-blue-700/40' },
  { gradient: 'from-amber-900/40 to-amber-950/20', ring: 'border-amber-700/40' },
  { gradient: 'from-emerald-900/40 to-emerald-950/20', ring: 'border-emerald-700/40' },
  { gradient: 'from-violet-900/40 to-violet-950/20', ring: 'border-violet-700/40' },
  { gradient: 'from-cyan-900/40 to-cyan-950/20', ring: 'border-cyan-700/40' },
  { gradient: 'from-rose-900/40 to-rose-950/20', ring: 'border-rose-700/40' },
  { gradient: 'from-teal-900/40 to-teal-950/20', ring: 'border-teal-700/40' },
  { gradient: 'from-orange-900/40 to-orange-950/20', ring: 'border-orange-700/40' },
  { gradient: 'from-pink-900/40 to-pink-950/20', ring: 'border-pink-700/40' },
  { gradient: 'from-indigo-900/40 to-indigo-950/20', ring: 'border-indigo-700/40' },
  { gradient: 'from-lime-900/40 to-lime-950/20', ring: 'border-lime-700/40' },
];

const PlayerSeat = ({
  player, index, total, gamePhase, isSelected, isSpeaking, onVote, onInspect,
}: PlayerSeatProps) => {
  const [hovered, setHovered] = useState(false);
  const isDead = player.status === 'dead';
  const isVoting = gamePhase === 'voting';
  const accent = SEAT_ACCENTS[index % SEAT_ACCENTS.length];

  // Elliptical positioning
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radiusX = 43;
  const radiusY = 40;
  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 + radiusY * Math.sin(angle);

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* ── Outer voting / speaking rings ── */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute -inset-2 rounded-2xl border-2 border-primary"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            style={{ boxShadow: '0 0 24px hsl(var(--werewolf) / 0.6)' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSpeaking && !isDead && (
          <>
            <motion.div
              className="absolute -inset-3 rounded-2xl border border-alive/40"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="flex items-center gap-1 bg-alive/20 text-alive text-[9px] px-2 py-0.5 rounded-full border border-alive/30 backdrop-blur-sm">
                <Mic className="w-2.5 h-2.5" /> 发言中
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main card ── */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onInspect}
        whileHover={isDead ? {} : { scale: 1.08, y: -4 }}
        whileTap={isDead ? {} : { scale: 0.96 }}
        className={`relative w-[72px] cursor-pointer transition-all duration-300 select-none ${
          isDead ? 'opacity-40 grayscale' : ''
        }`}
      >
        {/* Card body */}
        <div
          className={`relative rounded-xl overflow-hidden border transition-colors duration-300 ${
            isDead
              ? 'border-destructive/30 bg-destructive/5'
              : isSelected
              ? 'border-primary/60 bg-primary/10'
              : hovered
              ? 'border-accent/50 bg-surface-elevated'
              : 'border-border/60 bg-surface'
          }`}
          style={!isDead ? {
            boxShadow: hovered
              ? '0 12px 40px rgba(0,0,0,0.5), 0 0 20px hsl(var(--moonlight) / 0.1)'
              : '0 4px 16px rgba(0,0,0,0.4)',
          } : undefined}
        >
          {/* Top gradient accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${accent.gradient}`} />

          {/* Avatar area */}
          <div className="px-2 pt-3 pb-1 flex flex-col items-center">
            {/* Emoji avatar with decorative ring */}
            <div className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors ${
              isDead
                ? 'border-destructive/40 bg-destructive/10'
                : isSelected
                ? 'border-primary/50 bg-primary/10'
                : `${accent.ring} bg-background/50`
            }`}>
              {isDead ? (
                <Skull className="w-5 h-5 text-destructive" />
              ) : (
                <span className="text-2xl leading-none">{player.emoji}</span>
              )}

              {/* Status dot */}
              {!isDead && gamePhase === 'waiting' && (
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
                  player.isReady ? 'bg-alive' : 'bg-muted-foreground/30'
                }`} />
              )}
            </div>

            {/* Player name */}
            <p className={`text-[11px] font-medium text-center mt-1.5 w-full truncate leading-tight ${
              isDead ? 'text-destructive/50 line-through' : 'text-foreground/90'
            }`}>
              {player.name}
            </p>
          </div>

          {/* Bottom info bar */}
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/30 bg-background/30">
            {/* Number badge */}
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground/70 bg-muted/50 w-5 h-5 rounded flex items-center justify-center">
              {player.number}
            </span>

            {/* Badges */}
            <div className="flex items-center gap-1">
              {player.isOwner && <Crown className="w-3 h-3 text-gold" />}
              {player.isAI && <Bot className="w-3 h-3 text-accent/70" />}
            </div>
          </div>
        </div>

        {/* ── Vote button (overlaid at bottom) ── */}
        <AnimatePresence>
          {isVoting && !isDead && (
            <motion.button
              initial={{ scale: 0, y: -4 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              onClick={(e) => { e.stopPropagation(); onVote(); }}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
            >
              <Vote className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Hover detail tooltip ── */}
      <AnimatePresence>
        {hovered && !isDead && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40 glass-panel rounded-xl px-3.5 py-2.5 min-w-[140px] pointer-events-none"
          >
            <p className="text-xs font-semibold text-foreground mb-0.5">{player.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {player.isAI ? `🤖 ${player.personality || 'AI 玩家'}` : '👤 真人玩家'}
            </p>
            {player.isOwner && (
              <p className="text-[10px] text-gold mt-1 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> 房主
              </p>
            )}
            {isVoting && (
              <p className="text-[10px] text-primary mt-1 font-medium">⚔ 点击投票放逐</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerSeat;
