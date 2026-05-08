import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Bike, BadgeCheck, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  car: Car, bike: Bike, badge: BadgeCheck, refresh: RefreshCw,
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Perfect Motor Driving School" },
      { name: "description", content: "Driving courses, license assistance, refresher training and more from PMDS." },
      { property: "og:title", content: "PMDS Services" },
      { property: "og:description", content: "Comprehensive driving courses and license assistance." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase.from("services").select("*").order("sort_order");
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">Our Services</h1>
          <p className="mt-3 opacity-90">Find the perfect course for your driving journey</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = (s.icon && ICONS[s.icon]) || Sparkles;
          return (
            <div key={s.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-base hover:-translate-y-1 hover:shadow-elegant">
              {s.image_url ? (
                <img src={s.image_url} alt={s.name} className="h-44 w-full object-cover" />
              ) : (
                <div className="grid h-44 w-full place-items-center bg-gradient-hero">
                  <Icon className="h-16 w-16 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  {s.price && <span className="text-lg font-bold text-primary">{s.price}</span>}
                  <Link to="/book" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                    Enroll <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {services.length === 0 && (
          <p className="col-span-full py-20 text-center text-muted-foreground">No services available right now.</p>
        )}
      </section>
    </PublicLayout>
  );
}
