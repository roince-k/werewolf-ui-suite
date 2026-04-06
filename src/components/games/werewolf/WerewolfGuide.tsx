import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Skull, Swords, Eye, Users, Moon, Sun, Star, AlertTriangle, BookOpen, Sparkles } from 'lucide-react';
import { ROLE_DATA, BOARD_CONFIGS, NIGHT_ORDER_SUMMARY, GLOSSARY, FACTION_COLORS, type Faction } from '@/lib/roleData';
import type { Role } from '@/store/gameStore';

const FACTION_ORDER: Faction[] = ['god', 'village', 'wolf', 'neutral'];
const FACTION_LABELS: Record<Faction, string> = {
  god: '🛡️ 神职（好人阵营）',
  village: '👤 平民（好人阵营）',
  wolf: '🐺 狼人阵营',
  neutral: '🎭 中立阵营',
};

const WerewolfGuide = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'rules' | 'flow' | 'glossary'>('roles');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const role = selectedRole ? ROLE_DATA[selectedRole] : null;

  const allRoles = Object.entries(ROLE_DATA) as [Role, typeof ROLE_DATA[Role]][];
  const filteredRoles = showAdvanced ? allRoles : allRoles.filter(([, v]) => !v.isAdvanced);

  const rolesByFaction = FACTION_ORDER.map(faction => ({
    faction,
    label: FACTION_LABELS[faction],
    roles: filteredRoles.filter(([, v]) => v.faction === faction),
  })).filter(g => g.roles.length > 0);

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
        <div className="flex gap-2 border-b border-border/40 pb-1 flex-wrap">
          {([
            { key: 'roles' as const, label: '身份图鉴', icon: <Shield className="w-4 h-4" /> },
            { key: 'rules' as const, label: '游戏规则', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'flow' as const, label: '流程说明', icon: <Swords className="w-4 h-4" /> },
            { key: 'glossary' as const, label: '术语词典', icon: <Sparkles className="w-4 h-4" /> },
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="display-title text-xl text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" /> 板子配置
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    showAdvanced
                      ? 'bg-accent/10 text-accent border-accent/30'
                      : 'text-muted-foreground border-border/40 hover:bg-muted/30'
                  }`}
                >
                  {showAdvanced ? '✓ 显示进阶' : '显示进阶板子'}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {BOARD_CONFIGS.filter(cfg => showAdvanced || !cfg.isAdvanced).map(cfg => (
                  <div key={cfg.name} className="surface-elevated rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="display-title text-lg text-foreground">{cfg.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">{cfg.subtitle}</span>
                      {cfg.isAdvanced && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">进阶</span>
                      )}
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

            {/* Role cards by faction */}
            <section>
              <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" /> 身份图鉴
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  共 {filteredRoles.length} 个角色
                </span>
              </h3>

              {rolesByFaction.map(group => (
                <div key={group.faction} className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    {group.roles.map(([id, r]) => (
                      <motion.button
                        key={id}
                        onClick={() => setSelectedRole(selectedRole === id ? null : id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`card-room text-center py-4 relative ${
                          selectedRole === id ? 'border-primary glow-werewolf' : ''
                        }`}
                      >
                        {r.onlyIn12 && (
                          <span className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                            12人
                          </span>
                        )}
                        {r.isAdvanced && !r.onlyIn12 && (
                          <span className="absolute top-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
                            进阶
                          </span>
                        )}
                        <span className="text-2xl block mb-1.5">{r.emoji}</span>
                        <h3 className="display-title text-sm text-foreground">{r.label}</h3>
                        <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full border ${FACTION_COLORS[r.faction]}`}>
                          {r.factionLabel}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Detail panel */}
              <AnimatePresence>
                {role && selectedRole && (
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
                              <h2 className="display-title text-2xl text-foreground">{role.label}</h2>
                              {role.onlyIn12 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">仅12人局</span>
                              )}
                              {role.isAdvanced && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">进阶角色</span>
                              )}
                            </div>
                            <p className={`text-sm ${FACTION_COLORS[role.faction].split(' ')[0]}`}>{role.factionLabel}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedRole(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-secondary-foreground mb-6">{role.desc}</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {role.abilities && role.abilities.length > 0 && (
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
                        )}
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
                        {role.winCondition && (
                          <div>
                            <h4 className="text-sm font-medium text-accent mb-2">胜利条件</h4>
                            <p className="text-sm text-muted-foreground">{role.winCondition}</p>
                          </div>
                        )}
                        {role.strategies && role.strategies.length > 0 && (
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
                        )}
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
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-alive/20 bg-alive/5 p-4">
                  <h4 className="text-sm font-medium text-alive mb-2">好人阵营获胜</h4>
                  <p className="text-sm text-muted-foreground">放逐所有狼人阵营玩家（包括已加入狼人阵营的野孩子等）</p>
                </div>
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <h4 className="text-sm font-medium text-destructive mb-2">狼人阵营获胜（屠边规则）</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>屠民</strong>：所有平民出局</li>
                    <li>• <strong>屠神</strong>：所有神职角色出局</li>
                    <li>• 存活狼人数 ≥ 存活非狼人数</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <h4 className="text-sm font-medium text-accent mb-2">中立阵营获胜</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 各中立角色有独立获胜条件</li>
                    <li>• 优先级高于好人阵营</li>
                    <li>• 通常劣后于狼人屠边</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 text-[12px] text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span><strong className="text-foreground">狼刀在先</strong>：当同时满足好人和狼人的获胜条件时，视为狼人阵营获胜。</span>
              </div>
            </section>

            {/* Victory priority table */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-accent" /> 胜负判定优先级
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">优先级</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">获胜阵营</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">判定条件</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      { pri: '最高', faction: '狼人阵营', cond: '狼刀在先：同时满足好狼获胜条件时，狼人优先获胜' },
                      { pri: '高', faction: '中立阵营', cond: '第三方达成独立获胜条件' },
                      { pri: '中', faction: '狼人阵营', cond: '屠边：屠民或屠神达成' },
                      { pri: '中', faction: '好人阵营', cond: '放逐所有狼人' },
                      { pri: '低', faction: '好人阵营', cond: '中立阵营获胜条件不满足时的默认胜利' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="py-2 px-3 font-medium">{row.pri}</td>
                        <td className="py-2 px-3">{row.faction}</td>
                        <td className="py-2 px-3">{row.cond}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    <li>• 被狼美人魅惑殉情时 <strong className="text-destructive">不能</strong> 开枪</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">🐧 冰冻/禁锢效果</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 守卫被冰冻 → 无法守护</li>
                    <li>• 狼人被冰冻 → 整个狼队无法刀人</li>
                    <li>• 预言家被冰冻 → 无法查验</li>
                    <li>• 女巫被冰冻 → 无法使用解药/毒药</li>
                    <li>• 猎人不受影响（开枪是被动技能）</li>
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

            {/* Night order quick reference */}
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Moon className="w-5 h-5 text-accent" /> 夜间行动顺序速查表
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">板子名称</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">夜间行动顺序</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {NIGHT_ORDER_SUMMARY.map((row, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="py-2 px-3 font-medium text-foreground">{row.board}</td>
                        <td className="py-2 px-3">{row.order}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <p className="text-[12px] text-muted-foreground">若无玩家死亡，系统宣布"平安夜"。发言从警长左侧/右侧开始。</p>
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
                  <p className="text-[12px] text-muted-foreground">猎人开枪带走的玩家视为与猎人同时死亡。</p>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">💋 狼美人殉情</h4>
                  <p className="text-[12px] text-muted-foreground">狼美人死亡时，当前被魅惑者立即殉情死亡。被魅惑的猎人殉情时无法开枪。</p>
                </div>
                <div className="rounded-lg border border-border/40 p-4">
                  <h4 className="text-sm font-medium text-foreground mb-1.5">💘 情侣殉情</h4>
                  <p className="text-[12px] text-muted-foreground">情侣一方死亡另一方立即殉情。对立阵营情侣与丘比特组成第三方。</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ═══ Tab: 术语词典 ═══ */}
        {activeTab === 'glossary' && (
          <div className="space-y-6">
            <section className="surface-elevated rounded-xl p-6">
              <h3 className="display-title text-lg text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> 狼人杀术语词典
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {GLOSSARY.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border/40 p-3 hover:bg-muted/20 transition-colors">
                    <span className="text-sm font-bold text-foreground">{item.term}</span>
                    <p className="text-[12px] text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default WerewolfGuide;
