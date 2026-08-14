import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/site/Layout";
import Index from "./pages/Index.tsx";
import Woningscan from "./pages/Woningscan.tsx";
import Diensten from "./pages/Diensten.tsx";
import DienstDetail from "./pages/DienstDetail.tsx";
import Werkwijze from "./pages/Werkwijze.tsx";
import Realisaties from "./pages/Realisaties.tsx";
import RealisatieDetail from "./pages/RealisatieDetail.tsx";
import Reviews from "./pages/Reviews.tsx";
import Over from "./pages/Over.tsx";
import Contact from "./pages/Contact.tsx";
import Regios from "./pages/Regios.tsx";
import RegioDetail from "./pages/RegioDetail.tsx";
import Blog from "./pages/Blog.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/woningscan" element={<Woningscan />} />
            <Route path="/diensten" element={<Diensten />} />
            <Route path="/diensten/:slug" element={<DienstDetail />} />
            <Route path="/werkwijze" element={<Werkwijze />} />
            <Route path="/realisaties" element={<Realisaties />} />
            <Route path="/realisaties/:slug" element={<RealisatieDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/over" element={<Over />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/regio" element={<Regios />} />
            <Route path="/regio/:slug" element={<RegioDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
