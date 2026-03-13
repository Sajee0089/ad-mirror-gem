import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE_URL } from "@/lib/seo";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Terms of Service - Ads SL</title>
      <meta name="description" content="Read the Ads SL terms of service. Understand the rules and guidelines for using Sri Lanka's leading free classified ads platform." />
      <link rel="canonical" href={`${SITE_URL}/terms`} />
    </Helmet>

    <Navbar />

    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>

      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p><em>Last updated: March 2026</em></p>

        <p>
          Welcome to Ads SL. By accessing or using our classified ads platform at ads-sl.com, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">1. Acceptance of Terms</h2>
        <p>
          By creating an account, posting ads, or browsing our platform, you agree to these terms. If you do not agree, please do not use our services.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">2. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate information when creating an account</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must be at least 18 years old to use our platform</li>
          <li>One person may not maintain multiple accounts</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">3. Ad Posting Guidelines</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>All ads must be truthful and not misleading</li>
          <li>You must not post illegal content or services</li>
          <li>Images must be relevant and appropriate</li>
          <li>Contact information provided must be genuine</li>
          <li>Duplicate or spam ads will be removed</li>
          <li>Ads are subject to review and approval by our moderation team</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">4. Prohibited Content</h2>
        <p>The following content is strictly prohibited:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Illegal goods or services</li>
          <li>Fraudulent or deceptive listings</li>
          <li>Content that infringes on intellectual property rights</li>
          <li>Harassment, hate speech, or threats</li>
          <li>Content involving minors</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">5. Platform Liability</h2>
        <p>
          Ads SL acts as a platform connecting buyers and sellers. We do not participate in, verify, or guarantee any transactions between users. Users engage in transactions at their own risk. Ads SL is not responsible for any losses, damages, or disputes arising from interactions between users.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">6. Content Moderation</h2>
        <p>
          We reserve the right to remove any ad, suspend any account, or block any user at our discretion. Ads that violate our guidelines will be rejected or removed without notice.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">7. Intellectual Property</h2>
        <p>
          By posting content on Ads SL, you grant us a non-exclusive license to display and distribute your content on our platform. You retain ownership of your content.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">8. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of Ads SL after changes constitutes acceptance of the new terms.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">9. Contact</h2>
        <p>
          For questions about these terms, contact us at support@ads-sl.com.
        </p>
      </div>

      <footer className="mt-12 border-t border-border pt-6 pb-4 text-muted-foreground text-xs flex flex-wrap gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>·</span>
        <Link to="/about" className="hover:text-primary">About Us</Link>
        <span>·</span>
        <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
      </footer>
    </div>
  </div>
);

export default Terms;
