import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LogOut, Image as ImageIcon, Wrench, MessageSquare, Calendar, Settings,
  Trash2, Plus, Upload, Pencil, Save, X, Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAuthed, login, logout } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ 
    meta: [
      { title: "Admin — PMDS" }, 
      { name: "robots", content: "noindex" }
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" }
    ]
  }),
  component: AdminPage,
});

type Tab = "media" | "services" | "contacts" | "appointments" | "settings";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("media");

  useEffect(() => { setAuthed(isAuthed()); }, []);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "media", label: "Gallery & Media", icon: ImageIcon },
    { id: "services", label: "Services", icon: Wrench },
    { id: "contacts", label: "Contact Enquiries", icon: MessageSquare },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "settings", label: "Contact Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-gradient-hero px-3 py-1 text-sm font-bold text-primary-foreground">PMDS Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-secondary"><Home className="h-4 w-4" /> Site</Link>
            <button onClick={() => { logout(); setAuthed(false); }} className="inline-flex items-center gap-1 rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={"flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-base " + (tab === t.id ? "bg-gradient-hero text-primary-foreground shadow-card" : "hover:bg-secondary")}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>

        <main className="rounded-xl border border-border bg-card p-6 shadow-card">
          {tab === "media" && <MediaManager />}
          {tab === "services" && <ServicesManager />}
          {tab === "contacts" && <ContactsManager />}
          {tab === "appointments" && <AppointmentsManager />}
          {tab === "settings" && <SettingsManager />}
        </main>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(u, p)) { toast.success("Welcome back!"); onLogin(); }
    else toast.error("Invalid credentials");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <h1 className="text-2xl font-bold">PMDS Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your website.</p>
        <div className="mt-6 space-y-3">
          <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Username" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="Password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button className="w-full rounded-md bg-gradient-hero px-4 py-2 font-semibold text-primary-foreground shadow-card transition-base hover:shadow-glow">Sign In</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Media ---------------- */
function MediaManager() {
  const qc = useQueryClient();
  const { data: media = [] } = useQuery({
    queryKey: ["admin_media"],
    queryFn: async () => (await supabase.from("media").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) { toast.error(`Upload failed: ${file.name}`); continue; }
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("media").insert({
        type: isVideo ? "video" : "photo",
        url: pub.publicUrl,
        title: file.name,
        show_in_carousel: true,
        show_in_gallery: !isVideo,
      });
    }
    setUploading(false);
    qc.invalidateQueries({ queryKey: ["admin_media"] });
    qc.invalidateQueries({ queryKey: ["gallery_photos"] });
    qc.invalidateQueries({ queryKey: ["carousel_media"] });
    toast.success("Upload complete");
  }

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    await supabase.from("media").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_media"] });
    qc.invalidateQueries({ queryKey: ["gallery_photos"] });
    qc.invalidateQueries({ queryKey: ["carousel_media"] });
    toast.success("Deleted");
  }

  async function toggle(id: string, field: "show_in_gallery" | "show_in_carousel", val: boolean) {
    const patch: any = { [field]: val };
    await supabase.from("media").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_media"] });
    qc.invalidateQueries({ queryKey: ["gallery_photos"] });
    qc.invalidateQueries({ queryKey: ["carousel_media"] });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Gallery & Media</h2>
          <p className="text-sm text-muted-foreground">Upload photos & videos. Photos show in Gallery + Carousel; videos show in Carousel only.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-glow">
          <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Files"}
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-xl border border-border bg-background">
            {m.type === "video" ? (
              <video src={m.url} className="aspect-video w-full bg-black" controls />
            ) : (
              <img src={m.url} alt="" className="aspect-video w-full object-cover" />
            )}
            <div className="p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="rounded bg-secondary px-2 py-0.5 font-medium uppercase">{m.type}</span>
                <button onClick={() => del(m.id)} className="text-destructive hover:underline"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={m.show_in_gallery} onChange={(e) => toggle(m.id, "show_in_gallery", e.target.checked)} disabled={m.type === "video"} />
                  Show in Gallery
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={m.show_in_carousel} onChange={(e) => toggle(m.id, "show_in_carousel", e.target.checked)} />
                  Show in Carousel
                </label>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No media uploaded yet.</p>}
      </div>
    </div>
  );
}

