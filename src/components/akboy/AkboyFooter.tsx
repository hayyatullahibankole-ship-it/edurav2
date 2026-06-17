import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  if (isCampusHub) {
    return (
      <footer className="bg-akboy-forest-deep text-akboy-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src={akboyLogo} alt="Campus Hub" className="h-10 w-auto" />
              <span className="text-sm font-display font-semibold">Campus Hub</span>
            </div>
            <p className="max-w-xl text-sm text-akboy-cream/70">
              Fresh admission news, scholarship updates and campus headlines for Nigerian students.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/" className="hover:text-akboy-butter">Home</Link>
            <Link to="/blog" className="hover:text-akboy-butter">Blog</Link>
            <a href="mailto:akboycreativehub@gmail.com" className="hover:text-akboy-butter">Contact</a>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-akboy-cream/50">
          © {currentYear} Campus Hub. A product of AKBOY Creative Hub.
        </div>
      </footer>
    );
  }

  const columns: { title: string; links: { name: string; to: string; external?: boolean }[] }[] = [
    {
      title: "Services",
      links: [
        { name: "Educational Consultancy", to: `${basePath}/services#educational` },
        { name: "Tutorials", to: `${basePath}/services#tutorials` },
        { name: "Graphic Design", to: `${basePath}/services#graphics` },
        { name: "Web Design", to: `${basePath}/services#web` },
        { name: "Branding", to: `${basePath}/services#branding` },
      ],
    },
    {
      title: "Learn",
      links: [
        { name: "Exam Prep Academy", to: `${basePath}/register` },
        { name: "Mock Exams", to: `${basePath}/mock` },
        { name: "JAMB CBT Practice", to: "https://edura.space", external: true },
        { name: "Resources", to: `${basePath}/resources` },
        { name: "Academy (soon)", to: `${basePath}/academy` },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", to: `${basePath}/about` },
        { name: "Portfolio", to: `${basePath}/portfolio` },
        { name: "Testimonials", to: `${basePath}/testimonials` },
        { name: "Campus Hub", to: `${basePath}/campus-hub` },
        { name: "Book Consultation", to: `${basePath}/consultation` },
      ],
    },
  ];

  return (
    <footer className="bg-akboy-forest-deep text-akboy-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05] akboy-grain pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* CTA strip */}
        <div className="mb-14 grid md:grid-cols-[2fr,1fr] gap-8 items-end pb-12 border-b border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-akboy-butter mb-3">Let's build something remarkable</p>
            <h3 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05]">
              Ready to grow your brand or your grades?
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`${basePath}/consultation`}
              className="inline-flex items-center gap-2 bg-akboy-butter text-akboy-ink font-semibold px-5 py-3 rounded-full hover:brightness-95 transition"
            >
              Book consultation <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/2348101466977"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-akboy-cream font-medium px-5 py-3 rounded-full transition"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="col-span-2 space-y-5">
            <div className="inline-flex items-center gap-3 bg-akboy-cream rounded-2xl px-3 py-2">
              <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-10 w-auto" />
              <span className="font-display text-akboy-forest font-semibold">AKBOY Creative Hub</span>
            </div>
            <p className="text-sm text-akboy-cream/70 leading-relaxed max-w-sm">
              Empowering growth through creativity and education. A creative & educational hub helping students, schools, businesses and organizations achieve their goals.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook, href: "https://facebook.com/akboycreativehub", label: "Facebook" },
                { Icon: Instagram, href: "https://instagram.com/akboycreativehub", label: "Instagram" },
                { Icon: Linkedin, href: "https://linkedin.com/company/akboycreativehub", label: "LinkedIn" },
                { Icon: Twitter, href: "https://twitter.com/akboycreative", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 hover:bg-akboy-butter hover:text-akboy-ink rounded-full flex items-center justify-center transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.18em] text-akboy-butter mb-4">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.name}>
                      <a href={l.to} target="_blank" rel="noopener noreferrer" className="text-akboy-cream/75 hover:text-akboy-butter transition">
                        {l.name}
                      </a>
                    </li>
                  ) : (
                    <li key={l.name}>
                      <Link to={l.to} className="text-akboy-cream/75 hover:text-akboy-butter transition">
                        {l.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 grid md:grid-cols-3 gap-4 text-sm text-akboy-cream/60">
          <a href="mailto:akboycreativehub@gmail.com" className="flex items-center gap-2 hover:text-akboy-butter">
            <Mail className="w-4 h-4" /> akboycreativehub@gmail.com
          </a>
          <a href="tel:+2348101466977" className="flex items-center gap-2 hover:text-akboy-butter">
            <Phone className="w-4 h-4" /> +234 810 146 6977
          </a>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Lagos, Nigeria
          </span>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-akboy-cream/50">
          <p>© {currentYear} AKBOY Creative Hub. Empowering Growth Through Creativity & Education.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-akboy-butter">Privacy</Link>
            <Link to="/terms" className="hover:text-akboy-butter">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
