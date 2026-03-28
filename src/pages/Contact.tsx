import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Radio, Clock, Facebook, Instagram, Youtube } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6 text-center">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">Get In Touch</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display mt-3 mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Whether you need a quote, want to schedule maintenance, or just have a question — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="rounded-xl border border-border bg-card p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-1">Address</h3>
                    <p className="text-sm text-muted-foreground">540 O'Connor Road</p>
                    <p className="text-sm text-muted-foreground">Lewiston, Idaho 83501</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-1">Phone</h3>
                    <a href="tel:208-746-8271" className="text-sm text-muted-foreground hover:text-primary transition-colors">208-746-8271</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Radio className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-1">Unicom Frequency</h3>
                    <p className="text-sm text-muted-foreground">122.950</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold mb-1">Hours</h3>
                    <p className="text-sm text-muted-foreground">Monday – Friday: 8:00 AM – 5:00 PM</p>
                    <p className="text-sm text-muted-foreground">Saturday – Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="font-display font-bold mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/profile.php?id=100057614342951" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                    <Facebook className="w-5 h-5 text-muted-foreground" />
                  </a>
                  <a href="https://www.instagram.com/hillcrestaircraftco/" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                    <Instagram className="w-5 h-5 text-muted-foreground" />
                  </a>
                  <a href="https://www.youtube.com/@HillcrestAircraftCompany" target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                    <Youtube className="w-5 h-5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold font-display mb-6">Send a Message</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Full Name" className="bg-background border-border" />
                <Input type="email" placeholder="Email Address" className="bg-background border-border" />
                <Input type="tel" placeholder="Phone Number" className="bg-background border-border" />
                <Textarea placeholder="How can we help you?" rows={5} className="bg-background border-border" />
                <Button variant="default" className="w-full" size="lg">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Embed */}
      <section className="border-t border-border">
        <iframe
          title="Hillcrest Aircraft Company Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2721.5!2d-117.0494!3d46.3744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54a1e8c9e9e9e9e9%3A0x0!2s540+O%27Connor+Rd%2C+Lewiston%2C+ID+83501!5e0!3m2!1sen!1sus!4v1"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
