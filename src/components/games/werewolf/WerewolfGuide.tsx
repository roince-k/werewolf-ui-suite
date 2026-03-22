import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Skull, Swords, Eye, Heart, Crosshair, Users, Moon, Sun, Star, AlertTriangle, BookOpen } from 'lucide-react';

interface RoleInfo {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  faction: 'werewolf' | 'village' | 'god';
  description: string;
  abilities: string[];
  limitations?: string[];
  deathSkill?: string;
  winCondition: string;
  strategies: string[];
  onlyIn12?: boolean;
}

const ROLES: RoleInfo[] = [
  {
    id: 'werewolf', name: '普通狼人', nameEn: 'Werewolf', emoji: '🐺', faction: 'werewolf',
    description: '夜晚与同伴商议选择击杀一名玩家，白天隐藏身份混入好人阵营。',
    abilities: ['每晚与狼队友共同商议，选择击杀一名玩家', '可以自刀（刀自己阵营的队友）', '白天可伪装好人身份', '发言阶段可选择自爆，直接进入黑夜'],
    deathSkill: '无',
    winCondition: '屠民（所有平民出局）或屠神（所有神职出局）',
    strategies: ['隐藏 - 低调发言避免被怀疑', '激进 - 主动发言引导投票', '悍跳 - 冒充预言家上警抢警徽', '倒钩 - 站边真预言家做好身份', '深水 - 隐藏在平民中避免暴露'],
  },
  {
    id: 'white_wolf_king', name: '白狼王', nameEn: 'White Wolf King', emoji: '👑', faction: 'werewolf',
    description: '狼人阵营的强力角色，白天可自爆并带走一名玩家。',
    abilities: ['夜间与普通狼人共同刀人', '白天发言阶段可自爆', '自爆时可选择带走一名存活玩家'],
    limitations: ['被女巫毒杀时不能触发自爆', '被猎人枪击时不能触发自爆'],
    deathSkill: '自爆发动技能时有遗言；被带走的玩家无遗言',
    winCondition: '屠民或屠神',
    strategies: ['关键时刻自爆带走核心神职', '前期隐藏避免暴露白狼王身份', '利用自爆吞警徽打乱好人节奏'],
    onlyIn12: true,
  },
  {
    id: 'seer', name: '预言家', nameEn: 'Seer', emoji: '🔮', faction: 'god',
    description: '每晚可查验一名玩家的阵营身份（好人/狼人），是好人阵营的核心信息源。',
    abilities: ['每晚查验一名玩家的阵营身份', '获知目标是金水（好人）还是查杀（狼人）', '不能查验具体角色，只能查验阵营'],
    winCondition: '放逐所有狼人',
    strategies: ['首日必须上警，起跳预言家身份', '报告查验结果，建立警徽流', '说明警徽流安排（先验X号，再验Y号）', '当选警长后带领好人阵营'],
  },
  {
    id: 'witch', name: '女巫', nameEn: 'Witch', emoji: '🧪', faction: 'god',
    description: '拥有一瓶解药和一瓶毒药，可以救人或杀人，是好人阵营的关键角色。',
    abilities: ['解药：可救活当晚被狼人击杀的玩家', '毒药：可毒杀任意一名玩家', '使用解药前可得知狼刀目标'],
    limitations: ['两瓶药不能在同一晚使用', '仅首夜可自救，之后不能自救', '用掉解药后无法得知狼刀信息'],
    winCondition: '放逐所有狼人',
    strategies: ['保守用药 - 谨慎使用药物', '观察发言判断预言家真假', '关键轮次可起跳带队', '报告银水信息（被救活的玩家）'],
  },
  {
    id: 'hunter', name: '猎人', nameEn: 'Hunter', emoji: '🏹', faction: 'god',
    description: '被淘汰时可以开枪带走一名玩家，是好人阵营的重要威慑。',
    abilities: ['被狼人击杀时可开枪带走一人', '被投票放逐出局时可开枪带走一人'],
    limitations: ['被女巫毒杀时不能开枪', '被白狼王自爆带走时不能开枪'],
    winCondition: '放逐所有狼人',
    strategies: ['隐藏身份避免被优先刀杀', '被出局时准确开枪带走疑似狼人', '避免被毒杀（此时不能开枪）', '选择目标时要准确，避免误伤神职'],
  },
  {
    id: 'guard', name: '守卫', nameEn: 'Guard', emoji: '🛡️', faction: 'god',
    description: '每晚可守护一名玩家（包括自己），被守护的玩家当晚不会被狼刀杀死。',
    abilities: ['每晚可守护一名玩家（包括自己）', '被守护的玩家当晚免受狼刀'],
    limitations: ['不能连续两晚守护同一名玩家', '同守同救：女巫解药+守卫守护同一人=该玩家死亡（奶穿）', '毒药穿透守护：被女巫毒杀时守护无效'],
    winCondition: '放逐所有狼人',
    strategies: ['优先守护预言家或关键神职', '根据局势判断狼人刀法', '后期可守护关键平民追轮次', '隐藏身份避免暴露'],
    onlyIn12: true,
  },
  {
    id: 'villager', name: '平民', nameEn: 'Villager', emoji: '🧑‍🌾', faction: 'village',
    description: '没有特殊技能，通过发言和投票帮助好人阵营获胜。',
    abilities: ['参与白天讨论，分析局势', '投票放逐可疑玩家', '表水清晰，表明好人身份'],
    winCondition: '放逐所有狼人',
    strategies: ['积极发言，认真分析局势', '跟随预言家逻辑投票', '避免分票，集中票型', '表水清晰，表明好人立场'],
  },
];

