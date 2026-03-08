import { Search, MapPin, ChevronDown } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { districts } from "@/data/districts";

const categories = [
  { label: "Spa", icon: "💆" },
  { label: "Live Cam", icon: "📹" },
  { label: "Girls Personal", icon: "👩" },
  { label: "Boys Personal", icon: "👨" },
  { label: "Shemale Personal", icon: "🌈" },
  { label: "Marriage Proposals", icon: "💍" },
  { label: "Rooms", icon: "🏠" },
  { label: "Toys & Accessories", icon: "🎁" },
];

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedDistrict?: string | null;
  onDistrictSelect?: (district: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Sidebar = ({ selectedCategory, onCategorySelect, selectedDistrict, onDistrictSelect, searchQuery = "", onSearchChange }: SidebarProps) => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-4">
      {/* How to publish */}
      <div
        className="bg-primary text-primary-foreground rounded-lg p-4 text-center cursor-pointer hover:bg-primary/90 transition-colors"
        onClick={() => navigate(user ? "/post-ad" : "/auth")}
      >
        <p className="font-semibold text-sm">How to publish Ads?</p>
        <p className="text-xs opacity-80 mt-1">දැන්වීම් පලකරන පියවරක්?</p>
      </div>

      {/* District Filter */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {selectedDistrict ? (
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              📍 {selectedDistrict}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => onDistrictSelect?.(null)}
            >
              Clear
            </Button>
          </div>
        ) : (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Filter by District
              </h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1 px-4 pb-4">
                {districts.map((district) => (
                  <li key={district}>
                    <button
                      onClick={() => onDistrictSelect?.(district)}
                      className="flex items-center gap-2 text-sm w-full text-left transition-colors rounded px-2 py-1 text-foreground/80 hover:text-primary"
                    >
                      📍 {district}
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Categories */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {selectedCategory ? (
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-primary/5 to-primary/10">
            <span className="text-sm font-semibold flex items-center gap-2 text-primary">
              {categories.find(c => c.label === selectedCategory)?.icon} {selectedCategory}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => onCategorySelect(null)}
            >
              Clear
            </Button>
          </div>
        ) : (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-primary/5 transition-colors group">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md p-1 text-xs">📂</span>
                Top Categories
              </h3>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="px-2 pb-3 space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.label}>
                    <button
                      onClick={() => onCategorySelect(cat.label)}
                      className="flex items-center gap-2.5 text-sm w-full text-left transition-all rounded-md px-3 py-2 text-foreground/80 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Search - below categories */}
      <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
        <div className="flex gap-2">
          <Input
            ref={searchInputRef}
            placeholder="Search Ads ..."
            className="text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchInputRef.current?.blur();
              }
            }}
          />
          {searchQuery ? (
            <Button size="sm" variant="secondary" onClick={() => { onSearchChange?.(""); searchInputRef.current?.focus(); }}>
              ✕
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={() => searchInputRef.current?.blur()}
            className="shrink-0"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
