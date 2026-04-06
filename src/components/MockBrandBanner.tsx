import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrandConfig {
  brand_name: string;
  brand_logo_url: string;
  brand_tagline: string;
  brand_color: string;
  brand_enabled: boolean;
}

const defaultBrand: BrandConfig = {
  brand_name: "",
  brand_logo_url: "",
  brand_tagline: "",
  brand_color: "#f97316",
  brand_enabled: false,
};

export const useMockBrand = () => {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("mock_settings" as any)
          .select("key, value")
          .in("key", ["brand_name", "brand_logo_url", "brand_tagline", "brand_color", "brand_enabled"]);

        if (data) {
          const config = { ...defaultBrand };
          for (const row of data as any[]) {
            try {
              const val = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
              (config as any)[row.key] = val;
            } catch {
              (config as any)[row.key] = row.value;
            }
          }
          setBrand(config);
        }
      } catch (e) {
        console.error("Failed to load brand config:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { brand, loading };
};

export const MockBrandBanner = ({ className = "" }: { className?: string }) => {
  const { brand, loading } = useMockBrand();

  if (loading || !brand.brand_enabled || !brand.brand_name) return null;

  const bgColor = brand.brand_color || "#f97316";

  return (
    <div
      className={`w-full py-3 px-4 flex items-center justify-center gap-3 text-white ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {brand.brand_logo_url && (
        <img
          src={brand.brand_logo_url}
          alt={brand.brand_name}
          className="h-8 w-auto object-contain rounded"
        />
      )}
      <div className="text-center">
        <p className="font-bold text-sm md:text-base leading-tight">{brand.brand_name}</p>
        {brand.brand_tagline && (
          <p className="text-xs opacity-90">{brand.brand_tagline}</p>
        )}
      </div>
    </div>
  );
};
