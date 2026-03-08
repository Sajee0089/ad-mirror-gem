import { Button } from "@/components/ui/button";
import { Send, AlertTriangle } from "lucide-react";

const HeroBanner = () => {
  return (
    <div className="hero-gradient rounded-lg p-8 text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
        Lanka Ads by NO.1 Ads Agent
      </h1>
      <p className="text-lg font-semibold text-primary-foreground/90 mb-1">
        The #1 Lanka Add Platform
      </p>
      <p className="text-sm text-primary-foreground/70 mb-5">
        for Personal Ads in Sri Lanka
      </p>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
        <Button size="sm" variant="secondary" className="font-medium">
          Agents
        </Button>
        <Button size="sm" variant="secondary" className="font-medium">
          Browse
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button size="sm" variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
          <Send className="w-4 h-4 mr-1" />
          Subscribe
        </Button>
        <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Beware of Fake Ads
        </Button>
      </div>
    </div>
  );
};

export default HeroBanner;
