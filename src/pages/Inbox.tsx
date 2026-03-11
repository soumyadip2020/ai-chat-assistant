import { useState } from 'react';
import { type Customer, type Message } from '@/lib/mockData';
import { generateAIResponse, flagForHumanSupport } from '@/lib/placeholderFunctions';
import { Send, Mic, Image, Phone, MoreVertical, Search, AlertTriangle, Bot, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Inbox() {
  const [customers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const selected = customers.find(c => c.id === selectedId);
  const currentMessages = selectedId ? (messages[selectedId] || []) : [];

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSend = async () => {
    if (!reply.trim() || !selectedId) return;
    const newMsg: Message = {
      id: `m_${Date.now()}`, conversationId: selectedId,
      sender: 'agent', type: 'text', content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setReply('');
  };

  const handleAIReply = async () => {
    if (!selectedId) return;
    toast.info('Generating AI response...');
    const aiText = await generateAIResponse('', []);
    const aiMsg: Message = {
      id: `m_${Date.now()}`, conversationId: selectedId,
      sender: 'ai', type: 'text', content: aiText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), aiMsg] }));
    toast.success('AI response sent!');
  };

  const handleHandoff = async () => {
    if (!selectedId) return;
    await flagForHumanSupport(selectedId, 'Agent requested handoff');
    toast.warning('Conversation flagged for human support');
  };

  const selectCustomer = (c: Customer) => {
    setSelectedId(c.id);
    setShowMobileChat(true);
  };

  const tagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return 'bg-warning/10 text-warning';
      case 'Lead': return 'bg-primary/10 text-primary';
      default: return 'bg-success/10 text-success';
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Customer list */}
      <div className={`w-full lg:w-80 border-r border-border bg-card flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search conversations..." />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1">Customer conversations will appear here</p>
            </div>
          ) : (
            filteredCustomers.map(c => (
              <button key={c.id} onClick={() => selectCustomer(c)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors text-left ${selectedId === c.id ? 'bg-secondary' : ''}`}>
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{c.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tagColor(c.tag)}`}>{c.tag}</span>
                    {c.unread > 0 && <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        {selected ? (
          <>
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button className="lg:hidden text-muted-foreground" onClick={() => setShowMobileChat(false)}>←</button>
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                  {selected.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleAIReply} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Generate AI reply">
                  <Bot className="w-4 h-4 text-primary" />
                </button>
                <button onClick={handleHandoff} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Flag for human support">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              <AnimatePresence>
                {currentMessages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'customer'
                        ? 'bg-secondary text-secondary-foreground rounded-bl-md'
                        : msg.sender === 'ai'
                        ? 'gradient-primary text-primary-foreground rounded-br-md'
                        : 'bg-primary text-primary-foreground rounded-br-md'
                    }`}>
                      {msg.sender !== 'customer' && (
                        <div className="flex items-center gap-1 mb-1">
                          {msg.sender === 'ai' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          <span className="text-[10px] font-medium opacity-80">{msg.sender === 'ai' ? 'AI' : 'Agent'}</span>
                        </div>
                      )}
                      {msg.type === 'image' ? (
                        <div className="space-y-2">
                          <div className="w-48 h-32 rounded-lg bg-muted overflow-hidden">
                            <img src={msg.content} alt="Shared" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ) : msg.type === 'voice' ? (
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          <div className="flex gap-0.5">
                            {[...Array(20)].map((_, i) => (
                              <div key={i} className="w-0.5 rounded-full bg-current opacity-60"
                                style={{ height: `${8 + Math.random() * 16}px` }} />
                            ))}
                          </div>
                          <span className="text-xs opacity-80">0:15</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <p className="text-[10px] opacity-60 mt-1 text-right">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-3 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </button>
                <input value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Type a message..." />
                <button onClick={handleSend}
                  className="p-2.5 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <MessageSquare className="w-12 h-12 opacity-30" />
            <p className="text-sm">Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
