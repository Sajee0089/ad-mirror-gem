import { Search, Users, UserCircle, Heart, Newspaper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const Sidebar = () => {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      {/* How to publish */}
      <div className="bg-primary text-primary-foreground rounded-lg p-4 text-center">
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
          >
            <btn.icon className="w-4 h-4" />
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <h3 className="font-bold text-base mb-3">Top Categories</h3>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat.label}>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
