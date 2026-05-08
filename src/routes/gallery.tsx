import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Perfect Motor Driving School" },
      { name: "description", content: "Photos from our training sessions, fleet, and student success stories." },
      { property: "og:title", content: "PMDS Gallery" },
      { property: "og:description", content: "See our students, fleet and training in action." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: photos = [] } = useQuery({
    queryKey: ["gallery_photos"],
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*").eq("type", "photo").eq("show_in_gallery", true).order("sort_order");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState<string | null>(null);

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">Gallery</h1>
          <p className="mt-3 opacity-90">Moments from our driving school</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {photos.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No photos yet. Check back soon!</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpen(p.url)}
                className="mb-4 block w-full overflow-hidden rounded-xl shadow-card transition-base hover:shadow-elegant"
              >
                <img src={p.url} alt={p.title ?? ""} className="w-full transition-transform duration-500 hover:scale-105" />
              </button>
            ))}
          </div>
        )}
      </section>

      {open && (
        <div onClick={() => setOpen(null)} className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4">
          <button onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
          <img src={open} alt="" className="max-h-[90vh] max-w-full rounded-xl shadow-elegant" />
        </div>
      )}
    </PublicLayout>
  );
}
