
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Grid, List, Filter, BookmarkPlus, Bookmark, Calendar, Building, MapPin, Clock, Search, Plus } from "lucide-react";

// Mock data
const opportunitiesData = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Inc.",
    logo: "https://ui-avatars.com/api/?name=TC&background=0D8ABC&color=fff",
    location: "Remote",
    type: "Internship",
    deadline: "2025-05-15",
    description: "We are looking for a Frontend Developer Intern to join our team. The ideal candidate should have experience with React, HTML, CSS, and JavaScript.",
    requirements: ["React", "HTML", "CSS", "JavaScript"],
    matchScore: 85,
    isNew: true,
    isBookmarked: false
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    logo: "https://ui-avatars.com/api/?name=DH&background=EF4444&color=fff",
    location: "New York, NY",
    type: "Full-time",
    deadline: "2025-05-20",
    description: "Join our team as a UX Designer to create beautiful and intuitive user experiences for our products.",
    requirements: ["Figma", "User Research", "Prototyping", "UI Design"],
    matchScore: 78,
    isNew: true,
    isBookmarked: true
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "DataDrive",
    logo: "https://ui-avatars.com/api/?name=DD&background=10B981&color=fff",
    location: "Chicago, IL",
    type: "Full-time",
    deadline: "2025-05-25",
    description: "We're seeking a Data Analyst to help us analyze and interpret complex data sets to drive business decisions.",
    requirements: ["SQL", "Python", "Data Visualization", "Statistics"],
    matchScore: 72,
    isNew: false,
    isBookmarked: false
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "ServerStack",
    logo: "https://ui-avatars.com/api/?name=SS&background=6366F1&color=fff",
    location: "Boston, MA",
    type: "Full-time",
    deadline: "2025-06-01",
    description: "Join our engineering team to build and maintain server-side applications and APIs.",
    requirements: ["Node.js", "Express", "MongoDB", "API Development"],
    matchScore: 65,
    isNew: false,
    isBookmarked: false
  },
  {
    id: 5,
    title: "Marketing Intern",
    company: "BrandBoost",
    logo: "https://ui-avatars.com/api/?name=BB&background=8B5CF6&color=fff",
    location: "Remote",
    type: "Internship",
    deadline: "2025-05-30",
    description: "Looking for a Marketing Intern to assist with digital marketing campaigns and social media management.",
    requirements: ["Social Media", "Content Creation", "Analytics", "Communication"],
    matchScore: 60,
    isNew: true,
    isBookmarked: false
  },
  {
    id: 6,
    title: "Full Stack Developer",
    company: "TechCorp Inc.",
    logo: "https://ui-avatars.com/api/?name=TC&background=0D8ABC&color=fff",
    location: "Remote",
    type: "Full-time",
    deadline: "2025-06-15",
    description: "We are seeking a Full Stack Developer to work on both front-end and back-end development of our web applications.",
    requirements: ["React", "Node.js", "MongoDB", "TypeScript"],
    matchScore: 82,
    isNew: false,
    isBookmarked: true
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

const Opportunities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [opportunities, setOpportunities] = useState(opportunitiesData);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter states
  const [filters, setFilters] = useState({
    companies: [] as string[],
    types: [] as string[],
    locations: [] as string[],
    bookmarked: false,
    newOnly: false,
  });
  
  // Get unique filter options
  const companies = [...new Set(opportunitiesData.map(job => job.company))];
  const types = [...new Set(opportunitiesData.map(job => job.type))];
  const locations = [...new Set(opportunitiesData.map(job => job.location))];
  
  // Handle bookmark toggle
  const toggleBookmark = (id: number) => {
    setOpportunities(opportunities.map(job => 
      job.id === id ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
    
    const job = opportunities.find(job => job.id === id);
    if (job) {
      toast({
        title: job.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: `${job.title} at ${job.company} has been ${job.isBookmarked ? "removed from" : "added to"} your bookmarks.`
      });
    }
  };
  
  // Handle application
  const handleApply = () => {
    if (selectedOpportunity) {
      toast({
        title: "Application Submitted",
        description: `Your application for ${selectedOpportunity.title} at ${selectedOpportunity.company} has been submitted successfully.`
      });
      setSelectedOpportunity(null);
    }
  };
  
  // Apply filters and search
  const filteredJobs = opportunities.filter(job => {
    // Search term filter
    if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !job.company.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Company filter
    if (filters.companies.length > 0 && !filters.companies.includes(job.company)) {
      return false;
    }
    
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(job.type)) {
      return false;
    }
    
    // Location filter
    if (filters.locations.length > 0 && !filters.locations.includes(job.location)) {
      return false;
    }
    
    // Bookmarked filter
    if (filters.bookmarked && !job.isBookmarked) {
      return false;
    }
    
    // New only filter
    if (filters.newOnly && !job.isNew) {
      return false;
    }
    
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);
  
  // Toggle filter checkboxes
  const toggleFilter = (field: keyof typeof filters, value: string) => {
    if (field === 'bookmarked' || field === 'newOnly') {
      setFilters({
        ...filters,
        [field]: !filters[field as 'bookmarked' | 'newOnly']
      });
    } else {
      const currentFilters = filters[field as 'companies' | 'types' | 'locations'];
      if (currentFilters.includes(value)) {
        setFilters({
          ...filters,
          [field]: currentFilters.filter(item => item !== value)
        });
      } else {
        setFilters({
          ...filters,
          [field]: [...currentFilters, value]
        });
      }
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      companies: [],
      types: [],
      locations: [],
      bookmarked: false,
      newOnly: false
    });
    setSearchTerm("");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and apply for available job opportunities
          </p>
        </div>
        
        {user?.role === "admin" && (
          <Button>
            <Plus size={16} className="mr-2" />
            Add New Job
          </Button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs by title or company..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Opportunities</DialogTitle>
                <DialogDescription>
                  Refine your job search with filters
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Companies</h3>
                  <div className="space-y-2">
                    {companies.map(company => (
                      <div key={company} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`company-${company}`} 
                          checked={filters.companies.includes(company)} 
                          onCheckedChange={() => toggleFilter('companies', company)}
                        />
                        <Label htmlFor={`company-${company}`}>{company}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Job Type</h3>
                  <div className="space-y-2">
                    {types.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={filters.types.includes(type)} 
                          onCheckedChange={() => toggleFilter('types', type)}
                        />
                        <Label htmlFor={`type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  <div className="space-y-2">
                    {locations.map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`location-${location}`} 
                          checked={filters.locations.includes(location)} 
                          onCheckedChange={() => toggleFilter('locations', location)}
                        />
                        <Label htmlFor={`location-${location}`}>{location}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">More Filters</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bookmarked" 
                        checked={filters.bookmarked} 
                        onCheckedChange={() => toggleFilter('bookmarked', '')}
                      />
                      <Label htmlFor="bookmarked">Bookmarked Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="new-only" 
                        checked={filters.newOnly} 
                        onCheckedChange={() => toggleFilter('newOnly', '')}
                      />
                      <Label htmlFor="new-only">New Opportunities Only</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={() => setFilterOpen(false)}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="flex gap-1 border rounded-md">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
              className="rounded-none rounded-l-md"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
              className="rounded-none rounded-r-md"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {filters.companies.length > 0 || filters.types.length > 0 || filters.locations.length > 0 || 
        filters.bookmarked || filters.newOnly ? (
        <div className="flex gap-2 flex-wrap">
          {filters.companies.map(company => (
            <Badge key={`comp-${company}`} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('companies', company)}>
              Company: {company} ×
            </Badge>
          ))}
          {filters.types.map(type => (
            <Badge key={`type-${type}`} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('types', type)}>
              Type: {type} ×
            </Badge>
          ))}
          {filters.locations.map(location => (
            <Badge key={`loc-${location}`} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('locations', location)}>
              Location: {location} ×
            </Badge>
          ))}
          {filters.bookmarked && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('bookmarked', '')}>
              Bookmarked Only ×
            </Badge>
          )}
          {filters.newOnly && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => toggleFilter('newOnly', '')}>
              New Only ×
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      ) : null}
      
      {/* Jobs Display - Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <Card key={job.id} className="hover:border-purple-300 transition-all card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-3 items-center">
                      <div className="w-10 h-10 rounded-md overflow-hidden">
                        <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {job.title}
                          {job.isNew && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleBookmark(job.id)}
                      className="text-muted-foreground hover:text-purple-600"
                    >
                      {job.isBookmarked ? <Bookmark className="fill-purple-600 text-purple-600" /> : <BookmarkPlus />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="bg-purple-50 border-purple-200">
                        {job.matchScore}% Match
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Deadline: {formatDate(job.deadline)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{getTimeLeft(job.deadline)}</span>
                      </div>
                    </div>
                    
                    <div className="line-clamp-3 text-sm">
                      {job.description}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setSelectedOpportunity(job)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more opportunities.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Jobs Display - List View */}
      {view === "list" && (
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <Card key={job.id} className="hover:border-purple-300 transition-all card-shadow">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-12 h-12 rounded-md overflow-hidden hidden sm:block">
                      <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          {job.title}
                          {job.isNew && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                              New
                            </Badge>
                          )}
                        </h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-purple-50 border-purple-200">
                          {job.matchScore}% Match
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>Deadline: {formatDate(job.deadline)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span>{getTimeLeft(job.deadline)}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm line-clamp-2 hidden sm:block">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 justify-end sm:justify-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleBookmark(job.id)}
                      className="text-muted-foreground hover:text-purple-600"
                    >
                      {job.isBookmarked ? <Bookmark className="fill-purple-600 text-purple-600" /> : <BookmarkPlus />}
                    </Button>
                    <Button onClick={() => setSelectedOpportunity(job)}>
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-8 text-center">
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more opportunities.
              </p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Job Details Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
        {selectedOpportunity && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md overflow-hidden">
                  <img src={selectedOpportunity.logo} alt={selectedOpportunity.company} className="w-full h-full object-cover" />
                </div>
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    {selectedOpportunity.title}
                    {selectedOpportunity.isNew && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        New
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>{selectedOpportunity.company}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-purple-50 border-purple-200">
                  {selectedOpportunity.matchScore}% Match
                </Badge>
                <Badge variant="outline">{selectedOpportunity.type}</Badge>
                
                <div className="flex items-center text-sm">
                  <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{selectedOpportunity.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>Deadline: {formatDate(selectedOpportunity.deadline)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span>{getTimeLeft(selectedOpportunity.deadline)}</span>
                </div>
              </div>
              
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="company">Company</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-4">
                  <p>{selectedOpportunity.description}</p>
                </TabsContent>
                <TabsContent value="requirements" className="pt-4">
                  <h4 className="font-medium mb-2">Required Skills & Qualifications</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedOpportunity.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="company" className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img src={selectedOpportunity.logo} alt={selectedOpportunity.company} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-medium">{selectedOpportunity.company}</h3>
                  </div>
                  <p>
                    {selectedOpportunity.company} is a leading company in its field. Visit their website or contact the placement office for more information about the company.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="sm:mr-auto" 
                onClick={() => toggleBookmark(selectedOpportunity.id)}
              >
                {selectedOpportunity.isBookmarked ? (
                  <>
                    <Bookmark className="mr-2 h-4 w-4 fill-current" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Add to Bookmarks
                  </>
                )}
              </Button>
              <Button onClick={handleApply}>
                Apply Now
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Opportunities;
