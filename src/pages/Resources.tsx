import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Download,
  FileText,
  Video,
  BookOpen,
  Clock,
  Star,
  Filter,
  Play,
  Lock,
  Eye,
  Globe,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

const Resources = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasPremiumAccess, isPremium, loading: subscriptionLoading } = useSubscription();
  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchResourcesData();
  }, []);

  const fetchResourcesData = async () => {
    try {
      setLoading(true);
      
      const [resourcesResp, subjectsResp] = await Promise.all([
        supabase.from('resources').select(`
          *,
          subjects(name, code)
        `).eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').eq('is_active', true)
      ]);

      setResources(resourcesResp.data || []);
      setSubjects(subjectsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/') || fileType === 'video/youtube') {
      return <Video className="h-6 w-6" />;
    } else if (fileType.startsWith('image/')) {
      return <Video className="h-6 w-6" />; // Using video icon for now
    } else if (fileType === 'text/html') {
      return <Globe className="h-6 w-6" />;
    } else {
      return <FileText className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleResourceAccess = async (resource: any) => {
    try {
      // Check if user is logged in
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to access resources",
          variant: "destructive"
        });
        window.location.href = '/auth';
        return;
      }

      // Check premium access for premium resources
      if (resource.access_level === 'premium') {
        if (subscriptionLoading) {
          toast({
            title: "Loading",
            description: "Checking subscription status...",
          });
          return;
        }
        
        if (!hasPremiumAccess && !isPremium) {
          toast({
            title: "Premium Required",
            description: "This resource requires a premium subscription",
            variant: "destructive"
          });
          window.location.href = '/payment?plan=premium';
          return;
        }
      }

      console.log('Accessing resource:', resource.title, 'URL:', resource.file_url);

      // Generate proper storage URL for the file
      let fileUrl = resource.file_url;
      
      try {
        // If the file_url is a storage path, construct the full Supabase storage URL
        if (!fileUrl.startsWith('http')) {
          // For paths starting with "uploads/", use the uploads bucket
          if (fileUrl.startsWith('uploads/')) {
            const filePath = fileUrl.replace('uploads/', '');
            const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
            fileUrl = data.publicUrl;
            console.log('Generated uploads storage URL:', fileUrl);
          } else {
            // Handle other storage paths like "resources/file.pdf"
            const pathParts = fileUrl.split('/');
            
            // If no bucket specified, default to 'resources'
            let bucketName = 'resources';
            let filePath = fileUrl;
            
            // If path includes bucket name
            if (pathParts.length > 1) {
              bucketName = pathParts[0];
              filePath = pathParts.slice(1).join('/');
            }
            
            // Get public URL from Supabase storage
            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            fileUrl = data.publicUrl;
            console.log('Generated storage URL:', fileUrl);
          }
        }

        // Test if file exists by attempting to fetch it
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (!response.ok) {
          console.warn('File not accessible via HEAD request, trying direct access');
          // Try direct download without HEAD check
        }

        // Increment download count
        await supabase
          .from('resources')
          .update({ 
            download_count: (resource.download_count || 0) + 1,
            view_count: (resource.view_count || 0) + 1
          })
          .eq('id', resource.id);

        // Handle different file types
        if (resource.file_type?.startsWith('video') || fileUrl.includes('youtube')) {
          window.open(fileUrl, '_blank');
          toast({
            title: "Opening Video",
            description: "Video is opening in a new tab"
          });
        } else {
          // For documents, try to download with proper filename
          try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            
            // Get proper filename with extension
            let filename = resource.title;
            if (!filename.includes('.')) {
              const urlPath = new URL(fileUrl).pathname;
              const extension = urlPath.split('.').pop();
              if (extension) {
                filename += `.${extension}`;
              }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up blob URL
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            
            toast({
              title: "Download Started",
              description: `Downloading ${filename}`
            });
          } catch (downloadError) {
            // Fallback: open in new tab
            console.warn('Download failed, opening in new tab:', downloadError);
            window.open(fileUrl, '_blank');
            toast({
              title: "Opening File",
              description: "File is opening in a new tab"
            });
          }
        }

      } catch (urlError) {
        console.error('Error processing file URL:', urlError);
        throw new Error("File not found or inaccessible");
      }

    } catch (error) {
      console.error('Error accessing resource:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to access resource";
      toast({
        title: "Access Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || resource.subject_id === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const resourceCategories = [
    { name: "All Resources", count: resources.length },
    { name: "Past Questions", count: resources.filter(r => r.tags?.includes?.('past-questions')).length },
    { name: "Study Guides", count: resources.filter(r => r.tags?.includes?.('study-guide')).length },
    { name: "Video Tutorials", count: resources.filter(r => r.file_type?.startsWith('video')).length },
    { name: "Practice Tests", count: resources.filter(r => r.tags?.includes?.('practice')).length },
    { name: "Exam Tips", count: resources.filter(r => r.tags?.includes?.('tips')).length }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              📚 Resource Library
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Study Resources & Materials
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Access thousands of study materials, past questions, video tutorials, and expert guides 
              to boost your WAEC and JAMB preparation.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search for resources, subjects, or topics..." 
                className="pl-12 pr-4 py-6 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Categories */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories */}
            <div className="lg:w-1/4">
              <h3 className="font-semibold mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {resourceCategories.map((category, index) => (
                  <button 
                    key={index}
                    className={`w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex justify-between items-center ${
                      selectedCategory === category.name.toLowerCase().replace(' ', '-') ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => setSelectedCategory(category.name.toLowerCase().replace(' ', '-'))}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Filter */}
            <div className="lg:w-3/4">
              <h3 className="font-semibold mb-4">Filter by Subject</h3>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedSubject === 'all' ? 'default' : 'outline'}
                  className="px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedSubject('all')}
                >
                  All Subjects
                </Badge>
                {subjects.map((subject) => (
                  <Badge 
                    key={subject.id}
                    variant={selectedSubject === subject.id ? 'default' : 'outline'}
                    className="px-3 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Resources</h2>
              <p className="text-muted-foreground">Most popular and highly-rated study materials</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                All PDFs
              </Button>
              <Button variant="outline">
                <Video className="h-4 w-4 mr-2" />
                All Videos
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }, (_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-5 bg-gray-200 rounded"></div>
                      <div className="w-12 h-5 bg-gray-200 rounded"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-full h-10 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${
                        resource.file_type?.startsWith('video') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getFileIcon(resource.file_type)}
                      </div>
                      {resource.access_level === 'premium' && (
                        <Badge className={`${hasPremiumAccess || isPremium ? 'bg-green-100 text-green-700 border-green-300' : 'bg-accent/10 text-accent border-accent/20'}`}>
                          {hasPremiumAccess || isPremium ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {hasPremiumAccess || isPremium ? 'Premium' : 'Premium'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {resource.subjects?.name || 'General'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.file_type?.startsWith('video') ? 'Video' : 'Document'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <CardTitle className="text-lg leading-tight mb-2">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {resource.description}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{resource.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        <span>{resource.download_count || 0}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={resource.access_level === 'premium' && !(hasPremiumAccess || isPremium) ? "default" : "outline"}
                      onClick={() => handleResourceAccess(resource)}
                      disabled={subscriptionLoading}
                    >
                      {subscriptionLoading ? (
                        <span>Checking...</span>
                      ) : resource.file_type?.startsWith('video') ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {resource.access_level === 'premium' && !(hasPremiumAccess || isPremium) 
                            ? 'Get Premium' 
                            : 'Watch Video'
                          }
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {resource.access_level === 'premium' && !(hasPremiumAccess || isPremium) 
                            ? 'Get Premium' 
                            : 'Download'
                          }
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No resources found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedSubject !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No resources have been uploaded yet'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="py-20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto text-center p-8">
            <CardHeader>
              <div className="mx-auto bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-3xl mb-4">
                Unlock Premium Resources
              </CardTitle>
              <CardDescription className="text-lg">
                Get access to exclusive video tutorials, detailed study guides, and premium past questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Video className="h-5 w-5 text-accent" />
                  <span>150+ Video Tutorials</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span>500+ Premium PDFs</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-5 w-5 text-accent" />
                  <span>Unlimited Downloads</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/payment?plan=premium">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Resources;