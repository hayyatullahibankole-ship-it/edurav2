import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X, Building2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  schoolData: any;
  onUpdate: () => void;
}

export default function SchoolSettings({ schoolData, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: schoolData?.name || "",
    email: schoolData?.email || "",
    phone: schoolData?.phone || "",
    address: schoolData?.address || "",
    city: schoolData?.city || "",
    state: schoolData?.state || "",
    country: schoolData?.country || "Nigeria",
    logo_url: schoolData?.logo_url || "",
    website: schoolData?.website || "",
    school_code: schoolData?.school_code || "",
    description: schoolData?.description || "",
    type: schoolData?.type || "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Sync form data when schoolData changes
  useEffect(() => {
    if (schoolData) {
      setFormData({
        name: schoolData.name || "",
        email: schoolData.email || "",
        phone: schoolData.phone || "",
        address: schoolData.address || "",
        city: schoolData.city || "",
        state: schoolData.state || "",
        country: schoolData.country || "Nigeria",
        logo_url: schoolData.logo_url ? `${schoolData.logo_url}?t=${Date.now()}` : "",
        website: schoolData.website || "",
        school_code: schoolData.school_code || "",
        description: schoolData.description || "",
        type: schoolData.type || "",
      });
    }
  }, [schoolData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show instant preview
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } catch {}

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      // Delete old logo if exists
      if (formData.logo_url) {
        const oldPath = formData.logo_url.split("/object/public/school-logos/")[1];
        if (oldPath) {
          await supabase.storage.from("school-logos").remove([oldPath]);
        }
      }

      // Upload new logo
      const fileExt = file.name.split(".").pop();
      const fileName = `${schoolData.id}/logo.${fileExt?.toLowerCase()}`;
      const { error: uploadError } = await supabase.storage
        .from("school-logos")
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("school-logos")
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;
      const logoUrlWithCache = `${logoUrl}?t=${Date.now()}`;

      // Update database
      const { error: updateError } = await supabase
        .from("schools")
        .update({ logo_url: logoUrl })
        .eq("id", schoolData.id);

      if (updateError) throw updateError;

      setFormData((prev) => ({ ...prev, logo_url: logoUrl }));
      setPreviewUrl(logoUrlWithCache);
      toast.success("Logo uploaded successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(error?.message || "Failed to upload logo");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo_url) return;

    setUploading(true);
    try {
      // Delete from storage
      const path = formData.logo_url.split("/").slice(-2).join("/");
      await supabase.storage.from("school-logos").remove([path]);

      // Update database
      const { error } = await supabase
        .from("schools")
        .update({ logo_url: null })
        .eq("id", schoolData.id);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, logo_url: "" }));
      toast.success("Logo removed successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSchool = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("schools")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          website: formData.website,
          description: formData.description,
          type: formData.type,
        })
        .eq("id", schoolData.id);

      if (error) throw error;

      toast.success("School information updated successfully");
      onUpdate();
    } catch (error: any) {
      console.error("Error updating school:", error);
      toast.error("Failed to update school information");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <div>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Update your school's information and branding</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-3">
            <Label>School Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-2">
                {previewUrl || formData.logo_url ? (
                  <AvatarImage 
                    src={(previewUrl || formData.logo_url) as string}
                    alt={formData.name}
                    key={previewUrl || formData.logo_url}
                  />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {formData.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById("logo-upload")?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                      </>
                    )}
                  </Button>
                  {formData.logo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={handleRemoveLogo}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or WEBP. Max 2MB. Logo appears on all reports.
                </p>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">School Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">School Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="e.g., Secondary, Primary, College"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_code">School Code (Auto-generated)</Label>
              <Input
                id="school_code"
                value={formData.school_code}
                disabled
                className="bg-muted cursor-not-allowed"
                placeholder="Auto-generated school code"
              />
              <p className="text-xs text-muted-foreground">
                This unique code is automatically generated and appears on all reports
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="https://yourschool.com"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">School Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="contact@school.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">School Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+234 XXX XXX XXXX"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={2}
                placeholder="Street address"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">School Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Brief description of your school, mission, and values..."
            />
          </div>

          <Button onClick={handleUpdateSchool} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your admin account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              placeholder="Re-enter password"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}