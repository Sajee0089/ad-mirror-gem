import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import { sampleAds } from "@/data/sampleAds";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <HeroBanner />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
