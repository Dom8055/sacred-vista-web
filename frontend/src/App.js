import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { CatalogProvider } from "@/context/CatalogContext";
import { AuthProvider } from "@/context/AuthContext";
import { scrollToTop, useLenis } from "@/hooks/useLenis";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import ErrorBoundary from "@/components/sv/ErrorBoundary";
import { NotFoundBlock } from "@/components/sv/States";
import Home from "@/pages/Home";
import Packages from "@/pages/Packages";
import PackageDetails from "@/pages/PackageDetails";
import Destinations from "@/pages/Destinations";
import DestinationDetails from "@/pages/DestinationDetails";
import Gallery from "@/pages/Gallery";
import Blog from "@/pages/Blog";
import Reviews from "@/pages/Reviews";
import Contact from "@/pages/Contact";
import LegalPage from "@/pages/LegalPage";
import Admin, { AdminLogin } from "@/pages/Admin";

function Shell() {
  const { pathname } = useLocation();
  useLenis();
  useEffect(() => {
    scrollToTop(true);
  }, [pathname]);
  const admin = pathname.startsWith("/admin");

  return (
    <>
      {!admin && <Header />}
      <ErrorBoundary key={pathname}>
        <motion.main key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="bg-forest">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/packages/:packageId" element={<PackageDetails />} />
            <Route path="/package-details" element={<PackageDetails />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:destinationId" element={<DestinationDetails />} />
            <Route path="/destination-details" element={<DestinationDetails />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<LegalPage policy="privacy" />} />
            <Route path="/terms-conditions" element={<LegalPage policy="terms" />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFoundBlock title="This trail ends here." text="The page you were looking for doesn't exist." to="/" cta="Return home" />} />
          </Routes>
        </motion.main>
      </ErrorBoundary>
      {!admin && <Footer />}
      {!admin && <FloatingActions />}
    </>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <CatalogProvider>
          <AuthProvider>
            <Shell />
            <Toaster />
          </AuthProvider>
        </CatalogProvider>
      </BrowserRouter>
    </div>
  );
}
