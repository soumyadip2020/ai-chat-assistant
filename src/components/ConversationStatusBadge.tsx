import { type ConversationStatus } from '@/lib/mockData';
import { Circle, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const statusConfig: Record<ConversationStatus, { label: string; icon: React.ElementType; className: string }> = {
  new_lead: { label: 'New Lead', icon: Circle, className: 'bg-primary/10 text-primary' },
  active: { label: 'Active', icon: MessageCircle, className: 'bg-success/10 text-success' },
  waiting_human: { label: 'Waiting for Human', icon: AlertTriangle, className: 'bg-warning/10 text-warning' },
  closed: { label: 'Closed', icon: CheckCircle2, className: 'bg-muted text-muted-foreground' },
};

interface Props {
  status: ConversationStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export default function ConversationStatusBadge({ status, size = 'sm', showIcon = true }: Props) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.className} ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    }`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      {config.label}
    </span>
  );
}