/* ---------------- Services ---------------- */
function ServicesManager() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);

  function startNew() { setEditing({ name: "", description: "", price: "", icon: "car", image_url: "", sort_order: items.length + 1 }); }

  async function save() {
    if (!editing.name) { toast.error("Name required"); return; }
    const payload = { ...editing };
    if (editing.id) {
      await supabase.from("services").update(payload).eq("id", editing.id);
    } else {
      delete payload.id;
      await supabase.from("services").insert(payload);
    }
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin_services"] });
    qc.invalidateQueries({ queryKey: ["services"] });
    toast.success("Saved");
  }

  async function del(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_services"] });
    qc.invalidateQueries({ queryKey: ["services"] });
    toast.success("Deleted");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services</h2>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-glow">
          <Plus className="h-4 w-4" /> New Service
        </button>
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 md:grid-cols-2">
          <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <Input label="Price" value={editing.price ?? ""} onChange={(v) => setEditing({ ...editing, price: v })} />
          <Input label="Icon (car / bike / badge / refresh)" value={editing.icon ?? ""} onChange={(v) => setEditing({ ...editing, icon: v })} />
          <Input label="Image URL (optional)" value={editing.image_url ?? ""} onChange={(v) => setEditing({ ...editing, image_url: v })} />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={save} className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Save</button>
            <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 rounded-md border border-border px-4 py-2 text-sm"><X className="h-4 w-4" /> Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60"><tr>
            <th className="p-3 text-left">Name</th><th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Description</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.price}</td>
                <td className="p-3 text-muted-foreground">{s.description}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(s)} className="mr-2 text-primary hover:underline"><Pencil className="inline h-4 w-4" /></button>
                  <button onClick={() => del(s.id)} className="text-destructive hover:underline"><Trash2 className="inline h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No services yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Contacts ---------------- */
