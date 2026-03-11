/**
 * MESSAGE QUEUE & HUMAN-LIKE DELAY SYSTEM
 * =========================================
 * Ensures natural messaging patterns:
 * - Random delays between 5-20 seconds for replies
 * - One message per conversation at a time
 * - Campaign messages staggered 10-45 seconds apart
 */

type QueueItem = {
  id: string;
  conversationId: string;
  message: string;
  delay: number;
  callback: (message: string) => void;
  status: 'pending' | 'typing' | 'sending' | 'sent';
};

class MessageQueue {
  private queue: QueueItem[] = [];
  private activeConversations: Set<string> = new Set();
  private listeners: Set<(queue: QueueItem[]) => void> = new Set();

  /** Generate a random delay between min and max seconds */
  static randomDelay(minSec: number = 5, maxSec: number = 20): number {
    return Math.floor(Math.random() * (maxSec - minSec) * 1000) + minSec * 1000;
  }

  /** Subscribe to queue changes */
  subscribe(listener: (queue: QueueItem[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn([...this.queue]));
  }

  /** Schedule a human-like reply with random delay */
  scheduleHumanLikeReply(
    conversationId: string,
    message: string,
    callback: (message: string) => void,
    minDelay: number = 5,
    maxDelay: number = 20
  ): string {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const delay = MessageQueue.randomDelay(minDelay, maxDelay);

    const item: QueueItem = {
      id,
      conversationId,
      message,
      delay,
      callback,
      status: 'pending',
    };

    this.queue.push(item);
    this.notify();
    this.processQueue();
    return id;
  }

  /** Process queue — only one message per conversation at a time */
  private async processQueue() {
    for (const item of this.queue) {
      if (item.status !== 'pending') continue;
      if (this.activeConversations.has(item.conversationId)) continue;

      this.activeConversations.add(item.conversationId);
      item.status = 'typing';
      this.notify();

      // Show typing indicator for 60% of the delay, then send
      const typingDuration = Math.floor(item.delay * 0.6);
      const sendDelay = item.delay - typingDuration;

      await new Promise(r => setTimeout(r, typingDuration));

      item.status = 'sending';
      this.notify();

      await new Promise(r => setTimeout(r, sendDelay));

      item.callback(item.message);
      item.status = 'sent';
      this.activeConversations.delete(item.conversationId);
      this.notify();

      // Clean up sent items
      this.queue = this.queue.filter(q => q.status !== 'sent');
      this.notify();

      // Continue processing
      this.processQueue();
      break;
    }
  }

  /** Check if a conversation currently has a pending/typing message */
  isConversationBusy(conversationId: string): boolean {
    return this.activeConversations.has(conversationId);
  }

  /** Get typing status for a conversation */
  getTypingStatus(conversationId: string): 'typing' | 'sending' | null {
    const item = this.queue.find(
      q => q.conversationId === conversationId && (q.status === 'typing' || q.status === 'sending')
    );
    return item?.status as 'typing' | 'sending' | null;
  }

  /** Cancel a queued message */
  cancel(id: string) {
    this.queue = this.queue.filter(q => q.id !== id);
    this.notify();
  }

  /** Clear all queued messages for a conversation */
  clearConversation(conversationId: string) {
    this.queue = this.queue.filter(q => q.conversationId !== conversationId);
    this.activeConversations.delete(conversationId);
    this.notify();
  }
}

// Singleton instance
export const messageQueue = new MessageQueue();
export { MessageQueue };
export type { QueueItem };
