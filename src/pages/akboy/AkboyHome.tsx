import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight, ArrowUpRight, GraduationCap, Palette, Code, BookOpen,
  Megaphone, Heart, Star, Quote, Mail, Phone, MapPin, MessageCircle, Send,
} from "lucide-react";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import hero1 from "@/assets/akboy-hero-1.jpg";
import hero2 from "@/assets/akboy-hero-2.jpg";
import hero3 from "@/assets/akboy-hero-3.jpg";
import hero4 from "@/assets/akboy-hero-4.jpg";

/* ============================================================
   AKBOY — Editorial Magazine Redesign
   Palette:  forest / emerald / moss / cream / ink  (no yellow)
   Type:     Syne (display)  +  Plus Jakarta Sans (body)
   Layout:   Magazine — featured + grid, strong hierarchy
   ============================================================ */

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-akboy-forest font-semibold">
    <span className="w-6 h-px bg-akboy-forest/60" />
    {children}
  </span>
);

const SectionHead = ({
  eyebrow, title, kicker, action,
}: { eyebrow: string; title: React.ReactNode; kicker?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
    <div className="max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-akboy-ink leading-[1.05] tracking-tight mt-4">
        {title}
      </h2>
      {kicker && <p className="mt-4 text-base lg:text-lg text-akboy-ink/65 font-body leading-relaxed">{kicker}</p>}
    </div>
    {action}
  </div>
);

/* ---------------- HERO (magazine featured) ---------------- */
function Hero({ basePath }: { basePath: string }) {
  return (
    <section className="relative bg-akboy-cream pt-16 sm:pt-20 pb-16 lg:pb-24 border-b border-akboy-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead row */}
        <div className="flex items-center justify-between pb-8 border-b border-akboy-ink/10 mb-10 lg:mb-14">
          <Eyebrow>Issue 01 · Creative Hub</Eyebrow>
          <span className="hidden sm:inline text-[11px] uppercase tracking-[0.25em] text-akboy-ink/50">
            Education · Design · Digital
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[0.95] tracking-tight text-akboy-ink">
              Where <span className="text-akboy-forest">education</span> meets the craft of creating.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-akboy-ink/70 font-body leading-relaxed">
              AKBOY Creative Hub guides students into top universities, trains the next wave of digital
              creators, and builds brands that move people.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-13 px-7 rounded-none bg-akboy-forest hover:bg-akboy-forest-deep text-white text-sm font-semibold tracking-wide uppercase">
                <Link to={`${basePath}/services`}>Explore services <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-13 px-7 rounded-none text-akboy-forest hover:bg-akboy-mint/40 text-sm font-semibold tracking-wide uppercase border border-akboy-forest/20">
                <Link to={`${basePath}/register`}>Start learning</Link>
              </Button>
            </div>
          </div>

          {/* Featured image */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden bg-akboy-emerald">
              <img src={hero2} alt="Featured student" className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-akboy-ink/60">
              <span>Featured · JAMB 2025</span>
              <span>320+ average score</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 lg:grid-cols-4 border-t border-b border-akboy-ink/10 divide-x divide-akboy-ink/10">
          {[
            ["1,200+", "Students guided"],
            ["98%", "Admission rate"],
            ["300+", "Brands designed"],
            ["6", "Core services"],
          ].map(([n, l]) => (
            <div key={l} className="py-6 px-4 lg:px-8 first:pl-0">
              <div className="font-display text-3xl lg:text-4xl text-akboy-forest">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-akboy-ink/60">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUSTED MARQUEE ---------------- */
function TrustedBy() {
  const items = ["UNILAG", "Lagos State Univ.", "Univ. of Ibadan", "Greenwood Academy", "Bridge International", "Coastline Schools", "BrightFuture Tutors", "EduraCBT", "UNIOSUN", "Covenant Prep"];
  return (
    <section className="py-10 bg-white border-b border-akboy-stone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-akboy-ink/50 font-semibold mb-6">
          Trusted across Nigeria
        </p>
        <div className="overflow-hidden relative">
          <div className="flex gap-14 akboy-marquee whitespace-nowrap">
            {[...items, ...items].map((name, i) => (
              <span key={i} className="font-display text-xl text-akboy-ink/35">{name}</span>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
function About({ basePath }: { basePath: string }) {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] overflow-hidden">
            <img src={hero3} alt="Akboy story" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-7 lg:pt-8">
          <Eyebrow>About AKBOY</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-akboy-ink leading-[1.05] tracking-tight mt-4">
            A hub where students become scholars, and brands become stories.
          </h2>
          <p className="mt-6 text-lg text-akboy-ink/70 font-body leading-relaxed max-w-2xl">
            We exist at the intersection of education and creativity — guiding students into top
            universities, training the next wave of digital creators, and designing brands that move people.
          </p>

          <div className="grid sm:grid-cols-3 mt-10 border-t border-akboy-ink/10">
            {[
              ["Mission", "Empower youth through education and creative skills."],
              ["Vision",  "Africa's most loved hub for learning and design."],
              ["Impact",  "1,200+ students guided. 300+ brands built."],
            ].map(([l, t]) => (
              <div key={l} className="py-6 sm:pr-6 border-b sm:border-b-0 sm:border-r last:border-r-0 border-akboy-ink/10">
                <div className="text-[11px] uppercase tracking-[0.25em] text-akboy-forest font-bold mb-2">{l}</div>
                <p className="text-sm text-akboy-ink/70 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <Link to={`${basePath}/about`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-akboy-forest hover:gap-3 transition-all uppercase tracking-wider">
            Read the full story <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES (uniform editorial grid) ---------------- */
const SERVICES = [
  { icon: GraduationCap, n: "01", title: "Educational Consultancy", desc: "JAMB · WAEC · Post-UTME · admission strategy." },
  { icon: BookOpen,      n: "02", title: "Tutorial Services",        desc: "Live and on-demand classes for secondary & uni students." },
  { icon: Palette,       n: "03", title: "Graphics Design",          desc: "Brand identity, flyers, social, packaging." },
  { icon: Code,          n: "04", title: "Web Development",          desc: "Modern, fast, conversion-ready websites." },
  { icon: Megaphone,     n: "05", title: "Digital Skills Training",  desc: "Bootcamps in design, no-code, marketing & AI." },
  { icon: Heart,         n: "06", title: "Quran & Tajweed",          desc: "Personalized memorization and pronunciation coaching." },
];

function Services({ basePath }: { basePath: string }) {
  return (
    <section className="py-20 lg:py-28 bg-akboy-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="What we do"
          title={<>Six services. One creative ecosystem.</>}
          action={
            <Button asChild variant="ghost" className="rounded-none text-akboy-forest hover:bg-white border border-akboy-forest/20 uppercase tracking-wider text-xs font-semibold">
              <Link to={`${basePath}/services`}>All services <ArrowUpRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          }
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-akboy-ink/10">
          {SERVICES.map((s) => (
            <Link
              key={s.n}
              to={`${basePath}/services`}
              className="group relative p-8 lg:p-10 border-r border-b border-akboy-ink/10 bg-white hover:bg-akboy-forest hover:text-white transition-colors"
            >
              <div className="flex items-start justify-between mb-12">
                <span className="font-display text-sm text-akboy-ink/40 group-hover:text-white/50">{s.n}</span>
                <s.icon className="w-5 h-5 text-akboy-forest group-hover:text-akboy-moss" />
              </div>
              <h3 className="font-display text-2xl leading-tight mb-3">{s.title}</h3>
              <p className="text-sm font-body leading-relaxed text-akboy-ink/65 group-hover:text-white/75">{s.desc}</p>
              <ArrowUpRight className="absolute bottom-6 right-6 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURED PROGRAMS (magazine cards) ---------------- */
const PROGRAMS = [
  { tag: "JAMB · WAEC",   title: "Exam Success Orientation",   desc: "Intensive prep covering syllabus mastery, exam tactics & mindset.", img: hero1, href: "/register" },
  { tag: "Consultancy",   title: "Admission Assistance",       desc: "1-on-1 university placement guidance — UNILAG, LASU, UI, UNIOSUN.", img: hero2, href: "/services" },
  { tag: "Creative",      title: "Graphics Design Course",     desc: "Master Canva, Photoshop & Illustrator with live projects.",        img: hero3, href: "/services" },
  { tag: "Digital",       title: "Website Design Training",    desc: "Build modern responsive websites with no-code & code tools.",      img: hero4, href: "/services" },
];

function Programs({ basePath }: { basePath: string }) {
  const [featured, ...rest] = PROGRAMS;
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Featured programs"
          title={<>Programs built to change trajectories.</>}
        />
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Featured large */}
          <Link to={`${basePath}${featured.href}`} className="lg:col-span-7 group block">
            <div className="aspect-[16/10] overflow-hidden bg-akboy-stone">
              <img src={featured.img} alt={featured.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            </div>
            <div className="mt-6">
              <span className="text-[11px] uppercase tracking-[0.25em] text-akboy-forest font-semibold">{featured.tag}</span>
              <h3 className="font-display text-3xl lg:text-4xl text-akboy-ink mt-3 leading-tight group-hover:text-akboy-forest transition-colors">{featured.title}</h3>
              <p className="mt-3 text-base text-akboy-ink/65 max-w-lg">{featured.desc}</p>
            </div>
          </Link>

          {/* List of others */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-akboy-ink/10 border-t border-b border-akboy-ink/10">
            {rest.map((p) => (
              <Link key={p.title} to={`${basePath}${p.href}`} className="group py-6 flex gap-5 items-start hover:bg-akboy-cream px-2 -mx-2 transition-colors">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-akboy-forest font-semibold">{p.tag}</span>
                  <h4 className="font-display text-lg text-akboy-ink leading-tight mt-1 group-hover:text-akboy-forest transition-colors">{p.title}</h4>
                  <p className="mt-1 text-sm text-akboy-ink/60 line-clamp-2">{p.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-akboy-ink/30 group-hover:text-akboy-forest mt-2 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
const TESTIMONIALS = [
  { quote: "AKBOY didn't just prep me for JAMB — they reshaped how I think about studying. Scored 312.", name: "Aisha Bello", role: "UNILAG Medical Student" },
  { quote: "The brand identity they built for our school is now copied across the state. World-class work.", name: "Mr. Ade Okon",  role: "Director, Greenwood Academy" },
  { quote: "From zero to landing my first design client in 8 weeks. The bootcamp delivers what it promises.", name: "Tunde Adigun", role: "Freelance Designer" },
];

function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-akboy-forest text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <span className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-akboy-moss font-semibold">
            <span className="w-6 h-px bg-akboy-moss/60" /> Voices
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight mt-4">
            Real stories from real people we've worked with.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-white/15 border border-white/15">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-akboy-forest p-8 lg:p-10">
              <Quote className="w-6 h-6 text-akboy-moss mb-6" />
              <p className="font-display text-xl leading-snug text-white/95">"{t.quote}"</p>
              <div className="mt-8 pt-6 border-t border-white/15">
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-white/55 mt-0.5">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  { q: "Who can join AKBOY's programs?", a: "Secondary students, undergraduates, parents, entrepreneurs and brands — anyone who wants to grow through education or creative work." },
  { q: "Are classes online or physical?", a: "Most tutorials run online via live sessions. Some intensive programs and the Mock Exam are physical at our Lagos campus." },
  { q: "How do I book a creative project?", a: "Use the Services page or send a message via our WhatsApp button. We respond within a few hours." },
  { q: "Do you offer scholarships?", a: "Yes, we run quarterly merit and need-based scholarships for our tutorial programs. Follow our Campus Hub for openings." },
];

function FAQ() {
  return (
    <section className="py-20 lg:py-28 bg-akboy-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHead eyebrow="FAQ" title={<>Answers to common questions.</>} />
        <Accordion type="single" collapsible className="border-t border-akboy-ink/10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border-b border-akboy-ink/10">
              <AccordionTrigger className="py-6 text-left font-display text-lg text-akboy-ink hover:text-akboy-forest hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-akboy-ink/70 text-base leading-relaxed pb-6">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA({ basePath }: { basePath: string }) {
  return (
    <section className="py-24 lg:py-32 bg-white border-t border-akboy-stone">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Eyebrow>Begin with AKBOY</Eyebrow>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-akboy-ink leading-[1.02] tracking-tight mt-6">
          Ready to learn, create, or grow your brand?
        </h2>
        <p className="mt-6 text-lg text-akboy-ink/65 max-w-xl mx-auto">
          Book a free consultation. We'll map a plan tailored to where you are and where you're going.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="h-13 px-8 rounded-none bg-akboy-forest hover:bg-akboy-forest-deep text-white text-sm font-semibold tracking-wide uppercase">
            <Link to={`${basePath}/contact`}>Book consultation <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-13 px-8 rounded-none text-akboy-forest hover:bg-akboy-mint/40 text-sm font-semibold tracking-wide uppercase border border-akboy-forest/20">
            <a href="https://wa.me/2348101466977" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 w-4 h-4" /> WhatsApp us
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */
export default function AkboyHome() {
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <AkboyLayout
      title="AKBOY Creative Hub — Education meets Creativity"
      description="AKBOY Creative Hub blends tutorials, admission consultancy, design and digital training into one premium ecosystem."
    >
      <Hero basePath={basePath} />
      <TrustedBy />
      <About basePath={basePath} />
      <Services basePath={basePath} />
      <Programs basePath={basePath} />
      <Testimonials />
      <FAQ />
      <CTA basePath={basePath} />
    </AkboyLayout>
  );
}
