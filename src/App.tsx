import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PostAd from "./pages/PostAd";
import MyAds from "./pages/MyAds";
import SavedAds from "./pages/SavedAds";
import AdminAds from "./pages/AdminAds";
import AdminRoute from "./components/AdminRoute";
import ResetPassword from "./pages/ResetPassword";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import AdPage from "./pages/AdPage";
import DistrictPage from "./pages/DistrictPage";
import CategoryPage from "./pages/CategoryPage";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/saved-ads" element={<SavedAds />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />
            {/* SEO pages */}
            <Route path="/ad/:slug" element={<AdPage />} />
            <Route path="/district/:district" element={<DistrictPage />} />
            <Route path="/:category" element={<CategoryPage />} />
            <Route path="/:district/:category" element={<CategoryPage />} />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
