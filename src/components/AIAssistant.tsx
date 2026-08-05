import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Mic, MicOff, Loader2, Brain, Zap, MessageCircle, Image as ImageIcon, XCircle, Camera, Paperclip, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { supabase } from "@/integrations/supabase/client";
import { sanitizeHtmlContent } from "@/utils/contentSecurity";

// Process markdown formatting (bold, italic) AND LaTeX math
const processMarkdown = (text: string): string => {
  let processed = text;
  
  // First, process LaTeX display math ($$...$$)
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    try {
      return `<div class="my-4 text-center">${katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
      })}</div>`;
    } catch (e) {
      return `<div class="text-red-600 text-sm">Math Error</div>`;
    }
  });
  
  // Then process inline math ($...$)
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch (e) {
      return `<span class="text-red-600 text-sm">Math Error</span>`;
    }
  });
  
  // Then process markdown formatting
  // Bold: **text** -> <strong>text</strong>
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  // Italic: *text* -> <em>text</em> (but avoid matching **)
  processed = processed.replace(/(?<!\*)\*(?!\*)([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
  
  // Preserve line breaks
  processed = processed.replace(/\n/g, '<br/>');
  
  return processed;
};

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // Base64 encoded images
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const icons = [Sparkles, Brain, Zap, MessageCircle];
  const IconComponent = icons[currentIcon];

  // Icon morphing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice input failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... Speak now");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images
    if (uploadedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImages((prev) => [...prev, base64String]);
        toast.success("Image added successfully");
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const streamChat = async (userMessage: string, images?: string[]) => {
    const newMessage: Message = { 
      role: "user" as const, 
      content: userMessage,
      ...(images && images.length > 0 && { images })
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      console.log("Sending message to AI assistant...", { messageCount: newMessages.length, hasImages: !!images?.length });

      const FN_URL = "https://zqapbmllkywsuywpfava.supabase.co/functions/v1/ai-assistant";
      const ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXBibWxsa3l3c3V5d3BmYXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTA5NDgsImV4cCI6MjA3NDI4Njk0OH0.uZmBzHcTI3oBiigUv_QCVkYF5Nh5_dK21qQtdpzjkUI";

      // Make sure we never send a stale/expired JWT — the Supabase gateway
      // rejects those with a 401 before the function ever runs.
      let accessToken: string | null = null;
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.access_token) {
          const expiresAt = (session.expires_at ?? 0) * 1000;
          if (expiresAt && expiresAt - Date.now() < 60_000) {
            const { data: refreshed } = await supabase.auth.refreshSession();
            accessToken = refreshed.session?.access_token ?? null;
          } else {
            accessToken = session.access_token;
          }
        }
      } catch {
        accessToken = null;
      }

      const callFn = (token: string | null) =>
        fetch(FN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
            Authorization: `Bearer ${token || ANON_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        });

      let response = await callFn(accessToken);

      // If the token was rejected, retry anonymously so the assistant still answers.
      if (response.status === 401 && accessToken) {
        console.warn("AI Assistant: session token rejected, retrying anonymously");
        response = await callFn(null);
      }

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Assistant error response:", errorText);
        let friendly = "The assistant is unavailable right now. Please try again.";
        if (response.status === 429) friendly = "Too many requests — wait a moment and try again.";
        else if (response.status === 402) friendly = "AI service is temporarily unavailable. Please contact support.";
        else {
          try {
            const parsed = JSON.parse(errorText);
            if (parsed?.error) friendly = String(parsed.error);
          } catch {
            /* keep the friendly default */
          }
        }
        throw new Error(friendly);
      }


      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) throw new Error("No reader available");

      // Add empty assistant message
      const currentMessages = [...newMessages, { role: "assistant" as const, content: "" }];
      setMessages(currentMessages);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                // Update only the last message
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { 
                    role: "assistant", 
                    content: assistantMessage 
                  };
                  return updated;
                });
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get response";
      toast.error(errorMessage);
      // Remove the user message that failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return;

    const userMessage = input.trim() || "Here are some images";
    const imagesToSend = [...uploadedImages];
    
    setInput("");
    setUploadedImages([]);
    
    await streamChat(userMessage, imagesToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

if (!isOpen) {
    return (
      <div className={`fixed z-50 ${isMobile ? 'bottom-24 right-5' : 'bottom-8 right-8'} group/ai-fab`}>
        {/* Main AI Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 px-5 py-4 rounded-full bg-purple-600 hover:shadow-2xl transition-all duration-500 group overflow-hidden animate-fade-in hover:scale-105 active:scale-95"
          style={{ 
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute w-2 h-2 bg-white/60 rounded-full top-2 left-4 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-1.5 h-1.5 bg-white/40 rounded-full top-6 right-8 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute w-1 h-1 bg-white/50 rounded-full bottom-3 left-12 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          </div>
          
          {/* Icon with glow */}
          <div className="relative z-10">
            <div className="absolute -inset-2 bg-white/20 rounded-full blur-lg animate-pulse" />
            <Sparkles className="relative h-6 w-6 text-white drop-shadow-lg" strokeWidth={2.5} />
          </div>
          
          {/* AI Chat Text - Desktop only */}
          {!isMobile && (
            <div className="relative z-10 flex flex-col items-start">
              <span className="text-white font-black text-sm leading-none mb-0.5">AI Chat</span>
              <span className="text-white/80 text-[10px] font-semibold leading-none">Ask me anything</span>
            </div>
          )}
          
          {/* Active status indicator */}
          <div className="relative z-10 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
            <span className="text-[10px] text-white/90 font-bold uppercase tracking-wider">Online</span>
          </div>
          
          {/* Rotating border */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </button>
        
        {/* Mobile AI badge */}
        {isMobile && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-400 rounded-full shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
            <span className="text-[10px] font-black text-white">AI</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed bg-card/95 backdrop-blur-2xl border border-border/50 rounded-[32px] shadow-2xl flex flex-col z-50 animate-scale-in overflow-hidden ${isMobile ? 'inset-4 bottom-24' : 'w-[420px] h-[650px] bottom-6 right-6'}`}
      style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}
    >
      {/* Modern Header with Gradient */}
      <div className="relative p-6 bg-primary overflow-hidden">
        {/* Curved bottom shape */}
        <div className="absolute bottom-0 left-0 right-0 h-4">
          <svg viewBox="0 0 1440 24" fill="none" className="w-full h-full">
            <path d="M0 24H1440V0C1440 0 1080 24 720 24C360 24 0 0 0 0V24Z" fill="hsl(var(--card))" fillOpacity="0.95" />
          </svg>
        </div>
        
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="relative flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-[20px] bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
              style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.3)' }}
            >
              <Sparkles className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-white text-xl mb-0.5">Edura AI</h3>
              <p className="text-xs text-white/90 font-semibold">Your Smart Study Companion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-2xl transition-all h-11 w-11"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-5 bg-background/50">
        {messages.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative h-24 w-24 mx-auto rounded-[28px] bg-primary flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 20px 60px rgba(var(--primary), 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}
              >
                <Sparkles className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h4 className="font-black mb-2 text-foreground text-2xl bg-foreground">
              Welcome to Edura AI! ✨
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium mb-6">
              I'm your intelligent study assistant. Ask me anything about exams, subjects, or study strategies!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <div className="px-4 py-2 bg-primary/10 rounded-[16px] text-xs text-primary font-bold border border-primary/20 shadow-lg">
                📸 Upload Images
              </div>
              <div className="px-4 py-2 bg-secondary/10 rounded-[16px] text-xs text-secondary-foreground font-bold border border-secondary/20 shadow-lg">
                Exam Tips
              </div>
              <div className="px-4 py-2 bg-accent/10 rounded-[16px] text-xs text-accent-foreground font-bold border border-accent/20 shadow-lg">
                Study Plans
              </div>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 animate-fade-in ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-5 py-4 rounded-[24px] max-w-[85%] shadow-lg ${
                message.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-card/80 backdrop-blur-sm border border-border/50 rounded-bl-sm"
              }`}
              style={message.role === "user" ? { 
                boxShadow: '0 8px 24px rgba(var(--primary), 0.3)' 
              } : {
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
              }}
            >
              {message.images && message.images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {message.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Uploaded ${idx + 1}`}
                      className="max-w-[200px] max-h-[200px] rounded-[16px] object-cover border-2 border-white/20"
                    />
                  ))}
                </div>
              )}
              {message.role === "assistant" ? (
                <div 
                  className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtmlContent(processMarkdown(message.content))
                  }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4 animate-fade-in">
            <div className="inline-block px-5 py-4 rounded-[24px] bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg rounded-bl-sm"
              style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={2.5} />
                <span className="text-sm text-foreground font-bold">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Modern Input Area */}
      <div className="p-5 border-t border-border/50 bg-card/50 backdrop-blur-sm">
        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="w-16 h-16 rounded-[16px] object-cover border-2 border-primary shadow-lg"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-3">
          <div className="flex-1 relative">
            {/* Upload options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-2 h-9 w-9 rounded-[14px] hover:bg-primary/10 z-10"
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-[16px]">
                <DropdownMenuItem 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedImages.length >= 5}
                  className="cursor-pointer rounded-[12px]"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add photos & files
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploadedImages.length >= 5}
                  className="cursor-pointer rounded-[12px]"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="min-h-[64px] pl-12 pr-3 resize-none border-border/50 focus-visible:ring-primary rounded-[20px] shadow-lg bg-background/80 backdrop-blur-sm font-medium"
              disabled={isLoading}
              style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              onClick={toggleVoiceInput}
              variant={isListening ? "destructive" : "outline"}
              disabled={isLoading}
              className={`rounded-[18px] h-12 w-12 shadow-lg border-border/50 ${isListening ? "" : "hover:bg-secondary/10 hover:border-primary/30"}`}
              title="Voice input"
            >
              {isListening ? (
                <MicOff className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Mic className="h-5 w-5" strokeWidth={2.5} />
              )}
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
              className="bg-primary hover:scale-105 text-white rounded-[18px] h-12 w-12 shadow-xl transition-all"
              title="Send message"
              style={{ boxShadow: '0 8px 24px rgba(var(--primary), 0.4)' }}
            >
              <Send className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
