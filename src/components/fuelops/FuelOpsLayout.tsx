import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Fuel, LayoutDashboard, Truck, FileText, Users, LogOut, Menu, X, ChevronRight, ClipboardList,
} from "lucide-react";

const FuelOpsLayout = ({ children }: { children: ReactNode }) => {
  const { user, profile, roles, signOut, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/fuelops", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "driver", "billing_clerk"] },
    { to: "/fuelops/tickets", icon: ClipboardList, label: "Service Tickets", roles: ["admin", "driver", "billing_clerk"] },
    { to: "/fuelops/log", icon: Truck, label: "Log Delivery", roles: ["admin", "driver"] },
    { to: "/fuelops/customers", icon: Users, label: "Customers", roles: ["admin", "billing_clerk"] },
    { to: "/fuelops/billing", icon: FileText, label: "Billing", roles: ["admin", "billing_clerk"] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.some((r) => hasRole(r as any))
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/fuelops/login");
  };

  const roleLabel = roles.length > 0 ? roles[0].replace("_", " ") : "user";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 fixed inset-y-0">
        <div className="p-5 border-b border-border">
          <Link to="/fuelops" className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary p-1.5">
              <Fuel className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg">FuelOps</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Fuel Management
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {filteredNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                location.pathname === item.to
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{roleLabel}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <Fuel className="w-5 h-5 text-primary" />
          <span className="font-display font-bold">FuelOps</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                <span className="font-display font-bold">FuelOps</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {filteredNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    location.pathname === item.to
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default FuelOpsLayout;
