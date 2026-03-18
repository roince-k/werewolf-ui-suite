import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const Auth = () => {
  const navigate = useNavigate();
  const login = useGameStore(s => s.login);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请填写所有字段');
      return;
    }
    if (tab === 'register' && password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 4) {
      setError('密码至少4个字符');
      return;
    }

    login(username);
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">返回</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <h1 className="display-title text-4xl text-center text-foreground mb-8 text-glow-moonlight">
          WEREWOLF
        </h1>

        {/* Card */}
        <div className="glass-panel rounded-xl p-6">
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-border">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="输入用户名"
                className="input-ritual"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="输入密码"
                  className="input-ritual pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {tab === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm text-muted-foreground mb-1.5">确认密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="input-ritual"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <button type="submit" className="btn-ritual w-full mt-2">
              {tab === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
