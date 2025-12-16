import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useDomainDetection } from '@/hooks/useDomainDetection';
import { AkboyLayout } from '@/components/akboy/AkboyLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  BookOpen, Palette, Globe, BookOpenCheck, 
  Upload, Printer, CheckCircle, Loader2,
  Phone, Mail, ArrowRight
} from 'lucide-react';

// Form validation schema
const registrationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(10, 'Valid phone number required').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gender: z.string().min(1, 'Please select gender'),
  academic_level: z.string().min(1, 'Please select academic level'),
  tutorial_id: z.string().min(1, 'Please select a tutorial'),
  mode_of_learning: z.string().min(1, 'Please select mode of learning'),
  tutorial_type: z.string().min(1, 'Please select tutorial type'),
  guardian_name: z.string().min(2, 'Guardian name is required').max(100),
  guardian_phone: z.string().min(10, 'Valid guardian phone required').max(15),
  referral_source: z.string().optional(),
  special_requests: z.string().max(500).optional(),
  agreement: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface Tutorial {
  id: string;
  name: string;
  slug: string;
  description: string;
  online_group_price: number;
  online_private_price: number;
  physical_group_price: number;
  physical_private_price: number;
  whatsapp_group_link: string | null;
  flyer_url: string | null;
}

interface PaymentAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const tutorialIcons: Record<string, typeof BookOpen> = {
  'exam-prep': BookOpen,
  'akboy-exam-prep-academy': BookOpen,
  'jamb-waec': BookOpen,
  'graphics-design': Palette,
  'web-design': Globe,
  'quran-memorization': BookOpenCheck,
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} timed out`));
    }, ms);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const createUuidV4 = (): string => {
  const c = globalThis.crypto as Crypto | undefined;

  // Prefer native generator when available (must keep method bound to crypto)
  if (typeof c?.randomUUID === 'function') {
    return c.randomUUID();
  }

  if (!c?.getRandomValues) {
    throw new Error('Secure random generator not available');
  }

  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);

  // RFC4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
};

export default function AkboyTutorialRegistration() {
  const [searchParams] = useSearchParams();
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? '' : '/akboy';
  
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [paymentAccount, setPaymentAccount] = useState<PaymentAccount | null>(null);
  const [submissionData, setSubmissionData] = useState<{
    registrationId: string;
    tutorialName: string;
    price: number;
    whatsappLink: string | null;
  } | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const preselectedTutorial = searchParams.get('tutorial');

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      gender: '',
      academic_level: '',
      tutorial_id: '',
      mode_of_learning: '',
      tutorial_type: '',
      guardian_name: '',
      guardian_phone: '',
      referral_source: '',
      special_requests: '',
      agreement: false,
    },
  });

  const selectedTutorialId = form.watch('tutorial_id');
  const modeOfLearning = form.watch('mode_of_learning');
  const tutorialType = form.watch('tutorial_type');

  const selectedTutorial = tutorials.find(t => t.id === selectedTutorialId);
  
  const calculatePrice = () => {
    if (!selectedTutorial || !modeOfLearning || !tutorialType) return 0;
    const key = `${modeOfLearning}_${tutorialType}_price` as keyof Tutorial;
    return selectedTutorial[key] as number || 0;
  };

  const price = calculatePrice();

  useEffect(() => {
    fetchTutorials();
    fetchPaymentAccount();
  }, []);

  useEffect(() => {
    if (preselectedTutorial && tutorials.length > 0) {
      const tutorial = tutorials.find(t => t.slug === preselectedTutorial);
      if (tutorial) {
        form.setValue('tutorial_id', tutorial.id);
      }
    }
  }, [preselectedTutorial, tutorials]);

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('akboy_tutorials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('akboy_settings')
        .select('value')
        .eq('key', 'payment_account')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value) {
        setPaymentAccount(data.value as unknown as PaymentAccount);
      }
    } catch (error) {
      console.error('Error fetching payment account:', error);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    const { error } = await supabase.storage.from('tutorial-uploads').upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('tutorial-uploads').getPublicUrl(fileName);

    return publicUrl;
  };

  const onInvalid = () => {
    toast.error('Please complete all required fields highlighted in red.');
  };

  const onSubmit = async (data: RegistrationForm) => {
    if (!selectedTutorial) {
      toast.error('Please select a tutorial');
      return;
    }

    setSubmitting(true);

    try {
      let studentPhotoUrl: string | null = null;
      let paymentProofUrl: string | null = null;

      // Upload student photo
      if (studentPhoto) {
        setUploadingPhoto(true);
        try {
          studentPhotoUrl = await withTimeout(
            uploadFile(studentPhoto, 'photos'),
            60_000,
            'Student photo upload'
          );
        } finally {
          setUploadingPhoto(false);
        }

        if (!studentPhotoUrl) {
          toast.error('Failed to upload student photo');
          return;
        }
      }

      // Upload payment proof
      if (paymentProof) {
        setUploadingProof(true);
        try {
          paymentProofUrl = await withTimeout(
            uploadFile(paymentProof, 'payments'),
            60_000,
            'Payment proof upload'
          );
        } finally {
          setUploadingProof(false);
        }

        if (!paymentProofUrl) {
          toast.error('Failed to upload payment proof');
          return;
        }
      }

      const registrationId = createUuidV4();

      const insertTask = (async () => {
        return await supabase
          .from('akboy_tutorial_registrations')
          .insert({
            id: registrationId,
            tutorial_id: data.tutorial_id,
            full_name: data.full_name,
            phone: data.phone,
            email: data.email || null,
            gender: data.gender,
            academic_level: data.academic_level,
            student_photo_url: studentPhotoUrl,
            tutorial_name: selectedTutorial.name,
            mode_of_learning: data.mode_of_learning,
            tutorial_type: data.tutorial_type,
            price: price,
            payment_proof_url: paymentProofUrl,
            guardian_name: data.guardian_name,
            guardian_phone: data.guardian_phone,
            referral_source: data.referral_source || null,
            special_requests: data.special_requests || null,
          });
      })();

      const { error: insertError } = await withTimeout(
        insertTask,
        30_000,
        'Registration submission'
      );

      if (insertError) throw insertError;

      setSubmissionData({
        registrationId,
        tutorialName: selectedTutorial.name,
        price: price,
        whatsappLink: selectedTutorial.whatsapp_group_link,
      });

      toast.success('Registration submitted successfully!');
    } catch (error) {
      console.error('Registration error:', error);

      const isTimeout = error instanceof Error && /timed out/i.test(error.message);
      const technical = error instanceof Error ? error.message : '';

      toast.error(
        isTimeout
          ? 'Network timeout while submitting. Please check your internet and try again.'
          : technical
            ? `Failed to submit registration: ${technical}`
            : 'Failed to submit registration. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Success/Confirmation Page
  if (submissionData) {
    return (
      <AkboyLayout>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div ref={printRef} className="print:p-8">
              <Card className="border-emerald-200 shadow-lg">
                <CardHeader className="text-center bg-emerald-50 rounded-t-lg">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <CardTitle className="text-2xl text-emerald-800">Registration Successful!</CardTitle>
                  <CardDescription className="text-emerald-600">
                    Thank you for registering with AKBOY Creative Hub
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-gray-800">Registration Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Registration ID:</span>
                      <span className="font-mono text-xs">{submissionData.registrationId.slice(0, 8).toUpperCase()}</span>
                      <span className="text-gray-600">Tutorial:</span>
                      <span className="font-medium">{submissionData.tutorialName}</span>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-emerald-600">₦{submissionData.price.toLocaleString()}</span>
                      <span className="text-gray-600">Status:</span>
                      <span className="text-amber-600 font-medium">Pending Verification</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Important:</strong> Your registration will be confirmed once payment is verified. 
                      You will be added to the WhatsApp group after verification.
                    </p>
                  </div>

                  {submissionData.whatsappLink && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                      <p className="text-emerald-800 text-sm mb-2">
                        <strong>WhatsApp Group Link:</strong>
                      </p>
                      <a 
                        href={submissionData.whatsappLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline break-all text-sm"
                      >
                        {submissionData.whatsappLink}
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 print:hidden">
                    <Button 
                      onClick={handlePrint}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Confirmation
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = basePath || '/'}
                      className="flex-1"
                    >
                      Back to Home
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500 pt-4 border-t">
                    <p>Questions? Contact us:</p>
                    <p className="font-medium">08101466977 (WhatsApp) | akboycreativehub@gmail.com</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AkboyLayout>
    );
  }

  return (
    <AkboyLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Tutorial Registration
            </h1>
            <p className="text-lg md:text-xl text-emerald-100">
              Register for any of AKBOY Creative Hub's available tutorials. Choose your program below and complete a simple registration form.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                AKBOY Creative Hub offers quality online and physical tutorials designed to help you excel in exams 
                and learn new skills. Whether you're preparing for JAMB/WAEC, learning graphics design, web design, 
                or memorizing the Qur'an, we have a program for you. Select a tutorial below to get started.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Tutorials */}
        {!selectedTutorialId && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Available Tutorials</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {tutorials.map((tutorial) => {
                  const Icon = tutorialIcons[tutorial.slug] || BookOpen;
                  return (
                    <Card 
                      key={tutorial.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-emerald-300 overflow-hidden"
                      onClick={() => form.setValue('tutorial_id', tutorial.id)}
                    >
                      {tutorial.flyer_url && (
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={tutorial.flyer_url} 
                            alt={tutorial.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-100 rounded-lg">
                            <Icon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2">{tutorial.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{tutorial.description}</p>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                form.setValue('tutorial_id', tutorial.id);
                              }}
                            >
                              Register Now <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Registration Form */}
        {selectedTutorialId && (
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg">
              {/* Tutorial Flyer Banner */}
              {selectedTutorial?.flyer_url && (
                <div className="relative h-48 md:h-64 overflow-hidden rounded-t-lg">
                  <img 
                    src={selectedTutorial.flyer_url} 
                    alt={selectedTutorial.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-white text-xl md:text-2xl font-bold">{selectedTutorial.name}</h2>
                  </div>
                </div>
              )}
              <CardHeader className="bg-emerald-50 border-b">
                <CardTitle className="text-xl text-emerald-800">
                  AKBOY Creative Hub – Tutorial Registration Form
                </CardTitle>
                <CardDescription>
                  Fill this form carefully to register for your chosen tutorial. Your registration is confirmed only after payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                  {/* Section A: Student Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Section A: Student Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input 
                          id="full_name"
                          {...form.register('full_name')}
                          placeholder="Enter your full name"
                        />
                        {form.formState.errors.full_name && (
                          <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (WhatsApp) *</Label>
                        <Input 
                          id="phone"
                          {...form.register('phone')}
                          placeholder="08101234567"
                        />
                        {form.formState.errors.phone && (
                          <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address (Optional)</Label>
                        <Input 
                          id="email"
                          type="email"
                          {...form.register('email')}
                          placeholder="your@email.com"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Gender *</Label>
                        <Select 
                          value={form.watch('gender')} 
                          onValueChange={(value) => form.setValue('gender', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.gender && (
                          <p className="text-sm text-red-500">{form.formState.errors.gender.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Academic Level / Status *</Label>
                        <Select 
                          value={form.watch('academic_level')} 
                          onValueChange={(value) => form.setValue('academic_level', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sss1">SSS 1</SelectItem>
                            <SelectItem value="sss2">SSS 2</SelectItem>
                            <SelectItem value="sss3">SSS 3</SelectItem>
                            <SelectItem value="jamb_candidate">JAMB Candidate</SelectItem>
                            <SelectItem value="waec_candidate">WAEC Candidate</SelectItem>
                            <SelectItem value="neco_candidate">NECO Candidate</SelectItem>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="working">Working Class</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.academic_level && (
                          <p className="text-sm text-red-500">{form.formState.errors.academic_level.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Student Photo</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size <= 2 * 1024 * 1024) {
                                setStudentPhoto(file);
                              } else if (file) {
                                toast.error('Photo must be less than 2MB');
                              }
                            }}
                            className="text-sm"
                          />
                          {uploadingPhoto && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        <p className="text-xs text-gray-500">JPEG/PNG, max 2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Tutorial Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Section B: Tutorial Selection
                    </h3>

                    <div className="space-y-2">
                      <Label>Selected Tutorial *</Label>
                      <Select 
                        value={form.watch('tutorial_id')} 
                        onValueChange={(value) => form.setValue('tutorial_id', value, { shouldValidate: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tutorial" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutorials.map((tutorial) => (
                            <SelectItem key={tutorial.id} value={tutorial.id}>
                              {tutorial.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.tutorial_id && (
                        <p className="text-sm text-red-500">{form.formState.errors.tutorial_id.message}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mode of Learning *</Label>
                        <Select 
                          value={form.watch('mode_of_learning')} 
                          onValueChange={(value) => form.setValue('mode_of_learning', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="physical">Physical</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.mode_of_learning && (
                          <p className="text-sm text-red-500">{form.formState.errors.mode_of_learning.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Tutorial Type *</Label>
                        <Select 
                          value={form.watch('tutorial_type')} 
                          onValueChange={(value) => form.setValue('tutorial_type', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="group">Group Session</SelectItem>
                            <SelectItem value="private">Private Session</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.tutorial_type && (
                          <p className="text-sm text-red-500">{form.formState.errors.tutorial_type.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Price Display */}
                    {price > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Tutorial Fee:</span>
                          <span className="text-2xl font-bold text-emerald-600">
                            ₦{price.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Payment Account Details */}
                        {paymentAccount && (
                          <div className="border-t border-emerald-200 pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Payment Account Details</h4>
                            <div className="bg-white p-3 rounded border border-emerald-100 space-y-1 text-sm">
                              <p><span className="text-gray-600">Bank:</span> <span className="font-medium">{paymentAccount.bank_name}</span></p>
                              <p><span className="text-gray-600">Account Number:</span> <span className="font-medium font-mono">{paymentAccount.account_number}</span></p>
                              <p><span className="text-gray-600">Account Name:</span> <span className="font-medium">{paymentAccount.account_name}</span></p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Please transfer the exact amount and upload proof of payment below.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment Proof Upload */}
                    <div className="space-y-2">
                      <Label>Upload Proof of Payment</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size <= 5 * 1024 * 1024) {
                              setPaymentProof(file);
                            } else if (file) {
                              toast.error('File must be less than 5MB');
                            }
                          }}
                          className="text-sm"
                        />
                        {uploadingProof && <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                      <p className="text-xs text-gray-500">Image or PDF, max 5MB</p>
                    </div>
                  </div>

                  {/* Section C: Parent/Guardian Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Section C: Parent / Guardian Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardian_name">Parent/Guardian Full Name *</Label>
                        <Input 
                          id="guardian_name"
                          {...form.register('guardian_name')}
                          placeholder="Enter guardian's name"
                        />
                        {form.formState.errors.guardian_name && (
                          <p className="text-sm text-red-500">{form.formState.errors.guardian_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guardian_phone">Parent/Guardian Phone *</Label>
                        <Input 
                          id="guardian_phone"
                          {...form.register('guardian_phone')}
                          placeholder="08101234567"
                        />
                        {form.formState.errors.guardian_phone && (
                          <p className="text-sm text-red-500">{form.formState.errors.guardian_phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section D: Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Section D: Additional Information
                    </h3>

                    <div className="space-y-2">
                      <Label>How did you hear about AKBOY Creative Hub?</Label>
                      <Select 
                        value={form.watch('referral_source')} 
                        onValueChange={(value) => form.setValue('referral_source', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="referral">Referral/Friend</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="google">Google Search</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special_requests">Special Requests / Academic Challenges (Optional)</Label>
                      <Textarea 
                        id="special_requests"
                        {...form.register('special_requests')}
                        placeholder="Any specific areas you need help with or special requirements..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Section E: Agreement */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Section E: Agreement
                    </h3>

                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="agreement"
                        checked={form.watch('agreement')}
                        onCheckedChange={(checked) => form.setValue('agreement', checked as boolean, { shouldValidate: true })}
                      />
                      <Label htmlFor="agreement" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                        I confirm that the information provided is correct. I understand my registration will only 
                        be confirmed after payment verification and I will be added to the WhatsApp group.
                      </Label>
                    </div>
                    {form.formState.errors.agreement && (
                      <p className="text-sm text-red-500">{form.formState.errors.agreement.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting Registration...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Submit Registration
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card className="mt-8 bg-amber-50 border-amber-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-amber-800 mb-3">Important Notes:</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li>• All classes can be online or physical, depending on your selection.</li>
                  <li>• Payment confirms registration.</li>
                  <li>• You will be added to the WhatsApp group after payment verification.</li>
                  <li>• Printable confirmation will be available after submission.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mt-4">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-2">Questions? Contact us:</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    href="tel:08101466977" 
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                  >
                    <Phone className="w-4 h-4" />
                    08101466977
                  </a>
                  <a 
                    href="mailto:akboycreativehub@gmail.com" 
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                  >
                    <Mail className="w-4 h-4" />
                    akboycreativehub@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AkboyLayout>
  );
}