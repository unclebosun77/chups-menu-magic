import { Sparkles } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 px-4 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple to-neon-pink flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple/30">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        
        <div className="bg-secondary/80 backdrop-blur-xl border border-border/50 px-4 py-3 rounded-2xl rounded-tl-md">
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full bg-purple animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-purple animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div 
              className="w-2 h-2 rounded-full bg-purple animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
