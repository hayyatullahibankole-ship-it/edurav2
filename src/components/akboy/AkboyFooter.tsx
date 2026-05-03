import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  return (
    <footer className="bg-akboy-green text-akboy-cream">
      {/* Editorial top band */}
      <div className="border-b border-akboy-cream/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
          <h2 className="font-display text-3xl sm:text-5xl leading-[1.05] text-akboy-cream">
            Design. Educate. <span className="italic text-akboy-butter">Empower.</span>
          </h2>
          <Link
            to={`${basePath}/contact`}
            className="justify-self-start md:justify-self-end inline-flex items-center gap-2 bg-akboy-butter text-akboy-ink font-bold rounded-full px-5 py-3 text-sm hover:bg-akboy-sun transition-colors"
          >
            Start a project with Akboy
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-5 lg:col-span-2">
            <div className="inline-flex items-center gap-3">
              <span className="bg-akboy-cream rounded-xl p-2.5">
                <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-9 w-auto" />
              </span>
              <span className="font-display text-2xl font-black tracking-tight text-akboy-cream">AKBOY</span>
            </div>
            <p className="text-akboy-cream/70 text-sm leading-relaxed max-w-sm">
              A creative ecosystem for students and brands — design studio, exam-prep academy and a campus intelligence newsroom under one roof.
            </p>
            <div className="flex gap-2.5">
              {[
                { Icon: Facebook, href: "https://facebook.com/akboycreativehub" },
                { Icon: Instagram, href: "https://instagram.com/akboycreativehub" },
                { Icon: Linkedin, href: "https://linkedin.com/company/akboycreativehub" },
                { Icon: Twitter, href: "https://twitter.com/akboycreative" },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-akboy-cream/10 hover:bg-akboy-butter hover:text-akboy-ink text-akboy-cream rounded-full flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-akboy-butter font-bold mb-4">Learn</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={`${basePath}/register`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Exam Prep Academy</Link></li>
              <li><Link to={`${basePath}/mock`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Mock Exams</Link></li>
              <li><a href="https://edura.space" target="_blank" rel="noopener noreferrer" className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">JAMB CBT Practice</a></li>
              <li><Link to={`${basePath}/register`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Online Classes</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-akboy-butter font-bold mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={`${basePath}/campus-hub`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Campus Hub</Link></li>
              <li><Link to={`${basePath}/services`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Services</Link></li>
              <li><Link to={`${basePath}/portfolio`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">Portfolio</Link></li>
              <li><Link to={`${basePath}/about`} className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-akboy-butter font-bold mb-4">Get in touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <a href="mailto:akboycreativehub@gmail.com" className="text-akboy-cream/75 hover:text-akboy-cream break-all transition-colors">akboycreativehub@gmail.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <a href="tel:+2348101466977" className="text-akboy-cream/75 hover:text-akboy-cream transition-colors">+234 810 146 6977</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <span className="text-akboy-cream/75">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-akboy-cream/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-akboy-cream/50 text-xs">© {currentYear} AKBOY Creative Hub. Crafted in Lagos.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/privacy" className="text-akboy-cream/50 hover:text-akboy-cream transition-colors">Privacy</Link>
            <Link to="/terms" className="text-akboy-cream/50 hover:text-akboy-cream transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
