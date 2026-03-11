export type ConversationStatus = 'new_lead' | 'active' | 'waiting_human' | 'closed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  tag: 'Lead' | 'Customer' | 'VIP';
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  avatar?: string;
  notes: string;
  leadStatus: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
  conversationStatus: ConversationStatus;
  lastInteraction: string;
  email?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'ai' | 'agent';
  type: 'text' | 'voice' | 'image' | 'document';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  targetTags: string[];
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
  recipientCount: number;
  deliveredCount: number;
  maxRecipients: number;
}

export interface KnowledgeBase {
  businessDescription: string;
  faq: string;
  services: string;
  pricing: string;
  policies: string;
  openingHours: string;
}

export const MAX_CAMPAIGN_RECIPIENTS = 100;

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Sarah Johnson', phone: '+1 (555) 234-5678', tag: 'VIP', lastMessage: 'Thank you for the reservation!', lastMessageTime: '2 min ago', unread: 2, notes: 'Regular guest, prefers suite rooms', leadStatus: 'Converted', conversationStatus: 'active', lastInteraction: '2 min ago' },
  { id: '2', name: 'Ahmed Hassan', phone: '+971 50 123 4567', tag: 'Lead', lastMessage: 'Do you have availability for next weekend?', lastMessageTime: '15 min ago', unread: 1, notes: '', leadStatus: 'New', conversationStatus: 'new_lead', lastInteraction: '15 min ago' },
  { id: '3', name: 'Maria Garcia', phone: '+34 612 345 678', tag: 'Customer', lastMessage: 'Can I see the menu please?', lastMessageTime: '1 hr ago', unread: 0, notes: 'Vegetarian preferences', leadStatus: 'Qualified', conversationStatus: 'active', lastInteraction: '1 hr ago' },
  { id: '4', name: 'James Chen', phone: '+86 138 1234 5678', tag: 'Lead', lastMessage: 'What are your prices for a haircut?', lastMessageTime: '2 hrs ago', unread: 3, notes: '', leadStatus: 'Contacted', conversationStatus: 'waiting_human', lastInteraction: '2 hrs ago' },
  { id: '5', name: 'Emily Brown', phone: '+44 7700 900123', tag: 'Customer', lastMessage: 'I need to reschedule my appointment', lastMessageTime: '3 hrs ago', unread: 0, notes: 'Prefers morning slots', leadStatus: 'Converted', conversationStatus: 'closed', lastInteraction: '3 hrs ago' },
  { id: '6', name: 'Omar Khalil', phone: '+966 50 987 6543', tag: 'VIP', lastMessage: 'Is the spa available tomorrow?', lastMessageTime: '5 hrs ago', unread: 1, notes: 'Corporate client, high value', leadStatus: 'Converted', conversationStatus: 'active', lastInteraction: '5 hrs ago' },
  { id: '7', name: 'Lisa Park', phone: '+82 10 9876 5432', tag: 'Lead', lastMessage: 'Hello, I saw your ad on Instagram', lastMessageTime: '1 day ago', unread: 0, notes: '', leadStatus: 'New', conversationStatus: 'new_lead', lastInteraction: '1 day ago' },
  { id: '8', name: 'David Miller', phone: '+1 (555) 876-5432', tag: 'Customer', lastMessage: 'The service was excellent!', lastMessageTime: '1 day ago', unread: 0, notes: 'Left 5-star review', leadStatus: 'Converted', conversationStatus: 'closed', lastInteraction: '1 day ago' },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', conversationId: '1', sender: 'customer', type: 'text', content: 'Hi, I would like to book a suite for December 20-25', timestamp: '10:30 AM', status: 'read' },
    { id: 'm2', conversationId: '1', sender: 'ai', type: 'text', content: 'Hello Sarah! 🌟 Thank you for reaching out. I\'d be happy to help you with a suite reservation for December 20-25. We have our Deluxe Suite and Presidential Suite available. The Deluxe Suite is $350/night and the Presidential Suite is $650/night. Which would you prefer?', timestamp: '10:31 AM', status: 'read' },
    { id: 'm3', conversationId: '1', sender: 'customer', type: 'text', content: 'The Deluxe Suite sounds perfect! Can I also get a late checkout?', timestamp: '10:35 AM', status: 'read' },
    { id: 'm4', conversationId: '1', sender: 'ai', type: 'text', content: 'Absolutely! I\'ve noted your preference for the Deluxe Suite from Dec 20-25 with a late checkout request. Your total would be $1,750 for 5 nights. Shall I proceed with the booking?', timestamp: '10:36 AM', status: 'read' },
    { id: 'm5', conversationId: '1', sender: 'customer', type: 'text', content: 'Yes please! Here\'s a photo of my ID for the reservation', timestamp: '10:40 AM', status: 'read' },
    { id: 'm6', conversationId: '1', sender: 'customer', type: 'image', content: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200', timestamp: '10:40 AM', status: 'read' },
    { id: 'm7', conversationId: '1', sender: 'ai', type: 'text', content: 'Thank you Sarah! I\'ve received your ID. Your reservation is confirmed. You\'ll receive a confirmation email shortly. Is there anything else I can help you with?', timestamp: '10:41 AM', status: 'delivered' },
    { id: 'm8', conversationId: '1', sender: 'customer', type: 'text', content: 'Thank you for the reservation!', timestamp: '10:45 AM', status: 'delivered' },
  ],
  '2': [
    { id: 'm9', conversationId: '2', sender: 'customer', type: 'text', content: 'Hello! Do you have availability for next weekend?', timestamp: '9:15 AM', status: 'read' },
    { id: 'm10', conversationId: '2', sender: 'ai', type: 'text', content: 'Hi Ahmed! Welcome! 😊 Yes, we have several rooms available for next weekend. What type of room are you looking for and how many guests?', timestamp: '9:16 AM', status: 'delivered' },
    { id: 'm11', conversationId: '2', sender: 'customer', type: 'voice', content: '🎤 Voice message (0:15)', timestamp: '9:20 AM', status: 'read' },
    { id: 'm12', conversationId: '2', sender: 'ai', type: 'text', content: 'I heard your voice message! You mentioned you need a room for 2 adults and 1 child. We have our Family Suite which would be perfect - it includes a separate living area and a crib can be arranged. The rate is $280/night. Would you like to see photos?', timestamp: '9:21 AM', status: 'delivered' },
  ],
  '3': [
    { id: 'm13', conversationId: '3', sender: 'customer', type: 'text', content: 'Can I see the menu please?', timestamp: '8:00 AM', status: 'read' },
    { id: 'm14', conversationId: '3', sender: 'ai', type: 'text', content: 'Of course Maria! Here\'s a link to our full menu: menu.restaurant.com. We also have daily specials. Today\'s special is our Mediterranean Grilled Vegetables with Quinoa - perfect for our vegetarian guests! Would you like to make a reservation?', timestamp: '8:01 AM', status: 'read' },
  ],
  '4': [
    { id: 'm15', conversationId: '4', sender: 'customer', type: 'text', content: 'What are your prices for a haircut?', timestamp: '6:00 AM', status: 'read' },
    { id: 'm16', conversationId: '4', sender: 'ai', type: 'text', content: 'Hi James! Here are our haircut prices:\n\n💇 Men\'s Cut: $35\n💇 Women\'s Cut: $55\n💇 Kids Cut: $25\n✨ Cut & Style: $75\n\nWe also offer a 15% discount for first-time customers! Would you like to book an appointment?', timestamp: '6:01 AM', status: 'delivered' },
    { id: 'm17', conversationId: '4', sender: 'customer', type: 'text', content: 'That sounds great! Can I book for tomorrow at 3pm?', timestamp: '6:05 AM', status: 'read' },
    { id: 'm18', conversationId: '4', sender: 'customer', type: 'image', content: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200', timestamp: '6:06 AM', status: 'read' },
    { id: 'm19', conversationId: '4', sender: 'customer', type: 'text', content: 'I want something like this style', timestamp: '6:06 AM', status: 'read' },
  ],
};

