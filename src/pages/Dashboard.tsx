import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, ThumbsUp, TrendingUp, Bot } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState } from 'react';

const stats = [
  { label: 'Total Conversations', value: '0', icon: MessageSquare, change: '—' },
  { label: 'New Leads', value: '0', icon: Users, change: '—' },
  { label: 'Messages Today', value: '0', icon: Zap, change: '—' },
  { label: 'AI Responses', value: '0', icon: Bot, change: '—' },
  { label: 'Satisfaction', value: '—', icon: ThumbsUp, change: '—' },
];

export default function Dashboard() {
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your AI receptionist performance</p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-foreground">AI Auto-Reply</span>
          <button onClick={() => setAiEnabled(!aiEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${aiEnabled ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow transition-transform ${aiEnabled ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
          <span className={`text-xs font-medium ${aiEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
            {aiEnabled ? 'Active' : 'Off'}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-glow transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts - empty state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Messages This Week</h3>
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No message data yet
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Conversation Trends</h3>
          <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
            No conversation data yet
          </div>
        </motion.div>
      </div>
    </div>
  );
}
