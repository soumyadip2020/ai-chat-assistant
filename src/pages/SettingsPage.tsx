import { useState } from 'react';
import { defaultKnowledgeBase, type KnowledgeBase } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';
import { Save, Building2, Brain, Key, BookOpen, MessageSquare, Eye, Mic, Camera, Shield, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Tab = 'profile' | 'ai' | 'knowledge' | 'integrations';

interface IntegrationCard {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  detail: string;
  placeholder: string;
  connected: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [aiTone, setAiTone] = useState<string>('friendly');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [responseDelayMin, setResponseDelayMin] = useState(5);
  const [responseDelayMax, setResponseDelayMax] = useState(20);
  const [kb, setKb] = useState<KnowledgeBase>(defaultKnowledgeBase);

  const integrations: IntegrationCard[] = [
    {
      id: 'whatsapp', name: 'WhatsApp Business API', icon: MessageSquare,
      description: 'Connect your WhatsApp Business account to send and receive messages automatically.',
      detail: 'Supports Twilio, 360dialog, and official WhatsApp Cloud API. Enables two-way messaging, media sharing, and message templates.',
      placeholder: 'API Key or Provider URL', connected: false,
    },
    {
      id: 'ai', name: 'AI Language Model', icon: Brain,
      description: 'Power the AI receptionist with advanced language understanding and generation.',
      detail: 'Compatible with OpenAI GPT, Anthropic Claude, Google Gemini, and other LLM providers. Handles context-aware conversations and intent recognition.',
      placeholder: 'API Key (e.g., sk-...)', connected: false,
    },
    {
      id: 'speech', name: 'Speech-to-Text API', icon: Mic,
      description: 'Transcribe voice messages from customers into text for AI processing.',
      detail: 'Supports OpenAI Whisper, Google Speech-to-Text, and Azure Speech Services. Enables automatic transcription of voice messages received via WhatsApp.',
      placeholder: 'API Key', connected: false,
    },
    {
      id: 'vision', name: 'Vision AI API', icon: Camera,
      description: 'Analyze images sent by customers — IDs, documents, style references, and more.',
      detail: 'Compatible with GPT-4V, Google Vision AI, and Azure Computer Vision. Automatically describes image content and extracts relevant information for the AI.',
      placeholder: 'API Key', connected: false,
    },
  ];

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'integrations', label: 'Integrations', icon: Key },
  ];

  const handleSave = () => toast.success('Settings saved successfully!');

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-5 space-y-5">

        {activeTab === 'profile' && (
          <>
            <h3 className="font-semibold text-foreground">Business Profile</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Business Name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input value={user?.email || ''} disabled
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-muted text-muted-foreground text-sm" />
              </div>
            </div>
          </>
        )}

        {activeTab === 'ai' && (
          <>
            <h3 className="font-semibold text-foreground">AI Configuration</h3>
            <div className="space-y-5 max-w-lg">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">AI Auto-Reply</p>
                  <p className="text-xs text-muted-foreground">Automatically respond to incoming messages</p>
                </div>
                <button onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${aiEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">AI Tone</label>
                <div className="flex gap-2">
                  {['formal', 'friendly', 'luxury'].map(tone => (
                    <button key={tone} onClick={() => setAiTone(tone)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                        aiTone === tone ? 'bg-primary text-primary-foreground border-primary' : 'border-input text-muted-foreground hover:bg-secondary'
                      }`}>{tone}</button>
                  ))}
                </div>
              </div>

              {/* Response delay settings */}
              <div className="p-4 bg-secondary rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Human-Like Response Delay</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI replies are delayed by a random interval to simulate natural human response times.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Min delay (seconds)</label>
                    <input type="number" value={responseDelayMin} onChange={e => setResponseDelayMin(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      min={1} max={60} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Max delay (seconds)</label>
                    <input type="number" value={responseDelayMax} onChange={e => setResponseDelayMax(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      min={1} max={120} />
                  </div>
                </div>
              </div>

              {/* Safety features */}
              <div className="p-4 bg-secondary rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Rate Safety System</p>
                </div>
                <div className="space-y-1.5">
                  {[
                    'Only auto-replies to incoming customer messages',
                    'One message per conversation processed at a time',
                    'Messages queued and spaced naturally',
                    'Campaign limit: 100 recipients per campaign',
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-success flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'knowledge' && (
          <>
            <h3 className="font-semibold text-foreground">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">This information helps the AI generate accurate, context-aware responses about your business.</p>
            <div className="space-y-4">
              {(Object.keys(kb) as (keyof KnowledgeBase)[]).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <textarea value={kb[key]} onChange={e => setKb(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24" />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'integrations' && (
          <>
            <h3 className="font-semibold text-foreground">API Integrations</h3>
            <p className="text-sm text-muted-foreground">Connect external services to power your AI receptionist. All integrations are placeholder-ready.</p>
            <div className="space-y-4">
              {integrations.map(integration => (
                <div key={integration.id} className="border border-border rounded-xl p-4 hover:shadow-glow transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <integration.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          integration.connected ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
                      <p className="text-[11px] text-muted-foreground/70 mb-3">{integration.detail}</p>
                      <input
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder={integration.placeholder}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pt-2">
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" />Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
