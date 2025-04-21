
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { usersData, channelsData } from "./chatMockData";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isOnline: boolean;
};

type Channel = {
  id: number;
  name: string;
  description?: string;
  members: number[];
  isUnread: boolean;
  lastActivity: string;
};

interface ChatSidebarProps {
  users: User[];
  channels: Channel[];
  messages: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedChat: string;
  setSelectedChat: (id: string, type: "dm" | "channel") => void;
  showUsersList: boolean;
  setShowUsersList: (b: boolean) => void;
  startDMChat: (userId: number) => void;
  createChannel: (name: string, description: string) => void;
}

export function ChatSidebar({
  users,
  channels,
  messages,
  searchTerm,
  setSearchTerm,
  selectedChat,
  setSelectedChat,
  showUsersList,
  setShowUsersList,
  startDMChat,
  createChannel,
}: ChatSidebarProps) {
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");

  // Assume current user is first one (mock fallback)
  const currentUserId = users[0]?.id ?? 1;

  // Filtered/sorted user/channels
  const filteredUsers = users
    .filter((u) => u.id !== currentUserId && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 border-r flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Messages</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Tabs defaultValue="direct" className="flex-1">
        <TabsList className="w-full grid grid-cols-2 rounded-none">
          <TabsTrigger value="direct">Direct</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        {/* Direct Messages Tab */}
        <TabsContent value="direct" className="flex flex-col h-full mt-0">
          <div className="p-3 border-b flex justify-between items-center">
            <span className="text-sm font-medium">Direct Messages</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowUsersList(!showUsersList)}
            >
              <Plus size={16} />
            </Button>
          </div>
          {showUsersList ? (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={() => startDMChat(u.id)}
                  >
                    <div className="relative">
                      <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full" />
                      {u.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {u.role === "admin" ? "Administrator" : "Student"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {filteredUsers.map((u) => {
                  const dmId = Math.min(currentUserId, u.id) === currentUserId
                    ? `dm_${currentUserId}_${u.id}` 
                    : `dm_${u.id}_${currentUserId}`;
                  const chat = messages[dmId];
                  const lastMessage = chat && chat.length > 0 ? chat[chat.length - 1] : null;
                  const hasUnread = chat ? chat.some((msg: any) => !msg.isRead && msg.senderId !== currentUserId) : false;

                  return (
                    <div
                      key={u.id}
                      className={`flex items-center space-x-3 p-2 ${
                        selectedChat === dmId ? "bg-gray-100" : ""
                      } hover:bg-gray-100 rounded-md cursor-pointer ${
                        hasUnread ? "bg-purple-50" : ""
                      }`}
                      onClick={() => setSelectedChat(dmId, "dm")}
                    >
                      <div className="relative">
                        <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full" />
                        {u.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          {lastMessage && (
                            <p className="text-xs text-muted-foreground">
                              {/* Could use formatTimestamp */}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage 
                            ? lastMessage.senderId === currentUserId 
                              ? `You: ${lastMessage.content}`
                              : lastMessage.content
                            : "No messages yet"
                          }
                        </p>
                      </div>
                      {hasUnread && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        {/* Channels Tab */}
        <TabsContent value="channels" className="flex flex-col h-full mt-0">
          <div className="p-3 border-b flex justify-between items-center">
            <span className="text-sm font-medium">Channels</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Channel</DialogTitle>
                  <DialogDescription>
                    Create a new channel for group discussions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="channel-name" className="text-sm font-medium">
                      Channel Name
                    </label>
                    <Input
                      id="channel-name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. Interview Preparation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="channel-description" className="text-sm font-medium">
                      Description (optional)
                    </label>
                    <Input
                      id="channel-description"
                      value={newChannelDescription}
                      onChange={(e) => setNewChannelDescription(e.target.value)}
                      placeholder="What's this channel about?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      createChannel(newChannelName, newChannelDescription);
                      setNewChannelName("");
                      setNewChannelDescription("");
                    }}
                  >
                    Create Channel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {filteredChannels.map((channel) => {
                const channelId = `channel_${channel.id}`;
                const chat = messages[channelId];
                const lastMessage = chat && chat.length > 0 ? chat[chat.length - 1] : null;
                return (
                  <div
                    key={channel.id}
                    className={`flex items-center space-x-3 p-2 ${
                      selectedChat === channelId ? "bg-gray-100" : ""
                    } hover:bg-gray-100 rounded-md cursor-pointer ${
                      channel.isUnread ? "bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedChat(channelId, "channel")}
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-100 text-purple-700">
                      <Users size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{channel.name}</p>
                        {lastMessage && (
                          <p className="text-xs text-muted-foreground">
                            {/* Could use formatTimestamp */}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessage
                          ? lastMessage.senderId === currentUserId
                            ? `You: ${lastMessage.content}`
                            : `${users.find((u) => u.id === lastMessage.senderId)?.name.split(" ")[0] || "User"}: ${lastMessage.content}`
                          : channel.description || "No messages yet"}
                      </p>
                    </div>
                    {channel.isUnread && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
