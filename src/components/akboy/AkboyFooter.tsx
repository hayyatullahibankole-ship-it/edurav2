import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin, Terminal } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";

  return (
    <footer className="bg-slate-900 border-t border-cyan-500/10 text-slate-300 relative overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-2">
            <div className="inline-block bg-slate-800/50 border border-cyan-500/20 px-6 py-4 rounded-xl">
              <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-16 w-auto" />
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering creativity and education through innovative solutions, cutting-edge design, and transformative technology.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Facebook, href: "https://facebook.com/akboycreativehub" },
                { icon: Instagram, href: "https://instagram.com/akboycreativehub" },
                { icon: Linkedin, href: "https://linkedin.com/company/akboycreativehub" },
                { icon: Twitter, href: "https://twitter.com/akboycreative" },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 hover:bg-cyan-500/10 rounded-lg flex items-center justify-center transition-all hover:text-cyan-400"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-6">Navigation</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us", path: `${basePath}/about` },
                { label: "Services", path: `${basePath}/services` },
                { label: "Portfolio", path: `${basePath}/portfolio` },
                { label: "Events", path: `${basePath}/events` },
                { label: "Blog", path: "/blog" },
                { label: "Contact", path: `${basePath}/contact` },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link to={path} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-6">Products</h4>
            <Link to="/"
              className="group block bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 rounded-xl p-4 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-slate-950" />
                </div>
                <h5 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors text-sm">Edura CBT</h5>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI-powered exam prep platform
              </p>
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              {[
                { icon: Mail, text: "akboycreativehub@gmail.com", href: "mailto:akboycreativehub@gmail.com" },
                { icon: Phone, text: "+234 810 146 6977", href: "tel:+2348101466977" },
                { icon: MapPin, text: "Lagos, Nigeria", href: undefined },
              ].map(({ icon: Icon, text, href }, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  {href ? (
                    <a href={href} className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">{text}</a>
                  ) : (
                    <span className="text-slate-400 text-sm">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            © {currentYear} AKBOY Creative Hub. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <Link to="/privacy" className="text-slate-500 hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-cyan-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
