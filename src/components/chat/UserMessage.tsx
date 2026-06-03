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
        <div className="bg-foreground text-background px-4 py-3 rounded-2xl rounded-tr-sm">
          <p className="text-[14px] leading-relaxed">{content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-right mt-1 mr-2">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;
