import { motion } from 'framer-motion';
import { MessageSquare, Users, Zap, ThumbsUp, Bot, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState } from 'react';
import { dashboardStats, messagesPerDay, conversationTrends } from '@/lib/mockData';

const stats = [
  { label: 'Total Conversations', value: dashboardStats.totalConversations.toLocaleString(), icon: MessageSquare, change: '+12.5%', positive: true },
  { label: 'New Leads', value: dashboardStats.newLeads.toString(), icon: Users, change: '+8.2%', positive: true },
  { label: 'Messages Today', value: dashboardStats.messagesToday.toString(), icon: Zap, change: '+15.3%', positive: true },
  { label: 'AI Responses', value: dashboardStats.aiResponsesSent.toString(), icon: Bot, change: '+22.1%', positive: true },
  { label: 'Satisfaction', value: `${dashboardStats.customerSatisfaction}%`, icon: ThumbsUp, change: '+1.2%', positive: true },
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
            className="bg-card border border-border rounded-xl p-4 hover:shadow-glow transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Messages This Week</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={messagesPerDay} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
              />
              <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="aiReplies" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} name="AI Replies" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Conversation Trends</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={conversationTrends}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              />
              <defs>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="conversations" stroke="hsl(var(--primary))" fill="url(#colorConv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Queue status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">System Status</h3>
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            All systems operational
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Message Queue', value: 'Empty', status: 'Healthy' },
            { label: 'AI Response Time', value: '5-20s', status: 'Human-like delay' },
            { label: 'Campaign Limit', value: '100/campaign', status: 'Enforced' },
            { label: 'Rate Limiter', value: 'Active', status: '1 msg/conv at a time' },
          ].map(item => (
            <div key={item.label} className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs font-medium text-foreground">{item.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.status}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
