import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, FileText, Lock, Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";

export const PastQuestionsTab = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { canAccessPremium } = useSubscription();
  const [resources, setResources] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchPastQuestions();
  }, []);

  const fetchPastQuestions = async () => {
    try {
      setLoading(true);

      const subjectsResp = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (subjectsResp.error) throw new Error('Failed to fetch subjects');

      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!canAccessPremium && !isAdmin) {
        query = query.eq('access_level', 'free');
      }

      const { data: resourcesData, error: resourcesError } = await query;
      if (resourcesError) throw resourcesError;

      // Filter out resources that contain "syllabus" in title or description
      const pastQuestionsResources = (resourcesData || []).filter(resource => {
        const title = resource.title?.toLowerCase() || '';
        const description = resource.description?.toLowerCase() || '';
        return !title.includes('syllabus') && !description.includes('syllabus');
      });

      setSubjects(subjectsResp.data || []);
      setResources(pastQuestionsResources);
    } catch (error: any) {
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

  const handleDownload = async (resource: any) => {
    if (resource.access_level !== 'free' && !canAccessPremium && !isAdmin) {
      toast({
        title: "Premium Content",
        description: "Please upgrade to access this resource",
        variant: "destructive"
      });
      return;
    }

    window.open(resource.file_url, '_blank');
    toast({
      title: "Downloading",
      description: `${resource.title} is being downloaded`,
    });
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || resource.subject_id === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-border rounded-md bg-background"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const subject = subjects.find(s => s.id === resource.subject_id);
            const isLocked = resource.access_level !== 'free' && !canAccessPremium && !isAdmin;

            return (
              <Card key={resource.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {resource.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {subject && (
                          <Badge variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        )}
                        {resource.access_level !== 'free' && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resource.description && (
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {resource.file_size && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {resource.file_size}
                      </span>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleDownload(resource)}
                    className="w-full"
                    variant={isLocked ? "outline" : "default"}
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Upgrade to Access
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Call to Action */}
      {!canAccessPremium && !loading && (
        <Card className="mt-12 bg-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Unlock Premium Resources</h3>
            <p className="text-muted-foreground mb-6">
              Get access to exclusive study materials, past questions, books, and syllabus
            </p>
            <Button size="lg" asChild>
              <a href="/payment">Upgrade Now</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
