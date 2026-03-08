import { Search, Users, UserCircle, Heart, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { label: "Lanka Ads", icon: "🌸" },
  { label: "Girls Personal", icon: "🌸" },
  { label: "Boys Personal", icon: "🌸" },
  { label: "Shemale Personal", icon: "🌸" },
  { label: "Marriage Proposals", icon: "🌸" },
  { label: "Live Cam", icon: "🌸" },
  { label: "Spa & Wellness Services", icon: "🌸" },
  { label: "Rooms", icon: "🌸" },
  { label: "Sales", icon: "🌸" },
  { label: "Toys & Accessories", icon: "🌸" },
];

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const Sidebar = ({ selectedCategory, onCategorySelect }: SidebarProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subEmail, setSubEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = async () => {
    if (!subEmail.trim() || !subEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSubLoading(true);
    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .insert({ email: subEmail.trim().toLowerCase() });
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Subscribed! You'll receive new ad notifications.");
        setSubEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setSubLoading(false);
    }
  };

  const actionButtons = [
    { label: "Agents", icon: Users, onClick: () => window.open("https://wa.me/94789663179", "_blank") },
    { label: "My Saved Ads", icon: Heart, onClick: () => {} },
    { label: user ? "My Account" : "Login", icon: UserCircle, onClick: () => navigate(user ? "/my-ads" : "/auth") },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      {/* How to publish */}
      <div
        className="bg-primary text-primary-foreground rounded-lg p-4 text-center cursor-pointer hover:bg-primary/90 transition-colors"
        onClick={() => navigate(user ? "/post-ad" : "/auth")}
      >
        <p className="font-semibold text-sm">How to publish Ads?</p>
        <p className="text-xs opacity-80 mt-1">දැන්වීම් පලකරන පියවරක්?</p>
      </div>

      {/* Search */}
      <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
        <div className="flex gap-2">
          <Input placeholder="Search Ads ..." className="text-sm" />
          <Button size="sm" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-card rounded-lg p-3 shadow-sm border border-border space-y-2">
        {actionButtons.map((btn) => (
          <Button
            key={btn.label}
            variant="default"
            className="w-full justify-center gap-2 font-medium"
            size="sm"
            onClick={btn.onClick}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Email Subscription */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          Get New Ad Alerts
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Subscribe to receive email notifications about new ads.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Your email..."
            className="text-sm"
            type="email"
            value={subEmail}
            onChange={(e) => setSubEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
          />
          <Button size="sm" onClick={handleSubscribe} disabled={subLoading}>
            {subLoading ? "..." : "Subscribe"}
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <h3 className="font-bold text-base mb-3">Top Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.label}>
              <button
                onClick={() =>
                  onCategorySelect(selectedCategory === cat.label ? null : cat.label)
                }
                className={`flex items-center gap-2 text-sm w-full text-left transition-colors rounded px-2 py-1 ${
                  selectedCategory === cat.label
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
