import { RefreshCw, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-nav text-nav-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          H
        </div>
        <span className="text-lg font-bold tracking-tight">Hela Lanka Ads</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 bg-transparent">
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <LogIn className="w-4 h-4 mr-1" />
          Login/Post Ad
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
