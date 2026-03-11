import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PostAd from "./pages/PostAd";
import MyAds from "./pages/MyAds";
import SavedAds from "./pages/SavedAds";
import AdminAds from "./pages/AdminAds";
import AdminRoute from "./components/AdminRoute";
import ResetPassword from "./pages/ResetPassword";
import Blogs from "./pages/Blogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/my-ads" element={<MyAds />} />
          <Route path="/saved-ads" element={<SavedAds />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
