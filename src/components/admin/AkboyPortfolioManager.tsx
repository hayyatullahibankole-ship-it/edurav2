import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star } from "lucide-react";
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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    images: "",
    project_url: "",
    client_name: "",
    completion_date: "",
    tags: "",
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from("akboy_portfolio")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolio((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        ...formData,
        images: formData.images ? formData.images.split(",").map(i => i.trim()) : [],
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
      };

      if (editingItem) {
        const { error } = await supabase
          .from("akboy_portfolio")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Portfolio item updated successfully" });
      } else {
        const { error } = await supabase
          .from("akboy_portfolio")
          .insert([itemData]);

        if (error) throw error;
        toast({ title: "Portfolio item created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchPortfolio();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: Portfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      images: item.images?.join(", ") || "",
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
    if (!confirm("Are you sure you want to delete this portfolio item?")) return;

    try {
      const { error } = await supabase
        .from("akboy_portfolio")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Portfolio item deleted successfully" });
      fetchPortfolio();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      images: "",
      project_url: "",
      client_name: "",
      completion_date: "",
      tags: "",
      is_featured: false,
      is_active: true,
    });
    setEditingItem(null);
  };

  if (loading) return <div className="text-center p-8">Loading portfolio...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AKBOY Portfolio Management</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Branding, Web, Flyers, Campaigns"
                  required
                />
              </div>
              <div>
                <Label>Client Name</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Image URLs (comma-separated)</Label>
                <Textarea
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://image1.jpg, https://image2.jpg"
                  rows={2}
                />
              </div>
              <div>
                <Label>Project URL</Label>
                <Input
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Completion Date</Label>
                <Input
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="logo, branding, modern"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"}
                </Button>
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
                <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover rounded" />
              )}
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                {item.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{item.category}</span>
                {item.client_name && (
                  <>
                    <span>•</span>
                    <span>{item.client_name}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
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
