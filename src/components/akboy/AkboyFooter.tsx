import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import akboyLogo from "@/assets/akboy-logo.png";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEG0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="space-y-6 lg:col-span-2">
            <div className="inline-block bg-white px-8 py-5 rounded-2xl shadow-xl">
              <img 
                src={akboyLogo} 
                alt="AKBOY Creative Hub" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Empowering creativity and education through innovative solutions, cutting-edge design, and transformative technology.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 rounded-xl flex items-center justify-center transition-all group backdrop-blur-sm hover:scale-110"
              >
                <Facebook className="w-5 h-5 group-hover:text-white" />
              </a>
              <a
                href="https://instagram.com/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 rounded-xl flex items-center justify-center transition-all group backdrop-blur-sm hover:scale-110"
              >
                <Instagram className="w-5 h-5 group-hover:text-white" />
              </a>
              <a
                href="https://linkedin.com/company/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 rounded-xl flex items-center justify-center transition-all group backdrop-blur-sm hover:scale-110"
              >
                <Linkedin className="w-5 h-5 group-hover:text-white" />
              </a>
              <a
                href="https://twitter.com/akboycreative"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 rounded-xl flex items-center justify-center transition-all group backdrop-blur-sm hover:scale-110"
              >
                <Twitter className="w-5 h-5 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-emerald-300 font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/akboy/about" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/akboy/services" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">Our Services</Link></li>
              <li><Link to="/akboy/portfolio" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">Portfolio</Link></li>
              <li><Link to="/akboy/events" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">Events & Programs</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">Blog</Link></li>
              <li><Link to="/akboy/contact" className="text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Products */}
          <div>
            <h4 className="text-emerald-300 font-bold text-lg mb-6">Our Products</h4>
            <Link 
              to="/" 
              className="group block bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-400/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h5 className="font-bold text-white group-hover:text-emerald-300 transition-colors">Edura CBT</h5>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                JAMB & WAEC exam prep platform with thousands of practice questions
              </p>
            </Link>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-emerald-300 font-bold text-lg mb-6">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 group">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 transition-all backdrop-blur-sm">
                  <Mail className="w-4 h-4 text-emerald-300 group-hover:text-white" />
                </div>
                <a href="mailto:akboycreativehub@gmail.com" className="text-white/80 hover:text-white transition-colors leading-relaxed">
                  akboycreativehub@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 transition-all backdrop-blur-sm">
                  <Phone className="w-4 h-4 text-emerald-300 group-hover:text-white" />
                </div>
                <a href="tel:+2348101466977" className="text-white/80 hover:text-white transition-colors">
                  +234 810 146 6977
                </a>
              </li>
              <li className="flex items-start space-x-3 group">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 transition-all backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-emerald-300 group-hover:text-white" />
                </div>
                <span className="text-white/80">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/60 text-sm">
            © {currentYear} AKBOY Creative Hub. Crafted with excellence.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
