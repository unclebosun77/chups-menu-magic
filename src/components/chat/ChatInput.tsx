import { useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Outa anything..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full px-4 py-3 rounded-2xl resize-none",
              "bg-secondary/50 border border-border/50",
              "focus:outline-none focus:ring-2 focus:ring-purple/30 focus:border-purple/50",
              "placeholder:text-muted-foreground/50 text-sm",
              "transition-all disabled:opacity-50"
            )}
          />
        </div>
        
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={cn(
            "h-12 w-12 rounded-full flex-shrink-0 transition-all",
            message.trim() 
              ? "bg-gradient-to-r from-purple to-neon-pink shadow-lg shadow-purple/30"
              : "bg-secondary text-muted-foreground"
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
