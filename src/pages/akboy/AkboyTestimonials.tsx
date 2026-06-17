import { useEffect, useState } from "react";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Star } from "lucide-react";

interface T {
  id: string;
  client_name: string;
  company: string | null;
  content: string;
  role: string | null;
  rating: number | null;
  image_url: string | null;
}

const fallback: T[] = [
  { id: "1", client_name: "Mrs. Adebisi O.", company: "Greenfield Academy", role: "Principal", content: "AKBOY didn't just design our school's identity — they reshaped how parents see us. Enrolment for the new session is clearly up.", rating: 5, image_url: null },
  { id: "2", client_name: "Tunde A.", company: "JAMB 2025", role: "Student", content: "I went from struggling with JAMB topics to scoring 287. The tutorials were focused, and the team genuinely cared.", rating: 5, image_url: null },
  { id: "3", client_name: "Chidinma E.", company: "Lumen Studio", role: "Founder", content: "Our brand finally feels intentional. The website, the visuals, the consistency — clients comment on it constantly.", rating: 5, image_url: null },
  { id: "4", client_name: "Mr. Bayo K.", company: "Sunrise College", role: "Director", content: "Their educational consultancy gave us a clear roadmap. Six months later, our retention numbers tell the story.", rating: 5, image_url: null },
  { id: "5", client_name: "Aisha I.", company: "WAEC 2024", role: "Student", content: "Eight As. I never thought it was possible until I sat in an AKBOY tutorial.", rating: 5, image_url: null },
  { id: "6", client_name: "Bloom Bakery", company: "Lagos", role: "Small Business", content: "From logo to packaging to social — the entire brand finally looks like the bakery we always wanted to be.", rating: 5, image_url: null },
];

export default function AkboyTestimonials() {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("akboy_testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      const rows = (data as T[] | null) || [];
      setItems(rows.length ? rows : fallback);
      setLoading(false);
    })();
  }, []);

  return (
    <AkboyLayout
      title="Testimonials — Student & Client Stories"
      description="Real stories from students, schools, businesses and organizations who've worked with AKBOY Creative Hub."
    >
      <section className="bg-akboy-cream akboy-grain py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.22em] text-akboy-forest font-semibold">Stories that matter</p>
          <h1 className="mt-3 font-display text-5xl lg:text-6xl font-semibold leading-[1.05] text-akboy-ink max-w-3xl">
            What students, schools and brands say about us.
          </h1>
          <p className="mt-5 text-lg text-akboy-ink/70 max-w-2xl">
            We measure ourselves by the lives we change and the businesses we grow.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-akboy-ink/50">Loading…</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((t, i) => (
                <figure
                  key={t.id}
                  className={`rounded-3xl p-7 border flex flex-col ${
                    i % 5 === 0 ? "bg-akboy-forest text-akboy-cream border-akboy-forest" : "bg-akboy-cream border-akboy-stone text-akboy-ink"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Quote className={`w-7 h-7 ${i % 5 === 0 ? "text-akboy-butter" : "text-akboy-forest"}`} />
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating || 5 }).map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 fill-current ${i % 5 === 0 ? "text-akboy-butter" : "text-akboy-forest"}`} />
                      ))}
                    </div>
                  </div>
                  <blockquote className={`mt-5 font-display text-lg leading-snug flex-1 ${i % 5 === 0 ? "text-akboy-cream" : "text-akboy-ink"}`}>
                    "{t.content}"
                  </blockquote>
                  <figcaption className={`mt-6 pt-5 border-t ${i % 5 === 0 ? "border-akboy-cream/20" : "border-akboy-stone"}`}>
                    <p className="font-semibold">{t.client_name}</p>
                    <p className={`text-xs mt-0.5 ${i % 5 === 0 ? "text-akboy-cream/60" : "text-akboy-ink/55"}`}>
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </AkboyLayout>
  );
}
