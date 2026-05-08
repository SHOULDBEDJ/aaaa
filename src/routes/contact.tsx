import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Perfect Motor Driving School" },
      { name: "description", content: "Get in touch with PMDS. Call, email, WhatsApp or send an enquiry." },
      { property: "og:title", content: "Contact PMDS" },
      { property: "og:description", content: "Reach out to Perfect Motor Driving School." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  email: z.string().trim().email("Valid email required").max(255),
  message: z.string().trim().min(1, "Message required").max(1000),
});

function ContactPage() {
  const { data: s } = useSiteSettings();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.from("contact_enquiries").insert(parsed.data);
    setLoading(false);
    if (error) { toast.error("Failed to send. Try again."); return; }
    toast.success("Thanks! We'll get back to you shortly.");
    setForm({ name: "", phone: "", email: "", message: "" });
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">Contact Us</h1>
          <p className="mt-3 opacity-90">We'd love to hear from you</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Get in Touch</h2>
          <div className="space-y-4">
            {s && (
              <>
                <InfoRow icon={MapPin} label="Address" value={s.address} />
                <InfoRow icon={Phone} label="Phone" value={s.phone_number} href={`tel:${s.phone_number}`} />
                <InfoRow icon={Mail} label="Email" value={s.email} href={`mailto:${s.email}`} />
              </>
            )}
          </div>

          {s?.map_embed_url && (
            <div className="overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                src={s.map_embed_url}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location"
              />
            </div>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold">Send an Enquiry</h2>
          <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Email Address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-hero px-4 py-3 font-semibold text-primary-foreground shadow-card transition-base hover:shadow-glow disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const Comp: any = href ? "a" : "div";
  return (
    <Comp href={href} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-base hover:shadow-card">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </Comp>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
