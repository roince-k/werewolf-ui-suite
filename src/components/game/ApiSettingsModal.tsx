import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const API_CONFIGS: Record<string, { baseUrl: string; models: string[] }> = {
  OPENAI: { baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'] },
  DEEPSEEK: { baseUrl: 'https://api.deepseek.com', models: ['deepseek-chat', 'deepseek-coder'] },
  CLAUDE: { baseUrl: 'https://api.anthropic.com', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  QWEN: { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
  KIMI: { baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  GEMINI: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-1.5-flash', 'gemini-1.5-pro'] },
  LLAMA: { baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'] },
};

const PROVIDER_LABELS: Record<string, string> = {
  OPENAI: 'OpenAI / 兼容接口',
  DEEPSEEK: 'DeepSeek',
  CLAUDE: 'Anthropic Claude',
  QWEN: '阿里通义千问',
  KIMI: '月之暗面 Kimi',
  GEMINI: 'Google Gemini',
  LLAMA: 'Meta Llama (Groq)',
};

const ApiSettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { apiProvider, apiKey, apiModel, setApiSettings } = useGameStore();
  const [provider, setProvider] = useState(apiProvider);
  const [key, setKey] = useState(apiKey);
  const [model, setModel] = useState(apiModel);
  const [baseUrl, setBaseUrl] = useState(API_CONFIGS[apiProvider]?.baseUrl || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState('');

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const config = API_CONFIGS[p];
    if (config) {
      setBaseUrl(config.baseUrl);
      setModel(config.models[0]);
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!key.trim()) {
      setTestResult('error');
      setTestMessage('请先输入 API Key');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) {
        setTestResult('success');
        setTestMessage('连接成功！');
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult('error');
        setTestMessage(`连接失败 (${res.status}): ${data?.error?.message || '未知错误'}`);
      }
    } catch (err: any) {
      setTestResult('error');
      setTestMessage(`网络错误: ${err.message || '无法连接'}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setApiSettings(provider, key, model);
    onClose();
  };

  const config = API_CONFIGS[provider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative glass-panel rounded-xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="display-title text-lg text-foreground">🔑 AI API 设置</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">AI 服务商</label>
            <select
              value={provider}
              onChange={e => handleProviderChange(e.target.value)}
              className="input-ritual text-sm"
            >
              {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">API Base URL</label>
            <input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              className="input-ritual text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">API Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="输入API Key"
                className="input-ritual text-sm flex-1"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">模型名称</label>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="输入模型名称，如 gpt-4o-mini"
              className="input-ritual text-sm"
              list="model-suggestions"
            />
            <datalist id="model-suggestions">
              {config?.models.map(m => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground mt-1">可从建议中选择，或自行输入任意模型名称</p>
          </div>

          {/* Test Connection */}
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {testing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> 测试中...</>
            ) : (
              '🔗 测试连接'
            )}
          </button>

          {testResult && (
            <div className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
              testResult === 'success' 
                ? 'bg-alive/10 text-alive' 
                : 'bg-destructive/10 text-destructive'
            }`}>
              {testResult === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}

          <button onClick={handleSave} className="btn-ritual w-full mt-2 text-sm">
            保存设置
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiSettingsModal;
