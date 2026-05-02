import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";
import { useDomainDetection } from "@/hooks/useDomainDetection";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();
  const { isAkboy, isCampusHub } = useDomainDetection();
  const basePath = isCampusHub ? "" : isAkboy ? "" : "/akboy";

  if (isCampusHub) {
    return (
      <footer className="bg-slate-950 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={akboyLogo} alt="Campus Hub" className="h-12 w-auto" />
              <span className="text-sm font-semibold text-white">Campus Hub</span>
            </div>
            <p className="max-w-xl text-sm text-slate-400">
              Fresh admission news, scholarship updates and campus headlines for Nigerian students.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/blog" className="hover:text-white">Blog</Link>
            <a href="mailto:akboycreativehub@gmail.com" className="hover:text-white">Contact</a>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-500">
          © {currentYear} Campus Hub. All rights reserved.
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-emerald-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-2">
            <div className="inline-block bg-white px-6 py-4 rounded-xl">
              <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-16 w-auto" />
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Empowering students and businesses through design, education, and digital solutions.
            </p>
            <div className="flex space-x-3">
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
                  className="w-10 h-10 bg-emerald-800 hover:bg-yellow-400 hover:text-emerald-950 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-yellow-400 font-bold text-base mb-5">Learn</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={`${basePath}/register`} className="text-white/80 hover:text-white">Exam Prep Academy</Link></li>
              <li><Link to={`${basePath}/mock`} className="text-white/80 hover:text-white">Mock Exams</Link></li>
              <li><a href="https://edura.space" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">JAMB CBT Practice</a></li>
              <li><Link to={`${basePath}/register`} className="text-white/80 hover:text-white">Online Classes</Link></li>
            </ul>
          </div>

          {/* Campus Hub & Services */}
          <div>
            <h4 className="text-yellow-400 font-bold text-base mb-5">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to={`${basePath}/campus-hub`} className="text-white/80 hover:text-white">Campus Hub</Link></li>
              <li><Link to={`${basePath}/services`} className="text-white/80 hover:text-white">Services</Link></li>
              <li><Link to={`${basePath}/portfolio`} className="text-white/80 hover:text-white">Portfolio</Link></li>
              <li><Link to={`${basePath}/about`} className="text-white/80 hover:text-white">About</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-yellow-400 font-bold text-base mb-5">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:akboycreativehub@gmail.com" className="text-white/80 hover:text-white break-all">akboycreativehub@gmail.com</a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+2348101466977" className="text-white/80 hover:text-white">+234 810 146 6977</a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/80">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">© {currentYear} AKBOY Creative Hub. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-white/60 hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="text-white/60 hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
