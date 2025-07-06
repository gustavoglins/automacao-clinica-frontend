import { 
  Calendar, 
  Users, 
  User, 
  FileText, 
  UserCheck,
  BarChart3,
  Settings,
  Home
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Funcionários", url: "/funcionarios", icon: UserCheck },
]

const businessItems = [
  { title: "Financeiro", url: "/financeiro", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
]

const systemItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  { title: "Área do Paciente", url: "/area-paciente", icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold scale-105 transform transition-all duration-200" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200"

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-card">
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              AO
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-primary">Alpha Odonto</h2>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <div className={`flex items-center w-full relative ${isCollapsed ? 'justify-center' : ''}`}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-primary' : ''} ${!isCollapsed ? 'mr-3' : ''}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                        {isActive(item.url) && (
                          <div className="absolute -left-2 w-1 h-6 bg-primary rounded-r-full"></div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <div className={`flex items-center w-full relative ${isCollapsed ? 'justify-center' : ''}`}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-primary' : ''} ${!isCollapsed ? 'mr-3' : ''}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                        {isActive(item.url) && (
                          <div className="absolute -left-2 w-1 h-6 bg-primary rounded-r-full"></div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <div className={`flex items-center w-full relative ${isCollapsed ? 'justify-center' : ''}`}>
                        <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-primary' : ''} ${!isCollapsed ? 'mr-3' : ''}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                        {isActive(item.url) && (
                          <div className="absolute -left-2 w-1 h-6 bg-primary rounded-r-full"></div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapse trigger inside sidebar */}
        <div className="mt-auto p-2">
          <SidebarTrigger className="w-full" />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}