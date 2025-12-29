import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLaundryBasket } from "@/hooks/useDataQueries";

export const Navigation = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const { data: dirtyItems = [] } = useLaundryBasket();
  const laundryCount = dirtyItems.length;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink
          to="/"
          className="font-display text-2xl font-semibold tracking-tight"
        >
          Atelier
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          {user ? (
            // Authenticated user navigation
            <>
              <NavLink
                to="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/wardrobe"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                My Wardrobe
              </NavLink>
              <NavLink
                to="/looks"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                Get Styled
              </NavLink>
              <NavLink
                to="/saved"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                Saved
              </NavLink>
              <NavLink
                to="/laundry"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative"
                activeClassName="text-foreground font-medium"
              >
                Laundry
                {laundryCount > 0 && (
                  <span className="absolute -top-1 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {laundryCount > 9 ? "9+" : laundryCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/calendar"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                Calendar
              </NavLink>
              <NavLink
                to="/shopping"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-foreground font-medium"
              >
                Wishlist
              </NavLink>
            </>
          ) : (
            // Unauthenticated user navigation - landing page links only
            <>
              {isLandingPage ? (
                <>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </button>
                </>
              ) : (
                <NavLink
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <div className="hidden md:flex items-center gap-4">
              <NavLink
                to="/profile"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {user.email?.split("@")[0]}
              </NavLink>
              <Button
                variant="soft"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started Free
              </Button>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};
