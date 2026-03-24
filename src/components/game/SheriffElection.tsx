import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Hand, X, Check, Vote, Crown, Trash2 } from 'lucide-react';
import type { Player } from '@/store/gameStore';

export interface SheriffElectionProps {
  phase: 'nominate' | 'speech' | 'vote' | 'transfer';
  players: Player[];
  candidates: number[]; // player numbers who nominated
  withdrawnCandidates: number[]; // player numbers who withdrew
  currentSpeaker?: number; // player number currently speaking
  isSelfCandidate?: boolean;
  isSelfSheriff?: boolean; // for transfer/destroy on death
  onNominate: () => void;
  onWithdraw: () => void;
  onVote: (targetNumber: number) => void;
  onTransfer: (targetNumber: number) => void;
  onDestroy: () => void;
  embedded?: boolean;
}

const SheriffElection = ({
  phase, players, candidates, withdrawnCandidates, currentSpeaker,
  isSelfCandidate, isSelfSheriff, onNominate, onWithdraw, onVote, onTransfer, onDestroy, embedded,
}: SheriffElectionProps) => {
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  const activeCandidates = candidates.filter(n => !withdrawnCandidates.includes(n));
  const alivePlayers = players.filter(p => p.status === 'alive');

  // Transfer/Destroy on sheriff death
  if (phase === 'transfer' && isSelfSheriff) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={embedded ? 'w-full' : 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-[480px]'}
      >
        <div className={embedded ? '' : 'glass-panel rounded-2xl overflow-hidden border border-gold/30'}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-gold/5">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <div>
              <h3 className="display-title text-base text-foreground">警徽处理</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">你即将出局，请选择如何处理警徽</p>
            </div>
          </div>

          <div className="px-5 py-3">
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-medium">移交警徽给：</p>
            <div className="grid grid-cols-6 gap-1.5 mb-3">
              {alivePlayers.map(p => (
                <button
                  key={p.number}
                  onClick={() => setSelectedTarget(p.number)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all border ${
                    selectedTarget === p.number
                      ? 'bg-gold/15 border-gold/50 text-foreground ring-1 ring-gold/30'
                      : 'border-border/30 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span className="text-lg leading-none">{p.emoji}</span>
                  <span className="font-bold tabular-nums text-[10px]">{p.number}号</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 px-5 py-3 border-t border-border/30">
            <button
              onClick={onDestroy}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              撕毁警徽
            </button>
            <button
              onClick={() => selectedTarget && onTransfer(selectedTarget)}
              disabled={!selectedTarget}
              className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium btn-ritual disabled:opacity-40 disabled:pointer-events-none"
            >
              <Crown className="w-3.5 h-3.5" />
              移交警徽
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={embedded ? 'w-full' : 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-[520px]'}
    >
      <div className={embedded ? '' : 'glass-panel rounded-2xl overflow-hidden border border-gold/30'}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40 bg-gold/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gold/15">
            <Star className="w-5 h-5 text-gold fill-gold" />
          </div>
          <div className="flex-1">
            <h3 className="display-title text-base text-foreground">
              {phase === 'nominate' && '警长竞选 · 上警阶段'}
              {phase === 'speech' && '警长竞选 · 候选人发言'}
              {phase === 'vote' && '警长竞选 · 投票阶段'}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {phase === 'nominate' && '决定是否参与警长竞选'}
              {phase === 'speech' && `${currentSpeaker ? `${currentSpeaker}号正在发言` : '候选人依次发言中'}`}
              {phase === 'vote' && '请为你支持的候选人投票'}
            </p>
          </div>
        </div>

        {/* Candidates display */}
        {(phase === 'speech' || phase === 'vote') && activeCandidates.length > 0 && (
          <div className="px-5 py-3 border-b border-border/30">
            <p className="text-[10px] text-muted-foreground/60 mb-2 font-medium uppercase tracking-wider">
              {phase === 'vote' ? '请选择候选人' : '候选人列表'}
            </p>
            <div className="flex gap-2 flex-wrap">
              {candidates.map(num => {
                const player = players.find(p => p.number === num);
                if (!player) return null;
                const isWithdrawn = withdrawnCandidates.includes(num);
                const isCurrentSpeaker = currentSpeaker === num;
                const isVoteTarget = phase === 'vote' && selectedTarget === num;

                return (
                  <button
                    key={num}
                    disabled={isWithdrawn || phase === 'speech'}
                    onClick={() => phase === 'vote' && !isWithdrawn && setSelectedTarget(num)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${
                      isWithdrawn
                        ? 'opacity-40 line-through border-border/20 text-muted-foreground'
                        : isVoteTarget
                        ? 'bg-gold/15 border-gold/50 text-foreground ring-1 ring-gold/30'
                        : isCurrentSpeaker
                        ? 'bg-alive/10 border-alive/40 text-alive'
                        : 'border-border/40 text-muted-foreground hover:border-gold/30 hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{player.emoji}</span>
                    <span className="font-bold tabular-nums">{num}号</span>
                    <span className="text-[11px]">{player.name}</span>
                    {isWithdrawn && <span className="text-[9px] text-destructive">退水</span>}
                    {isCurrentSpeaker && <span className="text-[9px] text-alive">发言中</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 py-3">
          {phase === 'nominate' && (
            <>
              {isSelfCandidate ? (
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gold/10 text-gold border border-gold/30">
                  <Check className="w-3.5 h-3.5" />
                  已申请上警
                </div>
              ) : (
                <button
                  onClick={onNominate}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium btn-ritual"
                >
                  <Hand className="w-3.5 h-3.5" />
                  上警
                </button>
              )}
            </>
          )}

          {phase === 'speech' && isSelfCandidate && (
            <button
              onClick={onWithdraw}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              退水
            </button>
          )}

          {phase === 'vote' && (
            <button
              onClick={() => selectedTarget && onVote(selectedTarget)}
              disabled={!selectedTarget}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium btn-ritual disabled:opacity-40 disabled:pointer-events-none"
            >
              <Vote className="w-3.5 h-3.5" />
              投票
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SheriffElection;
