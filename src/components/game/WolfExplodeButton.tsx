import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, AlertTriangle, Check, X, Crosshair } from 'lucide-react';
import type { Player, Role } from '@/store/gameStore';
import { WOLF_ROLES } from '@/lib/roleData';

interface WolfExplodeButtonProps {
  myRole: Role | null;
  players: Player[];
  onExplode: (targetNumber?: number) => void;
}

const WolfExplodeButton = ({ myRole, players, onExplode }: WolfExplodeButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

  if (!myRole || !WOLF_ROLES.includes(myRole)) return null;

  const isWhiteWolfKing = myRole === 'white_wolf_king';
  const alivePlayers = players.filter(p => p.status === 'alive');

  const handleExplodeClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (isWhiteWolfKing) {
      setShowConfirm(false);
      setShowTargetPicker(true);
    } else {
      onExplode();
      setShowConfirm(false);
    }
  };

  const handleTargetConfirm = () => {
    onExplode(selectedTarget ?? undefined);
    setShowTargetPicker(false);
    setSelectedTarget(null);
  };

  return (
    <>
      {/* Explode trigger button */}
      <button
        onClick={handleExplodeClick}
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-all"
      >
        <Bomb className="w-4 h-4" />
        自爆
      </button>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowConfirm(false)}
          >
            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="relative glass-panel rounded-2xl p-6 max-w-sm mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="display-title text-lg text-foreground mb-2">确认自爆？</h3>
              <p className="text-sm text-muted-foreground mb-6">
                此操作不可撤销。自爆后你将出局，
                {isWhiteWolfKing ? '并可选择带走一名玩家。' : '当前发言流程将中断。'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
                >
                  <Bomb className="w-3.5 h-3.5" />
                  确认自爆
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* White Wolf King target picker */}
      <AnimatePresence>
        {showTargetPicker && isWhiteWolfKing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowTargetPicker(false)}
          >
            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="relative glass-panel rounded-2xl p-6 max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Crosshair className="w-5 h-5 text-destructive" />
                <div>
                  <h3 className="display-title text-base text-foreground">选择带走目标</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">白狼王自爆可带走一名存活玩家（无遗言）</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {alivePlayers.map(p => (
                  <button
                    key={p.number}
                    onClick={() => setSelectedTarget(p.number)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs transition-all border ${
                      selectedTarget === p.number
                        ? 'bg-destructive/15 border-destructive/50 text-foreground ring-1 ring-destructive/30'
                        : 'border-border/30 text-muted-foreground hover:border-destructive/30 hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-xl leading-none">{p.emoji}</span>
                    <span className="font-bold tabular-nums">{p.number}号</span>
                    <span className="text-[9px] truncate w-full text-center">{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { onExplode(); setShowTargetPicker(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  不带人
                </button>
                <button
                  onClick={handleTargetConfirm}
                  disabled={!selectedTarget}
                  className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:pointer-events-none transition-all"
                >
                  <Bomb className="w-3.5 h-3.5" />
                  确认带走
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WolfExplodeButton;
