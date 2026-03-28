import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Monitor, Radio, Gauge, ShieldCheck, Cpu, Headphones } from "lucide-react";
import avionicsImage from "@/assets/avionics-workshop.jpg";

const services = [
  { icon: Monitor, title: "Flight Instruments", description: "Garmin digital and mechanical indicators, electronic displays, and sensor systems for better, faster decision-making in the cockpit." },
  { icon: Radio, title: "Navigation & Radios", description: "From basic VHF communications to sophisticated GPS/Nav/Comm/MFD systems with touchscreen data entry and integrated radio tuning." },
  { icon: ShieldCheck, title: "ADS-B Solutions", description: "Meet ADS-B equipage requirements with Garmin's comprehensive suite of easy-to-install, cost-effective solutions." },
  { icon: Gauge, title: "Glass Cockpit Upgrades", description: "Transform your panel with Garmin G5, G500, and G3X electronic flight instrument systems for modern situational awareness." },
  { icon: Cpu, title: "Autopilot Systems", description: "Digital autopilot interface installation and integration with your existing avionics suite for smoother, safer flights." },
  { icon: Headphones, title: "Audio Systems", description: "Complete audio system integration including intercoms, Bluetooth connectivity, and noise-canceling solutions." },
];

const Avionics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img src={avionicsImage} alt="Avionics installation at Hillcrest" className="w-full h-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="container mx-auto">
              <span className="text-sm font-semibold tracking-widest uppercase text-primary">Sales • Service • Installation</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display mt-2">Hillcrest Avionics</h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-xl">
                Authorized Garmin dealer with full-service avionics sales, installation, and repair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Garmin Intro */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <img
              src="https://lirp.cdn-website.com/64bf551b/dms3rep/multi/opt/Garmin+Logo+Without+Delta-white-high-res-1920w.png"
              alt="Garmin Authorized Dealer"
              className="h-10 object-contain mx-auto mb-8"
              loading="lazy"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              With the most comprehensive lineup of avionics upgrades in the industry, Garmin offers solutions for most budgets and missions. Whether you're an entrepreneur flying business calls across a broad region or a recreational pilot turning weekends into family adventures, Garmin avionics help provide industry-leading capabilities and enhanced decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-3">Our Avionics Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.title} className="rounded-xl border border-border bg-card p-8 hover:border-primary/30 transition-colors">
                <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dan Wheeler */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Meet Our Team</span>
            <h2 className="text-3xl font-extrabold font-display mt-3 mb-6">Dan Wheeler</h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Avionics Department Manager</p>
            <p className="text-muted-foreground leading-relaxed">
              With over 45 years of experience in commercial aviation and avionics, Dan Wheeler brings unmatched expertise to Hillcrest Aircraft Company. His career began as an apprentice with a bush airline in British Columbia, which led to co-founding Northern Airborne Technology and later establishing Island Avionics, where he honed his expertise in audio system integration. Now, Dan is eager to apply this knowledge and experience to serve Hillcrest's current and future customers and contribute to the aviation community in the region.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="avionics-contact" className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold tracking-widest uppercase text-primary">Get In Touch</span>
              <h2 className="text-3xl font-extrabold font-display mt-3">Request a Quote</h2>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Full Name" className="bg-card border-border" />
              <Input type="email" placeholder="Email Address" className="bg-card border-border" />
              <Input type="tel" placeholder="Phone Number" className="bg-card border-border" />
              <Textarea placeholder="Tell us about your avionics needs..." rows={5} className="bg-card border-border" />
              <Button variant="default" className="w-full" size="lg">Send Message</Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Avionics;
