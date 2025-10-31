import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Download,
  BookOpen,
  Lock,
  Star,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";

const Books = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { canAccessPremium } = useSubscription();
  const [books, setBooks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    fetchBooksData();
  }, []);

  const fetchBooksData = async () => {
    try {
      setLoading(true);

      // Fetch subjects
      const subjectsResp = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (subjectsResp.error) throw new Error('Failed to fetch subjects');

      // Fetch books (resources with file_type = 'pdf' or 'book')
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .in('file_type', ['pdf', 'book'])
        .order('created_at', { ascending: false });

      if (!canAccessPremium && !isAdmin) {
        query = query.eq('access_level', 'free');
      }

      const { data: booksData, error: booksError } = await query;
      if (booksError) throw booksError;

      setSubjects(subjectsResp.data || []);
      setBooks(booksData || []);
    } catch (error: any) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (book: any) => {
    if (book.access_level !== 'free' && !canAccessPremium && !isAdmin) {
      toast({
        title: "Premium Content",
        description: "Please upgrade to access this book",
        variant: "destructive"
      });
      return;
    }

    window.open(book.file_url, '_blank');
    toast({
      title: "Downloading",
      description: `${book.title} is being downloaded`,
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || book.subject_id === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Educational <span className="text-primary">Books</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive textbooks and study materials for your exam preparation
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search books..."
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

          {/* Books Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No books found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const subject = subjects.find(s => s.id === book.subject_id);
                const isLocked = book.access_level !== 'free' && !canAccessPremium && !isAdmin;

                return (
                  <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-border">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                            {book.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {subject && (
                              <Badge variant="secondary" className="text-xs">
                                {subject.name}
                              </Badge>
                            )}
                            {book.access_level !== 'free' && (
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
                      {book.description && (
                        <CardDescription className="line-clamp-2">
                          {book.description}
                        </CardDescription>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {book.file_size && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {book.file_size}
                          </span>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleDownload(book)}
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
            <Card className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-2">Unlock Premium Books</h3>
                <p className="text-muted-foreground mb-6">
                  Get access to exclusive textbooks, study guides, and reference materials
                </p>
                <Button size="lg" asChild>
                  <a href="/payment">Upgrade Now</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Books;
