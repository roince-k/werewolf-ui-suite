import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Globe, Monitor, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [volume, setVolume] = useState(70);
  const [language, setLanguage] = useState('zh');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border flex items-center px-4 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </button>
        <h1 className="display-title text-xl text-foreground">设置</h1>
      </header>

      <div className="max-w-lg mx-auto p-6 space-y-8">
        {/* Sound */}
        <section>
          <h3 className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> 音效
          </h3>
          <div className="surface-elevated rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">音量</span>
              <span className="text-sm text-muted-foreground tabular-nums">{volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </section>

        {/* Language */}
        <section>
          <h3 className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> 语言
          </h3>
          <div className="surface-elevated rounded-lg p-4">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="input-ritual text-sm"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>

        {/* Theme */}
        <section>
          <h3 className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4" /> 主题
          </h3>
          <div className="surface-elevated rounded-lg p-4 flex gap-2">
            {[
              { key: 'dark', icon: Moon, label: '暗色' },
              { key: 'light', icon: Sun, label: '亮色' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-all ${
                  theme === t.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="surface-elevated rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-foreground">消息通知</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform ${
                notifications ? 'left-5' : 'left-1'
              }`} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
