import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-2 bg-primary/10 rounded-2xl rounded-br-md px-4 py-3 max-w-[75%]">
        <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-xs font-medium text-primary mr-1">AI is typing</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
