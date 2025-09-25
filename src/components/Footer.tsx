import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  BookOpen
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Practice Tests', href: '/demo' },
    { label: 'Resources', href: '/resources' },
    { label: 'Consultation', href: '/consultation' },
    { label: 'Pricing', href: '/payment' }
  ];

  const subjects = [
    'Mathematics', 'English', 'Physics', 'Chemistry', 
    'Biology', 'Economics', 'Geography', 'Government'
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' }
  ];

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Edura</span>
            </div>
            <p className="text-muted-foreground">
              Your trusted partner for WAEC and JAMB exam preparation. 
              Join thousands of successful students.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <Link 
                  key={index}
                  to={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Popular Subjects</h3>
            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div 
                  key={index}
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {subject}
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">support@edura.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+234 810 146 6977</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Newsletter</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email" 
                  className="flex-1"
                />
                <Button 
                  size="sm"
                  onClick={() => {
                    const email = (document.querySelector('input[placeholder="Enter your email"]') as HTMLInputElement)?.value;
                    if (email) {
                      // Simple validation
                      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        alert('Thank you for subscribing! You will receive updates about exam prep tips and new features.');
                        (document.querySelector('input[placeholder="Enter your email"]') as HTMLInputElement).value = '';
                      } else {
                        alert('Please enter a valid email address.');
                      }
                    } else {
                      alert('Please enter your email address.');
                    }
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap justify-center md:justify-start space-x-6">
            {legalLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-right">
            © 2024 Edura. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;