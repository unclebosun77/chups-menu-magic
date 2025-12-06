import { cn } from '@/lib/utils';

interface UserMessageProps {
  content: string;
  timestamp: Date;
  isNew?: boolean;
}

const UserMessage = ({ content, timestamp, isNew = false }: UserMessageProps) => {
  return (
    <div 
      className={cn(
        "flex justify-end mb-4 px-4",
        isNew && "animate-scale-in"
      )}
    >
      <div className="max-w-[80%]">
        <div className="bg-gradient-to-r from-purple to-neon-pink text-white px-4 py-3 rounded-2xl rounded-br-md shadow-lg shadow-purple/20">
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-right mt-1 mr-2">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;
