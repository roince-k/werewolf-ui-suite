import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Bot, Puzzle, Swords, Shield, Eye, Brain,
  Layers, Users, Cpu, ChevronDown, Sparkles,
  Gamepad2, Theater, Cog
} from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
  }),
};

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const scrollToContent = () => {
    document.getElementById('values')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="bg-background text-foreground">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_hsl(var(--background))_80%)]" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-werewolf/30 bg-werewolf/10 text-werewolf text-xs tracking-widest uppercase font-medium">
              AI-Powered Gaming Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
            className="display-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground text-glow-moonlight leading-[1.1] mb-4"
          >
            荒诞推理<span className="text-werewolf text-glow-werewolf ml-3">Charade</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-moonlight-dim text-base sm:text-lg tracking-[0.15em] uppercase mb-3"
          >
            AI 驱动的下一代社交博弈平台
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed"
          >
            随时开局、自动流程、支持 AI 角色参与。
            <br />
            从狼人杀起步，未来扩展更多社交推理游戏。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button onClick={() => navigate('/auth')} className="btn-ritual text-lg animate-pulse-glow">
              立即开始
            </button>
            <button onClick={scrollToContent} className="btn-ghost-moon text-lg">
              了解更多
            </button>
          </motion.div>
        </motion.div>

        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-moonlight-dim hover:text-moonlight transition-colors"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </motion.button>
      </section>

      {/* ═══════════ CORE VALUES ═══════════ */}
      <section id="values" className="relative py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader label="CORE VALUES" title="平台核心价值" subtitle="无需主持人，无需组织，AI 驱动的全新博弈体验" />
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: <Zap className="w-7 h-7" />, title: '自动化的游戏流程', desc: '无需专职主持人，系统自动推进阶段、结算与提示。房主负责配置与启动，其余流程全部由平台接管。', accent: 'werewolf' as const },
              { icon: <Bot className="w-7 h-7" />, title: 'AI Agent 可作为玩家参与', desc: '支持 AI 角色像真实玩家一样加入游戏：独立身份、独立推理、独立行为决策，与真人玩家共同博弈。', accent: 'moonlight' as const },
              { icon: <Puzzle className="w-7 h-7" />, title: '通用的博弈平台架构', desc: '狼人杀、阿瓦隆、社交推理小游戏。未来将支持更多类型的社交推理与阵营博弈游戏。', accent: 'gold' as const },
            ].map((card, i) => (
              <ValueCard key={card.title} {...card} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CURRENT GAME ═══════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-werewolf/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader label="FEATURED GAME" title="当前游戏：狼人杀" subtitle="从经典玩法开始，体验 AI 驱动的社交推理" />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Swords className="w-6 h-6" />, title: '标准规则自动化', desc: '完整的狼人杀规则引擎，自动推进每个阶段' },
              { icon: <Users className="w-6 h-6" />, title: '多人与 AI 实时参与对局', desc: '真人与 AI 混合参与，随时开局无需等待' },
              { icon: <Shield className="w-6 h-6" />, title: '快速配置，即开即玩', desc: '预设板子配置，一键创建房间立即开始' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={i}
                className="surface-elevated rounded-xl p-5 hover:border-werewolf/30 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-werewolf/10 text-werewolf flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h4 className="text-foreground font-semibold mb-2">{feat.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ROADMAP ═══════════ */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionHeader label="ROADMAP" title="未来扩展" subtitle="更多游戏、更多可能" />
          <div className="mt-16 space-y-6">
            {[
              { icon: <Gamepad2 className="w-6 h-6" />, title: '多类型社交推理游戏', desc: '阿瓦隆、抵抗组织、捉鬼等阵营推理游戏即将登场。', status: 'PLANNED' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'AI 与 AI 的对局', desc: '多个 AI Agent 互相博弈，人类玩家可以参与或旁观。', status: 'EXPLORING' },
              { icon: <Theater className="w-6 h-6" />, title: 'Game Master', desc: '未来引入 AI 主持人，支持流程更自由、规则更复杂的游戏类型。', status: 'FUTURE' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                className="surface-stone rounded-xl p-6 flex gap-5 items-start"
              >
                <div className="w-11 h-11 rounded-lg bg-moonlight/10 text-moonlight flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h4 className="text-foreground font-semibold text-lg">{item.title}</h4>
                    <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-moonlight/20 text-moonlight-dim">{item.status}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TECH HIGHLIGHTS ═══════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--werewolf)/0.06),_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader label="TECHNOLOGY" title="技术亮点" subtitle="为极致体验而设计的底层架构" />
          <div className="mt-16 grid sm:grid-cols-2 gap-5">
            {[
              { icon: <Cog className="w-5 h-5" />, text: '通用博弈规则引擎' },
              { icon: <Brain className="w-5 h-5" />, text: '多 Agent 协作框架' },
              { icon: <Cpu className="w-5 h-5" />, text: '实时状态机驱动的游戏流程' },
              { icon: <Layers className="w-5 h-5" />, text: '可扩展的游戏插件系统' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-center gap-4 px-5 py-4 rounded-lg border border-border/60 bg-surface/50 hover:border-moonlight/30 transition-colors duration-300"
              >
                <div className="text-moonlight">{item.icon}</div>
                <span className="text-foreground text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center px-4"
        >
          <h2 className="display-title text-4xl sm:text-5xl text-foreground text-glow-moonlight mb-4">准备好了吗？</h2>
          <p className="text-muted-foreground mb-8">加入荒诞推理 Charade，开启你的 AI 博弈之旅。</p>
          <button onClick={() => navigate('/auth')} className="btn-ritual text-lg animate-pulse-glow">立即开始</button>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="display-title text-xl text-foreground">荒诞推理<span className="text-werewolf ml-1">Charade</span></span>
            <span className="text-muted-foreground text-xs">AI 社交博弈平台</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">平台介绍</button>
            <button className="hover:text-foreground transition-colors">联系方式</button>
            <button className="hover:text-foreground transition-colors">隐私政策</button>
          </div>
          <p className="text-muted-foreground text-xs">© 2026 Charade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

/* ── Sub-components ── */

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
      className="text-center"
    >
      <span className="text-werewolf text-xs tracking-[0.2em] uppercase font-medium">{label}</span>
      <h2 className="display-title text-3xl sm:text-4xl lg:text-5xl text-foreground mt-3 mb-4">{title}</h2>
      <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">{subtitle}</p>
    </motion.div>
  );
}

function ValueCard({ icon, title, desc, accent, index }: { icon: React.ReactNode; title: string; desc: string; accent: 'werewolf' | 'moonlight' | 'gold'; index: number }) {
  const accentMap = {
    werewolf: { bg: 'bg-werewolf/10', text: 'text-werewolf', border: 'hover:border-werewolf/30' },
    moonlight: { bg: 'bg-moonlight/10', text: 'text-moonlight', border: 'hover:border-moonlight/30' },
    gold: { bg: 'bg-gold/10', text: 'text-gold', border: 'hover:border-gold/30' },
  };
  const a = accentMap[accent];
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} custom={index} className={`surface-elevated rounded-xl p-6 transition-colors duration-300 ${a.border}`}>
      <div className={`w-12 h-12 rounded-xl ${a.bg} ${a.text} flex items-center justify-center mb-5`}>{icon}</div>
      <h3 className="text-foreground font-semibold text-lg mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default Landing;
