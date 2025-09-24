import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Plus, 
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Video,
  Image,
  File,
  Globe,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  subject_id: string;
  access_level: string;
  tags: any;
  download_count: number;
  view_count: number;
  is_active: boolean;
  uploaded_by: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function ResourceManagement() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    file: null as File | null,
    file_type: '',
    subject_id: '',
    access_level: 'free' as 'free' | 'premium',
    tags: [] as string[],
    youtube_url: '',
    resource_type: 'file' as 'file' | 'video' | 'link'
  });

  const [bulkFiles, setBulkFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [resourcesResp, subjectsResp] = await Promise.all([
        supabase.from('resources').select(`
          *,
          subjects(name, code)
        `).order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').eq('is_active', true)
      ]);

      setResources(resourcesResp.data || []);
      setSubjects(subjectsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load resources data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewResource(prev => ({
        ...prev,
        file,
        file_type: file.type,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  const handleUploadResource = async () => {
    try {
      setLoading(true);
      
      let fileUrl = '';
      let fileSize = 0;
      let fileType = newResource.file_type;

      if (newResource.resource_type === 'file' && newResource.file) {
        // For now, we'll store the file name. In a real implementation,
        // you'd upload to Supabase Storage or another service
        fileUrl = `uploads/${newResource.file.name}`;
        fileSize = newResource.file.size;
        fileType = newResource.file.type;
      } else if (newResource.resource_type === 'video') {
        fileUrl = newResource.youtube_url;
        fileType = 'video/youtube';
      } else if (newResource.resource_type === 'link') {
        fileUrl = newResource.youtube_url;
        fileType = 'text/html';
      }

      const resourceData = {
        title: newResource.title,
        description: newResource.description,
        file_url: fileUrl,
        file_type: fileType,
        file_size_bytes: fileSize,
        subject_id: newResource.subject_id,
        access_level: newResource.access_level,
        tags: newResource.tags,
        is_active: true,
        download_count: 0,
        view_count: 0
      };

      const { error } = await supabase.from('resources').insert(resourceData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource uploaded successfully"
      });

      setIsUploadModalOpen(false);
      resetNewResource();
      fetchData();
      
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        title: "Error",
        description: "Failed to upload resource",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetNewResource = () => {
    setNewResource({
      title: '',
      description: '',
      file: null,
      file_type: '',
      subject_id: '',
      access_level: 'free',
      tags: [],
      youtube_url: '',
      resource_type: 'file'
    });
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles || bulkFiles.length === 0) return;

    try {
      setLoading(true);
      const resourcesToInsert: any[] = [];

      Array.from(bulkFiles).forEach(file => {
        resourcesToInsert.push({
          title: file.name.split('.')[0],
          description: `Bulk uploaded file: ${file.name}`,
          file_url: `uploads/${file.name}`,
          file_type: file.type,
          file_size_bytes: file.size,
          subject_id: subjects[0]?.id || '', // Default to first subject
          access_level: 'free',
          tags: [],
          is_active: true,
          download_count: 0,
          view_count: 0
        });
      });

      const { error } = await supabase.from('resources').insert(resourcesToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${resourcesToInsert.length} resources uploaded successfully`
      });

      setIsBulkUploadOpen(false);
      setBulkFiles(null);
      fetchData();

    } catch (error) {
      console.error('Error bulk uploading:', error);
      toast({
        title: "Error",
        description: "Failed to upload resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/') || fileType === 'video/youtube') {
      return <Video className="w-5 h-5" />;
    } else if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (fileType === 'text/html') {
      return <Globe className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || resource.subject_id === selectedSubject;
    const matchesType = selectedType === 'all' || resource.file_type.startsWith(selectedType);
    
    return matchesSearch && matchesSubject && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Resource Management</h2>
          <p className="text-slate-400">Upload and manage learning resources</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-600">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Bulk Upload Resources</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkFiles">Select Multiple Files</Label>
                  <Input
                    id="bulkFiles"
                    type="file"
                    multiple
                    onChange={(e) => setBulkFiles(e.target.files)}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Select multiple PDFs, videos, or other learning resources
                  </p>
                </div>

                {bulkFiles && bulkFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Selected Files ({bulkFiles.length})</h4>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {Array.from(bulkFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-slate-100 rounded">
                          <span className="truncate">{file.name}</span>
                          <span className="text-slate-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={loading || !bulkFiles || bulkFiles.length === 0}
                    className="flex-1"
                  >
                    {loading ? 'Uploading...' : `Upload ${bulkFiles?.length || 0} Resources`}
                  </Button>
                  <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label>Resource Type</Label>
                  <Select value={newResource.resource_type} onValueChange={(value: any) => setNewResource({...newResource, resource_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">File Upload (PDF, DOC, etc.)</SelectItem>
                      <SelectItem value="video">Video Link (YouTube, Vimeo)</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newResource.resource_type === 'file' && (
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                  </div>
                )}

                {(newResource.resource_type === 'video' || newResource.resource_type === 'link') && (
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={newResource.youtube_url}
                      onChange={(e) => setNewResource({...newResource, youtube_url: e.target.value})}
                      placeholder="https://youtube.com/watch?v=... or https://example.com"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newResource.title}
                    onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                    placeholder="Resource title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newResource.description}
                    onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                    placeholder="Describe what this resource covers..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newResource.subject_id} onValueChange={(value) => setNewResource({...newResource, subject_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="access">Access Level</Label>
                    <Select value={newResource.access_level} onValueChange={(value: any) => setNewResource({...newResource, access_level: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free Access</SelectItem>
                        <SelectItem value="premium">Premium Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newResource.tags.join(', ')}
                    onChange={(e) => setNewResource({...newResource, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    placeholder="study guide, revision, past questions"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleUploadResource} disabled={loading} className="flex-1">
                    {loading ? 'Uploading...' : 'Upload Resource'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resource Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Resources</p>
                <p className="text-2xl font-bold text-blue-400">{resources.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Downloads</p>
                <p className="text-2xl font-bold text-green-400">
                  {resources.reduce((sum, r) => sum + r.download_count, 0)}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Views</p>
                <p className="text-2xl font-bold text-purple-400">
                  {resources.reduce((sum, r) => sum + r.view_count, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Storage Used</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatFileSize(resources.reduce((sum, r) => sum + (r.file_size_bytes || 0), 0))}
                </p>
              </div>
              <FolderOpen className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="text">Links</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="all" className="text-white">All Resources</TabsTrigger>
          <TabsTrigger value="free" className="text-white">Free</TabsTrigger>
          <TabsTrigger value="premium" className="text-white">Premium</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-slate-600 rounded">
                        {getFileIcon(resource.file_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-white">{resource.title}</h3>
                          <Badge className={resource.access_level === 'premium' ? 'bg-yellow-600' : 'bg-green-600'}>
                            {resource.access_level}
                          </Badge>
                          <Badge variant="outline" className="text-slate-300">
                            {subjects.find(s => s.id === resource.subject_id)?.name || 'Unknown'}
                          </Badge>
                          {!resource.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>{formatFileSize(resource.file_size_bytes || 0)}</span>
                          <span>{resource.download_count} downloads</span>
                          <span>{resource.view_count} views</span>
                          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                          {resource.tags.length > 0 && (
                            <span>Tags: {resource.tags.slice(0, 3).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredResources.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No resources found</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {searchTerm || selectedSubject !== 'all' || selectedType !== 'all' 
                        ? 'Try adjusting your search filters'
                        : 'Upload your first resource to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="free">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Free resources will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Premium resources will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Resource analytics will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}