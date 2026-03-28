import { Fuel, Users, Receipt, Tablet, CreditCard, BarChart3, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Fuel,
    title: "Multi-Fuel Tracking",
    description: "Track Jet-A, 100LL, and any custom fuel type with real-time gallon counts and inventory levels.",
  },
  {
    icon: Tablet,
    title: "Tablet-Ready for Trucks",
    description: "Your fuel truck operators log deliveries from rugged tablets right on the ramp. No paperwork.",
  },
  {
    icon: Users,
    title: "Customer Accounts & Discounts",
    description: "Set custom discount rates per customer. Contract pricing, volume tiers, and negotiated rates.",
  },
  {
    icon: Receipt,
    title: "Flexible Billing",
    description: "Invoice per delivery or batch monthly statements. Automatic billing with full transaction history.",
  },
  {
    icon: CreditCard,
    title: "Planeside Credit Cards",
    description: "Accept credit card payments right at the aircraft via Stripe-powered mobile processing.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Reporting",
    description: "See fuel sold, revenue, top customers, and inventory across your entire operation in real time.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Every transaction syncs from truck tablets to your main office computer instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description: "Cloud-based with automatic backups. Your data is always safe, always accessible.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-[var(--gradient-surface)]" />
      <div className="relative container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-3 mb-4">
            Everything your FBO needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From the fuel truck to the front desk, every piece of your fueling operation connected in one platform.
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
