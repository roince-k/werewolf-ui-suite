import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Heart, Skull, Crosshair, Moon, Check, X, Droplets,
  FlaskConical, Shield, Ghost, Clock, ChevronLeft, ChevronRight,
  Vote, Ban
} from 'lucide-react';
import type { Player, Role, GamePhase } from '@/store/gameStore';

export interface NightAction {
  type: 'werewolf_kill' | 'seer_check' | 'witch_save' | 'witch_poison' | 'hunter_shoot' | 'guard_protect';
  targetId?: string;
}

interface ActionDrawerProps {
  myRole: Role | null;
  currentPhase: GamePhase;
  players: Player[];
  onAction: (action: NightAction) => void;
  onSkip: () => void;
}

const ROLE_ACTIONS: Record<string, { title: string; icon: React.ReactNode; description: string; actionLabel: string }> = {
  werewolf: {
    title: '狼人行动',
    icon: <Ghost className="w-5 h-5" />,
    description: '选择今晚要袭击的目标',
    actionLabel: '确认击杀',
  },
  white_wolf_king: {
    title: '白狼王行动',
    icon: <Ghost className="w-5 h-5" />,
    description: '选择今晚要袭击的目标',
    actionLabel: '确认击杀',
  },
  seer: {
    title: '预言家查验',
    icon: <Eye className="w-5 h-5" />,
    description: '选择要查验身份的玩家',
    actionLabel: '查验身份',
  },
  witch: {
    title: '女巫用药',
    icon: <FlaskConical className="w-5 h-5" />,
    description: '选择使用解药或毒药',
    actionLabel: '确认用药',
  },
  hunter: {
    title: '猎人待命',
    icon: <Crosshair className="w-5 h-5" />,
    description: '你被淘汰时可开枪带走一人',
    actionLabel: '待命中',
  },
  guard: {
    title: '守卫守护',
    icon: <Shield className="w-5 h-5" />,
    description: '选择今晚要守护的玩家',
    actionLabel: '确认守护',
  },
};

function hasAction(phase: GamePhase, role: Role | null): boolean {
  if (!role) return false;
  switch (phase) {
    case 'night_werewolf':
      return role === 'werewolf' || role === 'white_wolf_king';
    case 'night_seer':
      return role === 'seer';
    case 'night_witch':
      return role === 'witch';
    case 'night_guard':
      return role === 'guard';
    case 'night':
      return ['werewolf', 'white_wolf_king', 'seer', 'witch', 'guard'].includes(role);
    default:
      return false;
  }
}

function isActionablePhase(phase: GamePhase): boolean {
  return phase.startsWith('night') || phase === 'voting' || phase === 'sheriff_election' || phase === 'sheriff_vote';
}

