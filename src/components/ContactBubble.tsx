"use client";

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Message = { role: "user" | "assistant"; content: string; imageUrl?: string | null };
type ChatMode = "customer" | "staff" | "admin";

type ModeMeta = {
  title: string;
  subtitle: string;
  placeholder: string;
  launchLabel: string;
  intro: string;
  starters: string[];
  sendLabel: string;
  allowImage: boolean;
};

const contactLinks = [
  {
    label: "WhatsApp",
    helper: "Chat on WhatsApp",
    href: "https://wa.me/447774292572?text=Hi%20The%20Nail%20Lounge%2C%20I%27d%20like%20to%20book%20an%20appointment.",
    className: "bg-[#25D366] hover:bg-[#1fb857]",
    icon: WhatsAppIcon,
  },
  {
    label: "Facebook Messenger",
    helper: "Message our Facebook page",
    href: process.env.NEXT_PUBLIC_FACEBOOK_MESSENGER_URL || "https://m.me/nails.stokesley",
    className: "bg-[#0084FF] hover:bg-[#006fe0]",
    icon: MessengerIcon,
  },
  {
    label: "Instagram",
    helper: "Send us a DM",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_MESSENGER_URL || "https://ig.me/m/nails.stokesley",
    className: "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#FCAF45] hover:brightness-110",
    icon: InstagramIcon,
  },
];

function modeMeta(mode: ChatMode): ModeMeta {
  if (mode === "admin") {
    return {
      title: "Nail Lounge Admin Assistant",
      subtitle: "Live operational answers for revenue, bookings, staffing, leave, and priorities.",
      placeholder: "Ask about revenue, today’s bookings, staff gaps, leave queue, or an uploaded issue photo...",
      launchLabel: "Ask assistant",
      intro: "Hi. I can help with live operational questions, booking pressure, leave requests, staffing decisions, and the most urgent next actions from the current data snapshot.",
      starters: ["What is today’s counted revenue?", "Which bookings are still unassigned?", "What leave requests are waiting?", "Summarise today’s operations"],
      sendLabel: "Send",
      allowImage: true,
    };
  }

  if (mode === "staff") {
    return {
      title: "Nail Lounge Staff Assistant",
      subtitle: "Quick help for schedule, assigned clients, leave, availability, and workload.",
      placeholder: "Ask about your shift, next client, leave status, availability, or upload a reference photo...",
      launchLabel: "Ask assistant",
      intro: "Hi. I can help with your schedule, next clients, leave status, availability, workload, and a cautious review of any nail photo or screenshot you upload.",
      starters: ["How many clients do I have today?", "What is my next booking?", "What is the status of my leave requests?", "Show my workload summary"],
      sendLabel: "Send",
      allowImage: true,
    };
  }

  return {
    title: "Nail Lounge Assistant",
    subtitle: "Quick mobile-friendly help for customers.",
    placeholder: "Ask about services, prices, booking, nail concerns...",
    launchLabel: "Chat now",
    intro: "Hi! I can help with services, prices, booking steps, salon info, simple policies, and even a cautious visual opinion if you upload a nail photo.",
    starters: ["Prices", "Services", "How to book", "Can I show a nail photo?"],
    sendLabel: "Send",
    allowImage: true,
  };
}

function detectMode(pathname: string | null, role?: string | null): ChatMode {
  const page = String(pathname || "").toLowerCase();
  if (page.startsWith("/admin") || role === "ADMIN" || role === "MANAGER") return "admin";
  if (page.startsWith("/staff") || role === "STAFF") return "staff";
  return "customer";
}

function defaultImagePrompt(mode: ChatMode) {
  if (mode === "customer") {
    return "Can you look at this photo and tell me whether the salon may be able to help, and whether I should contact the salon first?";
  }
  if (mode === "staff") {
    return "Please review this image and tell me what matters for today’s work, booking notes, or escalation.";
  }
  return "Please review this image and tell me what matters operationally, what is confirmed, and what should be escalated.";
}

async function resizeImageToDataUrl(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = dataUrl;
  });

  const maxSide = 1280;
  const ratio = Math.min(1, maxSide / Math.max(image.width || 1, image.height || 1));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

