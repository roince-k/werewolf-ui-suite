import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Skull, Crown, Bot, Mic, Eye, UserCheck, X, Shield, Ghost, Crosshair, Heart, Zap } from 'lucide-react';
import type { Player, GamePhase, Role } from '@/store/gameStore';

interface PlayerSeatProps {
  player: Player;
  index: number;
  gamePhase: GamePhase;
  isSelected: boolean;
  isSpeaking?: boolean;
  tempRole?: Role | null;
  onVote: () => void;
  onInspect: () => void;
  onSetTempRole: (role: Role | null) => void;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  werewolf: { label: '狼人', icon: <Ghost className="w-3 h-3" />, color: 'text-destructive', bg: 'bg-destructive/15 border-destructive/30' },
  seer: { label: '预言家', icon: <Eye className="w-3 h-3" />, color: 'text-accent', bg: 'bg-accent/15 border-accent/30' },
  witch: { label: '女巫', icon: <Heart className="w-3 h-3" />, color: 'text-purple-400', bg: 'bg-purple-400/15 border-purple-400/30' },
  hunter: { label: '猎人', icon: <Crosshair className="w-3 h-3" />, color: 'text-gold', bg: 'bg-gold/15 border-gold/30' },
  villager: { label: '平民', icon: <Shield className="w-3 h-3" />, color: 'text-muted-foreground', bg: 'bg-muted/30 border-muted-foreground/20' },
};

const PlayerSeat = ({
  player, index, gamePhase, isSelected, isSpeaking, tempRole, onVote, onInspect, onSetTempRole,
}: PlayerSeatProps) => {
  const [hovered, setHovered] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const isDead = player.status === 'dead';
  const isVoting = gamePhase === 'voting';

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Speaking pulse rings */}
      <AnimatePresence>
        {isSpeaking && !isDead && (
          <>
            <motion.div
              className="absolute -inset-2 rounded-2xl border border-alive/30"
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-5 left-1/2 -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="flex items-center gap-1 bg-alive/20 text-alive text-[9px] px-2 py-0.5 rounded-full border border-alive/30 backdrop-blur-sm whitespace-nowrap">
                <Mic className="w-2.5 h-2.5" /> 发言中
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Vote selection ring */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute -inset-1.5 rounded-2xl border-2 border-primary"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            style={{ boxShadow: '0 0 20px hsl(var(--werewolf) / 0.5)' }}
          />
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowRolePicker(false); }}
        onClick={onInspect}
        whileHover={isDead ? {} : { y: -6 }}
        whileTap={isDead ? {} : { scale: 0.97 }}
        className={`relative w-[130px] cursor-pointer select-none transition-all duration-300 ${
          isDead ? 'opacity-40 grayscale' : ''
        }`}
      >
        <div
          className={`relative rounded-xl overflow-hidden border-2 transition-colors duration-300 ${
            isDead
              ? 'border-destructive/30 bg-destructive/5'
              : isSelected
              ? 'border-primary/60 bg-primary/10'
              : hovered
              ? 'border-accent/40 bg-surface-elevated'
              : 'border-border/50 bg-surface'
          }`}
          style={!isDead ? {
            boxShadow: hovered
              ? '0 16px 48px rgba(0,0,0,0.5), 0 0 24px hsl(var(--moonlight) / 0.08)'
              : '0 4px 20px rgba(0,0,0,0.4)',
          } : undefined}
        >
          {/* Number badge - top left */}
          <div className="absolute top-1.5 left-1.5 z-10">
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground/80 bg-background/60 backdrop-blur-sm w-5 h-5 rounded-md flex items-center justify-center border border-border/40">
              {player.number}
            </span>
          </div>

          {/* Status badges - top right */}
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5">
            {player.isOwner && (
              <span className="w-5 h-5 rounded-md bg-gold/15 flex items-center justify-center border border-gold/30">
                <Crown className="w-3 h-3 text-gold" />
              </span>
            )}
            {player.isAI && (
              <span className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20">
                <Bot className="w-3 h-3 text-accent/70" />
              </span>
            )}
          </div>

          {/* Avatar area */}
          <div className="pt-10 pb-3 flex flex-col items-center px-3">
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors ${
              isDead
                ? 'border-destructive/40 bg-destructive/10'
                : isSelected
                ? 'border-primary/50 bg-primary/10'
                : 'border-border/40 bg-background/40'
            }`}>
              {isDead ? (
                <Skull className="w-7 h-7 text-destructive" />
              ) : (
                <span className="text-3xl leading-none">{player.emoji}</span>
              )}

              {/* Ready dot */}
              {!isDead && gamePhase === 'waiting' && (
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                  player.isReady ? 'bg-alive' : 'bg-muted-foreground/30'
                }`} />
              )}
            </div>

            {/* Player name */}
            <p className={`text-xs font-semibold text-center mt-2 w-full truncate leading-tight ${
              isDead ? 'text-destructive/50 line-through' : 'text-foreground/90'
            }`}>
              {player.name}
            </p>

            {/* AI personality or human label */}
            <p className="text-[9px] text-muted-foreground/50 mt-0.5 truncate w-full text-center">
              {player.isAI ? `🤖 ${player.personality || 'AI'}` : '👤 真人'}
            </p>
          </div>

          {/* Temp role tag area */}
          <div className="px-2 pb-2">
            {tempRole ? (
              <button
                onClick={(e) => { e.stopPropagation(); onSetTempRole(null); }}
                className={`w-full flex items-center justify-center gap-1 text-[10px] font-medium py-1 rounded-md border transition-colors ${ROLE_CONFIG[tempRole].bg} ${ROLE_CONFIG[tempRole].color}`}
              >
                {ROLE_CONFIG[tempRole].icon}
                {ROLE_CONFIG[tempRole].label}
                <X className="w-2.5 h-2.5 ml-0.5 opacity-50" />
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowRolePicker(!showRolePicker); }}
                className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground/40 py-1 rounded-md border border-dashed border-border/30 hover:border-accent/30 hover:text-muted-foreground/60 transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                标记身份
              </button>
            )}
          </div>
        </div>

        {/* Vote button */}
        <AnimatePresence>
          {isVoting && !isDead && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={(e) => { e.stopPropagation(); onVote(); }}
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors z-20 ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
            >
              <Vote className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Role picker dropdown */}
      <AnimatePresence>
        {showRolePicker && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-xl p-1.5 min-w-[120px]"
          >
            <p className="text-[9px] text-muted-foreground/60 px-2 py-1 font-medium">标记临时身份</p>
            {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => {
              const cfg = ROLE_CONFIG[role];
              return (
                <button
                  key={role}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetTempRole(role);
                    setShowRolePicker(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-muted/50 ${cfg.color}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlayerSeat;
