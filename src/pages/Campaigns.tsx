import { useState } from 'react';
import { type Campaign, mockCampaigns, MAX_CAMPAIGN_RECIPIENTS } from '@/lib/mockData';
import { sendBulkCampaign } from '@/lib/placeholderFunctions';
import { Plus, Send, Clock, CheckCircle, FileText, Megaphone, AlertCircle, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', message: '', targetTags: [] as string[] });
  const [recipientCount, setRecipientCount] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendProgress, setSendProgress] = useState<{ sent: number; total: number } | null>(null);

  const statusIcon = (s: string) => {
    switch (s) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-warning" />;
      case 'sending': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'sent': return <Send className="w-4 h-4 text-primary" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-success/10 text-success';
      case 'scheduled': return 'bg-warning/10 text-warning';
      case 'sending': return 'bg-primary/10 text-primary';
      case 'sent': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleTag = (tag: string) => {
    setNewCampaign(prev => {
      const newTags = prev.targetTags.includes(tag)
        ? prev.targetTags.filter(t => t !== tag)
        : [...prev.targetTags, tag];

      // Simulate recipient count based on tags
      const estimatedPerTag: Record<string, number> = { Lead: 42, Customer: 35, VIP: 18 };
      const count = newTags.reduce((sum, t) => sum + (estimatedPerTag[t] || 20), 0);
      setRecipientCount(count);

      return { ...prev, targetTags: newTags };
    });
  };

  const isOverLimit = recipientCount > MAX_CAMPAIGN_RECIPIENTS;

  const handleCreate = async () => {
    if (!newCampaign.name || !newCampaign.message || newCampaign.targetTags.length === 0) {
      toast.error('Please fill all fields and select at least one tag');
      return;
    }
    if (isOverLimit) {
      toast.error(`Campaign limit reached. Maximum ${MAX_CAMPAIGN_RECIPIENTS} recipients allowed per campaign.`);
      return;
    }
    const campaign: Campaign = {
      id: `c_${Date.now()}`, name: newCampaign.name, message: newCampaign.message,
      targetTags: newCampaign.targetTags, scheduledAt: new Date().toISOString(),
      status: 'scheduled', recipientCount, deliveredCount: 0,
      maxRecipients: MAX_CAMPAIGN_RECIPIENTS,
    };
    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', message: '', targetTags: [] });
    setRecipientCount(0);
    setShowCreate(false);
    toast.success(`Campaign "${campaign.name}" created with ${recipientCount} recipients`);
  };

  const handleSend = async (campaign: Campaign) => {
    if (campaign.recipientCount > MAX_CAMPAIGN_RECIPIENTS) {
      toast.error(`Cannot send: exceeds ${MAX_CAMPAIGN_RECIPIENTS} recipient limit`);
      return;
    }

    setSendingId(campaign.id);
    setSendProgress({ sent: 0, total: campaign.recipientCount });

    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'sending' as const } : c));

    toast.info(`Sending campaign with staggered delivery (10-45s between messages)...`);

    const phones = Array.from({ length: campaign.recipientCount }, (_, i) => `phone_${i}`);
    const result = await sendBulkCampaign(phones, campaign.message, (sent, total) => {
      setSendProgress({ sent, total });
    });

    setCampaigns(prev => prev.map(c =>
      c.id === campaign.id
        ? { ...c, status: 'completed' as const, deliveredCount: result.sent }
        : c
    ));
    setSendingId(null);
    setSendProgress(null);
    toast.success(`Campaign sent! ${result.sent} delivered, ${result.failed} failed`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Send bulk WhatsApp messages · Max {MAX_CAMPAIGN_RECIPIENTS} recipients per campaign
          </p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />New Campaign
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Create Campaign</h3>
          <input value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Campaign name" />
          <textarea value={newCampaign.message} onChange={e => setNewCampaign(p => ({ ...p, message: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none h-24"
            placeholder="Message content..." />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target audience</label>
            <div className="flex gap-2">
              {['Lead', 'Customer', 'VIP'].map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    newCampaign.targetTags.includes(tag)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input text-muted-foreground hover:bg-secondary'
                  }`}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Recipient count & limit indicator */}
          {newCampaign.targetTags.length > 0 && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              isOverLimit ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-secondary/50'
            }`}>
              <Users className={`w-4 h-4 ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${isOverLimit ? 'text-destructive' : 'text-foreground'}`}>
                  {recipientCount} recipients selected
                </p>
                {isOverLimit && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    Campaign limit reached. Maximum {MAX_CAMPAIGN_RECIPIENTS} recipients allowed per campaign.
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                isOverLimit ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
              }`}>
                {recipientCount}/{MAX_CAMPAIGN_RECIPIENTS}
              </span>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowCreate(false); setRecipientCount(0); }}
              className="px-4 py-2 rounded-lg border border-input text-sm text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={isOverLimit}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${
                isOverLimit ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'gradient-primary text-primary-foreground hover:opacity-90'
              }`}>Create Campaign</button>
          </div>
        </motion.div>
      )}

      {/* Sending progress */}
      {sendProgress && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm font-medium text-foreground">
              Sending... {sendProgress.sent}/{sendProgress.total}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Messages are being sent with staggered delays (10-45s apart) to prevent spam detection
          </p>
        </motion.div>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 && !showCreate ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Megaphone className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No campaigns yet</p>
            <p className="text-xs mt-1">Create your first campaign to reach customers</p>
          </div>
        ) : (
          campaigns.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-glow transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(c.status)}
                  <h3 className="font-medium text-foreground text-sm">{c.name}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{c.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Tags: {c.targetTags.join(', ')}</span>
                  <span>Recipients: {c.recipientCount}/{c.maxRecipients}</span>
                  {c.deliveredCount > 0 && <span className="text-success">Delivered: {c.deliveredCount}</span>}
                </div>
              </div>
              {(c.status === 'scheduled' || c.status === 'draft') && (
                <button onClick={() => handleSend(c)} disabled={sendingId !== null}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-opacity ${
                    sendingId ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'gradient-primary text-primary-foreground hover:opacity-90'
                  }`}>
                  <Send className="w-3 h-3" />Send Now
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
