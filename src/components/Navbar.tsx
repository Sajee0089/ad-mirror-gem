import { RefreshCw, LogIn, LogOut, PlusCircle, List, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin");
    setIsAdmin(!!data && data.length > 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/");
  };

  const NavButtons = () => (
    <>
      <Button variant="outline" size="sm" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 bg-transparent w-full sm:w-auto justify-start sm:justify-center" onClick={() => window.location.reload()}>
        <RefreshCw className="w-4 h-4 mr-1" />
        Refresh
      </Button>
      {user ? (
        <>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto justify-start sm:justify-center" onClick={() => navigate("/post-ad")}>
            <PlusCircle className="w-4 h-4 mr-1" />
            Post Ad
          </Button>
          <Button variant="outline" size="sm" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 bg-transparent w-full sm:w-auto justify-start sm:justify-center" onClick={() => navigate("/my-ads")}>
            <List className="w-4 h-4 mr-1" />
            My Ads
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 bg-transparent w-full sm:w-auto justify-start sm:justify-center" onClick={() => navigate("/admin/ads")}>
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Button>
          )}
          <Button variant="outline" size="sm" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 bg-transparent w-full sm:w-auto justify-start sm:justify-center" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </>
      ) : (
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto justify-start sm:justify-center" onClick={() => navigate("/auth")}>
          <LogIn className="w-4 h-4 mr-1" />
          Login/Post Ad
        </Button>
      )}
    </>
  );

  return (
    <nav className="bg-nav text-nav-foreground px-3 sm:px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg">
          A
        </div>
        <span className="text-base sm:text-lg font-bold tracking-tight">Ads SL</span>
      </div>

      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-nav-foreground p-1">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-nav border-nav-foreground/20 w-64">
            <SheetTitle className="text-nav-foreground mb-4">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
            <div className="flex flex-col gap-2 mt-2">
              <NavButtons />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="flex items-center gap-2">
          <NavButtons />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