function ContactsManager() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin_contacts"],
    queryFn: async () => (await supabase.from("contact_enquiries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);

  async function save() {
    if (editing.id) await supabase.from("contact_enquiries").update(editing).eq("id", editing.id);
    else { const p = { ...editing }; delete p.id; await supabase.from("contact_enquiries").insert(p); }
    setEditing(null); qc.invalidateQueries({ queryKey: ["admin_contacts"] }); toast.success("Saved");
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("contact_enquiries").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_contacts"] }); toast.success("Deleted");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contact Enquiries</h2>
        <button onClick={() => setEditing({ name: "", phone: "", email: "", message: "" })} className="inline-flex items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {editing && (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 md:grid-cols-2">
          <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <Input label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
          <Input label="Email" value={editing.email} onChange={(v) => setEditing({ ...editing, email: v })} />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
            <button onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60"><tr>
            <th className="p-3 text-left">Date</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Message</th><th></th>
          </tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3 max-w-xs truncate">{c.message}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(c)} className="mr-2 text-primary"><Pencil className="inline h-4 w-4" /></button>
                  <button onClick={() => del(c.id)} className="text-destructive"><Trash2 className="inline h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No enquiries yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Appointments ---------------- */
function AppointmentsManager() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin_appointments"],
    queryFn: async () => (await supabase.from("appointment_enquiries").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const [editing, setEditing] = useState<any>(null);

  async function save() {
    const payload = { ...editing };
    delete payload.created_at;
    if (editing.id) await supabase.from("appointment_enquiries").update(payload).eq("id", editing.id);
    else { delete payload.id; await supabase.from("appointment_enquiries").insert(payload); }
    setEditing(null); qc.invalidateQueries({ queryKey: ["admin_appointments"] }); toast.success("Saved");
  }
  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("appointment_enquiries").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_appointments"] }); toast.success("Deleted");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointment Enquiries</h2>
        <button onClick={() => setEditing({ name: "", phone: "", service_name: "", description: "" })} className="inline-flex items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {editing && (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 md:grid-cols-2">
          <Input label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <Input label="Phone" value={editing.phone} onChange={(v) => setEditing({ ...editing, phone: v })} />
          <Input label="Service" value={editing.service_name ?? ""} onChange={(v) => setEditing({ ...editing, service_name: v })} />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
            <button onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60"><tr>
            <th className="p-3 text-left">Date</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Service</th><th className="p-3 text-left">Description</th><th></th>
          </tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</td>
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3">{a.phone}</td>
                <td className="p-3">{a.service_name}</td>
                <td className="p-3 max-w-xs truncate">{a.description}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(a)} className="mr-2 text-primary"><Pencil className="inline h-4 w-4" /></button>
                  <button onClick={() => del(a.id)} className="text-destructive"><Trash2 className="inline h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No appointments yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsManager() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).single()).data,
  });
  const { data: logoData } = useQuery({
    queryKey: ["site_logo"],
    queryFn: async () => (await supabase.from("media").select("url").eq("title", "_site_logo").single()).data,
  });

  const { data: heroData } = useQuery({
    queryKey: ["hero_media"],
    queryFn: async () => (await supabase.from("media").select("url, type").eq("title", "_hero_media").maybeSingle()).data,
  });

  const [form, setForm] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [heroMedia, setHeroMedia] = useState<{ url: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (settings && !form) setForm(settings); }, [settings, form]);
  useEffect(() => { if (logoData) setLogoUrl(logoData.url); }, [logoData]);
  useEffect(() => { if (heroData) setHeroMedia(heroData); }, [heroData]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Logo must be within 10MB"); return; }
    setUploading(true);
    try {
      const path = `logo-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const url = pub.publicUrl;
      const { data: existing } = await supabase.from("media").select("id").eq("title", "_site_logo").maybeSingle();
      const payload = { type: "photo", url, title: "_site_logo", show_in_carousel: false, show_in_gallery: false };
      if (existing) await supabase.from("media").update(payload).eq("id", existing.id);
      else await supabase.from("media").insert(payload);
      setLogoUrl(url);
      qc.invalidateQueries({ queryKey: ["site_logo"] });
      toast.success("Logo uploaded.");
    } catch (err: any) { toast.error(`Upload failed: ${err.message}`); }
    finally { setUploading(false); }
  }

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("File must be within 50MB"); return; }
    const isVideo = file.type.startsWith("video/");
    setUploadingHero(true);
    try {
      const path = `hero-${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file);
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const url = pub.publicUrl;
      const { data: existing } = await supabase.from("media").select("id").eq("title", "_hero_media").maybeSingle();
      const payload = { type: isVideo ? "video" : "photo", url, title: "_hero_media", show_in_carousel: false, show_in_gallery: false };
      if (existing) await supabase.from("media").update(payload).eq("id", existing.id);
      else await supabase.from("media").insert(payload);
      setHeroMedia({ url, type: payload.type });
      qc.invalidateQueries({ queryKey: ["hero_media"] });
      toast.success("Hero media updated.");
    } catch (err: any) { toast.error(`Upload failed: ${err.message}`); }
    finally { setUploadingHero(false); }
  }

  async function removeLogo() {
    await supabase.from("media").delete().eq("title", "_site_logo");
    setLogoUrl(null); qc.invalidateQueries({ queryKey: ["site_logo"] }); toast.success("Logo removed");
  }

  async function removeHero() {
    await supabase.from("media").delete().eq("title", "_hero_media");
    setHeroMedia(null); qc.invalidateQueries({ queryKey: ["hero_media"] }); toast.success("Hero media removed");
  }

  async function save() {
    const { id, logo_url, ...rest } = form;
    await supabase.from("site_settings").update(rest).eq("id", 1);
    qc.invalidateQueries({ queryKey: ["admin_settings"] });
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Settings saved");
  }

  if (!form) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold">Contact & Settings</h2>
      <p className="text-sm text-muted-foreground">These values appear across the public site.</p>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <h3 className="mb-4 text-lg font-semibold">Business Logo</h3>
          <div className="flex flex-col gap-4">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" /> : <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-glow disabled:opacity-50">
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Logo"}
              </button>
              {logoUrl && <button onClick={removeLogo} className="inline-flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Remove</button>}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-secondary/20 p-6">
          <h3 className="mb-4 text-lg font-semibold">Home Page Hero Media</h3>
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-background shadow-sm">
              {heroMedia ? (
                heroMedia.type === "video" ? <video src={heroMedia.url} className="h-full w-full object-cover" controls /> : <img src={heroMedia.url} alt="Hero" className="h-full w-full object-cover" />
              ) : <div className="grid h-full place-items-center"><ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" /></div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => heroInputRef.current?.click()} disabled={uploadingHero} className="inline-flex items-center gap-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-glow disabled:opacity-50">
                <Upload className="h-4 w-4" /> {uploadingHero ? "Uploading..." : "Upload Photo/Video"}
              </button>
              {heroMedia && <button onClick={removeHero} className="inline-flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Remove</button>}
            </div>
            <input type="file" ref={heroInputRef} className="hidden" accept="image/*,video/*" onChange={handleHeroUpload} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Phone Number" value={form.phone_number} onChange={(v) => setForm({ ...form, phone_number: v })} />
        <Input label="WhatsApp Number (digits only with country code)" value={form.whatsapp_number} onChange={(v) => setForm({ ...form, whatsapp_number: v })} />
        <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Google Maps Embed URL</label>
          <input value={form.map_embed_url} onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">About Us Content</label>
          <textarea value={form.about_content} onChange={(e) => setForm({ ...form, about_content: e.target.value })} rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      <button onClick={save} className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-card hover:shadow-glow">
        <Save className="h-4 w-4" /> Save Settings
      </button>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
    </div>
  );
}
