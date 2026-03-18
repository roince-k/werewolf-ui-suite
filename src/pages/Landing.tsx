import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          className="text-center"
        >
          {/* Title */}
          <h1 className="display-title text-7xl md:text-8xl lg:text-9xl text-foreground text-glow-moonlight mb-4">
            WEREWOLF
          </h1>
          <p className="text-moonlight-dim text-lg md:text-xl tracking-widest mb-2 uppercase">
            狼 人 杀
          </p>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-12">
            AI驱动的沉浸式狼人杀体验 · ReAct Agent架构
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="btn-ritual text-lg animate-pulse-glow"
            >
              开始游戏
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="btn-ghost-moon text-lg"
            >
              游戏说明
            </button>
          </motion.div>

          {/* Online count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2 text-muted-foreground text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-alive animate-pulse" />
            <Users className="w-4 h-4" />
            <span className="tabular-nums">42</span>
            <span>名玩家在线</span>
          </motion.div>
        </motion.div>

        {/* Bottom decorative text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 display-title text-sm tracking-[0.3em] text-moonlight-dim"
        >
          THE MOON IS FULL · SILENCE THE VILLAGE
        </motion.p>
      </div>
    </div>
  );
};

export default Landing;
