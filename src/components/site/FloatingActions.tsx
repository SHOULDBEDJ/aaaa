import { Phone, MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function FloatingActions() {
  const { data: s } = useSiteSettings();
  if (!s) return null;
  return (
    <>
      <a
        href={`tel:${s.phone_number}`}
        aria-label="Call us"
        className="fixed bottom-6 left-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-base hover:scale-110 hover:shadow-glow"
      >
        <Phone className="h-6 w-6" />
        <span className="absolute h-14 w-14 animate-ping rounded-full bg-primary/40" />
      </a>
      <a
        href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp us"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-success text-success-foreground shadow-elegant transition-base hover:scale-110 hover:shadow-glow"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute h-14 w-14 animate-ping rounded-full bg-success/40" />
      </a>
    </>
  );
}
