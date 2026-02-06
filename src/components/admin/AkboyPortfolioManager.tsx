import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, Upload, Loader2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  project_url: string;
  client_name: string;
  completion_date: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
}

export function AkboyPortfolioManager() {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    images: [] as string[],
    project_url: "",
    client_name: "",
    completion_date: "",
    tags: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => { fetchPortfolio(); }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("akboy_portfolio")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPortfolio((data as any) || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast({ title: "Error", description: `${file.name} exceeds 5MB limit`, variant: "destructive" });
          continue;
        }
        const ext = file.name.split('.').pop();
        const fileName = `portfolio/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
        const { error } = await supabase.storage.from('uploads').upload(fileName, file);
        if (error) {
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName);
        newUrls.push(publicUrl);
      }
      if (newUrls.length > 0) {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
        toast({ title: `${newUrls.length} image(s) uploaded` });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.images,
        project_url: formData.project_url,
        client_name: formData.client_name,
        completion_date: formData.completion_date,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      if (editingItem) {
        const { error } = await supabase.from("akboy_portfolio").update(itemData).eq("id", editingItem.id);
        if (error) throw error;
        toast({ title: "Portfolio item updated" });
      } else {
        const { error } = await supabase.from("akboy_portfolio").insert([itemData]);
        if (error) throw error;
        toast({ title: "Portfolio item created" });
      }
      setDialogOpen(false);
      resetForm();
      fetchPortfolio();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      images: Array.isArray(item.images) ? item.images : [],
      project_url: item.project_url || "",
      client_name: item.client_name || "",
      completion_date: item.completion_date || "",
      tags: item.tags?.join(", ") || "",
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    try {
      const { error } = await supabase.from("akboy_portfolio").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted" });
      fetchPortfolio();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "", images: [], project_url: "", client_name: "", completion_date: "", tags: "", is_featured: false, is_active: true });
    setEditingItem(null);
  };

  if (loading) return <div className="text-center p-8">Loading portfolio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AKBOY Portfolio Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Category *</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Branding, Web, Flyers" required />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Project Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="portfolio-images"
                    disabled={uploading}
                  />
                  <label htmlFor="portfolio-images" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-500">
                      {uploading ? "Uploading..." : "Click to upload images (max 5MB each)"}
                    </span>
                  </label>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual URL input as fallback */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:underline">Or paste image URLs manually</summary>
                  <Input
                    className="mt-2"
                    placeholder="https://image1.jpg, https://image2.jpg"
                    onChange={(e) => {
                      const urls = e.target.value.split(",").map(u => u.trim()).filter(Boolean);
                      if (urls.length) setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                    }}
                  />
                </details>
              </div>

              <div>
                <Label>Project URL</Label>
                <Input value={formData.project_url} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Completion Date</Label>
                <Input type="date" value={formData.completion_date} onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })} />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="logo, branding, modern" />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4" />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolio.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="space-y-2">
              {item.images && item.images[0] && (
                <img src={item.images[0] as string} alt={item.title} className="w-full h-48 object-cover rounded" />
              )}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                {item.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{item.category}</span>
                {item.client_name && (<><span>•</span><span>{item.client_name}</span></>)}
                {item.images?.length > 0 && (<><span>•</span><span className="flex items-center gap-1"><Image className="w-3 h-3" />{item.images.length}</span></>)}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
