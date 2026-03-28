import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, Award, Wrench, Users, MapPin, Shield } from "lucide-react";
import helicopterImage from "@/assets/about-helicopter.jpg";

const stats = [
  { value: "1956", label: "Established" },
  { value: "60+", label: "Years of Service" },
  { value: "3", label: "Authorized Dealerships" },
  { value: "1000s", label: "Aircraft Serviced" },
];

const values = [
  { icon: Shield, title: "Safety First", description: "Every procedure, every inspection, every flight — safety is our absolute priority and the foundation of everything we do." },
  { icon: Award, title: "Excellence", description: "As authorized dealers for Bell, Robinson, and Garmin, we maintain the highest standards of quality in every service we provide." },
  { icon: Users, title: "Community", description: "From our monthly Backcountry Breakfasts to mentoring the next generation of A&P technicians, we're deeply rooted in the aviation community." },
  { icon: Wrench, title: "Expertise", description: "Our team brings decades of hands-on experience in helicopter maintenance, avionics installation, and aircraft services." },
  { icon: Clock, title: "Reliability", description: "When your aircraft needs service, downtime matters. We work efficiently without ever cutting corners." },
  { icon: MapPin, title: "Idaho Roots", description: "Based at Lewiston-Nez Perce County Regional Airport, we proudly serve pilots across the Pacific Northwest and beyond." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img src={helicopterImage} alt="Hillcrest Aircraft helicopter in front of hangar" className="w-full h-full object-cover object-[center_25%]" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="container mx-auto">
              <span className="text-sm font-semibold tracking-widest uppercase text-primary">Our Story</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display mt-2">About Hillcrest</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Since 1956, Hillcrest Aircraft Company has been a cornerstone of aviation at the Lewiston-Nez Perce County Regional Airport in Lewiston, Idaho. What started as a small aircraft service operation has grown into one of the Pacific Northwest's most respected aviation companies.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Over six decades, we've built our reputation on precision, safety, and genuine care for the aviation community. As authorized dealers for Bell Helicopter, Robinson Helicopter, and Garmin Avionics, we deliver world-class helicopter maintenance, cutting-edge avionics installations, and comprehensive aircraft services.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Today, Hillcrest continues to innovate while honoring the values that built us — integrity, expertise, and an unwavering commitment to keeping you flying safely.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl lg:text-5xl font-extrabold font-display text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">What Drives Us</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-3">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-border bg-card p-8">
                <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">Authorized Dealer</span>
          <h2 className="text-2xl font-bold font-display mt-3 mb-10">Trusted by the Best in Aviation</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
            <a href="https://www.bellflight.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
              <img src="https://lirp.cdn-website.com/64bf551b/dms3rep/multi/opt/bell_seal_csf_rgb-e1552433451401-1920w.png" alt="Bell Helicopter" className="h-16 object-contain invert" loading="lazy" />
            </a>
            <a href="https://www.robinsonheli.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
              <img src="https://irp.cdn-website.com/64bf551b/dms3rep/multi/rhc-authorized-dealer-logo-logo-yellow-rotor-white-type.svg" alt="Robinson Helicopter" className="h-16 object-contain" loading="lazy" />
            </a>
            <a href="https://www.garmin.com/en-US/c/aviation/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">
              <img src="https://lirp.cdn-website.com/64bf551b/dms3rep/multi/opt/Garmin+Logo+Without+Delta-white-high-res-1920w.png" alt="Garmin Aviation" className="h-12 object-contain" loading="lazy" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
