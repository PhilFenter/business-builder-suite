import { Wrench, Cpu, Fuel, Users, CreditCard, BarChart3, ShieldCheck, MapPin } from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Helicopter Maintenance",
    description: "Full-service maintenance, inspections, repairs, and overhauls for Bell, Robinson, and Airbus helicopters.",
  },
  {
    icon: Cpu,
    title: "Avionics Center",
    description: "Authorized Garmin dealer. Sales, installation, and service for glass cockpits, ADS-B, nav/comm, and more.",
  },
  {
    icon: Fuel,
    title: "FBO & Fuel Services",
    description: "Full-service FBO with Jet-A and 100LL fuel, ramp services, and pilot amenities at Lewiston Airport.",
  },
  {
    icon: Users,
    title: "Helicopter Sales",
    description: "Authorized dealer for Bell and Robinson helicopters. New and pre-owned aircraft sales and acquisitions.",
  },
  {
    icon: MapPin,
    title: "Helicopter Tours",
    description: "Experience Idaho's breathtaking backcountry from above with scenic helicopter tours over the Clearwater mountains.",
  },
  {
    icon: ShieldCheck,
    title: "Parts & Support",
    description: "Comprehensive parts inventory and technical support to minimize downtime and keep you flying safely.",
  },
  {
    icon: BarChart3,
    title: "Aircraft Management",
    description: "Complete aircraft management services including maintenance tracking, scheduling, and compliance.",
  },
  {
    icon: CreditCard,
    title: "Flexible Billing",
    description: "Customer accounts with contract pricing, volume discounts, and convenient billing options for regular clients.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-[var(--gradient-surface)]" />
      <div className="relative container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">Services</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-3 mb-4">
            Complete Aviation Services
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From helicopter maintenance to avionics upgrades, fuel services to scenic tours — everything your aircraft needs under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300"
            >
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
