import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Skull, Swords, Eye, Heart, Crosshair, Users } from 'lucide-react';

interface RoleInfo {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  faction: 'werewolf' | 'village' | 'god';
  description: string;
  abilities: string[];
  winCondition: string;
  strategies: string[];
}

const ROLES: RoleInfo[] = [
  {
    id: 'werewolf', name: '狼人', nameEn: 'Werewolf', emoji: '🐺', faction: 'werewolf',
    description: '夜晚选择一名玩家击杀，白天隐藏身份混入好人阵营。',
    abilities: ['夜晚击杀一名玩家', '与同伴狼人共同决策', '白天伪装成好人'],
    winCondition: '消灭所有神职或所有平民',
    strategies: ['隐藏 - 低调发言避免被怀疑', '激进 - 主动发言引导投票', '悍跳 - 冒充神职', '倒钩 - 引导好人互相怀疑'],
  },
  {
    id: 'seer', name: '预言家', nameEn: 'Seer', emoji: '🔮', faction: 'god',
    description: '每晚可以查验一名玩家的身份，是好人阵营的核心。',
    abilities: ['每晚查验一名玩家身份', '获知目标是好人还是狼人'],
    winCondition: '消灭所有狼人',
    strategies: ['主动报验 - 第一天公布身份和查验结果', '被动报验 - 隐藏身份等待时机'],
  },
  {
    id: 'witch', name: '女巫', nameEn: 'Witch', emoji: '🧪', faction: 'god',
    description: '拥有一瓶解药和一瓶毒药，可以救人或杀人。',
    abilities: ['解药：救活当晚被杀的玩家', '毒药：毒杀一名玩家', '每种药只能使用一次'],
    winCondition: '消灭所有狼人',
    strategies: ['保守用药 - 谨慎使用药物', '激进用药 - 果断使用毒药'],
  },
  {
    id: 'hunter', name: '猎人', nameEn: 'Hunter', emoji: '🏹', faction: 'god',
    description: '被淘汰时可以开枪带走一名玩家。',
    abilities: ['被淘汰时可开枪带走一人', '被毒杀时不能开枪'],
    winCondition: '消灭所有狼人',
    strategies: ['隐藏 - 隐藏身份等待被杀时反击', '暴露 - 主动暴露身份威慑狼人'],
  },
  {
    id: 'villager', name: '平民', nameEn: 'Villager', emoji: '🧑‍🌾', faction: 'village',
    description: '没有特殊能力，通过发言和投票帮助好人阵营获胜。',
    abilities: ['参与白天讨论', '投票放逐可疑玩家'],
    winCondition: '消灭所有狼人',
    strategies: ['积极发言 - 主动分析局势', '跟随投票 - 跟随可信玩家', '逻辑分析 - 理性推理'],
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
    description: '适合新手入门的经典配置',
    roles: '3狼人 · 1预言家 · 1女巫 · 1猎人 · 3平民',
    details: ['狼人阵营：3人', '神职阵营：预言家、女巫、猎人', '平民阵营：3人', '游戏时长：约20-30分钟'],
  },
  {
    name: '12人标准局',
    description: '更加丰富的策略博弈',
    roles: '4狼人 · 1预言家 · 1女巫 · 1猎人 · 5平民',
    details: ['狼人阵营：4人', '神职阵营：预言家、女巫、猎人', '平民阵营：5人', '游戏时长：约30-50分钟'],
  },
];

const WerewolfGuide = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Game intro */}
        <section>
          <h2 className="display-title text-3xl text-foreground mb-3">🐺 狼人杀</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            狼人杀是一款经典的社交推理游戏。玩家被分为狼人阵营和好人阵营，通过白天讨论投票和夜晚特殊行动，各阵营争取胜利。
            好人需要找出并放逐所有狼人，而狼人则需要在暗中将好人逐一淘汰。
          </p>
        </section>

        {/* Board configs */}
        <section>
          <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" /> 板子配置
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {BOARD_CONFIGS.map(cfg => (
              <div key={cfg.name} className="surface-elevated rounded-xl p-5">
                <h4 className="display-title text-lg text-foreground mb-1">{cfg.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{cfg.description}</p>
                <p className="text-sm text-accent font-medium mb-3">{cfg.roles}</p>
                <ul className="space-y-1">
                  {cfg.details.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-primary">•</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Role cards */}
        <section>
          <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" /> 身份图鉴
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {ROLES.map(r => (
              <motion.button
                key={r.id}
                onClick={() => setSelectedRole(selectedRole === r.id ? null : r.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`card-room text-center py-6 ${
                  selectedRole === r.id ? 'border-primary glow-werewolf' : ''
                }`}
              >
                <span className="text-4xl block mb-3">{r.emoji}</span>
                <h3 className="display-title text-lg text-foreground">{r.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{r.nameEn}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border ${FACTION_COLORS[r.faction]}`}>
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
                        <h2 className="display-title text-2xl text-foreground">{role.name}</h2>
                        <p className="text-sm text-muted-foreground">{role.nameEn}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedRole(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-secondary-foreground mb-6">{role.description}</p>
                  <div className="grid md:grid-cols-3 gap-6">
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
                    <div>
                      <h4 className="text-sm font-medium text-accent mb-2">胜利条件</h4>
                      <p className="text-sm text-muted-foreground">{role.winCondition}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-accent mb-2">策略</h4>
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

        {/* Game rules */}
        <section>
          <h3 className="display-title text-xl text-foreground mb-4 flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent" /> 游戏规则
          </h3>
          <div className="surface-elevated rounded-xl p-6 space-y-3 text-sm text-muted-foreground">
            <p>• 游戏分为 <span className="text-foreground font-medium">夜晚</span> 和 <span className="text-foreground font-medium">白天</span> 两个阶段交替进行</p>
            <p>• 夜晚：狼人选择击杀目标，神职使用技能</p>
            <p>• 白天：所有存活玩家依次发言，讨论后投票放逐一名玩家</p>
            <p>• 狼人全部被放逐 → <span className="text-alive font-medium">好人阵营胜利</span></p>
            <p>• 好人阵营中神职全灭或平民全灭 → <span className="text-destructive font-medium">狼人阵营胜利</span></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WerewolfGuide;
