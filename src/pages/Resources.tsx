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
  const { user, isAdmin } = useAuth();
  const { hasPremiumAccess, isPremium, isEnterprise, canAccessPremium, loading: subscriptionLoading } = useSubscription();
  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchResourcesData();

    // Set up real-time updates for resources
    const channel = supabase
      .channel('resources-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, (payload) => {
        console.log('Resource changed:', payload);
        fetchResourcesData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResourcesData = async () => {
    try {
      setLoading(true);
      
      // Fetch resources and subjects separately to avoid RLS issues
      const subjectsResp = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (subjectsResp.error) {
        console.error('Subjects fetch error:', subjectsResp.error);
        throw new Error('Failed to fetch subjects');
      }

      // Fetch resources - RLS will filter based on user's access level
      const resourcesResp = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (resourcesResp.error) {
        console.error('Resources fetch error:', resourcesResp.error);
        // If error is RLS-related and user is not logged in, show a helpful message
        if (resourcesResp.error.message.includes('row-level security') || 
            resourcesResp.error.code === 'PGRST301') {
          toast({
            title: "Login Required",
            description: "Please log in to view resources",
            variant: "destructive"
          });
          setResources([]);
          setSubjects(subjectsResp.data || []);
          setLoading(false);
          return;
        }
        throw resourcesResp.error;
      }

      // Manually join subjects data to resources
      const resourcesWithSubjects = (resourcesResp.data || []).map(resource => {
        const subject = subjectsResp.data?.find(s => s.id === resource.subject_id);
        return {
          ...resource,
          subjects: subject ? { name: subject.name, code: subject.code } : null
        };
      });

      console.log('Fetched resources:', resourcesWithSubjects.length, 'resources');
      setResources(resourcesWithSubjects);
      setSubjects(subjectsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load resources",
        variant: "destructive"
      });
      // Set empty arrays so the page still renders
      setResources([]);
      setSubjects([]);
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
        
        if (!canAccessPremium && !isAdmin) {
          toast({
            title: "Premium Required",
            description: "This resource requires a premium or enterprise subscription",
            variant: "destructive"
          });
          window.location.href = '/payment?plan=premium';
          return;
        }
      }

      console.log('Accessing resource:', resource.title, 'URL:', resource.file_url);

      let fileUrl = resource.file_url;
      
      // Check if it's an external video link (YouTube, Vimeo, etc.)
      const isExternalVideo = fileUrl.includes('youtube.com') || 
                              fileUrl.includes('youtu.be') || 
                              fileUrl.includes('vimeo.com');
      
      // Handle different URL types
      if (fileUrl.startsWith('http')) {
        // Skip verification for external video links (YouTube, Vimeo) due to CORS
        if (!isExternalVideo) {
          // Verify the file exists for non-video external links
          try {
            const response = await fetch(fileUrl, { method: 'HEAD' });
            if (!response.ok) {
              throw new Error('File not found at the specified URL');
            }
          } catch (fetchError) {
            console.error('File verification failed:', fetchError);
            toast({
              title: "File Not Available",
              description: "This resource file is currently not available. Please contact support.",
              variant: "destructive"
            });
            return;
          }
        }
      } else {
        // Legacy or relative path - check if file exists in storage first
        let bucketName = 'uploads';
        let filePath = fileUrl;

        if (fileUrl.startsWith('uploads/')) {
          bucketName = 'uploads';
          filePath = fileUrl.replace('uploads/', '');
        } else if (fileUrl.includes('/')) {
          const pathParts = fileUrl.split('/');
          bucketName = pathParts[0];
          filePath = pathParts.slice(1).join('/');
        } else {
          bucketName = 'resources';
          filePath = fileUrl;
        }

        // Check if file exists in storage
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .download(filePath);

          if (error || !data) {
            console.error('File not found in storage:', error);
            toast({
              title: "File Not Available",
              description: "This resource file is currently not available. It may need to be re-uploaded.",
              variant: "destructive"
            });
            return;
          }

          // File exists, create download URL
          const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        } catch (storageError) {
          console.error('Storage access error:', storageError);
          toast({
            title: "Storage Error",
            description: "Unable to access the file storage. Please try again later.",
            variant: "destructive"
          });
          return;
        }
      }

      // Increment view/download count only if file access will succeed
      await supabase
        .from('resources')
        .update({ 
          download_count: (resource.download_count || 0) + 1,
          view_count: (resource.view_count || 0) + 1
        })
        .eq('id', resource.id);

      // Handle different file types
      if (resource.file_type?.startsWith('video') || fileUrl.includes('youtube') || fileUrl.includes('youtu.be') || fileUrl.includes('vimeo')) {
        // Normalize YouTube short links to full watch URLs
        const normalizeVideoUrl = (url: string) => {
          try {
            if (url.includes('youtu.be/')) {
              const id = new URL(url).pathname.replace('/', '').split('?')[0];
              return `https://www.youtube.com/watch?v=${id}`;
            }
            if (url.includes('youtube.com/shorts/')) {
              const id = new URL(url).pathname.split('/').pop();
              return `https://www.youtube.com/watch?v=${id}`;
            }
            return url;
          } catch {
            return url;
          }
        };

        const openUrl = normalizeVideoUrl(fileUrl);

        // Open in a true new tab to avoid iframe blocking (ERR_BLOCKED_BY_RESPONSE)
        const a = document.createElement('a');
        a.href = openUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast({
          title: "Opening Video",
          description: "Video is opening in a new tab"
        });
      } else {
        // For documents, try to download
        try {
          let filename = resource.title;
          if (!filename.includes('.')) {
            try {
              const urlPath = new URL(fileUrl).pathname;
              const extension = urlPath.split('.').pop();
              if (extension && extension.length <= 4) {
                filename += `.${extension}`;
              }
            } catch {
              // If URL parsing fails, add pdf extension as default
              filename += '.pdf';
            }
          }
          
          const downloadResponse = await fetch(fileUrl);
          if (!downloadResponse.ok) {
            throw new Error(`Failed to download: ${downloadResponse.status}`);
          }
          
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
          
          toast({
            title: "Download Started",
            description: `Downloading ${filename}`
          });

        } catch (downloadError) {
          console.error('Download failed:', downloadError);
          toast({
            title: "Download Failed",
            description: "Unable to download the file. The file may not be available.",
            variant: "destructive"
          });
        }
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
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || resource.subject_id === selectedSubject;
    
    // Allow all valid URLs (including YouTube, external links)
    const isValidUrl = resource.file_url && resource.file_url.startsWith('http');
    
    // Show all valid resources, regardless of source
    return matchesSearch && matchesSubject && isValidUrl;
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
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-3 sm:mb-4 bg-accent/10 text-accent border-accent/20 text-xs sm:text-sm">
              📚 Resource Library
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
              Study Resources & Materials
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-muted-foreground max-w-2xl mx-auto px-4">
              Access thousands of study materials, past questions, video tutorials, and expert guides 
              to boost your WAEC and JAMB preparation.
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
              <Input 
                placeholder="Search for resources, subjects, or topics..." 
                className="pl-10 sm:pl-12 pr-20 sm:pr-24 py-4 sm:py-6 text-sm sm:text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-auto">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Categories */}
      <section className="py-8 sm:py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Categories */}
            <div className="lg:w-1/4">
              <h3 className="font-semibold mb-4 flex items-center text-sm sm:text-base">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {resourceCategories.map((category, index) => (
                  <button 
                    key={index}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors flex justify-between items-center text-sm ${
                      selectedCategory === category.name.toLowerCase().replace(' ', '-') ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => setSelectedCategory(category.name.toLowerCase().replace(' ', '-'))}
                  >
                    <span className="truncate">{category.name}</span>
                    <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Filter */}
            <div className="lg:w-3/4">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Filter by Subject</h3>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={selectedSubject === 'all' ? 'default' : 'outline'}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedSubject('all')}
                >
                  All Subjects
                </Badge>
                {subjects.map((subject) => (
                  <Badge 
                    key={subject.id}
                    variant={selectedSubject === subject.id ? 'default' : 'outline'}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
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
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Resources</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Most popular and highly-rated study materials</p>
            </div>
            <div className="flex gap-2 sm:gap-4 overflow-x-auto">
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">All PDFs</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">All Videos</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 8 }, (_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
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
                <Card key={resource.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                  <CardHeader className="pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        resource.file_type?.startsWith('video') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {getFileIcon(resource.file_type)}
                      </div>
                      {resource.access_level === 'premium' && (
                        <Badge className={`flex-shrink-0 ${canAccessPremium ? 'bg-green-100 text-green-700 border-green-300' : 'bg-accent/10 text-accent border-accent/20'}`}>
                          {canAccessPremium ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {canAccessPremium ? (isEnterprise ? 'Enterprise' : 'Premium') : 'Premium'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {resource.subjects?.name || 'General'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.file_type?.startsWith('video') ? 'Video' : 'Document'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg leading-tight mb-2 line-clamp-2 break-words">
                        {resource.title || 'Untitled Resource'}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-3 break-words">
                        {resource.description || 'No description available'}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{resource.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{resource.download_count || 0}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full text-sm" 
                      variant={resource.access_level === 'premium' && !(hasPremiumAccess || isPremium) ? "default" : "outline"}
                      onClick={() => handleResourceAccess(resource)}
                      disabled={subscriptionLoading}
                    >
                      {subscriptionLoading ? (
                        <span>Checking...</span>
                      ) : resource.file_type?.startsWith('video') ? (
                        <>
                          <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {resource.access_level === 'premium' && !(hasPremiumAccess || isPremium) 
                            ? 'Get Premium' 
                            : 'Watch Video'
                          }
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-muted-foreground mb-2">No resources found</h3>
                <p className="text-sm text-muted-foreground px-4">
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
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto text-center p-6 sm:p-8">
            <CardHeader className="space-y-3 sm:space-y-4">
              <div className="mx-auto bg-accent/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl mb-2 sm:mb-4 px-2">
                Unlock Premium Resources
              </CardTitle>
              <CardDescription className="text-base sm:text-lg px-4">
                Get access to exclusive video tutorials, detailed study guides, and premium past questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span>150+ Video Tutorials</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span>500+ Premium PDFs</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span>Unlimited Downloads</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/payment?plan=premium" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                    Upgrade to Premium
                  </Button>
                </Link>
                 {!user ? (
                   <Link to="/auth" className="w-full sm:w-auto">
                     <Button size="lg" variant="outline" className="w-full sm:w-auto">
                       Login to Subscribe
                     </Button>
                   </Link>
                 ) : (
                   <Link to="/auth" className="w-full sm:w-auto">
                     <Button size="lg" variant="outline" className="w-full sm:w-auto">
                       Start Free Trial
                     </Button>
                   </Link>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Resources;