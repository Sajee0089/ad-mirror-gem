import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const HeroBanner = () => {
  const [verifyOpen, setVerifyOpen] = useState(false);

  const handleVerifyOk = () => {
    const message = encodeURIComponent("Become a Verified member");
    window.open(`https://wa.me/94789663179?text=${message}`, "_blank");
    setVerifyOpen(false);
  };

  return (
    <div className="hero-gradient rounded-lg px-8 py-4 text-center mb-4">
      <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-0.5">
        Lanka Ads by NO.1 Ads Agent
      </h1>
      <p className="text-lg font-semibold text-primary-foreground/90 mb-0.5">
        The #1 Lanka Add Platform
      </p>
      <p className="text-sm text-primary-foreground/70 mb-3">
        for Personal Ads in Sri Lanka
      </p>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
        <Button size="sm" variant="secondary" className="font-medium">
          Agents
        </Button>
        <Button size="sm" variant="secondary" className="font-medium">
          Browse
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setVerifyOpen(true)}
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          Become A Verify...
        </Button>
        <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Beware of Fake Ads
        </Button>
      </div>

      <AlertDialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verified Membership</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Verify Member ship සදහා මාසිකව 3000/= ක මුදලක් අය කෙරේ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerifyOk}>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HeroBanner;
