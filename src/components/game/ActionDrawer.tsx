import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Ban } from 'lucide-react';
import NightActionPanel, { type NightAction } from './NightActionPanel';
import SheriffElection from './SheriffElection';
import WolfExplodeButton from './WolfExplodeButton';
import type { Player, Role, GamePhase } from '@/store/gameStore';

interface ActionDrawerProps {
  gamePhase: GamePhase;
  myRole: Role | null;
  players: Player[];
  onNightAction: (action: NightAction) => void;
  onSkipNight: () => void;
  // Sheriff props
  sheriffPhase: 'nominate' | 'speech' | 'vote' | 'transfer' | null;
  candidates: number[];
  withdrawnCandidates: number[];
  isSelfCandidate: boolean;
  isSelfSheriff: boolean;
  onSheriffNominate: () => void;
  onSheriffWithdraw: () => void;
  onSheriffVote: (targetNumber: number) => void;
  onSheriffTransfer: (targetNumber: number) => void;
  onSheriffDestroy: () => void;
  // Wolf explode
  onWolfExplode: (targetNumber?: number) => void;
}

// Determine if there's an actionable phase
function hasAction(gamePhase: GamePhase): boolean {
  return (
    gamePhase === 'night' ||
    gamePhase === 'night_werewolf' ||
    gamePhase === 'night_seer' ||
    gamePhase === 'night_witch' ||
    gamePhase === 'night_guard' ||
    gamePhase === 'sheriff_election' ||
    gamePhase === 'sheriff_speech' ||
    gamePhase === 'sheriff_vote' ||
    gamePhase === 'day_wolf_explode_available' ||
    gamePhase === 'day' ||
    gamePhase === 'day_discussion' ||
    gamePhase === 'voting'
  );
}

const ActionDrawer = ({
  gamePhase,
  myRole,
  players,
  onNightAction,
  onSkipNight,
  sheriffPhase,
  candidates,
  withdrawnCandidates,
  isSelfCandidate,
  isSelfSheriff,
  onSheriffNominate,
  onSheriffWithdraw,
  onSheriffVote,
  onSheriffTransfer,
  onSheriffDestroy,
  onWolfExplode,
}: ActionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isNightPhase =
    gamePhase === 'night' ||
    gamePhase === 'night_werewolf' ||
    gamePhase === 'night_seer' ||
    gamePhase === 'night_witch' ||
    gamePhase === 'night_guard';

  const isSheriffPhase =
    gamePhase === 'sheriff_election' ||
    gamePhase === 'sheriff_speech' ||
    gamePhase === 'sheriff_vote' ||
    sheriffPhase === 'transfer';

  const actionable = hasAction(gamePhase) || sheriffPhase === 'transfer';

  // Auto-open when actionable phase starts
  useEffect(() => {
    if (actionable) {
      setIsOpen(true);
    }
  }, [actionable, gamePhase]);

  // Don't render at all during waiting/ended
  if (gamePhase === 'waiting' || gamePhase === 'ended') return null;

  const renderContent = () => {
    if (isNightPhase) {
      return (
        <NightActionPanel
          myRole={myRole}
          currentPhase={gamePhase}
          players={players}
          onAction={onNightAction}
          onSkip={onSkipNight}
          embedded
        />
      );
    }

    if (isSheriffPhase) {
      return (
        <SheriffElection
          phase={
            sheriffPhase === 'transfer'
              ? 'transfer'
              : gamePhase === 'sheriff_election'
              ? 'nominate'
              : gamePhase === 'sheriff_speech'
              ? 'speech'
              : 'vote'
          }
          players={players}
          candidates={candidates}
          withdrawnCandidates={withdrawnCandidates}
          isSelfCandidate={isSelfCandidate}
          isSelfSheriff={isSelfSheriff}
          onNominate={onSheriffNominate}
          onWithdraw={onSheriffWithdraw}
          onVote={onSheriffVote}
          onTransfer={onSheriffTransfer}
          onDestroy={onSheriffDestroy}
          embedded
        />
      );
    }

    // No actionable content
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 py-8">
        <Ban className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground/60 text-center">
          当前无可操作的技能或投票
        </p>
        <p className="text-[11px] text-muted-foreground/40 text-center">
          等待可操作阶段...
        </p>
      </div>
    );
  };

  return (
    <>
      {/* Pull tab - always visible on left edge, vertically centered */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'translate-x-[320px]' : 'translate-x-0'
        }`}
        style={{ zIndex: 35 }}
      >
        <div className={`
          flex items-center justify-center w-5 h-14 rounded-r-lg
          border border-l-0 border-border/60
          bg-card/90 backdrop-blur-sm
          text-muted-foreground hover:text-foreground
          hover:bg-accent/20 transition-colors
          shadow-sm
          ${actionable ? 'border-primary/40 bg-primary/5' : ''}
        `}>
          {isOpen ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
        {/* Pulse indicator when actionable and closed */}
        {actionable && !isOpen && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="fixed left-0 top-[calc(50%-200px)] z-30 w-[320px]"
            style={{ height: '400px' }}
          >
            <div className="h-full glass-panel rounded-r-2xl border border-l-0 border-border/60 overflow-hidden flex flex-col shadow-lg">
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-border/40 bg-background/40 shrink-0">
                <p className="display-title text-xs text-foreground/80 tracking-wider">
                  {isNightPhase
                    ? '🌙 夜间行动'
                    : isSheriffPhase
                    ? '⭐ 警长竞选'
                    : '📋 操作面板'}
                </p>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionDrawer;
