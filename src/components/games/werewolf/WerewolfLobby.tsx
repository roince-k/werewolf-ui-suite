import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import CreateRoomModal from '@/components/game/CreateRoomModal';

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'waiting', label: '等待中' },
  { key: 'playing', label: '进行中' },
  { key: 'mine', label: '我的' },
] as const;

const WerewolfLobby = () => {
  const navigate = useNavigate();
  const { currentUser, rooms, lobbyUsers, roomFilter, setRoomFilter, joinRoom, joinRoomAsSpectator } = useGameStore();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter(r => {
    if (roomFilter === 'waiting') return r.status === 'waiting';
    if (roomFilter === 'playing') return r.status === 'playing';
    if (roomFilter === 'mine') return r.players.some(p => p.id === currentUser?.id);
    return true;
  }).filter(r => !search || r.name.includes(search));

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
    navigate('/room');
  };

  const handleSpectateRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    joinRoomAsSpectator(roomId);
    navigate('/room');
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left filter sidebar */}
      <aside className="w-56 border-r border-border p-4 flex flex-col gap-6 shrink-0 hidden md:flex">
        <div className="space-y-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setRoomFilter(f.key)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                roomFilter === f.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索房间..."
            className="input-ritual pl-9 text-sm py-2"
          />
        </div>

        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" /> 在线玩家
          </h3>
          <div className="space-y-1">
            {lobbyUsers.map(u => (
              <div key={u} className="flex items-center gap-2 px-2 py-1.5 text-sm text-secondary-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-alive" />
                {u}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Room Grid */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="display-title text-2xl text-foreground">
            房间列表
            <span className="text-sm font-body text-muted-foreground ml-3 tabular-nums">
              {filteredRooms.length} 个房间
            </span>
          </h2>
          <button onClick={() => setShowCreateRoom(true)} className="btn-ritual flex items-center gap-2 text-sm py-2">
            <Plus className="w-4 h-4" /> 创建房间
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="card-room"
              onClick={() => handleJoinRoom(room.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">{room.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  room.status === 'waiting'
                    ? 'bg-alive/10 text-alive'
                    : room.status === 'playing'
                    ? 'bg-gold/10 text-gold'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {room.status === 'waiting' ? '等待中' : room.status === 'playing' ? '进行中' : '已结束'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{room.mode}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-accent tabular-nums">
                  {room.players.length}/{room.maxPlayers} 玩家
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleSpectateRoom(room.id, e)}
                    className="text-[10px] px-2 py-1 rounded-md bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/30 transition-colors flex items-center gap-1"
                    title="观战"
                  >
                    👁️ 观战
                  </button>
                  <div className="flex -space-x-1">
                    {room.players.slice(0, 5).map(p => (
                      <span key={p.id} className="w-6 h-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs">
                        {p.emoji}
                      </span>
                    ))}
                    {room.players.length > 5 && (
                      <span className="w-6 h-6 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-xs text-muted-foreground">
                        +{room.players.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
    </div>
  );
};

export default WerewolfLobby;
