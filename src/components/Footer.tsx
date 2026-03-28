import { Plane, Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="rounded-lg bg-primary p-1.5">
                <Plane className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">Hillcrest Aircraft Company</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Serving the aviation community from Lewiston, Idaho since 1956. Authorized dealer for Bell, Robinson, and Garmin.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=100057614342951" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                <Facebook className="w-4 h-4 text-muted-foreground" />
              </a>
              <a href="https://www.instagram.com/hillcrestaircraftco/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                <Instagram className="w-4 h-4 text-muted-foreground" />
              </a>
              <a href="https://www.youtube.com/@HillcrestAircraftCompany" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                <Youtube className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              <li><Link to="/avionics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Avionics</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Helicopter Maintenance</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Aircraft Services</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Helicopter Tours</Link></li>
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">FBO & Fuel</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/employment" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <p>540 O'Connor Road</p>
              <p>Lewiston, Idaho 83501</p>
              <a href="tel:208-746-8271" className="block hover:text-primary transition-colors">208-746-8271</a>
              <p>Unicom: 122.950</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Hillcrest Aircraft Company. Serving aviation since 1956.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
