import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Brain, MessageSquare, Swords, User, Trash2 } from 'lucide-react';
import { useGameStore, type AgentTemplate } from '@/store/gameStore';

const FIELD_LABELS: { key: keyof Pick<AgentTemplate, 'gameStyle' | 'personality' | 'reasoning' | 'languageStyle'>; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { key: 'gameStyle', label: '游戏风格', icon: <Swords className="w-4 h-4" />, placeholder: '例如：激进型、保守型、平衡型...' },
  { key: 'personality', label: '角色性格', icon: <User className="w-4 h-4" />, placeholder: '例如：冷静理性、热情感性、神秘莫测...' },
  { key: 'reasoning', label: '推理方式', icon: <Brain className="w-4 h-4" />, placeholder: '例如：逻辑推理为主、直觉判断为主...' },
  { key: 'languageStyle', label: '语言风格', icon: <MessageSquare className="w-4 h-4" />, placeholder: '例如：简洁明了、幽默诙谐、文艺优雅...' },
];

const STYLE_COLORS = [
  'from-destructive/20 to-destructive/5 border-destructive/30',
  'from-gold/20 to-gold/5 border-gold/30',
  'from-alive/20 to-alive/5 border-alive/30',
  'from-primary/20 to-primary/5 border-primary/30',
  'from-accent/20 to-accent/5 border-accent/30',
  'from-moonlight/20 to-moonlight/5 border-moonlight/30',
];

const EMOJI_OPTIONS = ['🧠', '🦊', '🎭', '🗡️', '🌙', '👁️', '🔥', '💀', '🌟', '🎲', '🃏', '🐍'];

const WerewolfAgents = () => {
  const { agentTemplates, addAgentTemplate, removeAgentTemplate, selectedAgentId, selectAgent } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected = agentTemplates.find(t => t.id === selectedId);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="display-title text-2xl text-foreground">🤖 智能体模板</h2>
            <p className="text-muted-foreground text-sm mt-1">
              选择 AI 智能体模板，AI 玩家将以该模板的风格进行发言和推理。
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-ritual flex items-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> 创建智能体
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {agentTemplates.map((agent, i) => (
            <motion.button
              key={agent.id}
              onClick={() => setSelectedId(selectedId === agent.id ? null : agent.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`relative card-room text-center py-5 px-3 border transition-all ${
                selectedId === agent.id ? 'border-primary glow-werewolf' : ''
              } ${selectedAgentId === agent.id ? 'ring-2 ring-gold' : ''}`}
            >
              {selectedAgentId === agent.id && (
                <span className="absolute top-2 right-2 text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded-full border border-gold/30">已选</span>
              )}
              <span className="text-4xl block mb-3">{agent.emoji}</span>
              <h3 className="display-title text-base text-foreground truncate">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1 justify-center mt-3">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border bg-gradient-to-r ${STYLE_COLORS[i % STYLE_COLORS.length]}`}>
                  {agent.gameStyle.split('，')[0].slice(0, 6)}
                </span>
              </div>
              {agent.isCustom && (
                <span className="absolute top-2 left-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30">自定义</span>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
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
                    <span className="text-4xl">{selected.emoji}</span>
                    <div>
                      <h2 className="display-title text-2xl text-foreground">{selected.name}</h2>
                      <p className="text-sm text-muted-foreground">{selected.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectAgent(selected.id)}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                        selectedAgentId === selected.id
                          ? 'bg-gold/20 text-gold border-gold/30'
                          : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/30'
                      }`}
                    >
                      {selectedAgentId === selected.id ? '✓ 已选用' : '选用此模板'}
                    </button>
                    {selected.isCustom && (
                      <button
                        onClick={() => { removeAgentTemplate(selected.id); setSelectedId(null); }}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {FIELD_LABELS.map(({ key, label, icon }) => (
                    <div key={key}>
                      <h4 className="text-sm font-medium text-accent mb-2 flex items-center gap-2">{icon} {label}</h4>
                      <p className="text-sm text-secondary-foreground leading-relaxed">{selected[key]}</p>
                    </div>
                  ))}
                </div>

                {selected.prompt && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-accent mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 完整 Prompt
                    </h4>
                    <pre className="text-xs text-muted-foreground bg-background/50 rounded-lg p-4 whitespace-pre-wrap border border-border leading-relaxed">
                      {selected.prompt}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateAgentModal
            onClose={() => setShowCreate(false)}
            onCreate={(agent) => {
              addAgentTemplate(agent);
              setShowCreate(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Create Agent Modal ── */
const CreateAgentModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: (agent: Omit<AgentTemplate, 'id'>) => void }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🧠');
  const [description, setDescription] = useState('');
  const [gameStyle, setGameStyle] = useState('');
  const [personality, setPersonality] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [languageStyle, setLanguageStyle] = useState('');

  const canSave = name.trim() && description.trim() && gameStyle.trim() && personality.trim() && reasoning.trim() && languageStyle.trim();

  const buildPrompt = () =>
    `你是一个狼人杀游戏中的AI玩家，名字叫"${name}"。\n\n【游戏风格】${gameStyle}\n【角色性格】${personality}\n【推理方式】${reasoning}\n【语言风格】${languageStyle}\n\n请始终按照以上风格进行发言、推理和投票。`;

  const handleSave = () => {
    if (!canSave) return;
    onCreate({
      name: name.trim(), emoji, description: description.trim(),
      gameStyle: gameStyle.trim(), personality: personality.trim(),
      reasoning: reasoning.trim(), languageStyle: languageStyle.trim(),
      prompt: buildPrompt(), isCustom: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative glass-panel rounded-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h3 className="display-title text-lg text-foreground">✨ 创建智能体</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">头像</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg border text-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-foreground/30'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">名称</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="智能体名称" className="input-ritual text-sm" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">简要描述</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="一句话描述该智能体风格" className="input-ritual text-sm" />
          </div>
          {FIELD_LABELS.map(({ key, label, icon, placeholder }) => {
            const val = key === 'gameStyle' ? gameStyle : key === 'personality' ? personality : key === 'reasoning' ? reasoning : languageStyle;
            const setter = key === 'gameStyle' ? setGameStyle : key === 'personality' ? setPersonality : key === 'reasoning' ? setReasoning : setLanguageStyle;
            return (
              <div key={key}>
                <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1.5">{icon} {label}</label>
                <textarea value={val} onChange={e => setter(e.target.value)} placeholder={placeholder} rows={2} className="input-ritual text-sm min-h-0 resize-none" />
              </div>
            );
          })}
          <button onClick={handleSave} disabled={!canSave} className="btn-ritual w-full mt-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            保存智能体
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WerewolfAgents;
