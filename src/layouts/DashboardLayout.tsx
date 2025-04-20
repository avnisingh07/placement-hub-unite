
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, FileText, MessageSquare, Bell, Calendar, Settings, Menu, X, LogOut, User, Building, Search } from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { 
      path: "/dashboard", 
      label: "Home", 
      icon: <Home size={20} />,
      roles: ["student", "admin"]
    },
    { 
      path: "/dashboard/admin", 
      label: "Admin Panel", 
      icon: <Building size={20} />,
      roles: ["admin"]
    },
    { 
      path: "/dashboard/resume", 
      label: "Resume", 
      icon: <FileText size={20} />,
      roles: ["student"]
    },
    { 
      path: "/dashboard/opportunities", 
      label: "Opportunities", 
      icon: <Search size={20} />,
      roles: ["student", "admin"]
    },
    { 
      path: "/dashboard/notifications", 
      label: "Notifications", 
      icon: <Bell size={20} />,
      roles: ["student", "admin"]
    },
    { 
      path: "/dashboard/reminders", 
      label: "Reminders", 
      icon: <Calendar size={20} />,
      roles: ["student", "admin"]
    },
    { 
      path: "/dashboard/chat", 
      label: "Chat", 
      icon: <MessageSquare size={20} />,
      roles: ["student", "admin"]
    },
    { 
      path: "/dashboard/settings", 
      label: "Settings", 
      icon: <Settings size={20} />,
      roles: ["student", "admin"]
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <NavLink to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-purple-600">PlaceMe</h1>
            </NavLink>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r shadow-sm z-20 fixed inset-y-0 left-0 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${
            isMobile ? "w-64" : "w-64"
          } transition-transform duration-300 ease-in-out mt-16 pt-5`}
        >
          <nav className="px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-purple-50 text-purple-600" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main 
          className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all duration-300 ${
            sidebarOpen ? (isMobile ? "ml-0" : "ml-64") : "ml-0"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
