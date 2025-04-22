import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, MoreHorizontal, Download, Trash, Edit, Eye, Plus, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { useResumes } from '@/hooks/useResumes';

const ResumeManager = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { uploadFile, isLoading: isUploading } = useStorageUpload();
  const { getMyResumes, deleteResume, getResumeFileUrl, updateResumeData, isLoading: isResumesLoading } = useResumes();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeNotes, setResumeNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const { resumes: resumeData } = await getMyResumes();
      setResumes(resumeData || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your resumes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 5MB"
      });
      return;
    }
    
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF or Word document"
      });
      return;
    }
    
    try {
      const { data, error } = await uploadFile(file, {
        bucket: 'resumes',
        path: user?.id
      });
      
      if (error) throw new Error(error);
      
      await updateResumeData(data.id, {
        title: resumeTitle || file.name,
        file_path: data.path,
        file_type: file.type,
        file_size: file.size,
        notes: resumeNotes
      });
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully"
      });
      
      setResumeTitle("");
      setResumeNotes("");
      fetchResumes();
      
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload resume"
      });
    }
  };

  const handleDownload = async (resume) => {
    try {
      const url = await getResumeFileUrl(resume.file_path);
      if (!url) throw new Error("Failed to get download URL");
      
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download resume"
      });
    }
  };

  const handleDelete = async () => {
    if (!resumeToDelete) return;
    
    try {
      await deleteResume(resumeToDelete.id);
      
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted successfully"
      });
      
      setShowDeleteDialog(false);
      setResumeToDelete(null);
      fetchResumes();
      
      if (selectedResume && selectedResume.id === resumeToDelete.id) {
        setSelectedResume(null);
      }
      
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Failed to delete resume"
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Resume Manager</h1>
          <p className="text-muted-foreground">
            Upload and manage your resumes for job applications
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload size={16} className="mr-2" />
              Upload Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Resume</DialogTitle>
              <DialogDescription>
                Upload a PDF or Word document of your resume
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Software Engineer Resume" 
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Add any notes about this version of your resume"
                  value={resumeNotes}
                  onChange={(e) => setResumeNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume-file">Resume File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                  <FileUp size={36} className="text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your file here or click to browse
                  </p>
                  <Input 
                    id="resume-file" 
                    type="file" 
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('resume-file').click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Select File"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX. Maximum size: 5MB
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setResumeTitle("");
                setResumeNotes("");
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Resumes</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <FileText size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resumes Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't uploaded any resumes yet. Upload your first resume to get started.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus size={16} className="mr-2" />
                      Upload Your First Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {/* Same content as the upload dialog above */}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <Card key={resume.id} className={selectedResume?.id === resume.id ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{resume.title}</CardTitle>
                        <CardDescription>
                          Uploaded on {formatDate(resume.created_at)}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownload(resume)}>
                            <Download size={16} className="mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye size={16} className="mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setResumeToDelete(resume);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">
                        {resume.file_type.split('/')[1].toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {formatFileSize(resume.file_size)}
                      </Badge>
                    </div>
                    {resume.notes && (
                      <p className="text-sm text-muted-foreground">
                        {resume.notes}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedResume(resume)}
                    >
                      {selectedResume?.id === resume.id ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Used Resumes</CardTitle>
              <CardDescription>
                Resumes you've recently used for job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resumes.length > 0 ? (
                <div className="space-y-4">
                  {resumes
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 3)
                    .map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <FileText size={20} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{resume.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Last used: {formatDate(resume.updated_at)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(resume)}
                        >
                          <Download size={16} className="mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No recently used resumes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {resumeToDelete && (
              <div className="flex items-center space-x-3 border p-3 rounded-lg">
                <div className="bg-red-100 p-2 rounded">
                  <FileText size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium">{resumeToDelete.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {formatDate(resumeToDelete.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeManager;
