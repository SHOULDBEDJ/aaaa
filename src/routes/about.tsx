import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Heart, Target, Eye, CheckCircle2 } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Perfect Motor Driving School" },
      { name: "description", content: "Learn about PMDS — our mission, vision, and 15+ years of helping students drive safely and confidently." },
      { property: "og:title", content: "About PMDS" },
      { property: "og:description", content: "Our mission, vision, and story." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold md:text-6xl">About PMDS</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            For over 15 years, Perfect Motor Driving School has been turning nervous beginners into confident drivers.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-2">
        <div>
          <img src="/seed/2.jpg" alt="PMDS training fleet" className="rounded-2xl shadow-elegant" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Story</span>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">15 Years of Trusted Training</h2>
          <p className="mt-4 text-muted-foreground">
            Founded in 2010, PMDS started with a single car and a dream — to make driving education accessible, structured, and safe. Today, we operate a fleet of 20+ dual-control vehicles, employ 30+ certified instructors, and have helped over 5,000 students earn their license.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Government-approved driving school",
              "Certified, friendly instructors",
              "Flexible batch timings & home pickup options",
              "Theory + practical with road simulator",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" /><span>{t}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="container mx-auto grid gap-6 px-4 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", text: "Empower every learner with the skills, confidence, and discipline to drive safely for life." },
            { icon: Eye, title: "Our Vision", text: "To be the most trusted name in driving education, building a generation of responsible drivers." },
            { icon: Heart, title: "Our Values", text: "Safety first. Patience always. Honest pricing. No shortcuts. Every student matters." },
          ].map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-accent">
                <it.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <Award className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-3xl font-bold">Why Students Love PMDS</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          We treat every learner as an individual. From your first nervous steering attempt to confidently navigating city traffic — we're with you every step.
        </p>
        <Link to="/book" className="mt-8 inline-flex rounded-md bg-gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-elegant transition-base hover:scale-105">
          Start Your Journey
        </Link>
      </section>
    </PublicLayout>
  );
}
