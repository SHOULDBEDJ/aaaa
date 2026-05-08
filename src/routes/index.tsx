import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, ChevronLeft, ChevronRight, ShieldCheck, Award, Users, Car, Star, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Perfect Motor Driving School — Learn to Drive with Confidence" },
      { name: "description", content: "PMDS — Certified instructors, modern training cars, and proven results. Book your driving lessons today." },
      { property: "og:title", content: "Perfect Motor Driving School (PMDS)" },
      { property: "og:description", content: "Certified instructors, modern fleet, proven success rate." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <MediaCarousel />
      <Features />
      <Stats />
      <CTA />
    </PublicLayout>
  );
}

function Hero() {
  const { data: hero } = useQuery({
    queryKey: ["hero_media"],
    queryFn: async () => (await supabase.from("media").select("url, type").eq("title", "_hero_media").maybeSingle()).data,
  });

  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 50%)" }} />
      <div className="container relative mx-auto grid gap-8 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Star className="h-3 w-3 fill-current" /> Trusted by 5000+ students
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
            Drive with <span className="text-accent">Confidence</span>.<br />
            Master the Road for Life.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-primary-foreground/85">
            Perfect Motor Driving School (PMDS) — certified instructors, modern dual-control vehicles, and a proven curriculum that gets you license-ready, fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/book" className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-semibold text-accent-foreground shadow-elegant transition-base hover:scale-105">
              Book Appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/services" className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 font-semibold backdrop-blur transition-base hover:bg-white/20">
              View Services
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 rounded-3xl bg-white/10 blur-2xl" />
          {hero ? (
            hero.type === "video" ? (
              <video
                src={hero.url}
                autoPlay
                muted
                loop
                playsInline
                className="relative aspect-video w-full rounded-3xl object-cover shadow-elegant"
              />
            ) : (
              <img
                src={hero.url}
                alt="Driving school training"
                width={1536}
                height={896}
                className="relative rounded-3xl object-cover shadow-elegant"
              />
            )
          ) : (
            <div className="relative aspect-video w-full rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-elegant flex items-center justify-center">
              <Car className="h-20 w-20 opacity-20" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MediaCarousel() {
  const { data: media = [] } = useQuery({
    queryKey: ["carousel_media"],
    queryFn: async () => {
      const { data } = await supabase.from("media").select("*").eq("show_in_carousel", true).order("sort_order");
      return data ?? [];
    },
  });

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing || media.length === 0) return;
    timer.current = setTimeout(() => setIdx((i) => (i + 1) % media.length), 4500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, playing, media.length]);

  if (media.length === 0) return null;

  const cur = media[idx];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">In Action</h2>
          <p className="mt-2 text-muted-foreground">Photos & videos from our training sessions.</p>
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium shadow-card transition-base hover:bg-secondary"
        >
          {playing ? <><Pause className="h-4 w-4" /> Stop</> : <><Play className="h-4 w-4" /> Start</>}
        </button>
      </div>

      <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-secondary shadow-elegant">
        {cur.type === "video" ? (
          <video src={cur.url} controls autoPlay={playing} muted loop className="h-full w-full object-cover" />
        ) : (
          <img src={cur.url} alt={cur.title ?? ""} className="h-full w-full object-cover transition-transform duration-700" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {cur.title && (
          <div className="absolute bottom-6 left-6 max-w-md text-white">
            <h3 className="text-2xl font-bold">{cur.title}</h3>
          </div>
        )}

        <button
          onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground opacity-0 shadow-card transition-base group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIdx((i) => (i + 1) % media.length)}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground opacity-0 shadow-card transition-base group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className={"h-2 rounded-full transition-all " + (i === idx ? "w-8 bg-white" : "w-2 bg-white/50")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: ShieldCheck, title: "Certified Instructors", desc: "Government-approved trainers with 10+ years on the road." },
    { icon: Car, title: "Modern Fleet", desc: "Dual-control cars and well-maintained two-wheelers." },
    { icon: Award, title: "98% Pass Rate", desc: "Proven curriculum with structured theory + practical." },
    { icon: Users, title: "Personal Attention", desc: "Small batches, flexible timing, custom learning plan." },
  ];
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Why Choose PMDS</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">Everything you need to become a safe, confident driver.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-base hover:-translate-y-1 hover:shadow-elegant">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero text-primary-foreground transition-base group-hover:shadow-glow">
              <it.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "5000+", l: "Happy Students" },
    { v: "98%", l: "Pass Rate" },
    { v: "15+", l: "Years Experience" },
    { v: "20+", l: "Training Vehicles" },
  ];
  return (
    <section className="bg-gradient-hero py-16 text-primary-foreground">
      <div className="container mx-auto grid gap-6 px-4 text-center sm:grid-cols-2 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-4xl font-bold md:text-5xl">{s.v}</div>
            <div className="mt-1 text-sm uppercase tracking-wider opacity-85">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-elegant md:p-16">
        <h2 className="text-3xl font-bold md:text-4xl">Ready to Get Behind the Wheel?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Book your appointment today and start your journey to becoming a confident driver.</p>
        <Link to="/book" className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-elegant transition-base hover:scale-105">
          Book Appointment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