const FACTION_COLORS = {
  werewolf: 'text-destructive border-destructive/30 bg-destructive/5',
  god: 'text-gold border-gold/30 bg-gold/5',
  village: 'text-alive border-alive/30 bg-alive/5',
};

const BOARD_CONFIGS = [
  {
    name: '9人标准局',
    subtitle: '预女猎民板',
    description: '适合新手入门的经典配置，无守卫无上警',
    roles: '3狼人 · 1预言家 · 1女巫 · 1猎人 · 3平民',
    details: [
      '狼人阵营：普通狼人 ×3',
      '神职阵营：预言家、女巫、猎人',
      '平民阵营：平民 ×3',
      '总人数：9人',
      '游戏时长：约20-30分钟',
      '无警长竞选、无守卫',
    ],
    nightOrder: '狼人 → 预言家 → 女巫',
  },
  {
    name: '12人标准局',
    subtitle: '预女猎守板 · 上警局',
    description: '包含守卫、白狼王和警长系统的完整策略体验',
    roles: '3狼人 + 1白狼王 · 1预言家 · 1女巫 · 1猎人 · 1守卫 · 4平民',
    details: [
      '狼人阵营：普通狼人 ×3 + 白狼王 ×1',
      '神职阵营：预言家、女巫、猎人、守卫',
      '平民阵营：平民 ×4',
      '总人数：12人',
      '游戏时长：约30-50分钟',
      '首日白天进行警长竞选',
    ],
    nightOrder: '守卫 → 狼人 → 预言家 → 女巫',
  },
];

