import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AkboyLayout } from "@/components/akboy/AkboyLayout";

export default function AkboyContact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("akboy_inquiries")
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AkboyLayout>
      {/* Hero Header */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#075E54] to-[#0A8A74] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-white/90">We'd love to hear from you and discuss how we can help</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-[#075E54] mb-6">Send Us a Message</h2>
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label>Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <Label>Message *</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="Tell us more about your needs..."
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#075E54] hover:bg-[#075E54]/90"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#075E54] mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <Card className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#A8E6A1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#075E54]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#075E54] mb-1 text-lg">Email Us</h3>
                      <p className="text-gray-600">akboycreativehub@gmail.com</p>
                      <a 
                        href="mailto:akboycreativehub@gmail.com"
                        className="text-[#075E54] hover:underline text-sm"
                      >
                        Send an email →
                      </a>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#A8E6A1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#075E54]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#075E54] mb-1">Call Us</h3>
                      <p className="text-gray-600">08101466977</p>
                      <a 
                        href="tel:+2348101466977"
                        className="text-[#075E54] hover:underline text-sm"
                      >
                        Make a call →
                      </a>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#A8E6A1] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[#075E54]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#075E54] mb-1">Visit Us</h3>
                      <p className="text-gray-600">Lagos, Nigeria</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-2xl font-bold text-[#075E54] mb-4">Connect With Us</h3>
                <div className="flex gap-4">
                  <a 
                    href="https://facebook.com/akboycreativehub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white hover:bg-[#075E54]/90 transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://instagram.com/akboycreativehub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white hover:bg-[#075E54]/90 transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://linkedin.com/company/akboycreativehub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white hover:bg-[#075E54]/90 transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://wa.me/2348101466977" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:bg-[#25D366]/90 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <Card className="p-6 bg-[#075E54] text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-[#FFD700]" />
                  <h3 className="text-xl font-bold text-[#FFD700]">Business Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
