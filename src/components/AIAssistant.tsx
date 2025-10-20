import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Mic, MicOff, Loader2, Brain, Zap, MessageCircle, Image as ImageIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
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
      toast.error("Failed to get response. Please try again.");
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
      <div className={`fixed z-50 ${isMobile ? 'bottom-40 right-4' : 'bottom-6 right-6'}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl shadow-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 hover:scale-110 transition-all duration-500 p-0 relative group animate-bounce-slow"
        >
          {/* Multi-layered animated glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-green-400/60 blur-2xl animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-green-300/40 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-50 blur-md animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Morphing Icon - centered and contained */}
          <div className="relative w-full h-full flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-white drop-shadow-lg transition-all duration-500" />
          </div>
          
          {/* AI Badge */}
          <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-white text-green-600 text-[10px] font-bold rounded-md shadow-lg border border-green-200 animate-pulse">
            AI
          </div>
          
          {/* Multiple pulsing indicators */}
          <span className="absolute top-1 left-1 h-1.5 w-1.5 bg-green-300 rounded-full animate-ping" />
          <span className="absolute top-1 left-1 h-1.5 w-1.5 bg-green-300 rounded-full" />
        </Button>
        
        {/* Modern tooltip */}
        <div className="absolute -top-12 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-xl animate-pulse backdrop-blur-sm">
          AI Assistant
          <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-green-600 transform rotate-45" />
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed w-[420px] h-[650px] bg-background/95 backdrop-blur-xl border border-green-500/30 rounded-3xl shadow-2xl flex flex-col z-50 animate-scale-in overflow-hidden ${isMobile ? 'bottom-40 right-4' : 'bottom-6 right-6'}`}>
      {/* Modern Header with Gradient */}
      <div className="relative p-5 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Edura AI</h3>
              <p className="text-xs text-white/90 font-medium">Your Smart Study Companion</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-5 bg-gradient-to-b from-green-50/30 via-background to-background dark:from-green-950/10">
        {messages.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl" />
              <div className="relative h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h4 className="font-bold mb-3 text-foreground text-lg">Welcome to Edura AI! ✨</h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              I'm your intelligent study assistant. Ask me anything about exams, subjects, or study strategies!
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg text-xs text-green-700 dark:text-green-300 font-medium">
                📸 Upload Images
              </div>
              <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg text-xs text-green-700 dark:text-green-300 font-medium">
                Exam Tips
              </div>
              <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg text-xs text-green-700 dark:text-green-300 font-medium">
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
              className={`inline-block px-5 py-3 rounded-2xl max-w-[85%] shadow-md ${
                message.role === "user"
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}
            >
              {message.images && message.images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {message.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Uploaded ${idx + 1}`}
                      className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {message.role === "assistant" ? (
                <div 
                  className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: processMarkdown(message.content)
                  }}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4 animate-fade-in">
            <div className="inline-block px-5 py-3 rounded-2xl bg-card border border-border shadow-md rounded-bl-md">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Modern Input Area */}
      <div className="p-5 border-t bg-background/50 backdrop-blur-sm">
        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-green-500"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="min-h-[64px] resize-none border-green-200 dark:border-green-900/50 focus-visible:ring-green-500 rounded-2xl shadow-sm"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isLoading || uploadedImages.length >= 5}
              className="rounded-xl h-12 w-12 shadow-sm border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300"
              title="Upload images"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={toggleVoiceInput}
              variant={isListening ? "destructive" : "outline"}
              disabled={isLoading}
              className={`rounded-xl h-12 w-12 shadow-sm ${isListening ? "" : "border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300"}`}
              title="Voice input"
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || isLoading}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl h-12 w-12 shadow-md hover:shadow-lg transition-all"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
