import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import {
  ArrowUpRight, ArrowRight, Sparkles, BookOpen, Palette, Code, GraduationCap,
  Star, Quote, MapPin, Phone, Mail, Trophy
} from "lucide-react";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";

export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("is_published", true)
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => setBlogPosts(data || []));
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const services = [
    { num: "01", icon: GraduationCap, title: "Tutorials & Mock Exams", desc: "JAMB, WAEC & post-UTME prep with real CBT simulation.", href: `${basePath}/services` },
    { num: "02", icon: BookOpen, title: "Admission Consultancy", desc: "School choice, cut-off strategy, eligibility checks.", href: `${basePath}/campus-hub` },
    { num: "03", icon: Palette, title: "Brand & Graphics", desc: "Logos, flyers, social kits — built for Nigerian creators.", href: `${basePath}/services` },
    { num: "04", icon: Code, title: "Web Development", desc: "Fast, modern websites & student-facing platforms.", href: `${basePath}/services` },
  ];

  const stats = [
    { value: "5+", label: "Years building" },
    { value: "200+", label: "Projects shipped" },
    { value: "1.2k", label: "Students taught" },
    { value: "4.9★", label: "Avg rating" },
  ];

  const testimonials = [
    { name: "Tomiwa A.", role: "JAMB 2024 · Score 312", quote: "Akboy's mock exams felt exactly like the real CBT. The consultancy made my UNILAG choice obvious." },
    { name: "Folake S.", role: "Founder, Ladybloom", quote: "Got my logo, website and social templates in one week. They get the Naija market." },
    { name: "Ifeanyi O.", role: "LASU 200L", quote: "Their admission guide saved me from making the wrong school choice. Real talk." },
  ];

  return (
    <AkboyLayout>
      {/* HERO — editorial split */}
      <section className="relative bg-[#FAF7F0] overflow-hidden">
        {/* ticker */}
        <div className="border-y border-[#0F3D2E]/10 bg-[#FAF7F0] overflow-hidden">
          <div className="flex gap-12 py-2 animate-[marquee_30s_linear_infinite] whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-[#0F3D2E]/70 font-medium">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                <span>★ Education</span><span>Consultancy</span><span>Brand Design</span>
                <span>Web Development</span><span>Mock Exams</span><span>Lagos · Nigeria</span>
                <span>Est. 2020</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-3">
                <span className="w-10 h-px bg-[#0F3D2E]" />
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#0F3D2E] font-semibold">
                  Creative Hub · Issue 01
                </span>
              </div>
              <h1 className="font-serif text-[3.2rem] sm:text-7xl lg:text-[7.5rem] leading-[0.92] text-[#0F3D2E] tracking-tight">
                Learn.<br />
                Create.<br />
                <span className="italic font-light relative inline-block">
                  Get admitted.
                  <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 300 14" preserveAspectRatio="none">
                    <path d="M2 8 Q 75 2, 150 7 T 298 6" stroke="#F4E27A" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-[#0F3D2E]/70 max-w-xl leading-relaxed">
                A studio for ambitious Nigerian students and brands — tutorials, mock exams,
                admission consultancy, and design under one roof.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-full px-7 h-12 text-base">
                  <Link to={`${basePath}/services`}>
                    Explore services <ArrowUpRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-[#0F3D2E] hover:bg-[#0F3D2E]/5 rounded-full px-7 h-12 text-base underline underline-offset-4 decoration-[#F4E27A] decoration-4">
                  <Link to={`${basePath}/campus-hub`}>Campus Hub →</Link>
                </Button>
              </div>
            </div>

            {/* Right column collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#0F3D2E]">
                <img src={hero1} alt="Akboy Creative Hub" className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                  <div className="bg-[#F4E27A] text-[#0F3D2E] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#0F3D2E] rounded-full animate-pulse"/> Live now
                  </div>
                  <div className="text-white/90 text-xs font-mono tabular-nums">
                    {time.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} · Lagos
                  </div>
                </div>
              </div>
              {/* badge cards */}
              <div className="absolute -top-4 -left-4 bg-white border border-[#0F3D2E]/10 rounded-2xl shadow-xl p-3 hidden sm:flex items-center gap-2.5 max-w-[220px]">
                <div className="w-9 h-9 bg-[#F4E27A] rounded-xl grid place-items-center"><Trophy className="w-4 h-4 text-[#0F3D2E]"/></div>
                <div>
                  <div className="text-xs font-bold text-[#0F3D2E]">Award winning</div>
                  <div className="text-[10px] text-[#0F3D2E]/60">Edtech of the year '24</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#0F3D2E] text-white rounded-2xl shadow-xl p-4 hidden sm:block">
                <div className="text-[10px] uppercase tracking-widest text-[#F4E27A]">Now booking</div>
                <div className="text-sm font-semibold mt-0.5">JAMB '26 Mock Cohort</div>
              </div>
            </div>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-16 lg:mt-24 bg-[#0F3D2E]/10 border border-[#0F3D2E]/10 rounded-2xl overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#FAF7F0] p-5 lg:p-7">
                <div className="font-serif text-4xl lg:text-5xl text-[#0F3D2E] font-medium">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-[#0F3D2E]/60 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES — numbered editorial list */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12 lg:mb-16">
            <div className="max-w-2xl">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#0F3D2E]/60 font-semibold mb-3">— Our Practice</div>
              <h2 className="font-serif text-4xl lg:text-6xl text-[#0F3D2E] leading-[1.05]">
                Four crafts.<br />One studio.
              </h2>
            </div>
            <Link to={`${basePath}/services`} className="text-sm font-semibold text-[#0F3D2E] flex items-center gap-2 hover:gap-3 transition-all">
              View all services <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          <div className="divide-y divide-[#0F3D2E]/10 border-y border-[#0F3D2E]/10">
            {services.map((s) => (
              <Link key={s.num} to={s.href}
                className="group grid grid-cols-12 gap-4 py-7 lg:py-9 items-center hover:bg-[#FAF7F0] -mx-4 px-4 transition-colors">
                <div className="col-span-2 lg:col-span-1 font-serif text-2xl lg:text-3xl text-[#0F3D2E]/40">{s.num}</div>
                <div className="col-span-1 hidden lg:block">
                  <div className="w-11 h-11 rounded-full bg-[#F4E27A] grid place-items-center group-hover:bg-[#0F3D2E] transition-colors">
                    <s.icon className="w-5 h-5 text-[#0F3D2E] group-hover:text-[#F4E27A] transition-colors"/>
                  </div>
                </div>
                <div className="col-span-10 lg:col-span-5">
                  <h3 className="font-serif text-2xl lg:text-3xl text-[#0F3D2E] tracking-tight">{s.title}</h3>
                </div>
                <div className="hidden lg:block lg:col-span-4 text-[#0F3D2E]/70 text-sm leading-relaxed">{s.desc}</div>
                <div className="col-span-12 lg:col-span-1 flex justify-start lg:justify-end">
                  <div className="w-10 h-10 rounded-full border border-[#0F3D2E]/20 grid place-items-center group-hover:bg-[#0F3D2E] group-hover:border-[#0F3D2E] transition-all">
                    <ArrowUpRight className="w-4 h-4 text-[#0F3D2E] group-hover:text-white transition-colors"/>
                  </div>
                </div>
                <div className="col-span-12 lg:hidden text-[#0F3D2E]/70 text-sm pl-10">{s.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO band */}
      <section className="bg-[#0F3D2E] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-[#F4E27A]/10 blur-3xl" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Sparkles className="w-8 h-8 text-[#F4E27A] mb-6"/>
          <p className="font-serif text-3xl sm:text-4xl lg:text-6xl leading-[1.15] tracking-tight">
            We build for the student who refuses to settle —
            <span className="text-[#F4E27A] italic"> the one who wants the admission, the brand, and the website</span>,
            without compromise.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <div className="w-10 h-px bg-[#F4E27A]"/>
            <span className="text-xs uppercase tracking-[0.3em] text-white/70">Akboy Creative Hub · Lagos</span>
          </div>
        </div>
      </section>

      {/* JOURNAL / Blog */}
      {blogPosts.length > 0 && (
        <section className="bg-[#FAF7F0] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#0F3D2E]/60 font-semibold mb-3">— Journal</div>
                <h2 className="font-serif text-4xl lg:text-6xl text-[#0F3D2E] leading-[1.05]">
                  Reads &<br/>resources.
                </h2>
              </div>
              <Link to={`${basePath}/blog`} className="text-sm font-semibold text-[#0F3D2E] flex items-center gap-2 hover:gap-3 transition-all">
                Open journal <ArrowRight className="w-4 h-4"/>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {blogPosts.map((p, i) => (
                <Link key={p.id} to={`${basePath}/blog/${p.slug || p.id}`}
                  className={`group block ${i === 0 ? "md:col-span-2 md:row-span-1" : ""}`}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#0F3D2E]/10 mb-4">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F3D2E] to-[#0F3D2E]/70 grid place-items-center">
                        <BookOpen className="w-10 h-10 text-[#F4E27A]"/>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[#0F3D2E]/60 mb-2">
                    {new Date(p.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <h3 className="font-serif text-xl lg:text-2xl text-[#0F3D2E] leading-tight group-hover:underline decoration-[#F4E27A] decoration-4 underline-offset-4">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#0F3D2E]/60 font-semibold mb-3">— Word of mouth</div>
            <h2 className="font-serif text-4xl lg:text-6xl text-[#0F3D2E] leading-[1.05]">Loved by students<br/><em className="font-light">& founders alike.</em></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="border border-[#0F3D2E]/10 rounded-3xl p-7 bg-[#FAF7F0] relative">
                <Quote className="w-8 h-8 text-[#F4E27A] mb-4"/>
                <p className="text-[#0F3D2E] leading-relaxed mb-6 font-serif text-lg italic">"{t.quote}"</p>
                <div className="flex items-center justify-between border-t border-[#0F3D2E]/10 pt-4">
                  <div>
                    <div className="font-semibold text-[#0F3D2E] text-sm">{t.name}</div>
                    <div className="text-xs text-[#0F3D2E]/60">{t.role}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[#F4E27A] text-[#F4E27A]"/>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#FAF7F0] py-20 lg:py-32 border-t border-[#0F3D2E]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-5xl lg:text-8xl text-[#0F3D2E] leading-[0.95] tracking-tight">
            Let's build<br/>
            <span className="italic font-light">something real.</span>
          </h2>
          <p className="mt-8 text-lg text-[#0F3D2E]/70 max-w-xl mx-auto">
            Whether it's an admission, a brand, or a web product — start a conversation today.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-[#0F3D2E] hover:bg-[#0F3D2E]/90 text-white rounded-full px-8 h-12">
              <Link to={`${basePath}/contact`}>Start a project <ArrowUpRight className="ml-1 w-4 h-4"/></Link>
            </Button>
            <a href="https://wa.me/2348101466977" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-full border border-[#0F3D2E]/20 text-[#0F3D2E] hover:bg-[#F4E27A] hover:border-[#F4E27A] transition-colors text-sm font-semibold">
              <Phone className="w-4 h-4"/> WhatsApp us
            </a>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#0F3D2E]/60">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Lagos, Nigeria</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> hello@akboy.space</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> +234 810 146 6977</span>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </AkboyLayout>
  );
}
