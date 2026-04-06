import { motion, AnimatePresence } from 'framer-motion';
import type { Role } from '@/store/gameStore';
import { ROLE_DATA } from '@/lib/roleData';

interface RoleCardFlipProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

const RoleCardFlip = ({ role, isOpen, onClose }: RoleCardFlipProps) => {
  const art = ROLE_DATA[role];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Flip card container */}
          <motion.div
            className="relative w-[240px] h-[340px]"
            style={{ perspective: '1200px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              {/* Card back */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-border/60 bg-gradient-to-br from-primary/20 via-surface-elevated to-surface flex items-center justify-center shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <span className="text-4xl">🃏</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground/50 tracking-widest">CHARADE</p>
                </div>
                {/* Decorative pattern */}
                <div className="absolute inset-4 border border-border/20 rounded-xl pointer-events-none" />
                <div className="absolute inset-8 border border-border/10 rounded-lg pointer-events-none" />
              </div>

              {/* Card front (role reveal) */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 border-border/60 overflow-hidden shadow-2xl bg-gradient-to-b ${art.gradient}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {/* Glow effect */}
                <motion.div
                  className={`absolute inset-0 opacity-0`}
                  animate={{ opacity: [0, 0.3, 0.1] }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  style={{
                    background: `radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.3), transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
                  {/* Role emoji */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-4"
                  >
                    <span className="text-7xl filter drop-shadow-lg">{art.emoji}</span>
                  </motion.div>

                  {/* Role label */}
                  <motion.h2
                    className={`text-2xl font-black ${art.color} tracking-wider mb-2`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    {art.label}
                  </motion.h2>

                  {/* Divider */}
                  <motion.div
                    className="w-16 h-px bg-border/60 mb-3"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.2 }}
                  />

                  {/* Description */}
                  <motion.p
                    className="text-xs text-muted-foreground/70 text-center leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    {art.desc}
                  </motion.p>
                </div>

                {/* Bottom decorative */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            </motion.div>

            {/* Close hint */}
            <motion.p
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground/40 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              点击任意处关闭
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleCardFlip;
