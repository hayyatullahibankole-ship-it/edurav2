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
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("akboy_inquiries").insert([formData]);
      if (error) throw error;
      toast({ title: "Message Sent! 🎉", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <AkboyLayout>
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-slate-950 to-emerald-500/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">// Contact</span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mt-4 mb-6">
            Let's Create Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Amazing</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">We'd love to hear from you and discuss how we can help bring your ideas to life</p>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <Card className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "John Doe", required: true },
                    { label: "Email", key: "email", type: "email", placeholder: "john@example.com", required: true },
                    { label: "Phone", key: "phone", type: "text", placeholder: "+234 XXX XXX XXXX", required: false },
                    { label: "Subject", key: "subject", type: "text", placeholder: "How can we help?", required: true },
                  ].map(({ label, key, type, placeholder, required }) => (
                    <div key={key}>
                      <Label className="text-slate-300 text-sm">{label} {required && '*'}</Label>
                      <Input
                        type={type}
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        required={required}
                        placeholder={placeholder}
                        className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                      />
                    </div>
                  ))}
                  <div>
                    <Label className="text-slate-300 text-sm">Message *</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required rows={5} placeholder="Tell us about your project..."
                      className="mt-1 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                    />
                  </div>
                  <Button type="submit" disabled={loading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-12 rounded-lg shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? "Sending..." : <><Send className="mr-2 w-4 h-4" /> Send Message</>}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Get In Touch</h2>
                <p className="text-slate-400 mb-6">Have a question or want to work together? We're here to help!</p>

                <div className="space-y-4">
                  {[
                    { icon: Mail, title: "Email", text: "akboycreativehub@gmail.com", href: "mailto:akboycreativehub@gmail.com" },
                    { icon: Phone, title: "Phone", text: "+234 810 146 6977", href: "tel:+2348101466977" },
                    { icon: MapPin, title: "Location", text: "Lagos, Nigeria", href: undefined },
                  ].map(({ icon: Icon, title, text, href }, i) => (
                    <Card key={i} className="p-4 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/20 transition-all rounded-lg flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{title}</h3>
                        {href ? (
                          <a href={href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">{text}</a>
                        ) : (
                          <p className="text-sm text-slate-400">{text}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, href: "https://facebook.com/akboycreativehub" },
                    { icon: Instagram, href: "https://instagram.com/akboycreativehub" },
                    { icon: Linkedin, href: "https://linkedin.com/company/akboycreativehub" },
                    { icon: MessageCircle, href: "https://wa.me/2348101466977" },
                  ].map(({ icon: Icon, href }, i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg flex items-center justify-center transition-all hover:text-cyan-400 text-slate-400"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <Card className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Business Hours</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { day: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
                    { day: "Saturday", time: "10:00 AM - 4:00 PM" },
                    { day: "Sunday", time: "Closed" },
                  ].map(({ day, time }, i) => (
                    <div key={i} className="flex justify-between items-center pb-2 border-b border-slate-800/50 last:border-0 last:pb-0">
                      <span className="text-slate-300 font-medium">{day}</span>
                      <span className="text-cyan-400 font-mono text-xs">{time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </AkboyLayout>
  );
}