const WerewolfGuide = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'rules' | 'flow'>('roles');
  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Game intro */}
        <section>
          <h2 className="display-title text-3xl text-foreground mb-3">🐺 狼人杀</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            狼人杀是一款经典的社交推理游戏。玩家被分为狼人阵营和好人阵营，通过白天讨论投票和夜晚特殊行动，各阵营争取胜利。
            好人需要找出并放逐所有狼人，而狼人则需要通过屠边（屠民或屠神）取得胜利。
          </p>
        </section>

        {/* Tab navigation */}
        <div className="flex gap-2 border-b border-border/40 pb-1">
          {([
            { key: 'roles' as const, label: '身份图鉴', icon: <Shield className="w-4 h-4" /> },
            { key: 'rules' as const, label: '游戏规则', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'flow' as const, label: '流程说明', icon: <Swords className="w-4 h-4" /> },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.key
                  ? 'text-primary border-primary bg-primary/5'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ Tab: 身份图鉴 ═══ */}
        {activeTab === 'roles' && (
          <>
            {/* Board configs */}
            <section>
              <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> 板子配置
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {BOARD_CONFIGS.map(cfg => (
                  <div key={cfg.name} className="surface-elevated rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="display-title text-lg text-foreground">{cfg.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">{cfg.subtitle}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{cfg.description}</p>
                    <p className="text-sm text-accent font-medium mb-3">{cfg.roles}</p>
                    <ul className="space-y-1 mb-3">
                      {cfg.details.map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span> {d}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 bg-muted/30 px-3 py-2 rounded-lg">
                      <Moon className="w-3.5 h-3.5 text-accent" />
                      <span>夜间行动顺序：{cfg.nightOrder}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Role cards */}
            <section>
              <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" /> 身份图鉴
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                {ROLES.map(r => (
                  <motion.button
                    key={r.id}
                    onClick={() => setSelectedRole(selectedRole === r.id ? null : r.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`card-room text-center py-5 relative ${
                      selectedRole === r.id ? 'border-primary glow-werewolf' : ''
                    }`}
                  >
                    {r.onlyIn12 && (
                      <span className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                        12人
                      </span>
                    )}
                    <span className="text-3xl block mb-2">{r.emoji}</span>
                    <h3 className="display-title text-sm text-foreground">{r.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.nameEn}</p>
                    <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border ${FACTION_COLORS[r.faction]}`}>
                      {r.faction === 'werewolf' ? '狼人阵营' : r.faction === 'god' ? '神职' : '平民'}
                    </span>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {role && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="surface-elevated rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{role.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="display-title text-2xl text-foreground">{role.name}</h2>
                              {role.onlyIn12 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                                  仅12人局
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{role.nameEn}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedRole(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-secondary-foreground mb-6">{role.description}</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div>
                          <h4 className="text-sm font-medium text-accent mb-2">技能</h4>
                          <ul className="space-y-1.5">
                            {role.abilities.map((a, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span> {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {role.limitations && role.limitations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-destructive/80 mb-2">限制</h4>
                            <ul className="space-y-1.5">
                              {role.limitations.map((l, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-destructive/60 mt-0.5">✗</span> {l}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-accent mb-2">胜利条件</h4>
                          <p className="text-sm text-muted-foreground">{role.winCondition}</p>
                          {role.deathSkill && (
                            <>
                              <h4 className="text-sm font-medium text-accent mb-2 mt-3">死亡技能</h4>
                              <p className="text-sm text-muted-foreground">{role.deathSkill}</p>
                            </>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gold mb-2">策略</h4>
                          <ul className="space-y-1.5">
                            {role.strategies.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-gold mt-0.5">◆</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>
        )}

        {/* ═══ Tab: 游戏规则 ═══ */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Victory conditions */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-gold" /> 胜负判定
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-alive/20 bg-alive/5 p-4">
                  <h4 className="text-sm font-medium text-alive mb-2">好人阵营获胜</h4>
                  <p className="text-sm text-muted-foreground">放逐所有狼人阵营玩家</p>
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <h4 className="text-sm font-medium text-destructive mb-2">狼人阵营获胜（屠边规则）</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>屠民</strong>：所有平民出局</li>
                    <li>• <strong>屠神</strong>：所有神职角色出局</li>
                    <li>• 存活狼人数 ≥ 存活非狼人数</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 text-[12px] text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span><strong className="text-foreground">狼刀在先</strong>：当同时满足好人和狼人的获胜条件时，视为狼人阵营获胜。</span>
              </div>
            </section>

            {/* Last words rules */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Skull className="w-5 h-5 text-destructive/70" /> 遗言规则
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">死亡时间</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">死亡原因</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">是否有遗言</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/20">
                      <td className="py-2 px-3">首夜夜晚</td>
                      <td className="py-2 px-3">任意原因</td>
                      <td className="py-2 px-3 text-center text-alive font-medium">有</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-2 px-3">非首夜夜晚</td>
                      <td className="py-2 px-3">任意原因</td>
                      <td className="py-2 px-3 text-center text-destructive font-medium">无</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-2 px-3">白天</td>
                      <td className="py-2 px-3">投票/发言等（除自爆带走）</td>
                      <td className="py-2 px-3 text-center text-alive font-medium">有</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">白天</td>
                      <td className="py-2 px-3">被白狼王自爆带走</td>
                      <td className="py-2 px-3 text-center text-destructive font-medium">无</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Special rules */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gold" /> 特殊规则
              </h3>
              <div className="space-y-4">
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🐺 狼人自爆</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 发言阶段狼人可随时自爆，终止白天流程直接进入夜晚</li>
                    <li>• 自爆狼人有30秒遗言时间</li>
                    <li>• 警长竞选阶段自爆可吞警徽（本局无警长）</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🛡️ 同守同救（12人局）</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 女巫解药 + 守卫守护作用于同一名被狼刀的玩家 → 该玩家死亡（奶穿）</li>
                    <li>• 毒药不受守卫保护影响，直接生效</li>
                    <li>• 守卫不能连续两晚守护同一名玩家</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">⭐ 警长系统（仅12人局）</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 仅首日白天触发警长竞选</li>
                    <li>• 警长拥有1.5票投票权和发言顺序决定权</li>
                    <li>• 警长死亡时可选择移交警徽或撕毁警徽</li>
                    <li>• 平票处理：平票玩家再次发言投票，仍平票则无警长</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🏹 猎人开枪规则</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 被狼人击杀或被投票放逐时可开枪</li>
                    <li>• 被女巫毒杀时 <strong className="text-destructive">不能</strong> 开枪</li>
                    <li>• 被白狼王自爆带走时 <strong className="text-destructive">不能</strong> 开枪</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ═══ Tab: 流程说明 ═══ */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            {/* 9-player flow */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-accent" /> 9人局流程
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { icon: '🎮', label: '游戏开始', desc: '系统分配角色，玩家确认身份' },
                  { icon: '🌙', label: '首夜', desc: '狼人 → 预言家 → 女巫 依次行动' },
                  { icon: '☀️', label: '首日白天', desc: '宣布死讯 + 遗言（首夜死亡有遗言）' },
                  { icon: '💬', label: '发言阶段', desc: '从死者左侧开始，依次发言' },
                  { icon: '⚔️', label: '投票放逐', desc: '所有存活玩家投票，得票最多者出局' },
                  { icon: '📜', label: '出局遗言', desc: '被放逐玩家发表遗言' },
                  { icon: '🏆', label: '判定胜负', desc: '未结束则进入下一夜晚，循环往复' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-xl shrink-0">{step.icon}</span>
                    <div className="w-0.5 h-full bg-border/40 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-[12px] text-muted-foreground">{step.desc}</p>
                    </div>
                    {i < 6 && <span className="ml-auto text-muted-foreground/30 text-lg">↓</span>}
                  </div>
                ))}
              </div>
            </section>

            {/* 12-player flow */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-gold" /> 12人局流程
              </h3>
              <div className="flex flex-col gap-1">
                {[
                  { icon: '🎮', label: '游戏开始', desc: '系统分配角色（含白狼王、守卫）' },
                  { icon: '🌙', label: '首夜', desc: '守卫 → 狼人 → 预言家 → 女巫 依次行动' },
                  { icon: '☀️', label: '首日白天', desc: '宣布死讯 + 遗言' },
                  { icon: '⭐', label: '警长竞选', desc: '上警 → 候选人发言 → 退水 → 投票选警长' },
                  { icon: '💬', label: '发言阶段', desc: '警长决定发言顺序（警左/警右）' },
                  { icon: '⚔️', label: '投票放逐', desc: '警长1.5票，其他玩家1票' },
                  { icon: '📜', label: '出局遗言', desc: '警长出局可移交/撕毁警徽' },
                  { icon: '🏆', label: '判定胜负', desc: '屠民/屠神/狼全灭，未结束则入夜循环' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <span className="text-xl shrink-0">{step.icon}</span>
                    <div className="w-0.5 h-full bg-border/40 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      <p className="text-[12px] text-muted-foreground">{step.desc}</p>
                    </div>
                    {i < 7 && <span className="ml-auto text-muted-foreground/30 text-lg">↓</span>}
                  </div>
                ))}
              </div>
            </section>

            {/* Special scenarios */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gold" /> 特殊场景
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🌙 平安夜</h4>
                  <p className="text-[12px] text-muted-foreground">若无玩家死亡，系统宣布"平安夜"。发言从警长左侧/右侧开始，无警长时系统随机决定。</p>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">💀 多人死亡</h4>
                  <p className="text-[12px] text-muted-foreground">按玩家号码从小到大顺序公布，遗言按公布顺序依次进行。</p>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">👑 白狼王带人</h4>
                  <p className="text-[12px] text-muted-foreground">白狼王自爆时可带走一名玩家。被带走玩家无遗言，白狼王自爆后有遗言（30秒）。</p>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🏹 猎人开枪</h4>
                  <p className="text-[12px] text-muted-foreground">猎人开枪带走的玩家视为与猎人同时死亡。白天死亡被带者有遗言，夜晚死亡仅首夜有遗言。</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default WerewolfGuide;
