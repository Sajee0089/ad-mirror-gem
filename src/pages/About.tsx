import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE_URL, categorySlugMap } from "@/lib/seo";
import { districts } from "@/data/districts";
import { getDistrictUrl } from "@/lib/seo";

const About = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Ads SL",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@type": "Organization",
      name: "Ads SL",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Sri Lanka's leading free classified ads platform connecting buyers and sellers across all 25 districts.",
      areaServed: { "@type": "Country", name: "Sri Lanka" },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Ads SL - Sri Lanka's Free Classified Ads Platform</title>
        <meta name="description" content="Learn about Ads SL, Sri Lanka's leading free classified ads platform. We connect buyers and sellers across all 25 districts with safe, easy-to-use ad listings." />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">About Ads SL</h1>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            Ads SL is Sri Lanka's leading free classified ads platform, designed to connect buyers, sellers, and service providers across all 25 districts of the island. Whether you're looking for spa services in Colombo, personal ads in Kandy, or rooms in Galle, Ads SL makes it easy to post and find classified ads completely free of charge.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-6">Our Mission</h2>
          <p>
            Our mission is to provide a safe, reliable, and easy-to-use platform for Sri Lankans to buy, sell, and connect. We believe everyone should have access to free classified advertising, regardless of their location or budget.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-6">What We Offer</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Free Ad Posting:</strong> Post unlimited classified ads at no cost across all categories.</li>
            <li><strong>Verified Members:</strong> Our verification system helps build trust between buyers and sellers.</li>
            <li><strong>25 Districts Coverage:</strong> From Colombo to Jaffna, we cover every district in Sri Lanka.</li>
            <li><strong>Multiple Categories:</strong> Spa services, personal ads, rooms, marriage proposals, and more.</li>
            <li><strong>Mobile-Friendly:</strong> Access Ads SL from any device, anywhere in Sri Lanka.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground mt-6">Safety First</h2>
          <p>
            At Ads SL, safety is our top priority. All ads go through a review process before being published. We encourage users to meet in public places, verify identities, and report suspicious activity. Never share personal financial information with unknown parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-6">Browse by District</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {districts.map((d) => (
              <Link key={d} to={getDistrictUrl(d)} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {d}
              </Link>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(categorySlugMap).map(([cat, slug]) => (
              <Link key={cat} to={`/${slug}`} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {cat}
              </Link>
            ))}
          </div>

          <h2 className="text-xl font-semibold text-foreground mt-6">Contact Us</h2>
          <p>
            Have questions or feedback? We'd love to hear from you. Reach out to us via our WhatsApp support or email at support@ads-sl.com. We're here to help you make the most of your Ads SL experience.
          </p>
        </div>

        <footer className="mt-12 border-t border-border pt-6 pb-4 text-muted-foreground text-xs flex flex-wrap gap-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
          <span>·</span>
          <Link to="/blogs" className="hover:text-primary">Blog</Link>
        </footer>
      </div>
    </div>
  );
};

export default About;
