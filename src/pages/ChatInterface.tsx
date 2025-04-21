
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Send, User, Users, Plus, Filter, ChevronDown, ChevronUp, Menu, PenSquare, MessageSquare } from "lucide-react";

// Mock users
const usersData = [
  {
    id: 1,
    name: "John Student",
    email: "student@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=John+Student&background=8B5CF6&color=fff",
    isOnline: true
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6E59A5&color=fff",
    isOnline: true
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=EF4444&color=fff",
    isOnline: false
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=10B981&color=fff",
    isOnline: true
  },
  {
    id: 5,
    name: "Placement Coordinator",
    email: "coordinator@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Placement+Coordinator&background=0D8ABC&color=fff",
    isOnline: true
  }
];

// Mock channels
const channelsData = [
  {
    id: 1,
    name: "Placement Updates",
    description: "Official announcements and updates about placements",
    members: [1, 2, 3, 4, 5],
    isUnread: true,
    lastActivity: "2025-04-19T15:30:00"
  },
  {
    id: 2,
    name: "Technical Interview Prep",
    description: "Discuss technical interview questions and preparation strategies",
    members: [1, 3, 4],
    isUnread: false,
    lastActivity: "2025-04-18T12:45:00"
  },
  {
    id: 3,
    name: "Resume Feedback",
    description: "Get feedback on your resume from peers and placement officers",
    members: [1, 2, 5],
    isUnread: true,
    lastActivity: "2025-04-17T09:20:00"
  }
];

