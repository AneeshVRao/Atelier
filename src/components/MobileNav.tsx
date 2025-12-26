import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, X, Home, Shirt, Sparkles, Calendar, ShoppingBag, Settings, LogOut, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    setIsOpen(false);
    navigate("/");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/dashboard", icon: Sparkles, label: "Dashboard" },
    { to: "/wardrobe", icon: Shirt, label: "Wardrobe" },
    { to: "/looks", icon: Heart, label: "Today's Look" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/shopping", icon: ShoppingBag, label: "Shopping List" },
    { to: "/profile", icon: Settings, label: "Profile" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bg-card border-b border-border/50 z-50 animate-fade-up shadow-lg">
            <nav className="container mx-auto px-6 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    activeClassName="text-foreground bg-accent"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
              
              <div className="border-t border-border/50 mt-4 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <p className="px-4 text-sm text-muted-foreground truncate">{user.email}</p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="gold"
                    className="w-full"
                    onClick={() => { navigate("/auth"); setIsOpen(false); }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};
