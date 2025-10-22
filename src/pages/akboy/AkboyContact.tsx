import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle, Clock, Send } from "lucide-react";
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
        title: "Message Sent! 🎉",
        description: "We'll get back to you within 24 hours.",
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
      <section className="relative py-20 px-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6">
            <MessageCircle className="w-4 h-4" />
            Contact Us
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Let's Create Something
            <span className="block">Amazing Together</span>
          </h1>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            We'd love to hear from you and discuss how we can help bring your ideas to life
          </p>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <Card className="p-8 border-2 border-emerald-100 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-foreground font-semibold">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                      className="mt-2 h-12 border-2 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Email Address *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                      className="mt-2 h-12 border-2 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                      className="mt-2 h-12 border-2 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Subject *</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="How can we help you?"
                      className="mt-2 h-12 border-2 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Message *</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="Tell us more about your project or inquiry..."
                      className="mt-2 border-2 border-emerald-200 focus:border-emerald-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : (
                      <>
                        Send Message
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-6">Get In Touch</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Have a question or want to work together? We're here to help!
                </p>

                <div className="space-y-6">
                  <Card className="p-6 flex items-start gap-4 hover:shadow-xl transition-all border-2 hover:border-emerald-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-lg">Email Us</h3>
                      <p className="text-muted-foreground mb-2">akboycreativehub@gmail.com</p>
                      <a
                        href="mailto:akboycreativehub@gmail.com"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                      >
                        Send an email →
                      </a>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-start gap-4 hover:shadow-xl transition-all border-2 hover:border-emerald-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Phone className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-lg">Call Us</h3>
                      <p className="text-muted-foreground mb-2">+234 810 146 6977</p>
                      <a
                        href="tel:+2348101466977"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                      >
                        Make a call →
                      </a>
                    </div>
                  </Card>

                  <Card className="p-6 flex items-start gap-4 hover:shadow-xl transition-all border-2 hover:border-emerald-200">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 text-lg">Visit Us</h3>
                      <p className="text-muted-foreground">Lagos, Nigeria</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Connect With Us</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, href: "https://facebook.com/akboycreativehub", color: "from-blue-500 to-blue-600" },
                    { icon: Instagram, href: "https://instagram.com/akboycreativehub", color: "from-pink-500 to-purple-600" },
                    { icon: Linkedin, href: "https://linkedin.com/company/akboycreativehub", color: "from-blue-600 to-blue-700" },
                    { icon: MessageCircle, href: "https://wa.me/2348101466977", color: "from-green-500 to-green-600" }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-14 h-14 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg hover:shadow-xl`}
                    >
                      <social.icon className="w-7 h-7" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <Card className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-none shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Business Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="font-semibold">Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="font-semibold">Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Sunday</span>
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