// Mock messages for different chats
const messagesData: { [key: string]: any[] } = {
  // Direct messages
  "dm_1_2": [
    {
      id: 1,
      senderId: 2,
      content: "Hello John, how is your placement preparation going?",
      timestamp: "2025-04-19T10:30:00",
      isRead: true
    },
    {
      id: 2,
      senderId: 1,
      content: "Hi Admin, it's going well. I've been working on improving my resume and technical skills.",
      timestamp: "2025-04-19T10:32:00",
      isRead: true
    },
    {
      id: 3,
      senderId: 2,
      content: "That's great to hear! Have you applied for the Frontend Developer position at TechCorp yet?",
      timestamp: "2025-04-19T10:35:00",
      isRead: true
    },
    {
      id: 4,
      senderId: 1,
      content: "Not yet, I'm planning to apply by the end of this week. I wanted to make sure my resume is properly tailored for the role.",
      timestamp: "2025-04-19T10:37:00",
      isRead: true
    },
    {
      id: 5,
      senderId: 2,
      content: "Good approach. If you need any help reviewing your resume before submission, feel free to share it with me.",
      timestamp: "2025-04-19T10:40:00",
      isRead: false
    }
  ],
  
  // Channel messages
  "channel_1": [
    {
      id: 1,
      senderId: 2,
      content: "Important Announcement: TechCorp will be conducting a campus drive on May 10th. All interested students should register by May 5th.",
      timestamp: "2025-04-19T15:30:00",
      isRead: true
    },
    {
      id: 2,
      senderId: 5,
      content: "The registration link has been shared via email. Please check your inbox and follow the instructions.",
      timestamp: "2025-04-19T15:35:00",
      isRead: true
    },
    {
      id: 3,
      senderId: 1,
      content: "What are the roles they are hiring for?",
      timestamp: "2025-04-19T15:40:00",
      isRead: true
    },
    {
      id: 4,
      senderId: 5,
      content: "They are hiring for Software Engineer, UX Designer, and Data Analyst roles. Detailed job descriptions are attached in the email.",
      timestamp: "2025-04-19T15:45:00",
      isRead: true
    },
    {
      id: 5,
      senderId: 3,
      content: "Is there a minimum GPA requirement?",
      timestamp: "2025-04-19T15:50:00",
      isRead: true
    },
    {
      id: 6,
      senderId: 2,
      content: "Yes, the minimum GPA requirement is 3.5. Also, they're looking for candidates with relevant project experience.",
      timestamp: "2025-04-19T15:55:00",
      isRead: false
    }
  ]
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const ChatInterface = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(usersData);
  const [channels, setChannels] = useState(channelsData);
  const [messages, setMessages] = useState(messagesData);
  const [selectedChat, setSelectedChat] = useState("");
  const [chatType, setChatType] = useState<"dm" | "channel">("dm");
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUsersList, setShowUsersList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  
  // Effect to scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat, messages]);
  
  // Get chat title and avatar
  const getChatInfo = () => {
    if (!selectedChat) return { title: "", avatar: "", subtitle: "" };
    
    if (chatType === "dm") {
      const parts = selectedChat.split("_");
      const otherUserId = Number(parts[2]) === (user?.id || 0) ? Number(parts[1]) : Number(parts[2]);
      const otherUser = users.find(u => u.id === otherUserId);
      
      return {
        title: otherUser?.name || "",
        avatar: otherUser?.avatar || "",
        subtitle: otherUser?.isOnline ? "Online" : "Offline",
        isOnline: otherUser?.isOnline
      };
    } else {
      const channelId = Number(selectedChat.split("_")[1]);
      const channel = channels.find(c => c.id === channelId);
      
      return {
        title: channel?.name || "",
        avatar: "",
        subtitle: `${channel?.members.length} members`,
        description: channel?.description
      };
    }
  };
  
  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChat) return;
    
    const newMessage = {
      id: (messages[selectedChat]?.length || 0) + 1,
      senderId: user?.id,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    const updatedMessages = {
      ...messages,
      [selectedChat]: [...(messages[selectedChat] || []), newMessage]
    };
    
    setMessages(updatedMessages);
    setInputMessage("");
  };
  
  // Select chat
  const selectChat = (chatId: string, type: "dm" | "channel") => {
    setSelectedChat(chatId);
    setChatType(type);
    
    // Mark messages as read
    if (messages[chatId]) {
      const updatedMessages = {
        ...messages,
        [chatId]: messages[chatId].map(msg => ({
          ...msg,
          isRead: true
        }))
      };
      setMessages(updatedMessages);
    }
    
    // Mark channel as read
    if (type === "channel") {
      const channelId = Number(chatId.split("_")[1]);
      setChannels(channels.map(channel => 
        channel.id === channelId ? { ...channel, isUnread: false } : channel
      ));
    }
  };
  
  // Create a new DM chat
  const startDMChat = (userId: number) => {
    const dmId = (user?.id || 0) < userId 
      ? `dm_${user?.id}_${userId}` 
      : `dm_${userId}_${user?.id}`;
    
    if (!messages[dmId]) {
      setMessages({
        ...messages,
        [dmId]: []
      });
    }
    
    selectChat(dmId, "dm");
    setShowUsersList(false);
  };
  
  // Create a new channel
  const createChannel = () => {
    if (!newChannelName.trim()) return;
    
    const newChannel = {
      id: Math.max(...channels.map(c => c.id)) + 1,
      name: newChannelName.trim(),
      description: newChannelDescription.trim(),
      members: [user?.id as number],
      isUnread: false,
      lastActivity: new Date().toISOString()
    };
    
    setChannels([...channels, newChannel]);
    
    const channelId = `channel_${newChannel.id}`;
    setMessages({
      ...messages,
      [channelId]: []
    });
    
    selectChat(channelId, "channel");
    setNewChannelName("");
    setNewChannelDescription("");
  };
  
  // Filter chats and channels by search term
  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Sort by online status first
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return a.name.localeCompare(b.name);
  });
  
  const chatInfo = getChatInfo();
  
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full overflow-hidden border rounded-lg">
        {/* Sidebar - Chat List */}
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
                    {sortedUsers.map(u => (
                      <div
                        key={u.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => startDMChat(u.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                          </Avatar>
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
                    {sortedUsers.map(u => {
                      const dmId = (user?.id || 0) < u.id 
                        ? `dm_${user?.id}_${u.id}` 
                        : `dm_${u.id}_${user?.id}`;
                      
                      const chat = messages[dmId];
                      const lastMessage = chat && chat.length > 0 ? chat[chat.length - 1] : null;
                      const hasUnread = chat ? chat.some(msg => !msg.isRead && msg.senderId !== user?.id) : false;
                      
                      return (
                        <div
                          key={u.id}
                          className={`flex items-center space-x-3 p-2 ${
                            selectedChat === dmId ? "bg-gray-100" : ""
                          } hover:bg-gray-100 rounded-md cursor-pointer ${
                            hasUnread ? "bg-purple-50" : ""
                          }`}
                          onClick={() => selectChat(dmId, "dm")}
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.avatar} alt={u.name} />
                              <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {u.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              {lastMessage && (
                                <p className="text-xs text-muted-foreground">
                                  {formatTimestamp(lastMessage.timestamp)}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {lastMessage 
                                ? lastMessage.senderId === user?.id 
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
                        <Label htmlFor="channel-name">Channel Name</Label>
                        <Input 
                          id="channel-name" 
                          value={newChannelName} 
                          onChange={(e) => setNewChannelName(e.target.value)} 
                          placeholder="e.g. Interview Preparation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="channel-description">Description (optional)</Label>
                        <Input 
                          id="channel-description" 
                          value={newChannelDescription} 
                          onChange={(e) => setNewChannelDescription(e.target.value)} 
                          placeholder="What's this channel about?"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createChannel}>Create Channel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {filteredChannels.map(channel => {
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
                        onClick={() => selectChat(channelId, "channel")}
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-100 text-purple-700">
                          <Users size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium truncate">{channel.name}</p>
                            {lastMessage && (
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(lastMessage.timestamp)}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage 
                              ? lastMessage.senderId === user?.id 
                                ? `You: ${lastMessage.content}`
                                : `${users.find(u => u.id === lastMessage.senderId)?.name.split(' ')[0] || 'User'}: ${lastMessage.content}`
                              : channel.description || "No messages yet"
                            }
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
        
        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {chatType === "dm" ? (
                  <>
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chatInfo.avatar} alt={chatInfo.title} />
                        <AvatarFallback>{chatInfo.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chatInfo.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{chatInfo.title}</h3>
                      <p className="text-sm text-muted-foreground">{chatInfo.subtitle}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 text-purple-700">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium">{chatInfo.title}</h3>
                      <p className="text-sm text-muted-foreground">{chatInfo.subtitle}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Search size={18} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Menu size={18} />
                </Button>
              </div>
            </div>
            
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatType === "channel" && (
                  <div className="text-center p-4">
                    <h3 className="font-medium text-lg">{chatInfo.title}</h3>
                    <p className="text-muted-foreground mb-2">{chatInfo.description}</p>
                    <p className="text-sm text-muted-foreground">
                      This is the beginning of the {chatInfo.title} channel
                    </p>
                  </div>
                )}
                
                {messages[selectedChat]?.map((message, index) => {
                  const sender = users.find(u => u.id === message.senderId);
                  const isCurrentUser = message.senderId === user?.id;
                  const showAvatar = index === 0 || 
                    messages[selectedChat][index - 1].senderId !== message.senderId;
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] gap-2`}>
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.avatar} alt={sender?.name} />
                            <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8" />
                        )}
                        
                        <div>
                          {showAvatar && (
                            <div className={`flex items-center mb-1 ${isCurrentUser ? "justify-end" : ""}`}>
                              <span className="text-sm font-medium">
                                {isCurrentUser ? "You" : sender?.name}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatTimestamp(message.timestamp)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`rounded-lg py-2 px-3 ${
                            isCurrentUser 
                              ? "bg-purple-600 text-white" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            <p>{message.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Type a message..." 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>
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
                  <MessageSquare size={32} className="text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-muted-foreground max-w-sm">
                Select a conversation or start a new one to begin messaging
              </p>
              <Button className="mt-4" onClick={() => setShowUsersList(true)}>
                <PenSquare size={16} className="mr-2" />
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