const ActionDrawer = ({ myRole, currentPhase, players, onAction, onSkip }: ActionDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [witchAction, setWitchAction] = useState<'save' | 'poison' | null>(null);

  const actionable = isActionablePhase(currentPhase);
  const myHasAction = hasAction(currentPhase, myRole);

  // Auto-open when entering an actionable phase
  useEffect(() => {
    if (actionable) {
      setIsOpen(true);
      setSelectedTarget(null);
      setWitchAction(null);
    } else {
      setIsOpen(false);
    }
  }, [currentPhase, actionable]);

  const roleKey = myRole === 'white_wolf_king' ? 'white_wolf_king' : myRole;
  const config = roleKey ? ROLE_ACTIONS[roleKey] : null;
  const alivePlayers = players.filter(p => p.status === 'alive');

  const handleConfirm = () => {
    if ((myRole === 'werewolf' || myRole === 'white_wolf_king') && selectedTarget) {
      onAction({ type: 'werewolf_kill', targetId: selectedTarget });
    } else if (myRole === 'seer' && selectedTarget) {
      onAction({ type: 'seer_check', targetId: selectedTarget });
    } else if (myRole === 'witch') {
      if (witchAction === 'save') onAction({ type: 'witch_save' });
      else if (witchAction === 'poison' && selectedTarget) onAction({ type: 'witch_poison', targetId: selectedTarget });
    } else if (myRole === 'guard' && selectedTarget) {
      onAction({ type: 'guard_protect', targetId: selectedTarget });
    }
    setSelectedTarget(null);
    setWitchAction(null);
  };

  const needsTarget = myRole === 'werewolf' || myRole === 'white_wolf_king' || myRole === 'seer' || myRole === 'guard' || (myRole === 'witch' && witchAction === 'poison');
  const canConfirm = myRole === 'hunter' ? false :
    myRole === 'witch' ? (witchAction === 'save' || (witchAction === 'poison' && selectedTarget)) :
    !!selectedTarget;

  // Drawer width matches original panel ~520px but capped
  const DRAWER_W = 360;

  return (
    <>
      {/* Pull tab - always visible on right edge of main content area */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-[300px] top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-6 h-16 rounded-l-lg border border-r-0 border-border/60 transition-all ${
          actionable
            ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30'
            : 'bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground'
        }`}
        title={isOpen ? '收起操作面板' : '展开操作面板'}
      >
        {isOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        {actionable && !isOpen && (
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: DRAWER_W }}
            animate={{ x: 0 }}
            exit={{ x: DRAWER_W }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-12 bottom-0 z-20 flex flex-col border-l border-border/60 bg-card/95 backdrop-blur-md"
            style={{ width: DRAWER_W, right: 300 }}
          >
            {/* Drawer header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
              {actionable ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="display-title text-sm text-foreground">操作面板</span>
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 text-muted-foreground/60" />
                  <span className="display-title text-sm text-muted-foreground">操作面板</span>
                </>
              )}
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto">
              {!actionable ? (
                /* No actionable phase */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Ban className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">当前无可操作的技能或投票</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">等待游戏进入行动阶段...</p>
                </div>
              ) : !myHasAction && currentPhase.startsWith('night') ? (
                /* Night phase but not my turn */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/30 mb-3 animate-pulse" />
                  <p className="text-sm font-medium text-muted-foreground">夜晚进行中</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">请等待其他角色完成行动...</p>
                  <Moon className="w-5 h-5 text-accent/30 mt-4" />
                </div>
              ) : myHasAction && config && myRole !== 'villager' ? (
                /* Active role action */
                <div className="flex flex-col h-full">
                  {/* Role action header */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40 bg-background/30">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="display-title text-base text-foreground">{config.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{config.description}</p>
                    </div>
                    <Moon className="w-4 h-4 text-accent/40" />
                  </div>

                  {/* Witch special: save/poison toggle */}
                  {myRole === 'witch' && (
                    <div className="flex gap-2 px-4 py-3 border-b border-border/30">
                      <button
                        onClick={() => { setWitchAction('save'); setSelectedTarget(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          witchAction === 'save'
                            ? 'bg-alive/15 border-alive/40 text-alive'
                            : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                      >
                        <Droplets className="w-4 h-4" />
                        解药
                      </button>
                      <button
                        onClick={() => { setWitchAction('poison'); setSelectedTarget(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          witchAction === 'poison'
                            ? 'bg-destructive/15 border-destructive/40 text-destructive'
                            : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                      >
                        <Skull className="w-4 h-4" />
                        毒药
                      </button>
                    </div>
                  )}

                  {/* Target selection */}
                  {needsTarget && (
                    <div className="px-4 py-3 flex-1">
                      <p className="text-[10px] text-muted-foreground/60 mb-2 uppercase tracking-wider font-medium">选择目标</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {alivePlayers.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedTarget(p.id)}
                            className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all border ${
                              selectedTarget === p.id
                                ? 'bg-primary/15 border-primary/50 text-foreground ring-1 ring-primary/30'
                                : 'border-border/30 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/30'
                            }`}
                          >
                            <span className="text-lg leading-none">{p.emoji}</span>
                            <span className="font-bold tabular-nums text-[10px]">{p.number}号</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 px-4 py-3 border-t border-border/30 mt-auto shrink-0">
                    <button
                      onClick={onSkip}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground border border-border/40 hover:border-border hover:text-foreground transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      跳过
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!canConfirm}
                      className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium btn-ritual disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {config.actionLabel}
                    </button>
                  </div>
                </div>
              ) : (
                /* Voting or other actionable phase with no specific night action */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Vote className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">投票阶段进行中</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">点击玩家卡牌进行投票</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionDrawer;
