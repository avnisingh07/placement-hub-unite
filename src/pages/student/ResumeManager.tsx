
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Resume, useResumes } from "@/hooks/resumes/useResumes";
import { format } from "date-fns";

const ResumeManager: React.FC = () => {
  const { toast } = useToast();
  const {
    getMyResumes,
    uploadResume,
    deleteResume,
    getResumeFileUrl,
    isLoading,
  } = useResumes();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { resumes: fetchedResumes } = await getMyResumes();
      setResumes(fetchedResumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your resumes",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      // Auto-set title from filename if not set
      if (!resumeTitle) {
        setResumeTitle(file.name.split(".")[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!resumeTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your resume",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, we would parse the resume here
      // and extract relevant data like education, experience, skills, etc.
      const mockParsedData = {
        name: "Sample Name",
        email: "sample@example.com",
        skills: ["React", "JavaScript", "TypeScript"],
        experience: [
          {
            title: "Frontend Developer",
            company: "Sample Company",
            startDate: "2020-01",
            endDate: "Present",
          },
        ],
      };

      await uploadResume(selectedFile, resumeTitle, mockParsedData);
      
      setSelectedFile(null);
      setResumeTitle("");
      fetchResumes();
      
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await deleteResume(resumeId);
        fetchResumes();
        toast({
          title: "Resume deleted",
          description: "Your resume has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting resume:", error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting your resume",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewResume = async (resume: Resume) => {
    setSelectedResume(resume);
    try {
      const url = await getResumeFileUrl(resume.file_path);
      if (url) {
        setPreviewUrl(url);
      } else {
        toast({
          title: "Preview not available",
          description: "Could not generate a preview for this file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting resume URL:", error);
      toast({
        title: "Error",
        description: "Failed to load resume preview",
        variant: "destructive",
      });
    }
  };

  const downloadResume = async (resume: Resume) => {
    try {
      const url = await getResumeFileUrl(resume.file_path);
      if (url) {
        window.open(url, "_blank");
      } else {
        toast({
          title: "Download failed",
          description: "Could not generate download link",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your resume",
        variant: "destructive",
      });
    }
  };

  // Helper function to format file size
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume in PDF or Word format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-title">Resume Title</Label>
                <Input
                  id="resume-title"
                  placeholder="e.g., Software Engineer Resume 2023"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resume-file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                  <Input
                    id="resume-file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("resume-file")?.click()}
                  >
                    Browse Files
                  </Button>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-secondary/30 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[180px]">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </CardFooter>
        </Card>

        {/* Resumes List Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Resumes</CardTitle>
            <CardDescription>
              Manage your uploaded resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your first resume to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumes.map((resume) => (
                    <TableRow key={resume.id}>
                      <TableCell className="font-medium">
                        {resume.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resume.file_type.split("/")[1].toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(resume.file_size)}</TableCell>
                      <TableCell>
                        {format(
                          new Date(resume.created_at),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewResume(resume)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full h-[80vh]">
                              <DialogHeader>
                                <DialogTitle>{resume.title}</DialogTitle>
                                <DialogDescription>
                                  Uploaded on{" "}
                                  {format(
                                    new Date(resume.created_at),
                                    "MMMM d, yyyy"
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="h-full overflow-hidden">
                                {previewUrl && (
                                  <iframe
                                    src={previewUrl}
                                    className="w-full h-full border-0"
                                    title="Resume Preview"
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadResume(resume)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(resume.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeManager;
