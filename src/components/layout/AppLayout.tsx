import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import {
  Bell,
  Search,
  User,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchProvider, useSearch } from "@/context/SearchContext";
import { useNavigate } from "react-router-dom";
import { useClinic } from "@/context/ClinicContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { clinicName } = useClinic();
  return (
    <SearchProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <HeaderWithSearch clinicName={clinicName} />
            {/* Main Content */}
            <main className="flex-1 p-2 sm:p-4 bg-gray-50/30 overflow-auto">
              <div className="w-full max-w-full">{children}</div>
            </main>
            {/* Footer */}
            <footer className="px-2 sm:px-4 py-3 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm">
              <div className="w-full">
                <p className="text-xs text-gray-500 text-center">
                  Powered by{" "}
                  <span className="font-semibold text-[#2563eb]">Norvand</span>
                </p>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}

function HeaderWithSearch({ clinicName }: { clinicName: string }) {
  const { search, setSearch } = useSearch();
  const [showResults, setShowResults] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Busca real de pacientes e funcionários
  const [results, setResults] = React.useState<
    Array<{ id: string; name: string; type: string }>
  >([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    let ignore = false;
    async function fetchResults() {
      if (!search) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const [patients, employees]: [
          import("@/types/patient").Patient[],
          import("@/types/employee").Employee[]
        ] = await Promise.all([
          (
            await import("@/services/patientService")
          ).patientService.searchPatients(search),
          (
            await import("@/services/employeeService")
          ).employeeService.searchEmployees(search),
        ]);
        if (ignore) return;
        const mapped = [
          ...patients.map((p) => ({
            id: p.id,
            name: p.fullName,
            type: "Paciente",
          })),
          ...employees.map((e) => ({
            id: e.id,
            name: e.fullName,
            type: "Funcionário",
          })),
        ];
        setResults(mapped);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
    return () => {
      ignore = true;
    };
  }, [search]);

  React.useEffect(() => {
    setShowResults(!!search);
  }, [search]);

  // Fecha o dropdown ao clicar fora
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!inputRef.current) return;
      if (!inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    if (showResults) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showResults]);

  return (
    <>
      <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-2 sm:px-6 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Sidebar Trigger */}
          <div className="block md:hidden">
            <SidebarTrigger className="h-8 w-8" />
          </div>

          <div className="relative flex-1 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder="Buscar pacientes, funcionários..."
              className="pl-10 pr-4 py-2 w-full bg-gray-50/50 border-gray-200 rounded-lg focus:bg-white focus:border-blue-300 transition-all duration-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              onFocus={() => search && setShowResults(true)}
            />
            {showResults && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto animate-fade-in">
                <div className="p-3 border-b text-xs text-gray-500 font-semibold">
                  Resultados da busca
                </div>
                {results.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">
                    Nenhum resultado encontrado.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {results.map((item) => (
                      <li
                        key={item.type + item.id}
                        className="py-2 px-4 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                        onMouseDown={() => {
                          setShowResults(false);
                          setSearch(item.name);
                          if (item.type === "Paciente") {
                            navigate(
                              `/pacientes?q=${encodeURIComponent(item.name)}`
                            );
                          } else {
                            navigate(
                              `/funcionarios?q=${encodeURIComponent(item.name)}`
                            );
                          }
                        }}
                      >
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                          {item.type}
                        </span>
                        <span className="font-medium text-gray-900 truncate">
                          {item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 sm:h-10 px-1 sm:px-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                    <AvatarFallback className="bg-[#3b82f6] text-white text-xs sm:text-sm font-medium">
                      {clinicName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                  <div
                    onClick={() => {
                      window.open("", "_self");
                      window.close();
                      setTimeout(() => {
                        window.location.href = "about:blank";
                      }, 200);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
