import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, Skull, Crown, Bot, Mic, UserCheck, X, Star, Swords as SwordsIcon, UserMinus } from 'lucide-react';
import type { Player, GamePhase, Role } from '@/store/gameStore';
import RoleCardFlip from './RoleCardFlip';
import { ROLE_DATA, GUESS_ROLES } from '@/lib/roleData';

// Generated gradient avatars based on player number for visual distinction
const AVATAR_GRADIENTS = [
  'from-red-500/30 to-orange-500/30',
  'from-blue-500/30 to-cyan-500/30',
  'from-green-500/30 to-emerald-500/30',
  'from-purple-500/30 to-pink-500/30',
  'from-amber-500/30 to-yellow-500/30',
  'from-teal-500/30 to-lime-500/30',
  'from-rose-500/30 to-fuchsia-500/30',
  'from-indigo-500/30 to-violet-500/30',
  'from-sky-500/30 to-blue-500/30',
  'from-orange-500/30 to-red-500/30',
  'from-emerald-500/30 to-teal-500/30',
  'from-pink-500/30 to-rose-500/30',
];

const PLAYER_AVATARS = ['🐺', '🦊', '🦉', '🐍', '🦇', '🐻', '🦅', '🐱', '🐰', '🦌', '🐸', '🦁'];

