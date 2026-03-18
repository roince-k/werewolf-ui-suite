import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const NoteDrawer = ({ onClose }: { onClose: () => void }) => {
  const { notes, setNotes } = useGameStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-void/50" />
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="absolute left-0 top-12 bottom-0 w-72 glass-panel border-r border-border p-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="display-title text-lg text-foreground">📝 笔记</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="记录你的推理和怀疑对象..."
          className="flex-1 input-ritual text-sm resize-none"
        />
      </motion.div>
    </motion.div>
  );
};

export default NoteDrawer;
