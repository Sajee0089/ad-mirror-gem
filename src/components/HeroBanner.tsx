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
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

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
        <Button
          size="sm"
          variant="secondary"
          className="font-medium"
          onClick={() => window.open("https://wa.me/94789663179?text=" + encodeURIComponent("Hello, I need agent support"), "_blank")}
        >
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
        <Button
          size="sm"
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={() => setDisclaimerOpen(true)}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Beware of Fake Ads
        </Button>
      </div>

      <AlertDialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verified Membership</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Verified Member ship සදහා මාසිකව 3000/= ක මුදලක් අය කෙරේ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerifyOk}>Next</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Beware of Fake Ads
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4 mt-2">
                <p className="font-semibold text-foreground">වෙබ් අඩවි අවවාදය (Website Disclaimer)</p>
                <p>Ads SL විසින් Verified ලෙස සලකුණු කර ඇති සේවාවන් සම්බන්ධයෙන් පමණක් අපගේ ආයතනය වගකීමක් දරයි. එයට අමතරව වෙබ් අඩවියේ පළ කරන වෙනත් ඕනෑම දැන්වීමක් හෝ සේවාවක් සඳහා, ඔබ විසින් හමු වීමට පෙර හෝ හමු වූ පසුව සිදුකරන ගනුදෙනු, ගෙවීම් හෝ එකඟතා සම්බන්ධයෙන් අප ආයතනය වගකිවයුතු නොවේ.</p>
                <p>ඔබ Full Service ලබා ගැනීමට යන විට හමු වීමට පෙර මුදල් ගෙවීමෙන් වලකින්න.</p>
                <p>මෙය නිදහස් Classified Ads වෙබ් අඩවියක් වන අතර, අප විසින් සපයන්නේ දැන්වීම් පළ කිරීමට සහ සෙවීමට හැකි වේදිකාවක් පමණි. පරිශීලකයන් අතර සිදුවන ගනුදෙනු සඳහා අප වගකිවයුතු නොවේ.</p>
                <p>Cam Services භාවිතා කිරීමේදී වැඩි විශ්වාසනීයත්වයක් සඳහා Verified Ads ලෙස සලකුණු කර ඇති සේවාවන් තෝරාගන්න.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HeroBanner;
