import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Bot, User, Sparkles, Square } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import axios from "axios";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Lang = "en" | "ur";
interface Msg {
  id: string;
  from: "user" | "ai";
  text: string;
  time: string;
  translated?: string;
}

const QUICK: Record<Lang, string[]> = {
  en: ["Book an appointment", "Reschedule", "Clinic hours", "Talk to staff"],
  ur: ["مجھے اپوائنٹمنٹ بُک کرنی ہے", "اپوائنٹمنٹ تبدیل کریں", "کلینک اوقات", "اسٹاف سے بات"],
};

function ChatPage() {
  const { user } = useAuth();
  const [lang, setLang] = useState<Lang>("en");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m0",
      from: "ai",
      text: "Hi! I'm MediFlow's AI assistant. How can I help you today?",
      time: "now",
    },
  ]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendUser = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: `u${Date.now()}`, from: "user", text, time: "now" };
    setMsgs((p) => [...p, userMsg]);
    setInput("");
    try {
      setSending(true);
      const { data } = await api.post<{ response: string }>("/chat/message", {
        userId: user?.id ?? "anon",
        message: text,
      });
      setMsgs((p) => [
        ...p,
        { id: `a${Date.now()}`, from: "ai", text: data.response, time: "now" },
      ]);
    } catch (err: unknown) {
      const description = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? "Unable to reach the chat service.")
        : "Unable to reach the chat service.";
      toast.error("Message failed", { description });
    } finally {
      setSending(false);
    }
  };

  const currentQuick = QUICK[lang];

  // Voice recording simulation
  useEffect(() => {
    if (!recording) return;
    const phrases =
      lang === "en"
        ? [
            "I want",
            "I want to book",
            "I want to book an appointment",
            "I want to book an appointment with cardiology",
          ]
        : ["مجھے", "مجھے اپوائنٹمنٹ", "مجھے اپوائنٹمنٹ بُک کرنی ہے"];
    let i = 0;
    const t = setInterval(() => {
      setTranscript(phrases[Math.min(i, phrases.length - 1)]);
      i++;
      if (i >= phrases.length + 2) {
        clearInterval(t);
        setRecording(false);
        (async () => {
          try {
            setSending(true);
            const { data } = await api.post<{ transcript: string; responseText: string }>(
              "/chat/voice/process",
              { userId: user?.id ?? "anon", audioDataBase64: "bW9jaw==" },
            );
            setMsgs((p) => [
              ...p,
              { id: `u${Date.now()}`, from: "user", text: data.transcript, time: "now" },
              { id: `a${Date.now() + 1}`, from: "ai", text: data.responseText, time: "now" },
            ]);
          } catch (err: unknown) {
            const description = axios.isAxiosError(err)
              ? (err.response?.data?.detail ?? "Unable to reach the voice service.")
              : "Unable to reach the voice service.";
            toast.error("Voice processing failed", { description });
          } finally {
            setSending(false);
          }
        })();
        setTranscript("");
      }
    }, 600);
    return () => clearInterval(t);
  }, [recording, lang, user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Patient Chat & Voice Booking
          </h1>
          <p className="text-muted-foreground">
            Multilingual AI assistant simulation — English & Urdu
          </p>
        </div>
        <div className="flex p-1 rounded-xl bg-muted">
          {(["en", "ur"] as const).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setMsgs([
                  {
                    id: "m0",
                    from: "ai",
                    text:
                      l === "en"
                        ? "Hi! How can I help you today?"
                        : "السلام علیکم! میں آپ کی کیا مدد کر سکتا ہوں؟",
                    time: "now",
                  },
                ]);
              }}
              className={`relative px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${lang === l ? "text-primary-foreground" : "text-muted-foreground"}`}
            >
              {lang === l && (
                <motion.div
                  layoutId="lang-active"
                  className="absolute inset-0 rounded-lg gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{l === "en" ? "English" : "اردو"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2 rounded-2xl glass-card overflow-hidden flex flex-col h-[640px]">
          <div className="px-5 py-4 border-b border-border/60 flex items-center gap-3">
            <div className="size-10 rounded-full gradient-primary grid place-items-center shadow-glow">
              <Bot className="size-5 text-white" />
            </div>
            <div>
              <div className="font-semibold">MediFlow AI Assistant</div>
              <div className="text-xs text-success flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                Online
              </div>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-3"
            dir={lang === "ur" ? "rtl" : "ltr"}
          >
            <AnimatePresence initial={false}>
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.from === "ai" && (
                    <div className="size-7 rounded-full gradient-primary grid place-items-center shrink-0 mt-1">
                      <Bot className="size-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === "user"
                        ? "gradient-primary text-white rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <div>{m.text}</div>
                    {m.translated && (
                      <div className="mt-1 pt-1 border-t border-border/20 text-[10px] italic opacity-80">
                        {m.translated}
                      </div>
                    )}
                  </div>
                  {m.from === "user" && (
                    <div className="size-7 rounded-full bg-violet/20 grid place-items-center shrink-0 mt-1">
                      <User className="size-3.5 text-violet" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          <div className="px-5 pb-2 flex flex-wrap gap-2" dir={lang === "ur" ? "rtl" : "ltr"}>
            {currentQuick.map((q) => (
              <button
                key={q}
                disabled={sending}
                onClick={() => void sendUser(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-background/60 hover:bg-accent transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendUser(input);
            }}
            className="p-4 border-t border-border/60 flex gap-2"
            dir={lang === "ur" ? "rtl" : "ltr"}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === "en" ? "Type your message..." : "اپنا پیغام لکھیں..."}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={sending}
              className="gradient-primary text-white border-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>

        {/* Voice */}
        <div className="rounded-2xl glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-violet" />
            <h3 className="font-display font-bold text-lg">Voice Booking</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Tap the mic to simulate a voice call</p>

          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              {recording && (
                <>
                  <span className="absolute inset-0 rounded-full bg-destructive/30 animate-pulse-ring" />
                  <span
                    className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse-ring"
                    style={{ animationDelay: "0.4s" }}
                  />
                </>
              )}
              <button
                onClick={() => {
                  setRecording((r) => !r);
                  setTranscript("");
                }}
                className={`relative size-24 rounded-full grid place-items-center shadow-glow transition-all ${
                  recording ? "bg-destructive text-white" : "gradient-primary text-white"
                }`}
              >
                {recording ? (
                  <Square className="size-8 fill-current" />
                ) : (
                  <Mic className="size-9" />
                )}
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium">
                {recording ? "Listening..." : "Tap to speak"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {recording ? "Streaming to ASR pipeline" : "Powered by MediFlow Voice"}
              </div>
            </div>

            <div className="w-full">
              <div className="text-xs text-muted-foreground mb-2">Live transcription</div>
              <div
                className={`min-h-20 rounded-xl border border-border/60 bg-background/50 p-3 text-sm ${transcript ? "" : "text-muted-foreground"}`}
                dir={lang === "ur" ? "rtl" : "ltr"}
              >
                {transcript ||
                  (lang === "en"
                    ? "Your speech will appear here..."
                    : "آپ کی آواز یہاں ظاہر ہوگی...")}
                {recording && (
                  <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse align-middle" />
                )}
              </div>
            </div>

            {/* Audio waveform sim */}
            <div className="w-full flex items-end justify-center gap-1 h-12">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full gradient-primary"
                  animate={{ height: recording ? [4, 8 + Math.random() * 32, 4] : 4 }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.04 }}
                  style={{ height: 4 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
