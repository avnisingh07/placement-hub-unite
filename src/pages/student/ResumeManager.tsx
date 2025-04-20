
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Download, Eye, CheckCircle, XCircle } from "lucide-react";

const ResumeManager = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form fields for resume information
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Student",
    email: "john.student@example.com",
    phone: "(123) 456-7890",
    location: "New York, NY"
  });
  
  const [education, setEducation] = useState({
    institution: "University of Technology",
    degree: "Bachelor of Science in Computer Science",
    graduationDate: "2025-05",
    gpa: "3.8"
  });
  
  const [skills, setSkills] = useState("JavaScript, React, Node.js, HTML, CSS, TypeScript, Git");

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulate file upload
    setIsParsing(true);
    
    // Create a temporary URL for the file
    const url = URL.createObjectURL(file);
    setResumeUrl(url);
    
    // Simulate parsing progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setParseProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsParsing(false);
        setResumeUploaded(true);
        setActiveTab("edit");
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground">
          Upload, edit, and manage your resume to enhance your job opportunities
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="edit" disabled={!resumeUploaded}>Edit</TabsTrigger>
          <TabsTrigger value="preview" disabled={!resumeUploaded}>Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your resume to automatically extract information and improve your match score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-10 text-center">
                <div className="flex flex-col items-center">
                  <FileText size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Drag and drop your resume here</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOCX, and TXT formats up to 5MB
                  </p>
                  <Input
                    type="file"
                    className="hidden"
                    id="resume-upload"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                  <div className="flex gap-4">
                    <Button asChild>
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <Upload size={16} className="mr-2" />
                        Browse Files
                      </label>
                    </Button>
                    {resumeUploaded && (
                      <Button variant="outline" onClick={() => setShowPreview(true)}>
                        <Eye size={16} className="mr-2" />
                        View Uploaded Resume
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {isParsing && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Parsing resume...</span>
                    <span className="text-sm">{parseProgress}%</span>
                  </div>
                  <Progress value={parseProgress} />
                </div>
              )}
              
              {resumeUploaded && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
                  <CheckCircle size={20} className="mr-2" />
                  Resume uploaded and parsed successfully! You can now edit the extracted information.
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              {resumeUploaded ? (
                <Button onClick={() => setActiveTab("edit")}>
                  Continue to Edit
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Upload a resume to continue
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit Resume Information</CardTitle>
              <CardDescription>
                Review and edit the information extracted from your resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={personalInfo.name} 
                      onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={personalInfo.email} 
                      onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={personalInfo.phone} 
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={personalInfo.location} 
                      onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input 
                      id="institution" 
                      value={education.institution} 
                      onChange={(e) => setEducation({...education, institution: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree</Label>
                    <Input 
                      id="degree" 
                      value={education.degree} 
                      onChange={(e) => setEducation({...education, degree: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation-date">Graduation Date</Label>
                    <Input 
                      id="graduation-date" 
                      type="month" 
                      value={education.graduationDate} 
                      onChange={(e) => setEducation({...education, graduationDate: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input 
                      id="gpa" 
                      value={education.gpa} 
                      onChange={(e) => setEducation({...education, gpa: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Skills</h3>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Textarea 
                    id="skills" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)} 
                    rows={3} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back to Upload
              </Button>
              <Button onClick={() => setActiveTab("preview")}>
                Save and Preview
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
              <CardDescription>
                Preview how your resume information will appear to employers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{personalInfo.name}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{personalInfo.email}</span>
                    <span>{personalInfo.phone}</span>
                    <span>{personalInfo.location}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium border-b pb-1 mb-3">Education</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{education.institution}</p>
                    <p>{education.degree}</p>
                    <p className="text-sm text-muted-foreground">
                      Graduation: {new Date(education.graduationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} | GPA: {education.gpa}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium border-b pb-1 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.split(',').map((skill, index) => (
                      <div key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {skill.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
                <CheckCircle size={20} className="mr-2" />
                Your resume is complete and ready to be shared with employers!
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setActiveTab("edit")}>
                Back to Edit
              </Button>
              <Button>
                <Download size={16} className="mr-2" />
                Download Resume
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Resume Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resume Preview</DialogTitle>
            <DialogDescription>
              Viewing your uploaded resume
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-[8.5/11] bg-white border rounded-md overflow-hidden">
            {resumeUrl && (
              <iframe 
                src={resumeUrl} 
                className="w-full h-full" 
                title="Resume Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeManager;
