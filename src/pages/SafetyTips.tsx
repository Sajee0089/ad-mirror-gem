import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageSeo from "@/components/PageSeo";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export default function SafetyTips() {
  const canonical = `${SITE_URL}/safety-tips`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Safety Tips", item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Safety Tips for Classified Ads in Sri Lanka | Ads SL"
        description="Stay safe when browsing or replying to classified ads in Sri Lanka. Learn how to spot scams, verify sellers, and report suspicious listings on Ads SL."
        canonical={canonical}
        schema={breadcrumbJsonLd}
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Safety Tips</span>
        </nav>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Safety Tips on Ads SL</h1>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Ads SL is a free classified ads marketplace for Sri Lanka. Because transactions happen directly between advertisers and visitors, following basic safety precautions protects your money, privacy, and personal well-being.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Never Send Advance Payments to Strangers</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Avoid sending bank transfers, reload cards, or mobile money before meeting in person or verifying the service. Scammers often request an upfront booking fee and disappear.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Meet in Safe, Public Places</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When meeting someone for the first time — whether for a room inspection, marriage proposal meeting, or local service — choose a well-lit public location and let a trusted friend or family member know where you are going.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Look for Verified Members</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Listings marked with the Verified Member badge have completed additional checks with our team. Even with verified listings, always confirm pricing and terms clearly before proceeding.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Protect Your Personal Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Never share your National Identity Card (NIC) copy, banking OTPs, or private photos with unverified contacts. Keep conversations respectful and cautious.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Report Suspicious or Abusive Ads Immediately</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use the &ldquo;Report this ad&rdquo; button on any listing page, or message our moderation team on WhatsApp at{" "}
            <a href="https://wa.me/94789663179" target="_blank" rel="noopener noreferrer" className="text-primary underline">+94 78 966 3179</a>.
            We remove scam, underage, and policy-violating listings promptly.
          </p>
        </section>

        <footer className="pt-6 border-t border-border flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Link to="/posting-rules" className="hover:text-primary">Posting Rules</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
        </footer>
      </main>
    </div>
  );
}
