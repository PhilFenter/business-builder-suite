import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import breakfastImage from "@/assets/backcountry-breakfast.jpg";

const Events = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          <img src={breakfastImage} alt="Backcountry Breakfast at Hillcrest" className="w-full h-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="container mx-auto">
              <span className="text-sm font-semibold tracking-widest uppercase text-primary">Community</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display mt-2">Events</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Backcountry Breakfast */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Monthly Event</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Backcountry Breakfast</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Each month, pilots, aviation enthusiasts, and community members gather at the Lewiston Airport for Hillcrest Aircraft Company's Backcountry Breakfast. It's a time to enjoy a hearty meal, share stories, and celebrate the spirit of backcountry flying.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              From early risers landing on the ramp to families coming out to soak in the atmosphere, the breakfast brings together people who love aviation and the adventure that comes with it. Come see the aircraft, meet the people, and be part of the moments that make this tradition special.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="font-display font-bold">Lewiston Airport</p>
                <p className="text-sm text-muted-foreground">540 O'Connor Road</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <Clock className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="font-display font-bold">Monthly</p>
                <p className="text-sm text-muted-foreground">Check socials for dates</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="font-display font-bold">Open to All</p>
                <p className="text-sm text-muted-foreground">Pilots & community welcome</p>
              </div>
            </div>

            <Button variant="default" size="lg" asChild>
              <a href="https://www.facebook.com/profile.php?id=100057614342951" target="_blank" rel="noopener noreferrer">
                Follow Us for Event Dates
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Helicopter Tours */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-sm font-semibold tracking-widest uppercase text-primary">Adventures</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-3 mb-6">Helicopter Tours</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Experience the breathtaking Idaho backcountry from above. Hillcrest offers helicopter tours that give you a bird's-eye view of the Clearwater mountains, river canyons, and wilderness that make this region unlike anywhere else.
            </p>
            <Button variant="hero" size="lg">
              Book a Tour
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