export default function ContactBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showStarters, setShowStarters] = useState(true);
  const [draftImageUrl, setDraftImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const pathname = usePathname();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mode = useMemo(() => detectMode(pathname, user?.role), [pathname, user?.role]);
  const meta = useMemo(() => modeMeta(mode), [mode]);

  useEffect(() => {
    setMessages([{ role: "assistant", content: meta.intro }]);
    setInput("");
    setDraftImageUrl(null);
    setShowStarters(true);
  }, [meta.intro]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, sending]);

  const hasConversationStarted = messages.some((message) => message.role === "user");
  const showDirectContactLinks = mode === "customer" && !hasConversationStarted && showStarters && !draftImageUrl;

  const panelWidth = mode === "customer"
    ? (showStarters ? "w-[min(calc(100vw-1rem),24rem)]" : "w-[min(calc(100vw-1rem),28rem)]")
    : (showStarters ? "w-[min(calc(100vw-1rem),26rem)]" : "w-[min(calc(100vw-1rem),32rem)]");

  const messageAreaClassName = hasConversationStarted
    ? "max-h-[60vh] min-h-[18rem]"
    : "max-h-[52vh]";

  const sendMessage = async (text?: string) => {
    const raw = String(text ?? input).trim();
    const content = raw || (draftImageUrl ? defaultImagePrompt(mode) : "");
    if ((!content && !draftImageUrl) || sending) return;

    const imageUrl = draftImageUrl;
    const nextMessages: Message[] = [...messages, { role: "user", content, imageUrl }];
    setMessages(nextMessages);
    setInput("");
    setDraftImageUrl(null);
    setShowStarters(false);
    setSending(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/api/chatbot", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: bodyContent }) => ({ role, content: bodyContent })),
          page: pathname || "/",
          imageDataUrl: imageUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const answer = String(data?.answer || data?.error || "Sorry, I could not answer that just now.").trim();
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, the assistant is unavailable right now. Please refresh the page or use the direct contact buttons if you need an immediate answer.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }
    setUploadingImage(true);
    try {
      const compressed = await resizeImageToDataUrl(file);
      setDraftImageUrl(compressed);
      setOpen(true);
      setShowStarters(false);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-[70] flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <div className={`${panelWidth} overflow-hidden rounded-[2rem] border border-pink-100 bg-white shadow-2xl shadow-pink-200/40`}>
          <div className="bg-gradient-to-r from-pink-50 via-white to-rose-50 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-gray-900">{meta.title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{meta.subtitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white text-gray-500 shadow-sm">×</button>
            </div>
            {showStarters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {meta.starters.map((item) => (
                  <button key={item} onClick={() => sendMessage(item)} disabled={sending} className="rounded-full border border-pink-200 bg-white px-3 py-2 text-[11px] font-bold text-pink-700 disabled:opacity-50">
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`${messageAreaClassName} space-y-3 overflow-y-auto bg-[#fffafc] px-4 py-4`}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "bg-gray-900 text-white"
                      : "border border-pink-100 bg-white text-gray-700"
                  }`}
                >
                  {message.imageUrl && (
                    <img src={message.imageUrl} alt="Uploaded reference" className="mb-3 max-h-48 w-full rounded-2xl object-cover" />
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-[1.4rem] border border-pink-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">Typing…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-pink-100 bg-white p-3">
            {draftImageUrl && (
              <div className="mb-3 rounded-2xl border border-pink-100 bg-pink-50 p-3">
                <div className="flex items-start gap-3">
                  <img src={draftImageUrl} alt="Draft upload" className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wide text-pink-700">Image attached</p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">Ask what the salon may be able to do, and the assistant will give a cautious, non-medical opinion.</p>
                  </div>
                  <button onClick={() => setDraftImageUrl(null)} className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-xs font-bold text-pink-700">Remove</button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              {meta.allowImage && (
                <>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickImage} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || sending}
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 disabled:opacity-50"
                    title="Upload image"
                  >
                    {uploadingImage ? "…" : <PhotoIcon />}
                  </button>
                </>
              )}
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={meta.placeholder}
                className="min-h-12 flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || (!input.trim() && !draftImageUrl)}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-pink-600 px-4 text-sm font-black text-white disabled:opacity-50"
              >
                {meta.sendLabel}
              </button>
            </div>

            {showDirectContactLinks ? (
              <div className="mt-3 grid gap-2">
                {contactLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm"
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${item.className}`}>
                        <Icon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">{item.label}</span>
                        <span className="block text-xs text-gray-500">{item.helper}</span>
                      </span>
                      <span className="text-pink-400 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                    </a>
                  );
                })}
              </div>
            ) : mode !== "customer" ? (
              <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
                Internal mode uses live role-aware context from the current page, signed-in account, and current operational snapshot.
              </div>
            ) : null}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-2xl shadow-rose-300/60 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-200"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
      >
        <span className="absolute inset-0 rounded-full bg-rose-400/40 animate-ping" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full">{open ? <CloseIcon /> : <ChatIcon />}</span>
        {!open && (
          <span className="absolute right-[4.5rem] hidden whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg sm:block">
            {meta.launchLabel}
          </span>
        )}
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11.6c0 4.2-3.6 7.6-8 7.6-1.1 0-2.2-.2-3.2-.6L4 20l1.5-4.1A7.2 7.2 0 0 1 4 11.6C4 7.4 7.6 4 12 4s8 3.4 8 7.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8 15 2.4-2.7a1 1 0 0 1 1.49-.02L14 14.5l1.2-1.34a1 1 0 0 1 1.48-.04L19 15.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.43 2.13 11.88c0 1.74.46 3.44 1.33 4.94L2 22l5.3-1.39a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.43 9.9-9.88A9.84 9.84 0 0 0 12.04 2Zm5.76 14.1c-.24.68-1.39 1.29-1.94 1.37-.5.07-1.12.1-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.3.59-.37.78-.37h.57c.18.01.43-.07.67.51.24.58.84 2 .91 2.14.08.15.13.32.03.51-.1.2-.15.32-.3.49-.14.17-.3.38-.43.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.29.39-.24.67-.14.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.71-.17 1.39Z" />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.46 5.52 3.74 7.22V22l3.42-1.88c.9.25 1.86.39 2.84.39 5.52 0 10-4.15 10-9.24S17.52 2 12 2Zm1 12.48-2.55-2.72-4.98 2.72 5.47-5.8 2.61 2.72 4.91-2.72L13 14.48Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
