import { Fuel } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <Fuel className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">FuelOps</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FuelOps. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
