import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff, Settings, Upload, Loader2, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  flyer_url: string | null;
}

interface PaymentAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export function AkboyTutorialsManager() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [uploadingFlyer, setUploadingFlyer] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState<PaymentAccount>({
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);
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
    flyer_url: "",
  });

  useEffect(() => {
    fetchTutorials();
    fetchPaymentAccount();
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

  const fetchPaymentAccount = async () => {
    try {
      const { data, error } = await supabase
        .from("akboy_settings")
        .select("value")
        .eq("key", "payment_account")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data?.value) {
        const val = data.value as unknown as PaymentAccount;
        setPaymentAccount(val);
      }
    } catch (error: any) {
      console.error("Error fetching payment account:", error);
    }
  };

  const savePaymentAccount = async () => {
    setSavingPayment(true);
    try {
      // First check if key exists
      const { data: existing } = await supabase
        .from("akboy_settings")
        .select("key")
        .eq("key", "payment_account")
        .maybeSingle();

      const valueJson = JSON.parse(JSON.stringify(paymentAccount));

      if (existing) {
        const { error } = await supabase
          .from("akboy_settings")
          .update({
            value: valueJson,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "payment_account");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("akboy_settings")
          .insert([{
            key: "payment_account",
            value: valueJson,
          }]);
        if (error) throw error;
      }

      toast({ title: "Payment account details saved successfully" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingFlyer(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `flyers/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("tutorial-uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("tutorial-uploads")
        .getPublicUrl(fileName);

      setFormData({ ...formData, flyer_url: publicUrl });
      toast({ title: "Flyer uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Error uploading flyer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFlyer(false);
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
      flyer_url: "",
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
      flyer_url: tutorial.flyer_url || "",
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
    <Tabs defaultValue="tutorials" className="space-y-4">
      <TabsList className="bg-slate-700">
        <TabsTrigger value="tutorials" className="data-[state=active]:bg-emerald-600">
          <BookOpen className="w-4 h-4 mr-2" />
          Tutorials
        </TabsTrigger>
        <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600">
          <Settings className="w-4 h-4 mr-2" />
          Payment Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tutorials">
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

                  {/* Flyer Upload */}
                  <div className="space-y-2">
                    <Label>Tutorial Flyer</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFlyerUpload}
                          className="bg-slate-700 border-slate-600"
                          disabled={uploadingFlyer}
                        />
                      </div>
                      {uploadingFlyer && <Loader2 className="w-5 h-5 animate-spin" />}
                    </div>
                    {formData.flyer_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.flyer_url} 
                          alt="Tutorial flyer" 
                          className="max-h-32 rounded border border-slate-600"
                        />
                      </div>
                    )}
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
                    <div className="flex gap-4 flex-1">
                      {tutorial.flyer_url && (
                        <img 
                          src={tutorial.flyer_url} 
                          alt={tutorial.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      {!tutorial.flyer_url && (
                        <div className="w-16 h-16 bg-slate-600 rounded flex items-center justify-center">
                          <Image className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
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
      </TabsContent>

      <TabsContent value="settings">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Payment Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-sm">
              Configure the payment account details that will be displayed on the registration form.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Bank Name</Label>
                <Input
                  value={paymentAccount.bank_name}
                  onChange={(e) => setPaymentAccount({ ...paymentAccount, bank_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., Opay"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Account Number</Label>
                <Input
                  value={paymentAccount.account_number}
                  onChange={(e) => setPaymentAccount({ ...paymentAccount, account_number: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., 7043871023"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Account Name</Label>
                <Input
                  value={paymentAccount.account_name}
                  onChange={(e) => setPaymentAccount({ ...paymentAccount, account_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="e.g., AKBOY CREATIVE HUB"
                />
              </div>
            </div>
            <Button 
              onClick={savePaymentAccount} 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={savingPayment}
            >
              {savingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Payment Details"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
