import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Bell, Search, User, Settings, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-4">

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar pacientes, consultas..."
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50/50 border-gray-200 rounded-lg focus:bg-white focus:border-blue-300 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Button>
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 hover:bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">Dr. Alpha Odonto</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                        <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">AO</AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 bg-gray-50/30 overflow-auto">
            <div className="w-full">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="px-4 py-3 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm">
            <div className="w-full">
              <p className="text-xs text-gray-500 text-center">
                Powered by <span className="font-semibold text-blue-600">Norvand</span> • Alpha Odonto System
              </p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}