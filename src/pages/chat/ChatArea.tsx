
import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageList from "./MessageList";
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
  isOnline?: boolean;
  role?: string;
};

type Channel = {
  id: number;
  name: string;
  description?: string;
  members: number[];
  isUnread: boolean;
  lastActivity: string;
};

interface ChatAreaProps {
  chatType: "dm" | "channel";
  selectedChat: string;
  chatInfo: any;
  users: User[];
  messages: { [k: string]: Message[] };
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  onSend: () => void;
  currentUserId: number;
}

export default function ChatArea({
  chatType,
  selectedChat,
  chatInfo,
  users,
  messages,
  inputMessage,
  setInputMessage,
  onSend,
  currentUserId,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, messages]);

  return selectedChat ? (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {chatType === "dm" ? (
            <>
              <div className="relative">
                <img
                  src={chatInfo.avatar}
                  alt={chatInfo.title}
                  className="rounded-full h-10 w-10"
                />
                {chatInfo.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{chatInfo.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {chatInfo.subtitle}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 text-purple-700">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-medium">{chatInfo.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {chatInfo.subtitle}
                </p>
              </div>
            </>
          )}
        </div>
        {/* Header actions could go here */}
      </div>
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {chatType === "channel" && (
          <div className="text-center p-4">
            <h3 className="font-medium text-lg">{chatInfo.title}</h3>
            <p className="text-muted-foreground mb-2">{chatInfo.description}</p>
            <p className="text-sm text-muted-foreground">
              This is the beginning of the {chatInfo.title} channel
            </p>
          </div>
        )}
        <MessageList
          messages={messages[selectedChat] || []}
          users={users}
          currentUserId={currentUserId}
          scrollRef={messagesEndRef}
        />
      </ScrollArea>
      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
          <Button onClick={onSend}>
            <Send size={16} className="mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Send size={32} className="text-purple-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">Your Messages</h3>
        <p className="text-muted-foreground max-w-sm">
          Select a conversation or start a new one to begin messaging
        </p>
      </div>
    </div>
  );
}
