import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE_URL } from "@/lib/seo";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Privacy Policy - Ads SL</title>
      <meta name="description" content="Read the Ads SL privacy policy. Learn how we collect, use, and protect your personal information on Sri Lanka's leading classified ads platform." />
      <link rel="canonical" href={`${SITE_URL}/privacy`} />
    </Helmet>

    <Navbar />

    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>

      <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
        <p><em>Last updated: March 2026</em></p>

        <p>
          At Ads SL ("we", "our", "us"), we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our classified ads platform at ads-sl.com.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account Information:</strong> Email address and password when you register.</li>
          <li><strong>Ad Content:</strong> Titles, descriptions, images, contact phone numbers, and location data you provide when posting ads.</li>
          <li><strong>Usage Data:</strong> Pages visited, ads viewed, and interaction patterns to improve our service.</li>
          <li><strong>Device Information:</strong> Browser type, operating system, and IP address for security and analytics.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide and maintain our classified ads platform</li>
          <li>To display your ads to potential buyers and service seekers</li>
          <li>To communicate with you about your account and ads</li>
          <li>To prevent fraud, spam, and misuse of our platform</li>
          <li>To improve our services and user experience</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">3. Information Sharing</h2>
        <p>
          We do not sell your personal information. Your contact details (such as phone numbers) are displayed only on your published ads as you've provided them. We may share anonymized, aggregated data for analytics purposes.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and associated data</li>
          <li>Opt out of marketing communications</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground mt-6">6. Cookies</h2>
        <p>
          We use essential cookies to maintain your session and preferences. We may use analytics cookies to understand how users interact with our platform. You can manage cookie preferences through your browser settings.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">7. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at support@ads-sl.com.
        </p>
      </div>

      <footer className="mt-12 border-t border-border pt-6 pb-4 text-muted-foreground text-xs flex flex-wrap gap-2">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>·</span>
        <Link to="/about" className="hover:text-primary">About Us</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
      </footer>
    </div>
  </div>
);

export default Privacy;
