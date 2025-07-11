import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClinicProvider } from "@/context/ClinicContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Agenda from "./pages/Agenda";
import Configuracoes from "./pages/Configuracoes";
import Funcionarios from "./pages/Funcionarios";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pacientes from "./pages/Pacientes";
import Relatorios from "./pages/Relatorios";

const queryClient = new QueryClient();

const App = () => (
  <ClinicProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClinicProvider>
);

export default App;
