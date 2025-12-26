import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/MobileNav";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

export const Navigation = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="font-display text-2xl font-semibold tracking-tight">
          Atelier
        </NavLink>
        
        <div className="hidden md:flex items-center gap-8">
          {user && (
            <NavLink 
              to="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="text-foreground font-medium"
            >
              Dashboard
            </NavLink>
          )}
          <NavLink 
            to="/wardrobe" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-foreground font-medium"
          >
            Wardrobe
          </NavLink>
          <NavLink 
            to="/looks" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-foreground font-medium"
          >
            Looks
          </NavLink>
          {user && (
            <>
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
                Shopping
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <div className="hidden md:flex items-center gap-4">
              <NavLink 
                to="/profile" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {user.email?.split('@')[0]}
              </NavLink>
              <Button variant="soft" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="elegant" size="sm" onClick={() => navigate("/auth")} className="hidden md:flex">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};
