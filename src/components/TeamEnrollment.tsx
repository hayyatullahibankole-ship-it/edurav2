import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, Rocket, CheckCircle, Zap } from "lucide-react";
import { toast } from "sonner";

const teamApplicationSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  whatsapp_number: z.string().min(10, "Enter a valid WhatsApp number").max(20, "Number too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  preferred_role: z.enum(["Marketing & Promotions Lead", "Content Creator / Designer", "School Relations Officer", "Technical & Support Officer"], {
    required_error: "Please select a role"
  }),
  skills_experience: z.string().min(20, "Please provide more details about your skills").max(1000, "Skills description too long"),
  availability: z.array(z.string()).min(1, "Please select at least one availability option"),
  why_join: z.string().min(50, "Please tell us more about why you want to join").max(1000, "Response too long"),
  terms_agreed: z.boolean().refine(val => val === true, "You must agree to the terms"),
  optional_notes: z.string().max(500, "Notes too long").optional()
});

type TeamApplicationForm = z.infer<typeof teamApplicationSchema>;

const TeamEnrollment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<TeamApplicationForm>({
    resolver: zodResolver(teamApplicationSchema),
    defaultValues: {
      full_name: "",
      whatsapp_number: "",
      email: "",
      preferred_role: undefined,
      skills_experience: "",
      availability: [],
      why_join: "",
      terms_agreed: false,
      optional_notes: ""
    }
  });

  const onSubmit = async (data: TeamApplicationForm) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("team_applications").insert({
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number,
        email: data.email || null,
        preferred_role: data.preferred_role,
        skills_experience: data.skills_experience,
        availability: data.availability,
        why_join: data.why_join,
        terms_agreed: data.terms_agreed,
        optional_notes: data.optional_notes || null
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availabilityOptions = [
    { id: "weekdays", label: "Weekdays (Flexible hours)" },
    { id: "weekends", label: "Weekends only" },
    { id: "fulltime", label: "Full-time (if possible)" }
  ];

  const roles = [
    { value: "Marketing & Promotions Lead", description: "Drive student signups and brand awareness" },
    { value: "Content Creator / Designer", description: "Create engaging visual and written content" },
    { value: "School Relations Officer", description: "Build partnerships with schools" },
    { value: "Technical & Support Officer", description: "Provide technical assistance to users" }
  ];

  if (isSuccess) {
    return (
      <section id="join-team" className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center border-2 border-primary/20 shadow-2xl">
            <CardContent className="p-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Thank You for Applying!</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We'll review your submission and contact you with next steps soon. Welcome to Edura!
              </p>
              <Button onClick={() => setIsSuccess(false)} size="lg">
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="join-team" className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 px-6 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
            <Rocket className="w-4 h-4 mr-2 inline" />
            We're Hiring
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Join the Edura Team – Help Students Succeed!
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Edura is an advanced CBT platform designed to help students excel in WAEC, NECO, and JAMB. 
            We're building a passionate, motivated team to grow Edura and make exam preparation smarter, easier, and more effective.
          </p>
          
          {/* Roles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
            {roles.map((role, index) => (
              <Card key={index} className="text-left hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{role.value}</CardTitle>
                  <CardDescription className="text-sm">{role.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Work with us, gain valuable experience, and <span className="font-semibold text-primary">earn commission</span> from student signups and school partnerships.
          </p>
        </div>

        {/* Application Form */}
        <Card className="max-w-3xl mx-auto border-2 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold">Apply to Join the Team</CardTitle>
            <CardDescription className="text-base">Fill out the form below and we'll get back to you soon</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp Number */}
                <FormField
                  control={form.control}
                  name="whatsapp_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp / Contact Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 XXX XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferred Role */}
                <FormField
                  control={form.control}
                  name="preferred_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills/Experience */}
                <FormField
                  control={form.control}
                  name="skills_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills / Experience *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your relevant skills and experience..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Minimum 20 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Availability */}
                <FormField
                  control={form.control}
                  name="availability"
                  render={() => (
                    <FormItem>
                      <FormLabel>Availability *</FormLabel>
                      <div className="space-y-3">
                        {availabilityOptions.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.label)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), option.label]
                                        : field.value?.filter((val) => val !== option.label) || [];
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <Label className="font-normal cursor-pointer">{option.label}</Label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Why Join */}
                <FormField
                  control={form.control}
                  name="why_join"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to join Edura? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share your motivation and what you hope to achieve..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Minimum 50 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional Notes */}
                <FormField
                  control={form.control}
                  name="optional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional Notes / Questions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information or questions..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms Agreement */}
                <FormField
                  control={form.control}
                  name="terms_agreed"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label className="cursor-pointer">
                          I understand this is a volunteer–commission-based role and I am ready to contribute actively. *
                        </Label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-5 w-5" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Urgency Message */}
            <div className="mt-6 text-center">
              <Badge variant="destructive" className="px-4 py-2">
                Applications close in 7 days — Apply now!
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <Card className="max-w-2xl mx-auto mt-12 border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 text-center">
            <p className="text-lg italic text-muted-foreground mb-4">
              "Being part of Edura taught me real marketing and tech skills while helping students succeed."
            </p>
            <p className="font-semibold text-primary">– Current Team Member</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default TeamEnrollment;