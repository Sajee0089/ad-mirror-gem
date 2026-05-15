import Navbar from "@/components/Navbar";
import PageSeo from "@/components/PageSeo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

const Contact = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Ads SL",
    url: `${SITE_URL}/contact`,
  };

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Contact Us | Ads SL — Sri Lanka Classified Ads Support"
        description="Contact Ads SL support team via WhatsApp or email. We're here to help with classified ads, posting issues, and account support across Sri Lanka."
        canonical={`${SITE_URL}/contact`}
        schema={jsonLd}
      />

      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Contact Ads SL</h1>
        <p className="text-muted-foreground mb-6">
          Have a question about posting an ad, your account or our platform? Our support team is happy to help.
        </p>

        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" /> WhatsApp Support
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Fastest way to reach us. Available daily.
            </p>
            <Button asChild>
              <a href="https://wa.me/94789663179" target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp (+94 78 966 3179)
              </a>
            </Button>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Email
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              For non-urgent inquiries, write to us at:
            </p>
            <a href="mailto:support@ads-sl.com" className="text-primary hover:underline">
              support@ads-sl.com
            </a>
          </div>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-muted-foreground text-xs flex flex-wrap gap-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>·</span>
          <Link to="/about" className="hover:text-primary">About</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-primary">Terms</Link>
        </footer>
      </div>
    </div>
  );
};

export default Contact;
