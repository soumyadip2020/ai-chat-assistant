import { useState } from 'react';
import { defaultKnowledgeBase, type KnowledgeBase } from '@/lib/mockData';
import { useAuth } from '@/lib/authContext';
import { Save, Building2, Brain, Key, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type Tab = 'profile' | 'ai' | 'knowledge' | 'integrations';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [aiTone, setAiTone] = useState<string>('friendly');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [kb, setKb] = useState<KnowledgeBase>(defaultKnowledgeBase);

  const [integrations] = useState({
    whatsappProvider: '',
    aiApiKey: '',
    speechApi: '',
    visionApi: '',
  });

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
            <div className="space-y-4 max-w-lg">
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
            </div>
          </>
        )}

        {activeTab === 'knowledge' && (
          <>
            <h3 className="font-semibold text-foreground">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">This information helps the AI generate accurate responses about your business.</p>
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
            <p className="text-sm text-muted-foreground">Connect external services to power your AI receptionist.</p>
            <div className="space-y-4 max-w-lg">
              {[
                { label: 'WhatsApp API Provider', placeholder: 'e.g., Twilio, 360dialog', value: integrations.whatsappProvider },
                { label: 'AI API Key', placeholder: 'Your AI model API key', value: integrations.aiApiKey },
                { label: 'Speech Recognition API', placeholder: 'e.g., OpenAI Whisper key', value: integrations.speechApi },
                { label: 'Vision AI API', placeholder: 'e.g., GPT-4V API key', value: integrations.visionApi },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                  <input defaultValue={field.value}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={field.placeholder} />
                  <p className="text-xs text-muted-foreground mt-1">Not connected yet — placeholder for future integration</p>
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
