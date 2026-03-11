import { useState, useEffect, useRef } from 'react';
import { type Customer, type Message, type ConversationStatus, mockCustomers, mockMessages } from '@/lib/mockData';
import { generateAIResponse, flagForHumanSupport, processIncomingMessage } from '@/lib/placeholderFunctions';
import { messageQueue } from '@/lib/messageQueue';
import TypingIndicator from '@/components/TypingIndicator';
import ConversationStatusBadge from '@/components/ConversationStatusBadge';
import { Send, Mic, Image, Phone, MoreVertical, Search, AlertTriangle, Bot, User, MessageSquare, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Inbox() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typingConversations, setTypingConversations] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = customers.find(c => c.id === selectedId);
  const currentMessages = selectedId ? (messages[selectedId] || []) : [];

  const filteredCustomers = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchTag = tagFilter === 'All' || c.tag === tagFilter;
    const matchStatus = statusFilter === 'All' || c.conversationStatus === statusFilter;
    return matchSearch && matchTag && matchStatus;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, typingConversations]);

  // Subscribe to message queue for typing indicators
  useEffect(() => {
    const unsub = messageQueue.subscribe(() => {
      const typing = new Set<string>();
      customers.forEach(c => {
        const status = messageQueue.getTypingStatus(c.id);
        if (status) typing.add(c.id);
      });
      setTypingConversations(typing);
    });
    return () => { unsub(); };
  }, [customers]);

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
    if (messageQueue.isConversationBusy(selectedId)) {
      toast.error('AI is already composing a reply for this conversation');
      return;
    }

    toast.info('AI is generating a response...');
    const history = currentMessages.map(m => ({ role: m.sender, content: m.content }));
    const aiText = await generateAIResponse(
      currentMessages[currentMessages.length - 1]?.content || '',
      history
    );

    // Schedule with human-like delay
    messageQueue.scheduleHumanLikeReply(selectedId, aiText, (message) => {
      const aiMsg: Message = {
        id: `m_${Date.now()}`, conversationId: selectedId,
        sender: 'ai', type: 'text', content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      };
      setMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), aiMsg] }));
      toast.success('AI response sent!');
    });
  };

  const handleHandoff = async () => {
    if (!selectedId) return;
    await flagForHumanSupport(selectedId, 'Agent requested handoff');
    setCustomers(prev => prev.map(c =>
      c.id === selectedId ? { ...c, conversationStatus: 'waiting_human' as ConversationStatus } : c
    ));
    toast.warning('Conversation flagged for human support');
  };

  const handleStatusChange = (status: ConversationStatus) => {
    if (!selectedId) return;
    setCustomers(prev => prev.map(c =>
      c.id === selectedId ? { ...c, conversationStatus: status } : c
    ));
    toast.success(`Status updated to ${status.replace('_', ' ')}`);
  };

  const selectCustomer = (c: Customer) => {
    setSelectedId(c.id);
    setShowMobileChat(true);
    // Clear unread
    setCustomers(prev => prev.map(cu => cu.id === c.id ? { ...cu, unread: 0 } : cu));
  };

  const tagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return 'bg-warning/10 text-warning';
      case 'Lead': return 'bg-primary/10 text-primary';
      default: return 'bg-success/10 text-success';
    }
  };

  const msgTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      case 'document': return <FileText className="w-3 h-3" />;
      default: return null;
    }
  };

  const totalUnread = customers.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Customer list */}
      <div className={`w-full lg:w-80 border-r border-border bg-card flex flex-col ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search conversations..." />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['All', 'Lead', 'Customer', 'VIP'].map(tag => (
              <button key={tag} onClick={() => setTagFilter(tag)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  tagFilter === tag ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}>{tag}</button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {[
              { value: 'All', label: 'All Status' },
              { value: 'new_lead', label: 'New Lead' },
              { value: 'active', label: 'Active' },
              { value: 'waiting_human', label: 'Waiting' },
              { value: 'closed', label: 'Closed' },
            ].map(s => (
              <button key={s.value} onClick={() => setStatusFilter(s.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  statusFilter === s.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}>{s.label}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No conversations found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredCustomers.map(c => (
              <button key={c.id} onClick={() => selectCustomer(c)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors text-left ${selectedId === c.id ? 'bg-secondary' : ''}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {c.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {c.conversationStatus === 'active' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{c.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {msgTypeIcon(mockMessages[c.id]?.[mockMessages[c.id]?.length - 1]?.type || 'text')}
                    <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tagColor(c.tag)}`}>{c.tag}</span>
                    <ConversationStatusBadge status={c.conversationStatus} />
                    {c.unread > 0 && (
                      <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        {totalUnread > 0 && (
          <div className="p-3 border-t border-border bg-primary/5 text-center">
            <span className="text-xs font-medium text-primary">{totalUnread} unread messages</span>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
        {selected ? (
          <>
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button className="lg:hidden text-muted-foreground" onClick={() => setShowMobileChat(false)}>←</button>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                    {selected.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {selected.conversationStatus === 'active' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{selected.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{selected.phone}</p>
                    <ConversationStatusBadge status={selected.conversationStatus} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Status change dropdown */}
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Change status">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 hidden group-hover:block min-w-[160px]">
                    {(['new_lead', 'active', 'waiting_human', 'closed'] as ConversationStatus[]).map(s => (
                      <button key={s} onClick={() => handleStatusChange(s)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg">
                        <ConversationStatusBadge status={s} size="md" />
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAIReply} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Generate AI reply">
                  <Bot className="w-4 h-4 text-primary" />
                </button>
                <button onClick={handleHandoff} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Flag for human support">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
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
                          <span className="text-[10px] font-medium opacity-80">{msg.sender === 'ai' ? 'AI Assistant' : 'Agent'}</span>
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
                          <Mic className="w-4 h-4 flex-shrink-0" />
                          <div className="flex gap-0.5">
                            {[...Array(20)].map((_, i) => (
                              <div key={i} className="w-0.5 rounded-full bg-current opacity-60"
                                style={{ height: `${8 + Math.random() * 16}px` }} />
                            ))}
                          </div>
                          <span className="text-xs opacity-80">0:15</span>
                        </div>
                      ) : msg.type === 'document' ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{msg.content}</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {msgTypeIcon(msg.type)}
                        <p className="text-[10px] opacity-60">{msg.timestamp}</p>
                        {msg.sender !== 'customer' && (
                          <span className="text-[10px] opacity-50">
                            {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {selectedId && typingConversations.has(selectedId) && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Send image">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Send voice">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors" title="Send document">
                  <FileText className="w-4 h-4 text-muted-foreground" />
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
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary opacity-60" />
            </div>
            <p className="text-sm font-medium">Select a conversation to start</p>
            <p className="text-xs">Choose from {customers.length} conversations</p>
          </div>
        )}
      </div>
    </div>
  );
}
