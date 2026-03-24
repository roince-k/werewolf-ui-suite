import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Skull, Crosshair, Moon, Check, X, Droplets, FlaskConical, Shield, Ghost, Clock } from 'lucide-react';
import type { Player, Role, GamePhase } from '@/store/gameStore';

interface NightActionPanelProps {
  myRole: Role | null;
  currentPhase: GamePhase;
  players: Player[];
  onAction: (action: NightAction) => void;
  onSkip: () => void;
  embedded?: boolean;
}

export interface NightAction {
  type: 'werewolf_kill' | 'seer_check' | 'witch_save' | 'witch_poison' | 'hunter_shoot' | 'guard_protect';
  targetId?: string;
}

const ROLE_ACTIONS: Record<string, { title: string; icon: React.ReactNode; description: string; actionLabel: string; color: string }> = {
  werewolf: {
    title: '狼人行动',
    icon: <Ghost className="w-5 h-5" />,
    description: '选择今晚要袭击的目标',
    actionLabel: '确认击杀',
    color: 'destructive',
  },
  white_wolf_king: {
    title: '白狼王行动',
    icon: <Ghost className="w-5 h-5" />,
    description: '选择今晚要袭击的目标',
    actionLabel: '确认击杀',
    color: 'destructive',
  },
  seer: {
    title: '预言家查验',
    icon: <Eye className="w-5 h-5" />,
    description: '选择要查验身份的玩家',
    actionLabel: '查验身份',
    color: 'accent',
  },
  witch: {
    title: '女巫用药',
    icon: <FlaskConical className="w-5 h-5" />,
    description: '选择使用解药或毒药',
    actionLabel: '确认用药',
    color: 'purple-400',
  },
  hunter: {
    title: '猎人待命',
    icon: <Crosshair className="w-5 h-5" />,
    description: '你被淘汰时可开枪带走一人',
    actionLabel: '待命中',
    color: 'gold',
  },
  guard: {
    title: '守卫守护',
    icon: <Shield className="w-5 h-5" />,
    description: '选择今晚要守护的玩家',
    actionLabel: '确认守护',
    color: 'blue-400',
  },
};

// F3: Map phase+role to whether player has an action
function shouldShowAction(phase: GamePhase, role: Role | null): boolean {
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
      // Legacy generic night phase — show action for any actionable role
      return ['werewolf', 'white_wolf_king', 'seer', 'witch', 'guard'].includes(role);
    default:
      return false;
  }
}

const NightActionPanel = ({ myRole, currentPhase, players, onAction, onSkip, embedded }: NightActionPanelProps) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [witchAction, setWitchAction] = useState<'save' | 'poison' | null>(null);

  // F3: Determine if this role has action in this phase
  if (!myRole || !shouldShowAction(currentPhase, myRole)) {
    // Show waiting UI for non-active roles during night
    if (currentPhase.startsWith('night')) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={embedded ? 'w-full' : 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-[520px]'}
        >
          <div className={embedded ? '' : 'glass-panel rounded-2xl overflow-hidden border border-border/60'}>
            <div className="flex items-center gap-3 px-5 py-5 justify-center">
              <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">夜晚进行中</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">请等待其他角色完成行动...</p>
              </div>
              <Moon className="w-4 h-4 text-accent/40" />
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  }

  if (myRole === 'villager') return null;

  const roleKey = myRole === 'white_wolf_king' ? 'white_wolf_king' : myRole;
  const config = ROLE_ACTIONS[roleKey];
  if (!config) return null;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={embedded ? 'w-full' : 'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-[520px]'}
    >
      <div className="glass-panel rounded-2xl overflow-hidden border border-border/60">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40 bg-background/30">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${config.color}/15 text-${config.color}`}>
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
          <div className="flex gap-2 px-5 py-3 border-b border-border/30">
            <button
              onClick={() => { setWitchAction('save'); setSelectedTarget(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                witchAction === 'save'
                  ? 'bg-alive/15 border-alive/40 text-alive'
                  : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Droplets className="w-4 h-4" />
              解药（救人）
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
              毒药（毒人）
            </button>
          </div>
        )}

        {/* Target selection */}
        {needsTarget && (
          <div className="px-5 py-3">
            <p className="text-[10px] text-muted-foreground/60 mb-2 uppercase tracking-wider font-medium">选择目标</p>
            <div className="grid grid-cols-6 gap-1.5">
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
        <div className="flex gap-2 px-5 py-3 border-t border-border/30">
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
    </motion.div>
  );
};

export default NightActionPanel;
