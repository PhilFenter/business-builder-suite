import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-fbo.jpg";
import { Wrench, Cpu, Plane } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Hillcrest Aircraft Company operations at dusk"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Since 1956 • Lewiston, Idaho</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-6">
            Hillcrest{" "}
            <span className="text-primary">Aircraft Company</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
            60+ years of aviation excellence. Authorized Bell & Robinson helicopter dealer, 
            Garmin avionics center, full-service maintenance, and FBO operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button variant="hero" size="lg" className="px-8 py-6" asChild>
              <Link to="/contact">Request a Quote</Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="px-8 py-6" asChild>
              <Link to="/about">Our Story</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Wrench, label: "Helicopter Services", desc: "Bell & Robinson authorized" },
              { icon: Cpu, label: "Garmin Avionics", desc: "Sales, service & install" },
              { icon: Plane, label: "FBO & Fuel", desc: "Full service jet center" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
