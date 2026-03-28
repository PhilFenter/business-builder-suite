import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, MapPin, Clock, ChevronRight } from "lucide-react";

const openings = [
  {
    title: "Aviation Maintenance Technician",
    location: "Lewiston, ID",
    type: "Full-Time",
    description: "Perform routine inspections, repairs, and overhauls of helicopters. Must be detail-oriented with strong technical skills.",
    requirements: [
      "FAA A&P Certification",
      "Experience with Bell, Airbus, or Robinson helicopters preferred",
      "Strong knowledge of aviation safety regulations",
    ],
  },
  {
    title: "Aviation Maintenance Technician",
    location: "Lewiston, ID",
    type: "Full-Time",
    description: "Perform routine inspections, repairs, and overhauls of helicopters. Must be detail-oriented with strong technical skills.",
    requirements: [
      "FAA A&P Certification",
      "Experience with Bell, Airbus, or Robinson helicopters preferred",
      "Strong knowledge of aviation safety regulations",
    ],
  },
];

const perks = [
  { title: "Industry Leaders", description: "Work alongside experts at a company with decades of aviation excellence." },
  { title: "Cutting-Edge Equipment", description: "State-of-the-art technology and tools to help you succeed." },
  { title: "Safety First", description: "The highest safety standards in the industry for employees and clients." },
  { title: "Career Growth", description: "Training, professional development, and advancement opportunities." },
  { title: "Team-Oriented", description: "Collaborative, supportive work environment where every member is valued." },
];

const Employment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 text-center">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">Careers</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display mt-3 mb-6">Join Our Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Are you passionate about aviation and ready to take your career to new heights? We're always looking for skilled professionals who share our commitment to safety, precision, and exceptional service.
          </p>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold font-display text-center mb-10">Why Work With Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {perks.map((perk) => (
              <div key={perk.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-bold mb-2">{perk.title}</h3>
                <p className="text-sm text-muted-foreground">{perk.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Current Openings</span>
            <h2 className="text-3xl font-extrabold font-display mt-3">Open Positions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {openings.map((job, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-xl">{job.title}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" /> {job.type}
                      </span>
                    </div>
                  </div>
                  <Briefcase className="w-8 h-8 text-primary/30" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                <ul className="space-y-1.5">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-primary" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <span className="text-sm font-semibold tracking-widest uppercase text-primary">Apply</span>
              <h2 className="text-3xl font-extrabold font-display mt-3">Do you have what it takes?</h2>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="Name" className="bg-card border-border" />
              <Input type="email" placeholder="Email" className="bg-card border-border" />
              <Textarea placeholder="Cover Letter" rows={5} className="bg-card border-border" />
              <Button variant="default" className="w-full" size="lg">Submit Application</Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Employment;
