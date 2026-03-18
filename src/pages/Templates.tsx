import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

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
    id: 'werewolf', name: '狼人', nameEn: 'Werewolf', emoji: '🐺',
    faction: 'werewolf',
    description: '夜晚选择一名玩家击杀，白天隐藏身份混入好人阵营。',
    abilities: ['夜晚击杀一名玩家', '与同伴狼人共同决策', '白天伪装成好人'],
    winCondition: '消灭所有神职或所有平民',
    strategies: ['隐藏 - 低调发言避免被怀疑', '激进 - 主动发言引导投票', '悍跳 - 冒充神职', '倒钩 - 引导好人互相怀疑'],
  },
  {
    id: 'seer', name: '预言家', nameEn: 'Seer', emoji: '🔮',
    faction: 'god',
    description: '每晚可以查验一名玩家的身份，是好人阵营的核心。',
    abilities: ['每晚查验一名玩家身份', '获知目标是好人还是狼人'],
    winCondition: '消灭所有狼人',
    strategies: ['主动报验 - 第一天公布身份和查验结果', '被动报验 - 隐藏身份等待时机'],
  },
  {
    id: 'witch', name: '女巫', nameEn: 'Witch', emoji: '🧪',
    faction: 'god',
    description: '拥有一瓶解药和一瓶毒药，可以救人或杀人。',
    abilities: ['解药：救活当晚被杀的玩家', '毒药：毒杀一名玩家', '每种药只能使用一次'],
    winCondition: '消灭所有狼人',
    strategies: ['保守用药 - 谨慎使用药物', '激进用药 - 果断使用毒药'],
  },
  {
    id: 'hunter', name: '猎人', nameEn: 'Hunter', emoji: '🏹',
    faction: 'god',
    description: '被淘汰时可以开枪带走一名玩家。',
    abilities: ['被淘汰时可开枪带走一人', '被毒杀时不能开枪'],
    winCondition: '消灭所有狼人',
    strategies: ['隐藏 - 隐藏身份等待被杀时反击', '暴露 - 主动暴露身份威慑狼人'],
  },
  {
    id: 'villager', name: '平民', nameEn: 'Villager', emoji: '🧑‍🌾',
    faction: 'village',
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

const Templates = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedRole = ROLES.find(r => r.id === selected);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-4 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
        <h1 className="display-title text-xl text-foreground">身份图鉴</h1>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <p className="text-muted-foreground mb-8">
          12人标准局 · 4狼人 · 1预言家 · 1女巫 · 1猎人 · 5平民
        </p>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {ROLES.map((role) => (
            <motion.button
              key={role.id}
              onClick={() => setSelected(selected === role.id ? null : role.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`card-room text-center py-6 ${
                selected === role.id ? 'border-primary glow-werewolf' : ''
              }`}
            >
              <span className="text-4xl block mb-3">{role.emoji}</span>
              <h3 className="display-title text-lg text-foreground">{role.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{role.nameEn}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border ${FACTION_COLORS[role.faction]}`}>
                {role.faction === 'werewolf' ? '狼人阵营' : role.faction === 'god' ? '神职' : '平民'}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedRole && (
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
                    <span className="text-3xl">{selectedRole.emoji}</span>
                    <div>
                      <h2 className="display-title text-2xl text-foreground">{selectedRole.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedRole.nameEn}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-secondary-foreground mb-6">{selectedRole.description}</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-accent mb-2">技能</h4>
                    <ul className="space-y-1.5">
                      {selectedRole.abilities.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-accent mb-2">胜利条件</h4>
                    <p className="text-sm text-muted-foreground">{selectedRole.winCondition}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-accent mb-2">策略</h4>
                    <ul className="space-y-1.5">
                      {selectedRole.strategies.map((s, i) => (
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
      </div>
    </div>
  );
};

export default Templates;
