import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="relative rounded-2xl border border-primary/20 bg-card overflow-hidden p-12 lg:p-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display mb-6">
              Ready to work with{" "}
              <span className="text-primary">Hillcrest?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
              Whether you need avionics installed, a helicopter serviced, or fuel on the ramp — 
              we've been doing this for over 60 years and we'd love to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="hero" size="lg" className="px-10 py-6" asChild>
                <Link to="/contact">
                  Get In Touch
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="px-10 py-6" asChild>
                <Link to="/avionics">Explore Avionics</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
