
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "./chatMockData";

type Message = {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
};

type User = {
  id: number;
  name: string;
  avatar: string;
};

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUserId: number;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({
  messages,
  users,
  currentUserId,
  scrollRef,
}: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const sender = users.find((u) => u.id === message.senderId);
        const isCurrentUser = message.senderId === currentUserId;
        const showAvatar =
          index === 0 ||
          messages[index - 1].senderId !== message.senderId;

        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex ${
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              } max-w-[80%] gap-2`}
            >
              {showAvatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={sender?.avatar} alt={sender?.name} />
                  <AvatarFallback>{sender?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8" />
              )}
              <div>
                {showAvatar && (
                  <div
                    className={`flex items-center mb-1 ${
                      isCurrentUser ? "justify-end" : ""
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {isCurrentUser ? "You" : sender?.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                )}
                <div
                  className={`rounded-lg py-2 px-3 ${
                    isCurrentUser
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
}
