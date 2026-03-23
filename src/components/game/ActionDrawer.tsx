import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Ban } from 'lucide-react';
import NightActionPanel, { type NightAction } from './NightActionPanel';
import type { Player, Role, GamePhase } from '@/store/gameStore';

interface ActionDrawerProps {
  myRole: Role | null;
  currentPhase: GamePhase;
  players: Player[];
  onAction: (action: NightAction) => void;
  onSkip: () => void;
}

/** Check if the current phase has any actionable content */
function hasAction(phase: GamePhase): boolean {
  return (
    phase === 'night' ||
    phase === 'night_werewolf' ||
    phase === 'night_seer' ||
    phase === 'night_witch' ||
    phase === 'night_guard' ||
    phase === 'voting'
  );
}

const ActionDrawer = ({ myRole, currentPhase, players, onAction, onSkip }: ActionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const actionable = hasAction(currentPhase);

  // Auto-open when an actionable phase begins
  useEffect(() => {
    if (actionable) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [actionable, currentPhase]);

  const drawerHeight = 320;

  return (
    <div className="border-t border-border/40 flex flex-col shrink-0 relative">
      {/* Pull tab */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 py-2 bg-surface/50 hover:bg-surface-elevated/50 transition-colors border-b border-border/30"
      >
        <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span className="text-[10px] text-muted-foreground font-medium">
          {actionable ? '操作面板' : '操作面板'}
        </span>
      </button>

      {/* Drawer content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: drawerHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="overflow-hidden"
          >
            <div className="h-full overflow-y-auto">
              {actionable ? (
                <ActionDrawerContent
                  myRole={myRole}
                  currentPhase={currentPhase}
                  players={players}
                  onAction={onAction}
                  onSkip={onSkip}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mb-3">
                    <Ban className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">当前无可操作内容</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                    等待可操作的阶段（夜间技能 / 投票）
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Inline version of NightActionPanel for the drawer (no fixed positioning) */
const ActionDrawerContent = ({ myRole, currentPhase, players, onAction, onSkip }: ActionDrawerProps) => {
  return (
    <div className="p-0">
      <NightActionPanel
        myRole={myRole}
        currentPhase={currentPhase}
        players={players}
        onAction={onAction}
        onSkip={onSkip}
        inline
      />
    </div>
  );
};

export default ActionDrawer;
