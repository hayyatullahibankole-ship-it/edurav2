import { AkboyLayout } from "@/components/akboy/AkboyLayout";
import { Card } from "@/components/ui/card";
import { Target, Eye, BookOpen, Palette, Code, Lightbulb, Sparkles, Rocket } from "lucide-react";
import aboutHero from "@/assets/akboy-about-hero.jpg";
import teamImage from "@/assets/akboy-team.jpg";

export default function AkboyAbout() {
  return (
    <AkboyLayout>
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="space-y-8 md:max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-emerald-50">
              <Sparkles className="h-4 w-4" />
              About AKBOY
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">Designing growth for students, creatives, and modern brands.</h1>
              <p className="max-w-xl text-slate-300 text-lg leading-8">
                AKBOY Creative Hub blends education, digital design, and community impact in a clean, modern experience built for today's learners and young entrepreneurs.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Years of Growth", value: "5+" },
                { label: "Programs Delivered", value: "120+" },
                { label: "Young Creatives Helped", value: "500+" }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
              <Lightbulb className="h-4 w-4" />
              Our Purpose
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Inspiring confident learners and creative thinkers.</h2>
            <p className="max-w-xl text-slate-600 text-lg leading-8">
              We started from the belief that strong education, practical skills, and thoughtful design can create meaningful opportunities. AKBOY is a modern hub for students, creatives, and small brands focused on growth, clarity, and trust.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card className="border-gray-200 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">Clear Vision</h3>
                <p className="mt-3 text-slate-600">Build learning experiences and creative services that feel polished, practical, and human.</p>
              </Card>
              <Card className="border-gray-200 p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">Purposeful Mission</h3>
                <p className="mt-3 text-slate-600">Equip young people with digital skills, academic support, and creative confidence for today's world.</p>
              </Card>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-sm">
            <img src={aboutHero} alt="AKBOY about hero" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-10 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-600">What we do</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">Practical services, focused support, and modern learning.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Palette className="h-6 w-6 text-white" />,
                  title: "Design & Branding",
                  description: "Identity, graphics, and visual systems that help projects look sharp and professional."
                },
                {
                  icon: <BookOpen className="h-6 w-6 text-white" />,
                  title: "Training & Tutoring",
                  description: "Academic support, exam prep, and creative learning paths for students and young creators."
                },
                {
                  icon: <Code className="h-6 w-6 text-white" />,
                  title: "Digital Support",
                  description: "Website setup, content guidance, and practical tools for growing online presence."
                }
              ].map((item) => (
                <Card key={item.title} className="border-gray-200 p-8 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-700 text-white shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-4 text-slate-600 leading-7">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
              <Rocket className="h-4 w-4" />
              Next Phase
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Ready for what comes next.</h2>
            <p className="text-slate-600 leading-8 text-lg">
              We are moving toward a future where AKBOY offers more structured online learning, deeper mentorship, and stronger partnerships for youth and schools.
            </p>
            <ul className="space-y-4">
              {[
                "Online learning experiences for students and young professionals.",
                "Guided design and creative growth programs.",
                "Partnerships with schools, startups, and community groups."
              ].map((item, index) => (
                <li key={index} className="flex gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-700 text-white">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[32px] overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <img src={teamImage} alt="AKBOY team" className="h-full w-full object-cover" />
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-slate-100 p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-950">Our culture</h3>
              <p className="mt-4 text-slate-600 leading-7">
                Integrity, consistency, and refreshing clarity are what define AKBOY. We help creatives and students move forward with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
