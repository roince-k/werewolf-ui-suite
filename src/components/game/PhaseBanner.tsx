import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Swords, Clock, Star, Shield, Bomb } from 'lucide-react';
import type { GamePhase } from '@/store/gameStore';

interface PhaseBannerProps {
  phase: GamePhase;
  playerCount: number;
  totalSeats: number;
}

const PHASE_MESSAGES: Record<string, string[]> = {
  night: ['天黑请闭眼', '狼人请睁眼', '狼人请行动', '预言家请睁眼', '女巫请睁眼'],
  night_werewolf: ['狼人请睁眼', '请选择今晚的猎杀目标'],
  night_seer: ['预言家请睁眼', '请选择要查验的玩家'],
  night_witch: ['女巫请睁眼', '请决定是否使用药物'],
  night_guard: ['守卫请睁眼', '请选择要守护的玩家'],
  day: ['天亮了', '请开始自由讨论', '请发表你的看法'],
  day_discussion: ['自由讨论阶段', '请发表你的看法'],
  day_wolf_explode_available: ['发言阶段', '狼人可以选择自爆'],
  voting: ['投票阶段', '请投出你神圣的一票', '公投审判即将开始'],
  last_words: ['遗言阶段', '请发表你的遗言'],
  sheriff_election: ['警长竞选', '请决定是否上警'],
  sheriff_speech: ['候选人发言', '竞选演说中'],
  sheriff_vote: ['警长投票', '请为候选人投票'],
  waiting: ['等待玩家加入...'],
  ended: ['游戏结束'],
};

const PhaseBanner = ({ phase, playerCount, totalSeats }: PhaseBannerProps) => {
  const messages = PHASE_MESSAGES[phase] || ['等待中...'];

  const getPhaseIcon = () => {
    if (phase.startsWith('night')) return <Moon className="w-5 h-5 text-accent" />;
    if (phase.startsWith('sheriff')) return <Star className="w-5 h-5 text-gold" />;
    switch (phase) {
      case 'day': case 'day_discussion': case 'day_wolf_explode_available': return <Sun className="w-5 h-5 text-gold" />;
      case 'voting': return <Swords className="w-5 h-5 text-primary" />;
      case 'last_words': return <Shield className="w-5 h-5 text-muted-foreground" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPhaseEmoji = () => {
    if (phase.startsWith('night')) return '🌙';
    if (phase.startsWith('sheriff')) return '⭐';
    switch (phase) {
      case 'day': case 'day_discussion': case 'day_wolf_explode_available': return '☀️';
      case 'voting': return '⚔️';
      case 'last_words': return '💀';
      case 'waiting': return '🐺';
      default: return '🏆';
    }
  };

  const getGlowClass = () => {
    if (phase.startsWith('night')) return 'from-accent/5 via-accent/10 to-accent/5 border-accent/20';
    if (phase.startsWith('sheriff')) return 'from-gold/5 via-gold/10 to-gold/5 border-gold/20';
    switch (phase) {
      case 'day': case 'day_discussion': case 'day_wolf_explode_available': return 'from-gold/5 via-gold/10 to-gold/5 border-gold/20';
      case 'voting': return 'from-primary/5 via-primary/10 to-primary/5 border-primary/20';
      default: return 'from-muted/5 via-muted/10 to-muted/5 border-border/30';
    }
  };

  return (
    <div className="w-full py-4 flex items-center justify-center">
      <motion.div
        className={`relative flex items-center gap-4 px-8 py-4 rounded-2xl border bg-gradient-to-r ${getGlowClass()} backdrop-blur-sm`}
        animate={phase !== 'waiting' && phase !== 'ended' ? {
          boxShadow: [
            '0 0 20px hsl(var(--accent) / 0.05)',
            '0 0 40px hsl(var(--accent) / 0.12)',
            '0 0 20px hsl(var(--accent) / 0.05)',
          ],
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hidden sm:block w-12 h-px bg-gradient-to-r from-transparent to-border/60" />

        <motion.span
          className="text-3xl"
          animate={phase.startsWith('night') ? { rotate: [0, -5, 5, 0] } : phase === 'voting' ? { scale: [1, 1.1, 1] } : { y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {getPhaseEmoji()}
        </motion.span>

        <div className="flex flex-col items-center min-w-[180px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              {phase === 'waiting' ? (
                <>
                  <p className="display-title text-lg text-foreground">等待玩家</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{playerCount}/{totalSeats} 已就位</p>
                </>
              ) : (
                <CyclingText messages={messages} phase={phase} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-8 h-8 rounded-full bg-background/50 border border-border/40 flex items-center justify-center">
          {getPhaseIcon()}
        </div>

        <div className="hidden sm:block w-12 h-px bg-gradient-to-l from-transparent to-border/60" />
      </motion.div>
    </div>
  );
};

const CyclingText = ({ messages, phase }: { messages: string[]; phase: string }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [messages]);

  const getTextColor = () => {
    if (phase.startsWith('night')) return 'text-accent';
    if (phase.startsWith('sheriff')) return 'text-gold';
    switch (phase) {
      case 'day': case 'day_discussion': case 'day_wolf_explode_available': return 'text-gold';
      case 'voting': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className={`display-title text-lg tracking-widest ${getTextColor()}`}
      >
        {messages[index]}
      </motion.p>
    </AnimatePresence>
  );
};

export default PhaseBanner;
