import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Loader2, X } from "lucide-react";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, folder = "uploads", label = "Image" }: ImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Only image files are allowed", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("akboy-images").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw error;
      const { data, error: signErr } = await supabase.storage
        .from("akboy-images")
        .createSignedUrl(path, TEN_YEARS);
      if (signErr || !data?.signedUrl) throw signErr || new Error("Could not create image link");
      onChange(data.signedUrl);
      toast({ title: "Image uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {value ? (
        <div className="relative w-40 h-28 rounded border overflow-hidden bg-muted">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-background/90 rounded-full p-1 border"
            aria-label="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-40 h-28 rounded border-2 border-dashed grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="w-5 h-5" /> Upload {label.toLowerCase()}
            </span>
          )}
        </button>
      )}
      {value && (
        <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Replace"}
        </Button>
      )}
    </div>
  );
}

export default ImageUpload;
