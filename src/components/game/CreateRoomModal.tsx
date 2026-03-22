import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

const CreateRoomModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const { joinRoom, setSoloMode } = useGameStore();
  const [name, setName] = useState('');
  const [mode, setMode] = useState('9');
  const [isSolo, setIsSolo] = useState(true);

  const handleCreate = () => {
    if (!name.trim()) return;
    setSoloMode(isSolo);
    joinRoom('1');
    onClose();
    navigate('/room');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="relative glass-panel rounded-xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="display-title text-lg text-foreground">创建房间</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">房间名称</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="输入房间名称" className="input-ritual text-sm" />
          </div>

          {/* Game mode: Solo vs Multiplayer */}
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">游戏模式</label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSolo(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all border ${
                  !isSolo ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4" />
                多人模式
              </button>
              <button
                onClick={() => setIsSolo(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all border ${
                  isSolo ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                单人模式
              </button>
            </div>
            {isSolo && (
              <p className="text-[11px] text-accent/70 mt-1.5">
                🎮 单人模式：无时间限制，可自由思考推理
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">板子类型</label>
            <div className="flex gap-2">
              {[{ k: '9', l: '9人标准局', sub: '预女猎民板' }, { k: '12', l: '12人标准局', sub: '上警·预女猎守板' }].map(m => (
                <button
                  key={m.k}
                  onClick={() => setMode(m.k)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all flex flex-col items-center gap-0.5 ${
                    mode === m.k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{m.l}</span>
                  <span className={`text-[10px] ${mode === m.k ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>{m.sub}</span>
                </button>
              ))}
            </div>
            {mode === '12' && (
              <p className="text-[11px] text-accent/70 mt-1.5">
                ⭐ 12人局包含白狼王、守卫和警长竞选系统
              </p>
            )}
          </div>
          <button onClick={handleCreate} className="btn-ritual w-full text-sm">创建房间</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomModal;
