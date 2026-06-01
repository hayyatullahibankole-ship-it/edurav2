import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Code2,
  Palette,
  GraduationCap,
  Sparkles,
  Compass,
  Layers,
  ShieldCheck,
  Briefcase,
  Newspaper,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import heroImage from "@/assets/akboy-hero-1.jpg";
import portraitImage from "@/assets/akboy-hero-2.jpg";

export default function AkboyHome() {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, cover_image, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setBlogPosts(data || []));
  }, []);

  const services = [
    { icon: Code2, title: "Web Design & Development", line: "Marketing sites, web apps, and product platforms." },
    { icon: Palette, title: "Brand & Graphic Design", line: "Identity systems, visual assets, and brand kits." },
    { icon: GraduationCap, title: "Educational Consultancy", line: "Admission guidance and academic strategy." },
    { icon: BookOpen, title: "Tutoring & Academy", line: "JAMB, WAEC and creative-skill programs." },
  ];

  const capabilities = [
    { k: "01", t: "Strategy", d: "Positioning, structure, and clarity before pixels." },
    { k: "02", t: "Design", d: "Modern interfaces with purposeful typography and motion." },
    { k: "03", t: "Engineering", d: "Performant, accessible, future-proof builds." },
    { k: "04", t: "Education", d: "Programs that move students from prep to admission." },
  ];

  return (
    <AkboyLayout>
      {/* ─────────────── HERO (SPLIT) ─────────────── */}
      <section className="relative bg-akboy-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* LEFT */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-akboy-line bg-white px-3 py-1.5 text-xs font-medium text-akboy-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-akboy-moss" />
                Creative + Ed-Tech Studio · Lagos, Nigeria
              </div>

              <h1 className="mt-6 font-urbanist font-extrabold tracking-tight text-akboy-ink text-[44px] leading-[1.05] sm:text-6xl lg:text-[78px] lg:leading-[1.02]">
                We build modern{" "}
                <span className="italic font-medium text-akboy-moss">digital</span>{" "}
                experiences and{" "}
                <span className="relative inline-block">
                  smart learning
                  <span className="absolute left-0 right-0 -bottom-1 h-2 bg-akboy-butter/80 -z-0" />
                </span>{" "}
                products.
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-akboy-mute">
                AKBOY Creative Hub is a design, web development, and education
                studio. We help brands look sharp online and help students get
                into the universities they deserve.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="h-12 rounded-full bg-akboy-forest hover:bg-akboy-ink text-akboy-paper font-semibold px-6 text-sm tracking-wide shadow-none transition-colors"
                >
                  <Link to={`${basePath}/contact`}>
                    Start a project
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-akboy-ink/20 bg-transparent hover:bg-akboy-sand text-akboy-ink font-semibold px-6 text-sm tracking-wide shadow-none"
                >
                  <Link to={`${basePath}/services`}>Explore services</Link>
                </Button>
              </div>

              {/* trust row */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { v: "200+", l: "Projects shipped" },
                  { v: "500+", l: "Students guided" },
                  { v: "5yrs", l: "In the craft" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-urbanist text-2xl sm:text-3xl font-bold text-akboy-ink">{s.v}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-akboy-mute">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — visual */}
            <div className="lg:col-span-5">
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-[28px] border border-akboy-line bg-akboy-sand">
                  <img src={heroImage} alt="AKBOY creative work" className="h-full w-full object-cover" />
                </div>

                {/* floating tag */}
                <div className="absolute -left-4 -bottom-4 sm:-left-8 sm:-bottom-8 max-w-[240px] rounded-2xl border border-akboy-line bg-white p-4 shadow-[0_8px_24px_-12px_rgba(11,20,16,0.18)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-akboy-forest">
                      <Sparkles className="h-5 w-5 text-akboy-butter" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-akboy-mute">Now live</div>
                      <div className="font-urbanist text-sm font-semibold text-akboy-ink leading-tight">Edura CBT 2026 Cohort</div>
                    </div>
                  </div>
                </div>

                {/* corner badge */}
                <div className="absolute -top-4 -right-4 hidden sm:flex h-20 w-20 items-center justify-center rounded-full bg-akboy-butter text-akboy-ink font-urbanist text-xs font-bold text-center leading-tight rotate-[-8deg]">
                  Awwwards<br />grade UI
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* marquee strip */}
        <div className="border-y border-akboy-line bg-akboy-sand">
          <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-2 text-[11px] uppercase tracking-[0.24em] text-akboy-mute">
              <span>Web Design</span>
              <span>·</span>
              <span>Brand Identity</span>
              <span>·</span>
              <span>JAMB & WAEC Prep</span>
              <span>·</span>
              <span>Admission Consultancy</span>
              <span>·</span>
              <span>Edura CBT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── DUAL ENTRY ─────────────── */}
      <section className="bg-akboy-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-moss font-semibold">Two doors, one studio</p>
              <h2 className="mt-3 font-urbanist text-3xl sm:text-5xl font-bold tracking-tight text-akboy-ink leading-[1.05]">
                Choose your entry point.
              </h2>
            </div>
            <p className="max-w-md text-akboy-mute">
              Whether you are a student preparing for admission or a brand looking
              to grow online — we have built a path tailored for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5 lg:gap-7">
            {/* Students */}
            <Link
              to={`${basePath}/campus-hub`}
              className="group relative overflow-hidden rounded-3xl border border-akboy-line bg-white p-8 sm:p-10 transition-colors hover:bg-akboy-sand"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-akboy-forest text-akboy-butter">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-6 w-6 text-akboy-ink/40 group-hover:text-akboy-ink transition-colors" />
              </div>
              <h3 className="mt-8 font-urbanist text-2xl sm:text-3xl font-bold text-akboy-ink">For Students</h3>
              <p className="mt-3 text-akboy-mute leading-relaxed">
                Mock exams, admission updates, scholarships, and consultancy to
                help you move from preparation to acceptance letter.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Campus Hub", "Mock Exams", "Consultancy", "Exam Prep"].map((t) => (
                  <span key={t} className="rounded-full border border-akboy-line bg-akboy-paper px-3 py-1 text-xs font-medium text-akboy-ink">
                    {t}
                  </span>
                ))}
              </div>
            </Link>

            {/* Businesses */}
            <Link
              to={`${basePath}/services`}
              className="group relative overflow-hidden rounded-3xl border border-akboy-forest bg-akboy-forest p-8 sm:p-10 text-akboy-paper transition-colors hover:bg-akboy-ink"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-akboy-butter text-akboy-ink">
                  <Briefcase className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-6 w-6 text-akboy-paper/60 group-hover:text-akboy-paper transition-colors" />
              </div>
              <h3 className="mt-8 font-urbanist text-2xl sm:text-3xl font-bold">For Brands & Founders</h3>
              <p className="mt-3 text-akboy-paper/70 leading-relaxed">
                Modern websites, sharp brand identities, and digital products
                engineered to make your business look serious and convert.
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Websites", "Branding", "Product UI", "Web Apps"].map((t) => (
                  <span key={t} className="rounded-full border border-akboy-paper/20 bg-white/5 px-3 py-1 text-xs font-medium text-akboy-paper">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────── SERVICES ─────────────── */}
      <section className="bg-white border-y border-akboy-line py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-moss font-semibold">What we do</p>
              <h2 className="mt-3 font-urbanist text-3xl sm:text-5xl font-bold tracking-tight text-akboy-ink leading-[1.05]">
                Capabilities, in one studio.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 self-end">
              <p className="text-akboy-mute leading-relaxed">
                A focused set of services for modern brands and ambitious
                students — delivered by a small team that cares about craft.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-akboy-line border border-akboy-line rounded-3xl overflow-hidden">
            {services.map((s) => (
              <div key={s.title} className="group bg-white p-7 sm:p-8 hover:bg-akboy-paper transition-colors">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-akboy-line bg-akboy-paper text-akboy-forest">
                  <s.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-urbanist text-lg font-semibold text-akboy-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-akboy-mute leading-relaxed">{s.line}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-akboy-ink group-hover:gap-2.5 transition-all">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── PROCESS / CAPABILITY ─────────────── */}
      <section className="bg-akboy-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-moss font-semibold">How we work</p>
              <h2 className="mt-3 font-urbanist text-3xl sm:text-5xl font-bold tracking-tight text-akboy-ink leading-[1.05]">
                A small studio. <br /> A serious process.
              </h2>
              <p className="mt-5 text-akboy-mute max-w-md leading-relaxed">
                We treat every project — whether a brand site or a student's
                admission journey — as something worth doing properly.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-8 h-11 rounded-full border-akboy-ink/20 bg-transparent hover:bg-akboy-sand text-akboy-ink font-semibold px-5 text-sm"
              >
                <Link to={`${basePath}/about`}>
                  About the studio
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="lg:col-span-7">
              <div className="divide-y divide-akboy-line border-y border-akboy-line">
                {capabilities.map((c) => (
                  <div key={c.k} className="grid grid-cols-12 gap-6 py-7">
                    <div className="col-span-2 font-urbanist text-xs font-semibold text-akboy-mute tracking-widest">{c.k}</div>
                    <div className="col-span-10 sm:col-span-4 font-urbanist text-xl font-bold text-akboy-ink">{c.t}</div>
                    <div className="col-span-12 sm:col-span-6 text-akboy-mute leading-relaxed">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── CAMPUS HUB PREVIEW ─────────────── */}
      <section className="bg-white border-t border-akboy-line py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-moss font-semibold">Campus Hub</p>
              <h2 className="mt-3 font-urbanist text-3xl sm:text-5xl font-bold tracking-tight text-akboy-ink leading-[1.05]">
                Real updates for Nigerian students.
              </h2>
            </div>
            <Link
              to={`${basePath}/campus-hub`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-akboy-ink hover:text-akboy-moss transition-colors"
            >
              Visit Campus Hub <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {blogPosts.length > 0 && (
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Featured */}
              <Link
                to={`/blog/${blogPosts[0].slug}`}
                className="group lg:col-span-7 overflow-hidden rounded-3xl border border-akboy-line bg-akboy-paper"
              >
                {blogPosts[0].cover_image && (
                  <div className="aspect-[16/10] overflow-hidden bg-akboy-sand">
                    <img
                      src={blogPosts[0].cover_image}
                      alt={blogPosts[0].title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="p-7 sm:p-9">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-akboy-moss font-semibold">
                    <Newspaper className="h-3.5 w-3.5" />
                    {blogPosts[0].category || "Update"}
                  </div>
                  <h3 className="mt-4 font-urbanist text-2xl sm:text-3xl font-bold text-akboy-ink leading-tight group-hover:text-akboy-moss transition-colors">
                    {blogPosts[0].title}
                  </h3>
                  {blogPosts[0].excerpt && (
                    <p className="mt-3 text-akboy-mute leading-relaxed line-clamp-2">{blogPosts[0].excerpt}</p>
                  )}
                </div>
              </Link>

              {/* List */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-akboy-line border border-akboy-line rounded-3xl overflow-hidden">
                {blogPosts.slice(1, 4).map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group flex gap-4 p-5 hover:bg-akboy-paper transition-colors"
                  >
                    {p.cover_image && (
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-akboy-sand">
                        <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-akboy-moss font-semibold">
                        {p.category || "Update"}
                      </div>
                      <h4 className="mt-1.5 font-urbanist text-base font-semibold text-akboy-ink leading-snug line-clamp-2 group-hover:text-akboy-moss transition-colors">
                        {p.title}
                      </h4>
                    </div>
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-akboy-ink/30 group-hover:text-akboy-ink transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────── CTA ─────────────── */}
      <section className="bg-akboy-paper py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-akboy-forest p-10 sm:p-16 lg:p-20 text-akboy-paper">
            {/* corner accent */}
            <div className="absolute top-8 right-8 h-16 w-16 rounded-full bg-akboy-butter" />
            <div className="absolute bottom-0 right-12 h-32 w-32 rounded-full border border-akboy-paper/10" />

            <div className="relative grid lg:grid-cols-12 gap-10 items-end">
              <div className="lg:col-span-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-akboy-butter font-semibold">Let's build</p>
                <h2 className="mt-3 font-urbanist text-4xl sm:text-6xl font-bold tracking-tight leading-[1.02]">
                  Have a project, a brand, <br className="hidden sm:block" />
                  or an admission goal?
                </h2>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
                <Button
                  asChild
                  className="h-14 rounded-full bg-akboy-butter hover:bg-akboy-lime text-akboy-ink font-semibold px-7 text-sm tracking-wide shadow-none"
                >
                  <Link to={`${basePath}/contact`}>
                    Start a conversation
                    <ArrowUpRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <span className="text-xs text-akboy-paper/60">
                  Replies within 24 hours · Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
