import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/site/Layout";
import Index from "./pages/Index.tsx";
import Projecten from "./pages/Projecten.tsx";
import ProjectDetail from "./pages/ProjectDetail.tsx";
import Totaalrenovaties from "./pages/Totaalrenovaties.tsx";
import Woningscan from "./pages/Woningscan.tsx";
import Quickscan from "./pages/Quickscan.tsx";
import AdminQuickscan from "./pages/AdminQuickscan.tsx";
import Over from "./pages/Over.tsx";
import Contact from "./pages/Contact.tsx";
import Privacy from "./pages/Privacy.tsx";
import AlgemeneVoorwaarden from "./pages/AlgemeneVoorwaarden";
import Cookies from "./pages/Cookies";
import WettelijkeVermeldingen from "./pages/WettelijkeVermeldingen";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projecten" element={<Projecten />} />
          <Route path="/projecten/:slug" element={<ProjectDetail />} />
          <Route path="/totaalrenovaties" element={<Totaalrenovaties />} />
          <Route path="/woningscan" element={<Woningscan />} />
          <Route path="/woningscan/quickscan" element={<Quickscan />} />
          <Route path="/admin/quickscan" element={<AdminQuickscan />} />
          <Route path="/over" element={<Over />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/wettelijke-vermeldingen" element={<WettelijkeVermeldingen />} />
          <Route path="/diensten/*" element={<Navigate to="/totaalrenovaties" replace />} />
          <Route path="/realisaties/*" element={<Navigate to="/projecten" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
