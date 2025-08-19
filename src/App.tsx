import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ClinicProvider } from '@/context/ClinicContext';
import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { EmployeeProvider } from '@/context/EmployeeContext';
import { ServiceProvider } from '@/context/ServiceContext';
import { ConvenioProvider } from '@/context/ConvenioContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '@/components/auth';
import Agenda from './pages/Agenda';
import Configuracoes from './pages/Configuracoes';
import Fechamentos from './pages/Fechamentos';
import Funcionarios from './pages/Funcionarios';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Pacientes from './pages/Pacientes';
import Relatorios from './pages/Relatorios';
import Servicos from './pages/Servicos';
import Convenios from './pages/Convenios';
import Pagamentos from './pages/Pagamentos';
import AllSystemTest from './pages/__AllSystemTest';

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <ClinicProvider>
      <PatientProvider>
        <EmployeeProvider>
          <ServiceProvider>
            <ConvenioProvider>
              <AppointmentProvider>
                <DashboardProvider>
                  <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <BrowserRouter>
                        <Routes>
                          <Route
                            path="/login"
                            element={
                              <PublicRoute>
                                <Login />
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/"
                            element={
                              <ProtectedRoute>
                                <Index />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/agenda"
                            element={
                              <ProtectedRoute>
                                <Agenda />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/pacientes"
                            element={
                              <ProtectedRoute>
                                <Pacientes />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/funcionarios"
                            element={
                              <ProtectedRoute>
                                <Funcionarios />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/servicos"
                            element={
                              <ProtectedRoute>
                                <Servicos />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/convenios"
                            element={
                              <ProtectedRoute>
                                <Convenios />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/relatorios"
                            element={
                              <ProtectedRoute>
                                <Relatorios />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/pagamentos"
                            element={
                              <ProtectedRoute>
                                <Pagamentos />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/configuracoes"
                            element={
                              <ProtectedRoute>
                                <Configuracoes />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/fechamentos"
                            element={
                              <ProtectedRoute>
                                <Fechamentos />
                              </ProtectedRoute>
                            }
                          />
                          {/* Rota oculta para página de testes completos do sistema */}
                          <Route
                            path="/__all-tests"
                            element={
                              <ProtectedRoute>
                                <AllSystemTest />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </BrowserRouter>
                    </TooltipProvider>
                  </QueryClientProvider>
                </DashboardProvider>
              </AppointmentProvider>
            </ConvenioProvider>
          </ServiceProvider>
        </EmployeeProvider>
      </PatientProvider>
    </ClinicProvider>
  </AuthProvider>
);

export default App;
