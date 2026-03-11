import { useState } from 'react';
import { type Customer } from '@/lib/mockData';
import { Search, Filter, ChevronDown, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Customers() {
  const [customers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('All');

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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No customers yet</p>
            <p className="text-xs mt-1">Customers will appear here as conversations come in</p>
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
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Last Message</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${tagColor(c.tag)}`}>{c.tag}</span>
                    </td>
                    <td className={`px-4 py-3 font-medium hidden md:table-cell ${statusColor(c.leadStatus)}`}>{c.leadStatus}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate hidden lg:table-cell">{c.lastMessage}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate hidden lg:table-cell">{c.notes || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
