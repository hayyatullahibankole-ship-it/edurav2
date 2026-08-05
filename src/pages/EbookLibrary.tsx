import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Lock, KeyRound, ArrowRight, ShoppingCart, MessageCircle } from "lucide-react";
import { getUnlockedEbookIds, redeemEbookCode, saveEbookAccess } from "@/utils/ebookAccess";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { canPurchaseDigitalInApp } from "@/lib/nativePayments";
import { openExternal } from "@/lib/openExternal";


const WHATSAPP_NUMBER = "2347050757085";

interface Ebook {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string | null;
  cover_url: string | null;
}

export default function EbookLibrary() {
  const { user } = useAuth();
  const { isAkboy } = useDomainDetection();
  const { toast } = useToast();
  const navigate = useNavigate();
  const basePath = isAkboy ? "" : "/akboy";

  const [books, setBooks] = useState<Ebook[]>([]);
  const [accessIds, setAccessIds] = useState<string[]>(() => getUnlockedEbookIds());
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const [requestBook, setRequestBook] = useState<Ebook | null>(null);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqNote, setReqNote] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const submitRequest = async () => {
    if (!requestBook) return;
    const name = reqName.trim();
    const email = reqEmail.trim();
    if (!name || !email) {
      toast({ title: "Missing details", description: "Your name and email are required.", variant: "destructive" });
      return;
    }
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from("akboy_inquiries").insert({
        name,
        email,
        phone: reqPhone.trim() || null,
        subject: `Ebook access code request: ${requestBook.title}`,
        message:
          `Request for an access code to "${requestBook.title}" by ${requestBook.author}.` +
          (reqNote.trim() ? `\n\nNote: ${reqNote.trim()}` : ""),
        status: "pending",
      });
      if (error) throw error;
      toast({
        title: "Request sent",
        description: "We'll send your access code shortly. You can also message us on WhatsApp to speed it up.",
      });
      setRequestBook(null);
      setReqNote("");
    } catch (error: any) {
      toast({ title: "Could not send request", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const whatsappLink = (book: Ebook) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hello AKBOY, I'd like to purchase an access code for the ebook "${book.title}".`
    )}`;

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ebooks")
      .select("id, title, slug, author, description, cover_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    setBooks((data as Ebook[]) || []);
    setAccessIds(getUnlockedEbookIds());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const redeem = async () => {
    const normalizedCode = code.trim().toUpperCase();
    const name = fullName.trim();
    if (!normalizedCode) return;
    if (!name) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    setRedeeming(true);
    try {
      const res = await redeemEbookCode(normalizedCode, name);

      if (!res.success) {
        toast({ title: "Could not redeem", description: res.error || "Invalid access code", variant: "destructive" });
        return;
      }

      saveEbookAccess(res.ebook_id!, normalizedCode, name);
      const unlocked = Array.from(new Set([...accessIds, res.ebook_id!]));
      setAccessIds(unlocked);
      setCode("");
      toast({ title: "Access granted", description: "This code is now locked to this device." });
      await load();
      if (res.slug) navigate(`${basePath}/ebooks/${res.slug}`);
    } catch (error: any) {
      toast({ title: "Could not redeem", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>Ebook Library | AKBOY</title>
        <meta name="description" content="Read AKBOY ebooks online. Access-controlled reading library for students and creatives." />
      </Helmet>

      <header className="bg-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Badge className="bg-white/10 text-emerald-50 border-0 mb-4">Reading Library</Badge>
          <h1 className="text-3xl md:text-5xl font-bold">Ebooks</h1>
          <p className="mt-3 text-emerald-100 max-w-2xl">
            Unlock each book with an access code. Once redeemed, it stays locked to the device that used it.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <Card className="p-5 border-stone-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <KeyRound className="w-4 h-4 text-emerald-700" /> Unlock a book
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter access code"
                className="uppercase"
              />
              <Button onClick={redeem} disabled={redeeming} className="bg-emerald-700 hover:bg-emerald-800">
                {redeeming ? "Checking..." : "Unlock"}
              </Button>
            </div>
            <p className="text-xs text-stone-500">Your name is recorded with the code you use.</p>
          </div>

        </Card>

        {loading ? (
          <p className="text-stone-500">Loading library...</p>
        ) : books.length === 0 ? (
          <Card className="p-12 text-center border-stone-200">
            <BookOpen className="w-10 h-10 mx-auto text-stone-400 mb-3" />
            <p className="text-stone-600">No books published yet. Check back soon.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((b) => {
              const unlocked = accessIds.includes(b.id);
              return (
                <Card key={b.id} className="overflow-hidden border-stone-200 flex flex-col">
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={`${b.title} cover`} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-stone-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-semibold text-lg text-stone-900">{b.title}</h2>
                    <p className="text-sm text-stone-500 mb-2">by {b.author}</p>
                    {b.description && <p className="text-sm text-stone-600 line-clamp-3 mb-4">{b.description}</p>}
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={unlocked ? "border-emerald-300 text-emerald-700" : "border-stone-300 text-stone-500"}>
                          {unlocked ? "Unlocked" : "Access required"}
                        </Badge>
                        <Button asChild size="sm" variant={unlocked ? "default" : "outline"} className={unlocked ? "bg-emerald-700 hover:bg-emerald-800" : ""}>
                          <Link to={`${basePath}/ebooks/${b.slug}`}>
                            {unlocked ? <>Read <ArrowRight className="w-4 h-4 ml-1" /></> : <><Lock className="w-4 h-4 mr-1" /> Preview</>}
                          </Link>
                        </Button>
                      </div>
                      {!unlocked && !canPurchaseDigitalInApp() && (
                        <p className="text-xs text-stone-500">
                          Have an access code? Enter it above to unlock this book.
                        </p>
                      )}
                      {!unlocked && canPurchaseDigitalInApp() && (
                        <Button
                          size="sm"
                          className="w-full bg-emerald-700 hover:bg-emerald-800"
                          onClick={() => {
                            setRequestBook(b);
                            setReqName(fullName);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Request / buy access code
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!requestBook} onOpenChange={(open) => !open && setRequestBook(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request access code</DialogTitle>
            <DialogDescription>
              {requestBook ? `For "${requestBook.title}". We'll contact you with payment details and your code.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="req-name">Full name</Label>
              <Input id="req-name" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-email">Email</Label>
              <Input id="req-email" type="email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-phone">Phone (optional)</Label>
              <Input id="req-phone" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} placeholder="080..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="req-note">Note (optional)</Label>
              <Textarea id="req-note" value={reqNote} onChange={(e) => setReqNote(e.target.value)} rows={3} placeholder="Anything we should know?" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {requestBook && canPurchaseDigitalInApp() && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => openExternal(whatsappLink(requestBook))}
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Buy on WhatsApp
              </Button>
            )}

            <Button onClick={submitRequest} disabled={submittingRequest} className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800">
              {submittingRequest ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
