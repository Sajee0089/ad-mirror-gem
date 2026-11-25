import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageSeo from "@/components/PageSeo";
import { FileCheck2, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export default function PostingRules() {
  const canonical = `${SITE_URL}/posting-rules`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Posting Rules", item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Posting Rules & Moderation Guidelines | Ads SL"
        description="Read the Ads SL posting rules before publishing a free classified ad in Sri Lanka. Clear title, genuine photos, 18+ compliance, and zero spam."
        canonical={canonical}
        schema={breadcrumbJsonLd}
      />
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">Posting Rules</span>
        </nav>

        <div className="flex items-center gap-2">
          <FileCheck2 className="w-7 h-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ads SL Posting Rules</h1>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Every listing submitted to Ads SL is reviewed by our moderation team before publication. Follow these rules so your ad is approved quickly and stays visible to visitors across Sri Lanka.
        </p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Age Requirement (18+ Only)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You must be at least 18 years old to post an ad on Ads SL. Any listing involving, referencing, or depicting minors is strictly prohibited and will be permanently banned and reported.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Accurate Details & Quality Standards</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Use a clear, descriptive title of at least 10 characters.</li>
            <li>Write a genuine description of at least 60 characters explaining your service, location, and terms.</li>
            <li>Upload at least one real, clear photo (no stolen, watermarked, or explicit graphic imagery).</li>
            <li>Choose the exact category and Sri Lankan district where the service is offered.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. No Explicit Graphic Text or Images</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Public listings must remain tasteful and compliant with platform standards. Explicit pornography, graphic descriptions, illegal services, harassment, and hate speech are rejected immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. No Duplicate Spam</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Do not post the same title and phone number repeatedly within 7 days. Instead, use the &ldquo;Renew Ad&rdquo; button in My Ads once every 24 hours to keep your active listing fresh.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Moderation & Enforcement</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All ads — especially in adult-rated categories — require admin approval before appearing publicly. Ads SL reserves the right to reject or remove any listing that violates these guidelines or Sri Lankan law.
          </p>
        </section>

        <footer className="pt-6 border-t border-border flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Link to="/safety-tips" className="hover:text-primary">Safety Tips</Link>
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