const PlayerSeat = ({
  player, index, gamePhase, isSelected, isSpeaking, isSelf, selfRole, localGuess, gameEnded,
  pickerDirection = 'up', isOwner, onVote, onInspect, onSetLocalGuess, onKick,
}: PlayerSeatProps) => {
  const [showGuessPicker, setShowGuessPicker] = useState(false);
  const [showRoleFlip, setShowRoleFlip] = useState(false);
  const [showKickConfirm, setShowKickConfirm] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isDead = player.status === 'dead';
  const isVoting = gamePhase === 'voting';
  const isWaiting = gamePhase === 'waiting';

  // Click outside to close guess picker
  useEffect(() => {
    if (!showGuessPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowGuessPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showGuessPicker]);

  const avatarEmoji = player.emoji || PLAYER_AVATARS[(player.number - 1) % PLAYER_AVATARS.length];
  const avatarGradient = AVATAR_GRADIENTS[(player.number - 1) % AVATAR_GRADIENTS.length];

  const displayRole = isSelf ? selfRole : (gameEnded ? player.role : null);
  const guessCorrect = gameEnded && localGuess && player.role ? localGuess === player.role : null;

  // Can owner kick this player? Only during waiting, not self
  const canKick = isOwner && !isSelf && isWaiting && onKick;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Speaking indicator */}
      <AnimatePresence>
        {isSpeaking && !isDead && (
          <>
            <motion.div
              className="absolute -inset-2.5 rounded-2xl"
              style={{ border: '2px solid hsl(var(--alive) / 0.4)' }}
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-6 left-1/2 -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="flex items-center gap-1 bg-alive/20 text-alive text-[9px] px-2.5 py-1 rounded-full border border-alive/30 backdrop-blur-sm whitespace-nowrap font-medium">
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
            className="absolute -inset-2 rounded-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            style={{
              border: '2px solid hsl(var(--primary))',
              boxShadow: '0 0 24px hsl(var(--werewolf) / 0.5)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sheriff badge */}
      {player.isSheriff && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 z-30"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold/20 border-2 border-gold/50 shadow-lg shadow-gold/20">
            <Star className="w-4 h-4 text-gold fill-gold" />
          </span>
        </motion.div>
      )}

      {/* Kick button - top left, only for room owner */}
      {canKick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-2 -left-2 z-30"
        >
          {showKickConfirm ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 bg-destructive/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onKick(player.id); setShowKickConfirm(false); }}
                className="text-[9px] text-destructive-foreground font-bold hover:underline"
              >
                确认
              </button>
              <span className="text-destructive-foreground/40 text-[9px]">|</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowKickConfirm(false); }}
                className="text-[9px] text-destructive-foreground/70 hover:underline"
              >
                取消
              </button>
            </motion.div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setShowKickConfirm(true); }}
              className="w-5 h-5 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover/seat:opacity-100 hover:!opacity-100"
              style={{ opacity: undefined }}
              title="踢出玩家"
            >
              <UserMinus className="w-3 h-3 text-destructive-foreground" />
            </button>
          )}
        </motion.div>
      )}

      {/* Role flip overlay for self */}
      {isSelf && selfRole && (
        <RoleCardFlip role={selfRole} isOpen={showRoleFlip} onClose={() => setShowRoleFlip(false)} />
      )}

      {/* Main card */}
      <motion.div
        onClick={() => {
          if (isSelf && selfRole && gamePhase !== 'waiting' && gamePhase !== 'ended') {
            setShowRoleFlip(true);
          } else {
            onInspect();
          }
        }}
        whileHover={isDead ? {} : { y: -6 }}
        whileTap={isDead ? {} : { scale: 0.97 }}
        className={`group/seat relative w-[clamp(108px,10vw,150px)] cursor-pointer select-none transition-all duration-300 ${
          isSelf ? 'ring-2 ring-accent/30 rounded-2xl' : ''
        }`}
      >
        {/* Death overlay animation */}
        <AnimatePresence>
          {isDead && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 rounded-2xl pointer-events-none overflow-hidden"
            >
              {/* Red slash effect */}
              <motion.div
                initial={{ x: '-100%', rotate: -45 }}
                animate={{ x: '200%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-destructive/30 to-transparent"
                style={{ transformOrigin: 'center' }}
              />
              {/* Persistent death vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-destructive/10 via-transparent to-destructive/15 rounded-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={isDead ? { opacity: 0.4, scale: 0.95, filter: 'grayscale(0.8) saturate(0.3)' } : { opacity: 1, scale: 1, filter: 'grayscale(0) saturate(1)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div
            className={`relative rounded-2xl transition-all duration-300 ${
              isDead
                ? 'border border-destructive/30 bg-destructive/5'
                : isSelected
                ? 'border-2 border-primary/60 bg-gradient-to-b from-primary/8 to-primary/3'
                : 'border border-border/40 bg-gradient-to-b from-surface-elevated to-surface hover:border-accent/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
            }`}
            style={!isDead && !isSelected ? {
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            } : undefined}
          >
            {/* Top bar: Number + badges */}
            <div className="flex items-center justify-between px-2.5 pt-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm tabular-nums ${
                isDead
                  ? 'bg-destructive/10 text-destructive/50'
                  : 'bg-primary/15 text-primary border border-primary/25'
              }`}>
                {player.number}
              </div>

              <div className="flex items-center gap-1">
                {isSelf && (
                  <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                    <span className="text-[9px] font-bold text-accent">我</span>
                  </span>
                )}
                {player.isOwner && (
                  <span className="w-6 h-6 rounded-lg bg-gold/12 flex items-center justify-center border border-gold/25">
                    <Crown className="w-3.5 h-3.5 text-gold" />
                  </span>
                )}
                {player.isAI && (
                  <span className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Bot className="w-3.5 h-3.5 text-accent/70" />
                  </span>
                )}
              </div>
            </div>

            {/* Avatar with generated gradient ring */}
            <div className="py-3 flex flex-col items-center px-3">
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isDead
                  ? 'bg-destructive/8 border border-destructive/20'
                  : isSelected
                  ? 'bg-primary/10 border-2 border-primary/30 shadow-[0_0_16px_hsl(var(--primary)/0.2)]'
                  : `bg-gradient-to-br ${avatarGradient} border border-border/30`
              }`}>
                {isDead ? (
                  <motion.div
                    initial={{ rotateZ: 0 }}
                    animate={{ rotateZ: [0, -10, 10, -5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Skull className="w-8 h-8 text-destructive/60" />
                  </motion.div>
                ) : (
                  <span className="text-3xl leading-none filter drop-shadow-sm">{avatarEmoji}</span>
                )}

                {/* Ready dot */}
                {!isDead && gamePhase === 'waiting' && (
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[2.5px] border-surface transition-colors ${
                    player.isReady ? 'bg-alive shadow-[0_0_8px_hsl(var(--alive)/0.5)]' : 'bg-muted-foreground/25'
                  }`} />
                )}

                {/* Sheriff vote weight */}
                {player.isSheriff && isVoting && (
                  <span className="absolute -bottom-1 -left-1 text-[8px] bg-gold/20 text-gold px-1.5 py-0.5 rounded-full border border-gold/30 font-bold">
                    1.5票
                  </span>
                )}

                {/* Dead cross overlay */}
                {isDead && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-[2px] bg-destructive/40 rotate-45 absolute" />
                    <div className="w-full h-[2px] bg-destructive/40 -rotate-45 absolute" />
                  </div>
                )}
              </div>

              <p className={`text-[13px] font-bold text-center mt-2.5 w-full truncate leading-tight ${
                isDead ? 'text-destructive/40 line-through' : 'text-foreground'
              }`}>
                {player.name}
              </p>

              <p className={`text-[10px] mt-1 truncate w-full text-center font-medium ${
                player.isAI ? 'text-accent/50' : 'text-muted-foreground/40'
              }`}>
                {isDead ? '💀 已出局' : player.isAI ? `🤖 ${player.personality || 'AI'}` : '👤 真人玩家'}
              </p>
            </div>

            {/* Self role display */}
            {displayRole && (
              <div className="px-2.5 pb-1.5">
                <div className={`w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold py-1.5 rounded-lg border ${ROLE_CONFIG[displayRole].bg} ${ROLE_CONFIG[displayRole].color}`}>
                  {ROLE_CONFIG[displayRole].icon}
                  {ROLE_CONFIG[displayRole].label}
                  {isSelf && <span className="text-[8px] opacity-60">（你）</span>}
                </div>
              </div>
            )}

            {/* Local guess tag */}
            <div className="px-2.5 pb-2.5" ref={pickerRef}>
              {!isSelf && (
                <>
                  {localGuess ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetLocalGuess(null); }}
                      className={`w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold py-1.5 rounded-lg border transition-colors ${
                        gameEnded
                          ? guessCorrect
                            ? 'bg-alive/15 border-alive/40 text-alive'
                            : 'bg-destructive/15 border-destructive/40 text-destructive'
                          : `${ROLE_CONFIG[localGuess].bg} ${ROLE_CONFIG[localGuess].color}`
                      }`}
                    >
                      {gameEnded && (guessCorrect ? '✓' : '✗')}
                      {ROLE_CONFIG[localGuess].icon}
                      {ROLE_CONFIG[localGuess].label}
                      {!gameEnded && <X className="w-2.5 h-2.5 ml-0.5 opacity-50" />}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowGuessPicker(!showGuessPicker); }}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/35 py-1.5 rounded-lg border border-dashed border-border/25 hover:border-accent/30 hover:text-muted-foreground/60 transition-colors"
                    >
                      <UserCheck className="w-3 h-3" />
                      标记身份
                    </button>
                  )}

                  <AnimatePresence>
                    {showGuessPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        className="absolute left-1/2 -translate-x-1/2 z-[100] glass-panel rounded-xl p-1.5 min-w-[130px] shadow-xl"
                        style={pickerDirection === 'up' ? { bottom: '100%', marginBottom: '4px' } : { top: '100%', marginTop: '4px' }}
                      >
                        <p className="text-[9px] text-muted-foreground/60 px-2 py-1 font-medium">猜测身份</p>
                        {GUESS_ROLES.map((role) => {
                          const cfg = ROLE_CONFIG[role];
                          return (
                            <button
                              key={role}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetLocalGuess(role);
                                setShowGuessPicker(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-colors hover:bg-muted/50 ${cfg.color}`}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Vote button */}
        <AnimatePresence>
          {isVoting && !isDead && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={(e) => { e.stopPropagation(); onVote(); }}
              className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors z-20 ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.4)]'
                  : 'bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
            >
              <Vote className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PlayerSeat;
