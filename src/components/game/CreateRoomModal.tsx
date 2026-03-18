import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

const CreateRoomModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const { joinRoom } = useGameStore();
  const [name, setName] = useState('');
  const [mode, setMode] = useState('9');

  const handleCreate = () => {
    if (!name.trim()) return;
    // Mock: just join the first room
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
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">板子类型</label>
            <div className="flex gap-2">
              {[{ k: '9', l: '9人标准局' }, { k: '12', l: '12人标准局' }].map(m => (
                <button
                  key={m.k}
                  onClick={() => setMode(m.k)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    mode === m.k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m.l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreate} className="btn-ritual w-full text-sm">创建房间</button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRoomModal;
