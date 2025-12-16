import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Tutorial {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  online_group_price: number | null;
  online_private_price: number | null;
  physical_group_price: number | null;
  physical_private_price: number | null;
  whatsapp_group_link: string | null;
  is_active: boolean | null;
  display_order: number | null;
}

export function AkboyTutorialsManager() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    online_group_price: 0,
    online_private_price: 0,
    physical_group_price: 0,
    physical_private_price: 0,
    whatsapp_group_link: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from("akboy_tutorials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTutorials(data || []);
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
      if (editingTutorial) {
        const { error } = await supabase
          .from("akboy_tutorials")
          .update(formData)
          .eq("id", editingTutorial.id);

        if (error) throw error;
        toast({ title: "Tutorial updated successfully" });
      } else {
        const { error } = await supabase
          .from("akboy_tutorials")
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Tutorial created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchTutorials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tutorial?")) return;

    try {
      const { error } = await supabase
        .from("akboy_tutorials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Tutorial deleted successfully" });
      fetchTutorials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (tutorial: Tutorial) => {
    try {
      const { error } = await supabase
        .from("akboy_tutorials")
        .update({ is_active: !tutorial.is_active })
        .eq("id", tutorial.id);

      if (error) throw error;
      toast({ title: `Tutorial ${!tutorial.is_active ? 'activated' : 'deactivated'}` });
      fetchTutorials();
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
      name: "",
      slug: "",
      description: "",
      online_group_price: 0,
      online_private_price: 0,
      physical_group_price: 0,
      physical_private_price: 0,
      whatsapp_group_link: "",
      is_active: true,
      display_order: 0,
    });
    setEditingTutorial(null);
  };

  const openEditDialog = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      name: tutorial.name,
      slug: tutorial.slug,
      description: tutorial.description || "",
      online_group_price: tutorial.online_group_price || 0,
      online_private_price: tutorial.online_private_price || 0,
      physical_group_price: tutorial.physical_group_price || 0,
      physical_private_price: tutorial.physical_private_price || 0,
      whatsapp_group_link: tutorial.whatsapp_group_link || "",
      is_active: tutorial.is_active ?? true,
      display_order: tutorial.display_order || 0,
    });
    setDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading tutorials...</div>;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          AKBOY Tutorials Management
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Tutorial
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTutorial ? "Edit Tutorial" : "Add New Tutorial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tutorial Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: editingTutorial ? formData.slug : generateSlug(e.target.value)
                      });
                    }}
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  rows={3}
                />
              </div>

              <div className="border border-slate-600 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-emerald-400">Pricing (₦)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Online Group Price</Label>
                    <Input
                      type="number"
                      value={formData.online_group_price}
                      onChange={(e) => setFormData({ ...formData, online_group_price: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Online Private Price</Label>
                    <Input
                      type="number"
                      value={formData.online_private_price}
                      onChange={(e) => setFormData({ ...formData, online_private_price: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Group Price</Label>
                    <Input
                      type="number"
                      value={formData.physical_group_price}
                      onChange={(e) => setFormData({ ...formData, physical_group_price: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Private Price</Label>
                    <Input
                      type="number"
                      value={formData.physical_private_price}
                      onChange={(e) => setFormData({ ...formData, physical_private_price: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Group Link</Label>
                <Input
                  value={formData.whatsapp_group_link}
                  onChange={(e) => setFormData({ ...formData, whatsapp_group_link: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingTutorial ? "Update" : "Create"} Tutorial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tutorials.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No tutorials found. Add your first tutorial.</p>
          ) : (
            tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-slate-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{tutorial.name}</h3>
                    <Badge variant={tutorial.is_active ? "default" : "secondary"} className={tutorial.is_active ? "bg-emerald-600" : ""}>
                      {tutorial.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{tutorial.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-600 px-2 py-1 rounded">
                      Online Group: ₦{(tutorial.online_group_price || 0).toLocaleString()}
                    </span>
                    <span className="bg-slate-600 px-2 py-1 rounded">
                      Online Private: ₦{(tutorial.online_private_price || 0).toLocaleString()}
                    </span>
                    <span className="bg-slate-600 px-2 py-1 rounded">
                      Physical Group: ₦{(tutorial.physical_group_price || 0).toLocaleString()}
                    </span>
                    <span className="bg-slate-600 px-2 py-1 rounded">
                      Physical Private: ₦{(tutorial.physical_private_price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(tutorial)}
                    className="text-slate-300 hover:text-white"
                  >
                    {tutorial.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(tutorial)}
                    className="text-slate-300 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tutorial.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
