import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Shirt,
  Sparkles,
  Calendar,
  ShoppingBag,
  Settings,
  LogOut,
  User,
  Heart,
  Info,
  Star,
  WashingMachine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLaundryBasket } from "@/hooks/useDataQueries";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const { data: dirtyItems = [] } = useLaundryBasket();
  const laundryCount = dirtyItems.length;

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    setIsOpen(false);
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Authenticated user navigation
  const authenticatedNavItems = [
    { to: "/", icon: Home, label: "Home", badge: 0 },
    { to: "/dashboard", icon: Sparkles, label: "Dashboard", badge: 0 },
    { to: "/wardrobe", icon: Shirt, label: "My Wardrobe", badge: 0 },
    { to: "/looks", icon: Heart, label: "Get Styled", badge: 0 },
    { to: "/saved", icon: Star, label: "Saved Outfits", badge: 0 },
    {
      to: "/laundry",
      icon: WashingMachine,
      label: "Laundry",
      badge: laundryCount,
    },
    { to: "/calendar", icon: Calendar, label: "Calendar", badge: 0 },
    { to: "/shopping", icon: ShoppingBag, label: "Wishlist", badge: 0 },
    { to: "/profile", icon: Settings, label: "Profile", badge: 0 },
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
              {user ? (
                // Authenticated navigation
                <div className="space-y-1">
                  {authenticatedNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      activeClassName="text-foreground bg-accent"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              ) : (
                // Unauthenticated navigation - landing page sections only
                <div className="space-y-1">
                  {isLandingPage ? (
                    <>
                      <button
                        onClick={() => scrollToSection("how-it-works")}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                      >
                        <Info className="w-5 h-5" />
                        How It Works
                      </button>
                      <button
                        onClick={() => scrollToSection("features")}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                      >
                        <Star className="w-5 h-5" />
                        Features
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Home className="w-5 h-5" />
                      Home
                    </NavLink>
                  )}
                </div>
              )}

              <div className="border-t border-border/50 mt-4 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <p className="px-4 text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant="gold"
                      className="w-full"
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Started Free
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        navigate("/auth");
                        setIsOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};
