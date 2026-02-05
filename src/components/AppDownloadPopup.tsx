 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { X, Download, Star, Users, Zap } from 'lucide-react';
 import eduraLogo from '@/assets/edura-logo.png';
 
 const UPTODOWN_URL = "https://edura-advanced-cbt-platform.en.uptodown.com/android/download";
 const POPUP_STORAGE_KEY = "edura_app_popup_dismissed";
 const POPUP_DELAY_MS = 3000; // Show after 3 seconds
 
 export const AppDownloadPopup = () => {
   const [open, setOpen] = useState(false);
 
   useEffect(() => {
     // Check if user has already dismissed the popup
     const dismissed = localStorage.getItem(POPUP_STORAGE_KEY);
     if (dismissed) return;
 
     // Check if already installed as PWA or native app
     const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true;
     if (isPWA) return;
 
     // Show popup after delay
     const timer = setTimeout(() => {
       setOpen(true);
     }, POPUP_DELAY_MS);
 
     return () => clearTimeout(timer);
   }, []);
 
   const handleDismiss = () => {
     setOpen(false);
     // Remember dismissal for 24 hours
     localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
   };
 
   const handleDownload = () => {
     window.open(UPTODOWN_URL, '_blank');
     handleDismiss();
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogContent className="max-w-sm mx-4 p-0 overflow-hidden rounded-3xl border-0 bg-transparent shadow-2xl">
         <div className="relative bg-gradient-to-br from-slate-900 via-primary to-slate-900 overflow-hidden">
           {/* Background effects */}
           <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary-glow/30 rounded-full blur-3xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
           </div>
 
           {/* Close button */}
           <button
             onClick={handleDismiss}
             className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
           >
             <X className="h-4 w-4 text-white" />
           </button>
 
           {/* Content */}
           <div className="relative z-10 p-6 pt-10">
             {/* Phone Mockup */}
             <div className="flex justify-center mb-6">
               <div className="relative">
                 {/* Phone Frame */}
                 <div className="w-36 h-72 bg-slate-800 rounded-[2rem] p-1.5 shadow-2xl border-2 border-slate-700">
                   {/* Screen */}
                   <div className="w-full h-full bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-[1.75rem] flex flex-col items-center justify-center overflow-hidden relative">
                     {/* Notch */}
                     <div className="absolute top-1.5 w-14 h-3 bg-slate-800 rounded-full" />
                     
                     {/* Screen Content */}
                     <div className="flex flex-col items-center gap-2 p-4">
                       <div className="bg-white/95 rounded-xl p-2.5 shadow-lg">
                         <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
                       </div>
                       <h3 className="text-white font-black text-sm drop-shadow-lg">Edura CBT</h3>
                       <p className="text-white/70 text-[10px] text-center">Your Gateway to Success</p>
                       
                       {/* Mini features */}
                       <div className="flex gap-2 mt-2">
                         <div className="bg-white/20 rounded-lg p-1.5">
                           <Zap className="h-3 w-3 text-white" />
                         </div>
                         <div className="bg-white/20 rounded-lg p-1.5">
                           <Star className="h-3 w-3 text-white" />
                         </div>
                         <div className="bg-white/20 rounded-lg p-1.5">
                           <Users className="h-3 w-3 text-white" />
                         </div>
                       </div>
                     </div>
                     
                     {/* Home indicator */}
                     <div className="absolute bottom-2 w-16 h-0.5 bg-white/50 rounded-full" />
                   </div>
                 </div>
                 
                 {/* Badge */}
                 <div className="absolute -top-2 -right-2 bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                   FREE
                 </div>
               </div>
             </div>
 
             {/* Text */}
             <div className="text-center mb-6">
               <h2 className="text-2xl font-black text-white mb-2">
                 📱 App Available!
               </h2>
               <p className="text-white/70 text-sm">
                 Get the full Edura CBT experience on your Android device
               </p>
             </div>
 
             {/* Stats */}
             <div className="flex justify-center gap-6 mb-6">
               <div className="text-center">
                 <p className="text-white font-black text-lg">50K+</p>
                 <p className="text-white/50 text-xs">Downloads</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-black text-lg">4.8★</p>
                 <p className="text-white/50 text-xs">Rating</p>
               </div>
               <div className="text-center">
                 <p className="text-white font-black text-lg">Free</p>
                 <p className="text-white/50 text-xs">Forever</p>
               </div>
             </div>
 
             {/* Buttons */}
             <div className="space-y-3">
               <Button
                 onClick={handleDownload}
                 className="w-full bg-success hover:bg-success/90 text-white font-black py-6 h-auto rounded-2xl shadow-lg gap-2"
               >
                 <Download className="h-5 w-5" strokeWidth={2.5} />
                 Download from Uptodown
               </Button>
               
               <button
                 onClick={handleDismiss}
                 className="w-full text-white/60 hover:text-white/80 text-sm font-medium py-2 transition-colors"
               >
                 Maybe Later
               </button>
             </div>
           </div>
         </div>
       </DialogContent>
     </Dialog>
   );
 };