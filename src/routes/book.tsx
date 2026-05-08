import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MessageCircle, Calendar } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/use-site-settings";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book Appointment — Perfect Motor Driving School" },
      { name: "description", content: "Book a driving lesson appointment with PMDS via email or WhatsApp." },
      { property: "og:title", content: "Book Appointment | PMDS" },
      { property: "og:description", content: "Reserve your spot for driving lessons today." },
    ],
  }),
  component: BookPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20),
  service: z.string().min(1, "Select a service"),
  description: z.string().max(1000).optional().or(z.literal("")),
});

function BookPage() {
  const { data: settings } = useSiteSettings();
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });

  const [form, setForm] = useState({ name: "", phone: "", service: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOther = form.service === "Other";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    if (isOther && !form.description.trim()) { toast.error("Please describe your request"); return; }
    setLoading(true);
    const svc = services.find((s) => s.name === form.service);
    const { error } = await supabase.from("appointment_enquiries").insert({
      name: form.name,
      phone: form.phone,
      service_id: svc?.id ?? null,
      service_name: form.service,
      description: form.description || null,
    });
    setLoading(false);
    if (error) { toast.error("Failed to save"); return; }
    setSubmitted(true);
    toast.success("Appointment request saved!");
  }

  function emailBody() {
    return `New Appointment Enquiry%0A%0AName: ${form.name}%0APhone: ${form.phone}%0AService: ${form.service}${isOther ? "%0ADescription: " + encodeURIComponent(form.description) : ""}`;
  }
  function waText() {
    return encodeURIComponent(`Hello PMDS, I'd like to book an appointment.\n\nName: ${form.name}\nPhone: ${form.phone}\nService: ${form.service}${isOther ? "\nDetails: " + form.description : ""}`);
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Calendar className="mx-auto h-12 w-12" />
          <h1 className="mt-3 text-4xl font-bold md:text-6xl">Book Appointment</h1>
          <p className="mt-3 opacity-90">Quick form, instant confirmation via email or WhatsApp</p>
        </div>
      </section>

      <section className="container mx-auto max-w-2xl px-4 py-12">
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />

          <div>
            <label className="mb-1 block text-sm font-medium">Select Service</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Choose a service —</option>
              {services.map((s) => (<option key={s.id} value={s.name}>{s.name}</option>))}
              <option value="Other">Other</option>
            </select>
          </div>

          {isOther && (
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell us what you need..."
              />
            </div>
          )}

          {!submitted ? (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-hero px-4 py-3 font-semibold text-primary-foreground shadow-card transition-base hover:shadow-glow disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Enquiry"}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl bg-success/10 p-4 text-center">
              <p className="font-semibold text-success">Choose how to send your enquiry:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`mailto:${settings?.email}?subject=Appointment Enquiry from ${encodeURIComponent(form.name)}&body=${emailBody()}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-card transition-base hover:shadow-glow"
                >
                  <Mail className="h-4 w-4" /> Send via Email
                </a>
                <a
                  href={`https://wa.me/${(settings?.whatsapp_number ?? "").replace(/\D/g, "")}?text=${waText()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-success px-4 py-3 font-semibold text-success-foreground shadow-card transition-base hover:shadow-glow"
                >
                  <MessageCircle className="h-4 w-4" /> Send via WhatsApp
                </a>
              </div>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", service: "", description: "" }); }}
                className="text-xs text-muted-foreground underline"
              >
                Submit another
              </button>
            </div>
          )}
        </form>
      </section>
    </PublicLayout>
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
