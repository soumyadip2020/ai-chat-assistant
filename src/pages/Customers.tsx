import { useState } from 'react';
import { type Customer, mockCustomers } from '@/lib/mockData';
import ConversationStatusBadge from '@/components/ConversationStatusBadge';
import { Search, Filter, ChevronDown, Users, X, Edit3, Save, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTag = tagFilter === 'All' || c.tag === tagFilter;
    return matchSearch && matchTag;
  });

  const tagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return 'bg-warning/10 text-warning';
      case 'Lead': return 'bg-primary/10 text-primary';
      default: return 'bg-success/10 text-success';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Converted': return 'text-success';
      case 'Qualified': return 'text-primary';
      case 'Lost': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleTagChange = (customerId: string, newTag: Customer['tag']) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, tag: newTag } : c));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => prev ? { ...prev, tag: newTag } : null);
    }
    toast.success(`Tag updated to ${newTag}`);
  };

  const handleSaveNotes = (customerId: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes: editNotes } : c));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => prev ? { ...prev, notes: editNotes } : null);
    }
    setEditingNotes(false);
    toast.success('Notes saved');
  };

  const handleLeadStatusChange = (customerId: string, status: Customer['leadStatus']) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, leadStatus: status } : c));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(prev => prev ? { ...prev, leadStatus: status } : null);
    }
    toast.success(`Lead status updated to ${status}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search customers..." />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border border-input bg-card text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
            <option>All</option>
            <option>Lead</option>
            <option>Customer</option>
            <option>VIP</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={`bg-card border border-border rounded-xl overflow-hidden ${selectedCustomer ? 'flex-1' : 'w-full'}`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No customers found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Customer</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Phone</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Tag</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Status</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      onClick={() => { setSelectedCustomer(c); setEditingNotes(false); }}
                      className={`border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${
                        selectedCustomer?.id === c.id ? 'bg-secondary/70' : ''
                      }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0">
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{c.name}</span>
                            <ConversationStatusBadge status={c.conversationStatus} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tagColor(c.tag)}`}>{c.tag}</span>
                      </td>
                      <td className={`px-4 py-3 font-medium hidden md:table-cell ${statusColor(c.leadStatus)}`}>{c.leadStatus}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{c.lastInteraction}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer detail panel */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="bg-card border border-border rounded-xl overflow-hidden flex-shrink-0 hidden lg:block"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-sm">Customer Details</h3>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-auto max-h-[calc(100vh-12rem)]">
                {/* Header */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg mx-auto">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="font-semibold text-foreground mt-2">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                  <div className="flex justify-center mt-2">
                    <ConversationStatusBadge status={selectedCustomer.conversationStatus} size="md" />
                  </div>
                </div>

                {/* Quick tag */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tag</label>
                  <div className="flex gap-1.5">
                    {(['Lead', 'Customer', 'VIP'] as const).map(tag => (
                      <button key={tag} onClick={() => handleTagChange(selectedCustomer.id, tag)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedCustomer.tag === tag
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}>{tag}</button>
                    ))}
                  </div>
                </div>

                {/* Lead status */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lead Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] as const).map(status => (
                      <button key={status} onClick={() => handleLeadStatusChange(selectedCustomer.id, status)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          selectedCustomer.leadStatus === status
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}>{status}</button>
                    ))}
                  </div>
                </div>

                {/* Last interaction */}
                <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Last Interaction</p>
                    <p className="text-[11px] text-muted-foreground">{selectedCustomer.lastInteraction}</p>
                  </div>
                </div>

                {/* Last message */}
                <div className="flex items-start gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Last Message</p>
                    <p className="text-[11px] text-muted-foreground">{selectedCustomer.lastMessage}</p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Notes</label>
                    {!editingNotes ? (
                      <button onClick={() => { setEditingNotes(true); setEditNotes(selectedCustomer.notes); }}
                        className="p-1 hover:bg-secondary rounded-md transition-colors">
                        <Edit3 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    ) : (
                      <button onClick={() => handleSaveNotes(selectedCustomer.id)}
                        className="p-1 hover:bg-secondary rounded-md transition-colors">
                        <Save className="w-3 h-3 text-primary" />
                      </button>
                    )}
                  </div>
                  {editingNotes ? (
                    <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
                      placeholder="Add notes about this customer..."
                      autoFocus />
                  ) : (
                    <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2.5 min-h-[40px]">
                      {selectedCustomer.notes || 'No notes yet'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
