import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ClinicProvider } from '@/context/ClinicContext';
import { PatientProvider } from '@/context/PatientContext';
import { EmployeeProvider } from '@/context/EmployeeContext';
import { ServiceProvider } from '@/context/ServiceContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Agenda from './pages/Agenda';
import Configuracoes from './pages/Configuracoes';
import Funcionarios from './pages/Funcionarios';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Pacientes from './pages/Pacientes';
import Relatorios from './pages/Relatorios';
import Servicos from './pages/Servicos';

const queryClient = new QueryClient();

const App = () => (
  <ClinicProvider>
    <PatientProvider>
      <EmployeeProvider>
        <ServiceProvider>
          <AppointmentProvider>
            <DashboardProvider>
              <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/" element={<Index />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/pacientes" element={<Pacientes />} />
                      <Route path="/funcionarios" element={<Funcionarios />} />
                      <Route path="/servicos" element={<Servicos />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route
                        path="/configuracoes"
                        element={<Configuracoes />}
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </QueryClientProvider>
            </DashboardProvider>
          </AppointmentProvider>
        </ServiceProvider>
      </EmployeeProvider>
    </PatientProvider>
  </ClinicProvider>
);

export default App;
