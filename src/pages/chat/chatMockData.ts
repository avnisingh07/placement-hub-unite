
export const usersData = [
  {
    id: 1,
    name: "John Student",
    email: "student@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=John+Student&background=8B5CF6&color=fff",
    isOnline: true,
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=6E59A5&color=fff",
    isOnline: true,
  },
  {
    id: 3,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=EF4444&color=fff",
    isOnline: false,
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "student",
    avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=10B981&color=fff",
    isOnline: true,
  },
  {
    id: 5,
    name: "Placement Coordinator",
    email: "coordinator@example.com",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Placement+Coordinator&background=0D8ABC&color=fff",
    isOnline: true,
  },
];

export const channelsData = [
  {
    id: 1,
    name: "Placement Updates",
    description: "Official announcements and updates about placements",
    members: [1, 2, 3, 4, 5],
    isUnread: true,
    lastActivity: "2025-04-19T15:30:00",
  },
  {
    id: 2,
    name: "Technical Interview Prep",
    description: "Discuss technical interview questions and preparation strategies",
    members: [1, 3, 4],
    isUnread: false,
    lastActivity: "2025-04-18T12:45:00",
  },
  {
    id: 3,
    name: "Resume Feedback",
    description: "Get feedback on your resume from peers and placement officers",
    members: [1, 2, 5],
    isUnread: true,
    lastActivity: "2025-04-17T09:20:00",
  },
];

export const messagesData: { [key: string]: any[] } = {
  "dm_1_2": [
    {
      id: 1,
      senderId: 2,
      content: "Hello John, how is your placement preparation going?",
      timestamp: "2025-04-19T10:30:00",
      isRead: true,
    },
    {
      id: 2,
      senderId: 1,
      content: "Hi Admin, it's going well. I've been working on improving my resume and technical skills.",
      timestamp: "2025-04-19T10:32:00",
      isRead: true,
    },
    {
      id: 3,
      senderId: 2,
      content: "That's great to hear! Have you applied for the Frontend Developer position at TechCorp yet?",
      timestamp: "2025-04-19T10:35:00",
      isRead: true,
    },
    {
      id: 4,
      senderId: 1,
      content: "Not yet, I'm planning to apply by the end of this week. I wanted to make sure my resume is properly tailored for the role.",
      timestamp: "2025-04-19T10:37:00",
      isRead: true,
    },
    {
      id: 5,
      senderId: 2,
      content: "Good approach. If you need any help reviewing your resume before submission, feel free to share it with me.",
      timestamp: "2025-04-19T10:40:00",
      isRead: false,
    },
  ],
  "channel_1": [
    {
      id: 1,
      senderId: 2,
      content: "Important Announcement: TechCorp will be conducting a campus drive on May 10th. All interested students should register by May 5th.",
      timestamp: "2025-04-19T15:30:00",
      isRead: true,
    },
    {
      id: 2,
      senderId: 5,
      content: "The registration link has been shared via email. Please check your inbox and follow the instructions.",
      timestamp: "2025-04-19T15:35:00",
      isRead: true,
    },
    {
      id: 3,
      senderId: 1,
      content: "What are the roles they are hiring for?",
      timestamp: "2025-04-19T15:40:00",
      isRead: true,
    },
    {
      id: 4,
      senderId: 5,
      content: "They are hiring for Software Engineer, UX Designer, and Data Analyst roles. Detailed job descriptions are attached in the email.",
      timestamp: "2025-04-19T15:45:00",
      isRead: true,
    },
    {
      id: 5,
      senderId: 3,
      content: "Is there a minimum GPA requirement?",
      timestamp: "2025-04-19T15:50:00",
      isRead: true,
    },
    {
      id: 6,
      senderId: 2,
      content: "Yes, the minimum GPA requirement is 3.5. Also, they're looking for candidates with relevant project experience.",
      timestamp: "2025-04-19T15:55:00",
      isRead: false,
    },
  ],
};

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}
