
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, Briefcase, Calendar, Clock } from "lucide-react";

// Mock data
const opportunities = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Inc.",
    logo: "https://ui-avatars.com/api/?name=TC&background=0D8ABC&color=fff",
    location: "Remote",
    deadline: "2025-05-15",
    matchScore: 85,
    isNew: true
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    logo: "https://ui-avatars.com/api/?name=DH&background=EF4444&color=fff",
    location: "New York, NY",
    deadline: "2025-05-20",
    matchScore: 78,
    isNew: true
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "DataDrive",
    logo: "https://ui-avatars.com/api/?name=DD&background=10B981&color=fff",
    location: "Chicago, IL",
    deadline: "2025-05-25",
    matchScore: 72,
    isNew: false
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "ServerStack",
    logo: "https://ui-avatars.com/api/?name=SS&background=6366F1&color=fff",
    location: "Boston, MA",
    deadline: "2025-06-01",
    matchScore: 65,
    isNew: false
  }
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Resume Submission",
    dueDate: "2025-04-30",
    description: "Submit your updated resume for the upcoming campus drive"
  },
  {
    id: 2,
    title: "TechCorp Application",
    dueDate: "2025-05-15",
    description: "Complete your application for the Frontend Developer Intern role"
  },
  {
    id: 3,
    title: "Mock Interview Session",
    dueDate: "2025-05-22",
    description: "Attend the scheduled mock interview session"
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getTimeLeft = (deadlineDate: string) => {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};

const StudentDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [resumeScore, setResumeScore] = useState(65);
  
  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % opportunities.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const skills = [
    { name: "React", level: 85 },
    { name: "JavaScript", level: 80 },
    { name: "HTML/CSS", level: 90 },
    { name: "TypeScript", level: 65 },
    { name: "Node.js", level: 60 }
  ];

  // Redirect to admin dashboard if user is an admin
  useEffect(() => {
    if (profile?.role === "admin") {
      navigate("/dashboard/admin");
    }
  }, [profile, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your placement journey and upcoming opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recommended Opportunities</CardTitle>
            <CardDescription>Matches based on your skills and preferences</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="relative overflow-hidden h-[320px]">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full" 
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {opportunities.map((job) => (
                  <div key={job.id} className="min-w-full px-1">
                    <Card className="h-full border-2 hover:border-purple-300 transition-all card-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex space-x-3 items-center">
                            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                              <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                {job.title}
                                {job.isNew && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                    New
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{job.company} • {job.location}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-purple-50 border-purple-200">
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Match Score</div>
                            <div className="flex items-center gap-2">
                              <Progress value={job.matchScore} className="h-2" />
                              <span className="text-sm">{job.matchScore}%</span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Application Deadline: {formatDate(job.deadline)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{getTimeLeft(job.deadline)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">View Details</Button>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                {opportunities.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      activeIndex === index ? "bg-purple-600" : "bg-gray-300"
                    }`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/opportunities")}>
              View All Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resume Stats</CardTitle>
            <CardDescription>
              Improve your resume to increase your match score
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Overall Resume Score</span>
                  <span className="text-sm font-medium">{resumeScore}%</span>
                </div>
                <Progress value={resumeScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Your Skills</h4>
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/resume")}>
              <FileText className="mr-2 h-4 w-4" />
              Manage Resume
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Upcoming Deadlines</CardTitle>
            <CardDescription>Stay on track with important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{deadline.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{deadline.description}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        getTimeLeft(deadline.dueDate) === "Today" || getTimeLeft(deadline.dueDate) === "Tomorrow"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      {getTimeLeft(deadline.dueDate)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Due: {formatDate(deadline.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/reminders")}>
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => navigate("/dashboard/opportunities")}>
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Opportunities
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/resume")}>
                <FileText className="mr-2 h-4 w-4" />
                Update Resume
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/chat")}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/chat")}>
                <Calendar className="mr-2 h-4 w-4" />
                Chat with Advisor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
