import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
  { to: "/book", label: "Book Appointment" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const { data: logo } = useQuery({
    queryKey: ["site_logo"],
    queryFn: async () => (await supabase.from("media").select("url").eq("title", "_site_logo").maybeSingle()).data,
  });

  const logoUrl = logo?.url || settings?.logo_url;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className={cn(
            "grid h-9 w-9 place-items-center overflow-hidden rounded-lg transition-base",
            logoUrl ? "bg-transparent" : "bg-gradient-hero text-primary-foreground shadow-glow"
          )}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <Car className="h-5 w-5" />
            )}
          </span>
          <span className="text-lg leading-tight">
            PMDS
            <span className="ml-1 hidden text-xs font-normal text-muted-foreground sm:inline">
              Perfect Motor Driving School
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-base hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/book"
            className="ml-2 rounded-md bg-gradient-hero px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-base hover:shadow-glow"
          >
            Enroll Now
          </Link>
        </nav>

        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}>
        <nav className="container mx-auto flex flex-col px-4 py-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-sm font-medium hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