export const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'Holiday Season Promo', message: '🎄 Special holiday offer! Get 20% off all bookings from Dec 20 - Jan 5. Use code HOLIDAY20. Book now!', targetTags: ['Customer', 'VIP'], scheduledAt: '2024-12-15T10:00:00', status: 'scheduled', recipientCount: 85, deliveredCount: 0, maxRecipients: 100 },
  { id: 'c2', name: 'New Year Welcome', message: '🎆 Happy New Year! Start 2025 with a fresh look. Book any service and get a complimentary upgrade!', targetTags: ['Lead'], scheduledAt: '2025-01-01T00:00:00', status: 'draft', recipientCount: 42, deliveredCount: 0, maxRecipients: 100 },
  { id: 'c3', name: 'VIP Appreciation', message: '⭐ As a valued VIP guest, enjoy an exclusive 30% discount on your next visit. Valid until end of month.', targetTags: ['VIP'], scheduledAt: '2024-11-01T09:00:00', status: 'completed', recipientCount: 45, deliveredCount: 43, maxRecipients: 100 },
];

export const defaultKnowledgeBase: KnowledgeBase = {
  businessDescription: 'We are a premium luxury hotel and spa resort offering world-class hospitality services.',
  faq: 'Q: What is check-in time?\nA: Check-in is at 3:00 PM, checkout at 11:00 AM.\n\nQ: Do you have parking?\nA: Yes, complimentary valet parking for all guests.\n\nQ: Is breakfast included?\nA: Yes, a full buffet breakfast is included with all room bookings.',
  services: 'Rooms & Suites, Restaurant & Bar, Spa & Wellness, Business Center, Event Spaces, Airport Transfer',
  pricing: 'Standard Room: $200/night\nDeluxe Room: $300/night\nDeluxe Suite: $350/night\nPresidential Suite: $650/night\nSpa Package: from $150',
  policies: 'Free cancellation up to 48 hours before check-in. No smoking in rooms. Pets allowed in designated rooms with $50/night surcharge.',
  openingHours: 'Reception: 24/7\nRestaurant: 6:30 AM - 11:00 PM\nSpa: 8:00 AM - 9:00 PM\nPool: 7:00 AM - 10:00 PM',
};

export const dashboardStats = {
  totalConversations: 1247,
  newLeads: 89,
  messagesToday: 342,
  aiResponsesSent: 298,
  customerSatisfaction: 94.5,
};

export const messagesPerDay = [
  { day: 'Mon', messages: 45, aiReplies: 38 },
  { day: 'Tue', messages: 62, aiReplies: 55 },
  { day: 'Wed', messages: 58, aiReplies: 50 },
  { day: 'Thu', messages: 71, aiReplies: 64 },
  { day: 'Fri', messages: 89, aiReplies: 78 },
  { day: 'Sat', messages: 95, aiReplies: 82 },
  { day: 'Sun', messages: 67, aiReplies: 59 },
];

export const conversationTrends = [
  { month: 'Jul', conversations: 580 },
  { month: 'Aug', conversations: 720 },
  { month: 'Sep', conversations: 850 },
  { month: 'Oct', conversations: 940 },
  { month: 'Nov', conversations: 1100 },
  { month: 'Dec', conversations: 1247 },
];
