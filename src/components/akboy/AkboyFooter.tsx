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
      <footer className="bg-akboy-forest text-akboy-paper font-epilogue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={akboyLogo} alt="Campus Hub" className="h-11 w-auto" />
              <span className="font-urbanist text-sm font-semibold text-akboy-paper">Campus Hub</span>
            </div>
            <p className="max-w-xl text-sm text-akboy-paper/70">
              Fresh admission news, scholarship updates and campus headlines for Nigerian students.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-akboy-paper/80">
            <Link to="/" className="hover:text-akboy-butter">Home</Link>
            <Link to="/blog" className="hover:text-akboy-butter">Blog</Link>
            <a href="mailto:akboycreativehub@gmail.com" className="hover:text-akboy-butter">Contact</a>
          </div>
        </div>
        <div className="border-t border-akboy-paper/10 py-4 text-center text-sm text-akboy-paper/50">
          © {currentYear} Campus Hub. All rights reserved.
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-akboy-forest text-akboy-paper font-epilogue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="space-y-6 lg:col-span-2">
            <div className="inline-block bg-akboy-paper px-4 py-3 rounded-2xl">
              <img src={akboyLogo} alt="AKBOY Creative Hub" className="h-11 w-auto" />
            </div>
            <p className="text-akboy-paper/70 text-sm leading-relaxed max-w-sm">
              A modern studio for web design, brand identity, and admission-focused education. Built in Lagos, made for the world.
            </p>
            <div className="flex space-x-2.5">
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
                  className="w-10 h-10 border border-akboy-paper/15 hover:border-akboy-butter hover:text-akboy-butter text-akboy-paper/80 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-urbanist text-akboy-paper font-semibold text-sm mb-5 uppercase tracking-[0.16em]">Learn</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={`${basePath}/register`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Exam Prep Academy</Link></li>
              <li><Link to={`${basePath}/mock`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Mock Exams</Link></li>
              <li><a href="https://edura.space" target="_blank" rel="noopener noreferrer" className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">JAMB CBT Practice</a></li>
              <li><Link to={`${basePath}/register`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Online Classes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-urbanist text-akboy-paper font-semibold text-sm mb-5 uppercase tracking-[0.16em]">Studio</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to={`${basePath}/services`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Services</Link></li>
              <li><Link to={`${basePath}/portfolio`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Portfolio</Link></li>
              <li><Link to={`${basePath}/about`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">About</Link></li>
              <li><Link to={`${basePath}/campus-hub`} className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Campus Hub</Link></li>
              <li><Link to="/blog" className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-urbanist text-akboy-paper font-semibold text-sm mb-5 uppercase tracking-[0.16em]">Get in touch</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <a href="mailto:akboycreativehub@gmail.com" className="text-akboy-paper/70 hover:text-akboy-butter break-all transition-colors">akboycreativehub@gmail.com</a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <a href="tel:+2348101466977" className="text-akboy-paper/70 hover:text-akboy-butter transition-colors">+234 810 146 6977</a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-akboy-butter mt-0.5 flex-shrink-0" />
                <span className="text-akboy-paper/70">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-akboy-paper/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-akboy-paper/50 text-sm">© {currentYear} AKBOY Creative Hub. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-akboy-paper/50 hover:text-akboy-butter transition-colors">Privacy</Link>
            <Link to="/terms" className="text-akboy-paper/50 hover:text-akboy-butter transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
