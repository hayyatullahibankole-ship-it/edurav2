import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function AkboyFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#075E54] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center">
                <span className="text-[#075E54] font-bold text-lg">AK</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">AKBOY Creative Hub</h3>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              Empowering education and creativity through innovative solutions and expert training.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#FFD700] rounded-lg flex items-center justify-center transition-colors group"
              >
                <Facebook className="w-4 h-4 group-hover:text-[#075E54]" />
              </a>
              <a
                href="https://instagram.com/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#FFD700] rounded-lg flex items-center justify-center transition-colors group"
              >
                <Instagram className="w-4 h-4 group-hover:text-[#075E54]" />
              </a>
              <a
                href="https://linkedin.com/company/akboycreativehub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#FFD700] rounded-lg flex items-center justify-center transition-colors group"
              >
                <Linkedin className="w-4 h-4 group-hover:text-[#075E54]" />
              </a>
              <a
                href="https://twitter.com/akboycreative"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-[#FFD700] rounded-lg flex items-center justify-center transition-colors group"
              >
                <Twitter className="w-4 h-4 group-hover:text-[#075E54]" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#FFD700] font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/akboy/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/akboy/services" className="text-white/80 hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/akboy/portfolio" className="text-white/80 hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link to="/akboy/events" className="text-white/80 hover:text-white transition-colors">Events & Programs</Link></li>
              <li><Link to="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/akboy/contact" className="text-white/80 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#FFD700] font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Educational Consultancy</li>
              <li>Tutorial Services</li>
              <li>Graphics Design</li>
              <li>Web Development</li>
              <li>Creative Training Programs</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#FFD700] font-semibold mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <a href="mailto:akboycreativehub@gmail.com" className="text-white/80 hover:text-white transition-colors">
                  akboycreativehub@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <a href="tel:+2348101466977" className="text-white/80 hover:text-white transition-colors">
                  +234 810 146 6977
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-white/80">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} AKBOY Creative Hub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
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
