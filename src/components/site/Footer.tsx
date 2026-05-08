import { Link } from "@tanstack/react-router";
import { Car } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: s } = useSiteSettings();
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
              <Car className="h-5 w-5" />
            </span>
            <span>Perfect Motor Driving School</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Drive with confidence. Certified instructors, modern vehicles, proven results.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/gallery" className="hover:text-primary">Gallery</Link></li>
            <li><Link to="/book" className="hover:text-primary">Book Appointment</Link></li>
            <li><Link to="/admin" className="hover:text-primary">Admin Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{s?.address}</li>
            <li>📞 {s?.phone_number}</li>
            <li>✉️ {s?.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Perfect Motor Driving School. All rights reserved.
      </div>
    </footer>
  );
}
